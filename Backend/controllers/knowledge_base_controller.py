from services import knowledge_base_service
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import UploadFile, HTTPException # Thêm HTTPException
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)


async def get_all_kbs_controller(
    db: AsyncSession,
    category_ids: Optional[List[int]] = None,
    file_types: Optional[List[str]] = None,
):
    """
    Controller trả về all KBs, hỗ trợ filter theo category_ids và file_types
    """
    return await knowledge_base_service.get_all_kbs_service(db, category_ids, file_types)

async def add_kb_rich_text_controller(
    data: dict,
    db: AsyncSession
):

    kb = await knowledge_base_service.add_kb_rich_text_service(
        user_id=data.get("user_id"),
        file_name=data.get("file_name"),
        raw_content=data.get("raw_content"),
        category_id=data.get("category_id"),
        db=db
    )
        
    return {
        "message": "Knowledge Base (rich text) added",
        "knowledge_base": kb
    }

async def create_kb_with_files_controller(
    user_id: Optional[int],
    category_id: Optional[int],
    files: List[UploadFile],
    db: AsyncSession
):

    
    
    valid_files = [f for f in (files or []) if f is not None and f.filename]
    
    kb = await knowledge_base_service.create_kb_with_files_service(
        files=valid_files,
        user_id=user_id,
        category_id=category_id,
        db=db
    )
    return {
        "message": "Knowledge Base created from files",
        "knowledge_base": kb
    }


async def update_kb_with_rich_text_controller(
    detail_id: int, 
    data: dict,   
    db: AsyncSession
):

    raw_content = data.get("raw_content")
    file_name = data.get("file_name")
    

    kb = await knowledge_base_service.update_kb_with_rich_text_service(
        detail_id=detail_id,
        file_name=file_name,
        raw_content=raw_content,
        user_id=data.get("user_id"),
        db=db
    )

        
    return {
        "message": "Knowledge Base (rich text) updated",
        "knowledge_base": kb
    }

async def delete_kb_detail_controller(detail_id: int, db: AsyncSession):

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

async def get_all_categories_controller(db: AsyncSession):
    """
    Controller lấy tất cả các knowledge categories
    """
    return await knowledge_base_service.get_all_categories_service(db)

async def create_category_controller(data: dict, db: AsyncSession):
    """
    Controller tạo category mới
    """
    name = data.get("name")
    description = data.get("description")
    
    if not name:
        raise HTTPException(status_code=400, detail="Tên danh mục không được để trống")
    
    category = await knowledge_base_service.create_category_service(name, description, db)
    return {
        "message": "Tạo danh mục thành công",
        "category": category
    }

async def update_category_controller(category_id: int, data: dict, db: AsyncSession):
    """
    Controller cập nhật category
    """
    name = data.get("name")
    description = data.get("description")
    
    if not name:
        raise HTTPException(status_code=400, detail="Tên danh mục không được để trống")
    
    category = await knowledge_base_service.update_category_service(category_id, name, description, db)
    if not category:
        raise HTTPException(status_code=404, detail="Không tìm thấy danh mục")
    
    return {
        "message": "Cập nhật danh mục thành công",
        "category": category
    }

async def delete_category_controller(category_id: int, db: AsyncSession):
    """
    Controller xóa category
    """
    success = await knowledge_base_service.delete_category_service(category_id, db)
    if not success:
        raise HTTPException(status_code=404, detail="Không tìm thấy danh mục")
    
    return {
        "message": "Xóa danh mục thành công",
        "success": True
    }

