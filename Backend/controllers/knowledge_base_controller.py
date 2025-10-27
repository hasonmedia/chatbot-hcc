from services import knowledge_base_service
from config.sheet import get_sheet
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import UploadFile
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

async def get_all_kb_controller(db: AsyncSession):
    return await knowledge_base_service.get_all_kb_service(db)

async def create_kb_controller(data: dict, db: AsyncSession):
    kb = await knowledge_base_service.create_kb_service(data, db)
    return {
        "message": "Knowledge Base created",
        "knowledge_base": kb
    }

async def update_kb_controller(
    kb_id: int,
    title: Optional[str],
    content: Optional[str],
    source: Optional[str],
    category: Optional[str],
    customer_id: Optional[str],
    is_active: Optional[bool],
    file: Optional[UploadFile],
    db: AsyncSession
):
    """
    Controller cập nhật knowledge base - hỗ trợ cả file upload (LEGACY)
    """
    kb = await knowledge_base_service.update_kb_with_file_service(
        kb_id=kb_id,
        title=title,
        content=content,
        source=source,
        category=category,
        customer_id=customer_id,
        is_active=is_active,
        file=file,
        db=db
    )
    if not kb:
        return {"error": "Knowledge Base not found"}
    return {
        "message": "Knowledge Base updated",
        "knowledge_base": kb
    }

async def update_kb_with_files_controller(
    kb_id: int,
    title: Optional[str],
    customer_id: Optional[str],
    files: List[UploadFile],
    db: AsyncSession
):
    """
    Controller cập nhật knowledge base - hỗ trợ nhiều files upload
    """
    # Lọc bỏ các file None
    valid_files = [f for f in (files or []) if f is not None]
    
    kb = await knowledge_base_service.update_kb_with_files_service(
        kb_id=kb_id,
        title=title,
        customer_id=customer_id,
        files=valid_files,
        db=db
    )
    if not kb:
        return {"error": "Knowledge Base not found"}
    return {
        "message": "Knowledge Base updated",
        "knowledge_base": kb,
        "files_processed": len(valid_files)
    }

async def create_kb_with_files_controller(
    title: str,
    customer_id: str,
    files: List[UploadFile],
    db: AsyncSession
):
    """
    Controller tạo knowledge base mới từ nhiều files upload
    """
    # Lọc bỏ các file None
    valid_files = [f for f in (files or []) if f is not None]
    
    if not valid_files:
        return {
            "error": "No files provided",
            "message": "Vui lòng chọn ít nhất một file"
        }
    
    kb = await knowledge_base_service.create_kb_with_files_service(
        title=title,
        customer_id=customer_id,
        files=valid_files,
        db=db
    )
    return {
        "message": "Knowledge Base created from files",
        "knowledge_base": kb,
        "files_processed": len(valid_files)
    }

async def delete_kb_detail_controller(detail_id: int, db: AsyncSession):
    """
    Controller xóa một file detail
    """
    success = await knowledge_base_service.delete_kb_detail_service(detail_id, db)
    if success:
        return {
            "message": "File deleted successfully",
            "success": True
        }
    else:
        return {
            "error": "File not found",
            "success": False
        }

async def search_kb_controller(query: str, db: AsyncSession):
    return await knowledge_base_service.search_kb_service(query, db)

async def test_sheet_processing_controller(sheet_id: str, kb_id: int):
    """
    Endpoint test để kiểm tra chức năng xử lý Google Sheet
    """
    try:
        result = get_sheet(sheet_id, kb_id)
        return {
            "success": result["success"],
            "message": result["message"],
            "details": {
                "chunks_created": result.get("chunks_created", 0),
                "sheets_processed": result.get("sheets_processed", 0)
            }
        }
    except Exception as e:
        logger.error(f"Lỗi trong test_sheet_processing_controller: {str(e)}")
        return {
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}",
            "details": {}
        }
