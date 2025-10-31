from services import knowledge_base_service
# from config.sheet import get_sheet  # <-- Xóa vì không còn dùng
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import UploadFile, HTTPException # Thêm HTTPException
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

# ----------------------------------------------------------------
# GET / READ
# ----------------------------------------------------------------

async def get_all_kbs_controller(db: AsyncSession):
    """
    Lấy tất cả Knowledge Base và details của chúng
    """
    # Sửa tên hàm service
    return await knowledge_base_service.get_all_kbs_service(db) 

# ----------------------------------------------------------------
# CREATE (Tạo mới)
# ----------------------------------------------------------------
async def add_kb_rich_text_controller(
    kb_id: int,
    data: dict,
    db: AsyncSession
):
    """
    Controller thêm Rich Text mới vào KB đã có
    """
    raw_content = data.get("raw_content")
    
    if not raw_content:
        raise HTTPException(status_code=400, detail="Thiếu 'raw_content'")

    kb = await knowledge_base_service.add_kb_rich_text_service(
        kb_id=kb_id,
        customer_id=data.get("customer_id"),
        user_id=data.get("user_id"),
        raw_content=raw_content,
        db=db
    )
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge Base not found")
        
    return {
        "message": "Knowledge Base (rich text) added",
        "knowledge_base": kb
    }
async def create_kb_with_files_controller(
    kb_id: int,
    title: str,
    customer_id: int,
    user_id: Optional[int],
    files: List[UploadFile],
    db: AsyncSession
):
    """
    Controller tạo knowledge base mới từ nhiều files upload
    (Dùng cho uploadMode = 'file')
    """
    valid_files = [f for f in (files or []) if f is not None and f.filename]
    
    if not valid_files:
        raise HTTPException(status_code=400, detail="Vui lòng chọn ít nhất một file")
    
    kb = await knowledge_base_service.create_kb_with_files_service(
        kb_id=kb_id,
        title=title,
        customer_id=customer_id,
        files=valid_files,
        user_id=user_id,
        db=db
    )
    return {
        "message": "Knowledge Base created from files",
        "knowledge_base": kb,
        "files_processed": len(valid_files)
    }

async def update_kb_with_files_controller(
    kb_id: int,
    title: Optional[str],
    customer_id: Optional[int],
    user_id: Optional[int],
    files: List[UploadFile],
    db: AsyncSession
):
    """
    Controller cập nhật KB (thêm file mới)
    (Dùng khi ở trang Edit, chọn uploadMode = 'file' và thêm file)
    """
    valid_files = [f for f in (files or []) if f is not None and f.filename]
    
    kb = await knowledge_base_service.update_kb_with_files_service(
        kb_id=kb_id,
        title=title,
        customer_id=customer_id,
        files=valid_files,
        user_id=user_id,
        db=db
    )
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge Base not found")
        
    return {
        "message": "Knowledge Base updated (files added)",
        "knowledge_base": kb,
        "files_processed": len(valid_files)
    }

async def update_kb_with_rich_text_controller(
    detail_id: int, # Cập nhật theo detail_id
    data: dict,     # Giả sử đây là Pydantic schema body
    db: AsyncSession
):
    """
    Controller cập nhật một KB Detail dạng Rich Text
    (Dùng khi ở trang Edit, chọn uploadMode = 'manual')
    """
    raw_content = data.get("raw_content")
    
    if  not raw_content:
        raise HTTPException(status_code=400, detail="Thiếu 'title' hoặc 'raw_content'")

    kb = await knowledge_base_service.update_kb_with_rich_text_service(
        detail_id=detail_id,
        customer_id=data.get("customer_id"),
        raw_content=raw_content,
        user_id=data.get("user_id"),
        db=db
    )
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge Base Detail not found or not RICH_TEXT type")
        
    return {
        "message": "Knowledge Base (rich text) updated",
        "knowledge_base": kb
    }

async def delete_kb_detail_controller(detail_id: int, db: AsyncSession):
    """
    Controller xóa một file/text detail (và các chunks của nó)
    """
    success = await knowledge_base_service.delete_kb_detail_service(detail_id, db)
    if success:
        return {
            "message": "File/Detail deleted successfully",
            "success": True
        }
    else:
        raise HTTPException(status_code=404, detail="File/Detail not found")

async def search_kb_controller(query: str, db: AsyncSession):
    return await knowledge_base_service.search_kb_service(query, db)

# --- ĐÃ XÓA `test_sheet_processing_controller` (legacy) ---