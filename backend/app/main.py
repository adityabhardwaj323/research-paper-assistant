import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.database import engine, Base
from app.api.routes_upload import router as upload_router

os.makedirs("./uploads", exist_ok=True)
os.makedirs("./faiss_store", exist_ok=True)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Research Paper AI Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)

@app.get("/")
def home():
    return {"message": "AI Research Assistant Backend Running"}

@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}