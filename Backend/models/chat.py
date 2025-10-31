from sqlalchemy import JSON, Column, Integer, String, ForeignKey, Table, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from config.database import Base
from sqlalchemy import Column, Boolean


class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, default="true")
    alert = Column(String, default="false")
    time = Column(DateTime, nullable=True)
    channel = Column(String, default="web")
    page_id = Column(String)
    url_channel = Column(String)
    name = Column(String)
    current_receiver = Column(String, default="Bot")
    previous_receiver = Column(String)
    created_at = Column(DateTime, default=datetime.now)

    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan")
    rating = relationship("Rating", back_populates="session", uselist=False, cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    chat_session_id = Column(Integer, ForeignKey("chat_sessions.id"))
    sender_name = Column(String)
    sender_type = Column(String)   # customer / bot / staff
    image = Column(String)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.now) 
    session = relationship("ChatSession", back_populates="messages")
 
class Rating(Base):
    __tablename__ = "rating"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), unique=True, nullable=False)
    rate = Column(Integer, nullable=True)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    session = relationship("ChatSession", back_populates="rating")

     