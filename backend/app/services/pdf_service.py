import fitz
import re
import os
import uuid
from typing import List, Dict, Tuple

UPLOAD_DIR = "./uploads"
CHUNK_SIZE = 512
CHUNK_OVERLAP = 64

class PDFService:

    def extract_text(self, file_path: str) -> Dict:
        doc = fitz.open(file_path)
        pages = []
        full_text_parts = []

        for page_num, page in enumerate(doc):
            text = page.get_text("text")
            text = self._clean_text(text)
            if text.strip():
                pages.append({
                    "page_number": page_num + 1,
                    "text": text
                })
                full_text_parts.append(text)

        doc.close()
        full_text = "\n\n".join(full_text_parts)

        return {
            "full_text": full_text,
            "pages": pages,
            "page_count": len(pages),
            "char_count": len(full_text)
        }

    def _clean_text(self, text: str) -> str:
        text = re.sub(r'(\w)-\n(\w)', r'\1\2', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r' {2,}', ' ', text)
        text = re.sub(r'^\d+\s*$', '', text, flags=re.MULTILINE)
        return text.strip()

    def chunk_text(self, text: str, paper_id: str) -> List[Dict]:
        sentences = self._split_sentences(text)
        chunks = []
        current_chunk = []
        current_len = 0
        chunk_index = 0

        for sentence in sentences:
            sentence_len = len(sentence)

            if current_len + sentence_len > CHUNK_SIZE and current_chunk:
                chunk_text = " ".join(current_chunk)
                chunks.append({
                    "chunk_id": f"{paper_id}_chunk_{chunk_index}",
                    "paper_id": paper_id,
                    "text": chunk_text,
                    "chunk_index": chunk_index,
                    "section": self._detect_section(chunk_text)
                })
                chunk_index += 1

                overlap_sentences = []
                overlap_len = 0
                for s in reversed(current_chunk):
                    if overlap_len + len(s) > CHUNK_OVERLAP:
                        break
                    overlap_sentences.insert(0, s)
                    overlap_len += len(s)

                current_chunk = overlap_sentences
                current_len = overlap_len

            current_chunk.append(sentence)
            current_len += sentence_len

        if current_chunk:
            chunk_text = " ".join(current_chunk)
            chunks.append({
                "chunk_id": f"{paper_id}_chunk_{chunk_index}",
                "paper_id": paper_id,
                "text": chunk_text,
                "chunk_index": chunk_index,
                "section": self._detect_section(chunk_text)
            })

        return chunks

    def _split_sentences(self, text: str) -> List[str]:
        pattern = r'(?<=[.!?])\s+(?=[A-Z])'
        sentences = re.split(pattern, text)
        return [s.strip() for s in sentences if len(s.strip()) > 20]

    def _detect_section(self, text: str) -> str:
        text_lower = text.lower()[:200]
        if any(k in text_lower for k in ['abstract', 'summary']):
            return 'abstract'
        if any(k in text_lower for k in ['introduction', 'background']):
            return 'introduction'
        if any(k in text_lower for k in ['method', 'approach', 'architecture']):
            return 'methodology'
        if any(k in text_lower for k in ['experiment', 'result', 'evaluation']):
            return 'results'
        if any(k in text_lower for k in ['conclusion', 'future', 'limitation']):
            return 'conclusion'
        return 'body'

    def save_upload(self, file_bytes: bytes, filename: str) -> Tuple[str, str]:
        paper_id = str(uuid.uuid4())
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        safe_filename = f"{paper_id}_{filename}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        return file_path, paper_id

pdf_service = PDFService()