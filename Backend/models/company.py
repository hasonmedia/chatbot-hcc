from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from config.database import Base
from sqlalchemy.orm import relationship


class Company(Base):
    __tablename__ = "company"
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String(255), nullable=False)
    logo_url = Column(String(255), nullable=False)
    contact = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    
    