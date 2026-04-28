from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from app.models.database import SessionLocal
from app.models.paper import Paper
from app.services.pdf_service import pdf_service
from app.services.embedding_service import embedding_service
from app.services.llm_service import llm_service
from datetime import datetime

router = APIRouter(prefix="/api/papers", tags=["papers"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def process_paper(paper_id: str, file_path: str):
    db = SessionLocal()
    paper = None
    try:
        paper = db.query(Paper).filter(Paper.id == paper_id).first()

        # 🔹 Stage 1: Extract text
        paper.status = "extracting"
        db.commit()

        extracted = pdf_service.extract_text(file_path)
        paper.raw_text = extracted["full_text"]
        paper.page_count = extracted["page_count"]
        paper.char_count = extracted["char_count"]

        # 🔹 Stage 2: Embedding
        paper.status = "embedding"
        db.commit()

        chunks = pdf_service.chunk_text(extracted["full_text"], paper_id)
        paper.chunk_count = len(chunks)

        index_path = embedding_service.build_index(paper_id, chunks)
        paper.faiss_index_path = index_path

        # 🔹 Stage 3: AI Analysis
        paper.status = "analyzing"
        db.commit()

        analysis = llm_service.analyze_paper(extracted["full_text"])
        paper.structured_analysis = analysis
        paper.keywords = analysis.get("keywords", [])

        # 🔹 Stage 4: Scoring
        scores = llm_service.score_paper(analysis)
        paper.scores = scores

        # 🔹 Done
        paper.status = "ready"
        paper.analyzed_at = datetime.utcnow()
        db.commit()

        print(f"Paper {paper_id} processing complete!")

    except Exception as e:
        if paper:
            paper.status = "error"
            paper.error_message = str(e)
            db.commit()
        print(f"Error processing paper {paper_id}: {e}")

    finally:
        db.close()


# 🚀 Upload API
@router.post("/upload")
async def upload_paper(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(400, "Only PDF files accepted")

    content = await file.read()

    size_mb = len(content) / (1024 * 1024)
    if size_mb > 50:
        raise HTTPException(400, "File too large. Max 50MB")

    file_path, paper_id = pdf_service.save_upload(content, file.filename)

    paper = Paper(
        id=paper_id,
        filename=file.filename,
        file_path=file_path,
        file_size_bytes=len(content),
        status="uploaded"
    )

    db.add(paper)
    db.commit()

    background_tasks.add_task(process_paper, paper_id, file_path)

    return {
        "paper_id": paper_id,
        "filename": file.filename,
        "status": "processing",
        "message": "Paper uploaded successfully. Processing started."
    }


# 🚀 Status API (with progress)
@router.get("/{paper_id}/status")
def get_status(paper_id: str, db: Session = Depends(get_db)):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()

    if not paper:
        raise HTTPException(404, "Paper not found")

    return {
        "paper_id": paper_id,
        "status": paper.status,
        "error": paper.error_message,
        "progress": {
            "uploaded": paper.status in ["uploaded", "extracting", "embedding", "analyzing", "ready"],
            "extracting": paper.status in ["extracting", "embedding", "analyzing", "ready"],
            "embedding": paper.status in ["embedding", "analyzing", "ready"],
            "analyzing": paper.status in ["analyzing", "ready"],
            "completed": paper.status == "ready"
        }
    }


# 🚀 Analysis API
@router.get("/{paper_id}/analysis")
def get_analysis(paper_id: str, db: Session = Depends(get_db)):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()

    if not paper:
        raise HTTPException(404, "Paper not found")

    if paper.status != "ready":
        return {"status": paper.status, "message": "Paper still processing"}

    return {
        "paper_id": paper_id,
        "status": paper.status,
        "structured_analysis": paper.structured_analysis,
        "scores": paper.scores,
        "keywords": paper.keywords,
        "page_count": paper.page_count,
        "char_count": paper.char_count
    }


# 🚀 Chat with Paper API
@router.post("/{paper_id}/chat")
def chat_with_paper(
    paper_id: str,
    request: dict,
    db: Session = Depends(get_db)
):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()

    if not paper:
        raise HTTPException(404, "Paper not found")

    if paper.status != "ready":
        return {"status": paper.status, "message": "Paper not ready"}

    question = request.get("question", "")

    # 🔥 Retrieve relevant chunks
    chunks = embedding_service.search(paper_id, question)

    response = llm_service.chat_with_paper(
        question=question,
        context_chunks=chunks,
        conversation_history=[]
    )

    return response