from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, func
from datetime import datetime
from config.database import Base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

class KnowledgeBase(Base):
    __tablename__ = "knowledge_base"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationship
    categories = relationship("KnowledgeCategory", back_populates="knowledge_base", cascade="all, delete-orphan")


class KnowledgeCategory(Base):
    """
    Bảng phân loại kiến thức - trung gian giữa KnowledgeBase và KnowledgeBaseDetail
    Quan hệ: KnowledgeBase 1 -> N KnowledgeCategory 1 -> N KnowledgeBaseDetail
    """
    __tablename__ = "knowledge_category"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    knowledge_base_id = Column(Integer, ForeignKey("knowledge_base.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    knowledge_base = relationship("KnowledgeBase", back_populates="categories")
    details = relationship("KnowledgeBaseDetail", back_populates="category", cascade="all, delete-orphan")


class KnowledgeBaseDetail(Base):
    __tablename__ = "knowledge_base_detail"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("knowledge_category.id"), nullable=False)
    
    # Thông tin file
    file_name = Column(String(255), nullable=True)
    file_type = Column(String(50), nullable=True)  # PDF, DOCX, XLSX
    file_path = Column(String(500), nullable=True)  # Đường dẫn lưu file
    description = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    source_type = Column(String(100), nullable=True)  # manual, web_crawl, api_import
    raw_content = Column(Text, nullable=True)  # Lưu trữ nội dung thô nếu cần
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    category = relationship("KnowledgeCategory", back_populates="details")
    user = relationship("User", foreign_keys=[user_id])


    
    

