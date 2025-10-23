from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Text, Boolean
from datetime import datetime
from config.database import Base


class FieldConfig(Base): 
    __tablename__ = "field_config"

    id = Column(Integer, primary_key=True, autoincrement=True)
    is_required = Column(Boolean, nullable=False, default=False)  # bắt buộc hay không
    excel_column_name = Column(String(255), nullable=False)   # tên hiển thị trong Excel (có thể tiếng việt)
    excel_column_letter = Column(String(10), nullable=False)  # cột Excel (A, B, C...)

