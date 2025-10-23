from sqlalchemy import JSON, Column, Integer, String, ForeignKey, Table, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from config.database import Base
from sqlalchemy import Column, Boolean

# class ChatSession(Base):
#     __tablename__ = "chat_sessions"
#     id = Column(Integer, primary_key=True, index=True)
#     # name = Column(String)
#     status = Column(String, default="true")
#     time = Column(DateTime, nullable=True)
#     channel = Column(String, default="web")
#     page_id = Column(String)
#     name = Column(String)
#     current_receiver = Column(String, default="Bot")   # tên người tiếp nhận hiện tại
#     previous_receiver = Column(String)  # tên người tiếp nhận trước đó
#     created_at = Column(DateTime, default=datetime.now)
#     # messages = relationship("Message", back_populates="session")
#     messages = relationship(
#         "Message",
#         back_populates="session",
#         cascade="all, delete-orphan"
#     )
#     customer_info = relationship("CustomerInfo", back_populates="session", uselist=False)
#     id_tag = Column(Integer, ForeignKey("tag.id"), nullable=True)
#     tag = relationship("Tag", back_populates="chat_sessions")
class ChatSessionTag(Base):
    __tablename__ = "chat_session_tag"
    chat_session_id = Column(Integer, ForeignKey("chat_sessions.id"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tag.id"), primary_key=True)
    
    chat_session = relationship("ChatSession", back_populates="chat_session_tags")
    tag = relationship("Tag", back_populates="chat_session_tags")


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

    chat_session_tags = relationship("ChatSessionTag", back_populates="chat_session", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary="chat_session_tag", back_populates="chat_sessions")

    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan")
    customer_info = relationship("CustomerInfo", back_populates="session", uselist=False)

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    chat_session_id = Column(Integer, ForeignKey("chat_sessions.id"))
    sender_name = Column(String)
    sender_type = Column(String)   # customer / bot / staff
    image = Column(String)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.now) 
    sender_name = Column(String)
    session = relationship("ChatSession", back_populates="messages")
 
class CustomerInfo(Base):
    __tablename__ = "customer_info"
    id = Column(Integer, primary_key=True, index=True)
    chat_session_id = Column(Integer, ForeignKey("chat_sessions.id")) 
    created_at = Column(DateTime, default=datetime.now)
    session = relationship("ChatSession", back_populates="customer_info")
    customer_data = Column(JSON, nullable=True, default={})
     