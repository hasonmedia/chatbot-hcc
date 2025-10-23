from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, func
from datetime import datetime
from config.database import Base
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector

class KnowledgeBase(Base):
    __tablename__ = "knowledge_base"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    source = Column(String(100), default="manual")
    category = Column(String(100), default="general")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    customer_id = Column(String(100), default="manual")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    chunk_text = Column(Text, nullable=False)
    search_vector = Column(Vector(3072))
    
    knowledge_base_id = Column(Integer, ForeignKey("knowledge_base.id"))
    
