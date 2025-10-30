from sqlalchemy import Column, ForeignKey, Integer, String, JSON, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from config.database import Base


class LLM(Base):
    __tablename__ = "llm"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    key = Column(String(150), nullable=False)
    prompt = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    company_id = Column(Integer, ForeignKey("company.id"), nullable=True)
    system_greeting = Column(Text, nullable=True)
    botName = Column(String(100), nullable=True)

    # Quan hệ 1-nhiều với bảng llm_key
    llm_keys = relationship("LLMKey", back_populates="llm", cascade="all, delete-orphan")


class LLMKey(Base):
    __tablename__ = "llm_key"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    key = Column(String(150), nullable=False)
    type = Column(String(50), nullable=False, default="bot")  # "bot" hoặc "embedding"
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    llm_id = Column(Integer, ForeignKey("llm.id"), nullable=False)

    # Quan hệ ngược lại
    llm = relationship("LLM", back_populates="llm_keys")
