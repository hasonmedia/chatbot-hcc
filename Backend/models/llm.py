from sqlalchemy import Column, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from config.database import Base


class LLM(Base):
    __tablename__ = "llm"

    id = Column(Integer, primary_key=True, autoincrement=True)
    prompt = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    company_id = Column(Integer, ForeignKey("company.id"), nullable=True)
    system_greeting = Column(Text, nullable=True)
    botName = Column(String(100), nullable=True)
    
    # Thêm 2 trường để chọn model cho bot và embedding (lưu ID của llm_detail)
    bot_model_detail_id = Column(Integer, nullable=True)  # ID của llm_detail dùng cho bot (1=gemini, 2=gpt)
    embedding_model_detail_id = Column(Integer, nullable=True)  # ID của llm_detail dùng cho embedding

    # Quan hệ 1-nhiều với LLMDetail
    llm_details = relationship("LLMDetail", back_populates="llm", cascade="all, delete-orphan")


class LLMDetail(Base):
    __tablename__ = "llm_detail"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False)  # "gemini" hoặc "gpt"
    key_free = Column(String(150), nullable=False)
    llm_id = Column(Integer, ForeignKey("llm.id"), nullable=False)

    # Quan hệ ngược lại với LLM
    llm = relationship("LLM", back_populates="llm_details")

    # Quan hệ 1-nhiều với LLMKey
    llm_keys = relationship("LLMKey", back_populates="llm_detail", cascade="all, delete-orphan")


class LLMKey(Base):
    __tablename__ = "llm_key"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    key = Column(String(150), nullable=False)
    type = Column(String(50), nullable=False, default="bot")  # "bot" hoặc "embedding"
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    llm_detail_id = Column(Integer, ForeignKey("llm_detail.id"), nullable=False)

    # Quan hệ ngược lại với LLMDetail
    llm_detail = relationship("LLMDetail", back_populates="llm_keys")
