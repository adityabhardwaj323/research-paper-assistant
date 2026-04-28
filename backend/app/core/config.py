from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    anthropic_api_key: str = "not-set"
    gemini_api_key: str = "not-set"
    database_url: str = "sqlite:///./papers.db"
    upload_dir: str = "./uploads"
    faiss_index_dir: str = "./faiss_store"
    embed_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    chunk_size: int = 512
    chunk_overlap: int = 64
    max_file_size_mb: int = 50
    max_chunks_per_query: int = 8

    class Config:
        env_file = (".env", ".env.local")

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()