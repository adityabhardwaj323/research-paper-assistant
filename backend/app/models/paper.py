from sqlalchemy import Column, String, DateTime, JSON, Text, Integer
from app.models.database import Base
from datetime import datetime
import uuid

class Paper(Base):
    __tablename__ = "papers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=False)
    file_size_bytes = Column(Integer)
    raw_text = Column(Text)
    page_count = Column(Integer)
    char_count = Column(Integer)
    structured_analysis = Column(JSON)
    scores = Column(JSON)
    keywords = Column(JSON)
    faiss_index_path = Column(String(500))
    chunk_count = Column(Integer)
    status = Column(String(50), default="uploaded")
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    analyzed_at = Column(DateTime)