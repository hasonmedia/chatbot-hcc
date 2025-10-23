from datetime import datetime
from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Text, Boolean
from config.database import Base

class TelegramBot(Base):
    __tablename__ = "telegram_bot"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    bot_name = Column(String(255), nullable=False)
    bot_token = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    company_id = Column(Integer, ForeignKey("company.id"), nullable=False)