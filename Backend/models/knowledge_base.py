from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, func
from datetime import datetime
from config.database import Base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector

class KnowledgeBase(Base):
    __tablename__ = "knowledge_base"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    customer_id = Column(String(100), default="manual")
    
    # Relationship
    details = relationship("KnowledgeBaseDetail", back_populates="knowledge_base", cascade="all, delete-orphan")


class KnowledgeBaseDetail(Base):
    """
    Bảng chi tiết lưu thông tin từng file được upload
    Quan hệ 1-nhiều với KnowledgeBase
    """
    __tablename__ = "knowledge_base_detail"

    id = Column(Integer, primary_key=True, index=True)
    knowledge_base_id = Column(Integer, ForeignKey("knowledge_base.id"), nullable=False)
    
    # Thông tin file
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=True)  # PDF, DOCX, XLSX
    file_path = Column(String(500), nullable=True)  # Đường dẫn lưu file
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    knowledge_base = relationship("KnowledgeBase", back_populates="details")
    chunks = relationship("DocumentChunk", back_populates="detail", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    chunk_text = Column(Text, nullable=False)
    search_vector = Column(Vector(3072))
    
    # Foreign key đến knowledge_base_detail thay vì knowledge_base
    knowledge_base_detail_id = Column(Integer, ForeignKey("knowledge_base_detail.id"), nullable=False)
    
    # Relationship
    detail = relationship("KnowledgeBaseDetail", back_populates="chunks")
    
