from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from config.database import Base
from sqlalchemy.orm import relationship

class Tag(Base):
    __tablename__ = "tag"
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(20), nullable=True)  
    chat_session_tags = relationship("ChatSessionTag", back_populates="tag", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", secondary="chat_session_tag", back_populates="tags")
