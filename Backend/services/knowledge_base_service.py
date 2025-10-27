from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from models.knowledge_base import KnowledgeBase, KnowledgeBaseDetail, DocumentChunk
from config.sheet import get_sheet
from fastapi import UploadFile
from helper.file_processor import process_uploaded_file, delete_chunks_by_detail_id
from typing import Optional, List
import logging
import os
import aiofiles

logger = logging.getLogger(__name__)

# Thư mục lưu file upload
UPLOAD_DIR = "upload/knowledge_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def get_all_kb_service(db: AsyncSession):
    """Lấy knowledge base với tất cả details"""
    result = await db.execute(
        select(KnowledgeBase)
    )
    kb = result.scalar_one_or_none()
    
    if kb:
        # Eager load details
        await db.refresh(kb, ['details'])
        
        # Chuyển đổi sang dict để trả về
        kb_dict = {
            "id": kb.id,
            "title": kb.title,
            "created_at": kb.created_at,
            "updated_at": kb.updated_at,
            "customer_id": kb.customer_id,
            "details": [
                {
                    "id": detail.id,
                    "file_name": detail.file_name,
                    "file_type": detail.file_type,
                    "file_path": detail.file_path,
                    "created_at": detail.created_at,
                    "is_active": detail.is_active
                }
                for detail in kb.details
            ] if kb.details else []
        }
        return kb_dict
    
    return kb


async def update_kb_service(kb_id: int, data: dict, db: AsyncSession):
    """Update knowledge base cơ bản (không có file)"""
    result = await db.execute(select(KnowledgeBase).filter(KnowledgeBase.id == kb_id))
    kb = result.scalar_one_or_none()
    if not kb:
        return None
    kb.title = data.get("title", kb.title)
    kb.customer_id = data.get("customer_id", kb.customer_id)
    
    await db.commit()
    await db.refresh(kb)

    return kb


async def create_kb_service(data: dict, db: AsyncSession):
    """Tạo knowledge base mới (manual input)"""
    kb = KnowledgeBase(
        title=data["title"],
        customer_id=data.get("customer_id", "manual")
    )
    db.add(kb)
    await db.commit()
    await db.refresh(kb)
    
    return kb


async def update_kb_with_files_service(
    kb_id: int,
    title: Optional[str],
    customer_id: Optional[str],
    files: List[UploadFile],
    db: AsyncSession
):
    """
    Cập nhật knowledge base với nhiều files
    """
    result = await db.execute(select(KnowledgeBase).filter(KnowledgeBase.id == kb_id))
    kb = result.scalar_one_or_none()
    if not kb:
        return None
    
    # Cập nhật các trường cơ bản
    if title is not None:
        kb.title = title
    if customer_id is not None:
        kb.customer_id = customer_id
    
    # Xử lý files nếu có
    if files and len(files) > 0:
        for file in files:
            detail = None
            file_path = None
            try:
                # Lưu file
                file_path = os.path.join(UPLOAD_DIR, file.filename)
                async with aiofiles.open(file_path, 'wb') as f:
                    content_file = await file.read()
                    await f.write(content_file)
                
                # Tạo knowledge_base_detail mới
                detail = KnowledgeBaseDetail(
                    knowledge_base_id=kb.id,
                    file_name=file.filename,
                    file_type=os.path.splitext(file.filename)[1].upper().replace('.', ''),
                    file_path=file_path,
                    is_active=True
                )
                db.add(detail)
                await db.flush()  # Để lấy detail.id
                await db.commit()  # Commit detail trước khi chunk
                
                # Xử lý file, chunk và lưu vào database
                file_result = await process_uploaded_file(
                    file_path, 
                    file.filename,
                    knowledge_base_detail_id=detail.id
                )
                
                if file_result['success']:
                    logger.info(f"Đã thêm file: {file.filename} với {file_result.get('chunks_created', 0)} chunks")
                else:
                    logger.error(f"Lỗi xử lý file {file.filename}: {file_result.get('error')}")
                    # Xóa chunks nếu có
                    await delete_chunks_by_detail_id(detail.id)
                    # Xóa detail vì xử lý thất bại
                    await db.delete(detail)
                    await db.commit()
                    # Xóa file vật lý
                    if os.path.exists(file_path):
                        os.remove(file_path)
                        
            except Exception as e:
                logger.error(f"Lỗi khi xử lý file {file.filename}: {str(e)}")
                # Rollback và cleanup
                if detail and detail.id:
                    await delete_chunks_by_detail_id(detail.id)
                    try:
                        await db.delete(detail)
                        await db.commit()
                    except:
                        pass
                if file_path and os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                    except:
                        pass
                continue
    
    await db.refresh(kb, ['details'])
    
    return kb


async def create_kb_with_files_service(
    title: str,
    customer_id: str,
    files: List[UploadFile],
    db: AsyncSession
):
    """
    Tạo knowledge base mới với nhiều files
    """
    try:
        # Tạo knowledge base mới
        kb = KnowledgeBase(
            title=title,
            customer_id=customer_id
        )
        db.add(kb)
        await db.flush()  # Để lấy kb.id
        
        # Xử lý từng file
        for file in files:
            detail = None
            file_path = None
            try:
                # Lưu file
                file_path = os.path.join(UPLOAD_DIR, file.filename)
                async with aiofiles.open(file_path, 'wb') as f:
                    content_file = await file.read()
                    await f.write(content_file)
                
                # Tạo knowledge_base_detail
                detail = KnowledgeBaseDetail(
                    knowledge_base_id=kb.id,
                    file_name=file.filename,
                    file_type=os.path.splitext(file.filename)[1].upper().replace('.', ''),
                    file_path=file_path,
                    is_active=True
                )
                db.add(detail)
                await db.flush()  # Để lấy detail.id
                await db.commit()  # Commit detail trước khi chunk
                
                # Xử lý file, chunk và lưu vào database
                file_result = await process_uploaded_file(
                    file_path, 
                    file.filename,
                    knowledge_base_detail_id=detail.id
                )
                
                if file_result['success']:
                    logger.info(f"Đã xử lý file: {file.filename} với {file_result.get('chunks_created', 0)} chunks")
                else:
                    logger.error(f"Lỗi xử lý file {file.filename}: {file_result.get('error')}")
                    # Xóa chunks nếu có
                    await delete_chunks_by_detail_id(detail.id)
                    # Xóa detail vì xử lý thất bại
                    await db.delete(detail)
                    await db.commit()
                    # Xóa file vật lý
                    if os.path.exists(file_path):
                        os.remove(file_path)
                        
            except Exception as e:
                logger.error(f"Lỗi khi xử lý file {file.filename}: {str(e)}")
                # Rollback và cleanup
                if detail and detail.id:
                    await delete_chunks_by_detail_id(detail.id)
                    try:
                        await db.delete(detail)
                        await db.commit()
                    except:
                        pass
                if file_path and os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                    except:
                        pass
                continue
        
        await db.refresh(kb, ['details'])
        
        logger.info(f"Đã tạo knowledge base với {len(files)} files")
        return kb
        
    except Exception as e:
        logger.error(f"Lỗi khi tạo knowledge base: {str(e)}")
        await db.rollback()
        raise


async def delete_kb_detail_service(detail_id: int, db: AsyncSession):
    """
    Xóa một file detail khỏi knowledge base
    Đồng thời xóa tất cả chunks liên quan
    """
    result = await db.execute(
        select(KnowledgeBaseDetail).filter(KnowledgeBaseDetail.id == detail_id)
    )
    detail = result.scalar_one_or_none()
    
    if detail:
        # Bước 1: Xóa tất cả chunks liên quan
        await delete_chunks_by_detail_id(detail_id)
        logger.info(f"Đã xóa chunks của detail_id={detail_id}")
        
        # Bước 2: Xóa file vật lý nếu có
        if detail.file_path and os.path.exists(detail.file_path):
            try:
                os.remove(detail.file_path)
                logger.info(f"Đã xóa file: {detail.file_path}")
            except Exception as e:
                logger.error(f"Lỗi xóa file: {str(e)}")
        
        # Bước 3: Xóa record trong DB
        await db.delete(detail)
        await db.commit()
        return True
    
    return False


async def create_kb_service(data: dict, db: AsyncSession):
    await db.execute(delete(KnowledgeBase))
    await db.commit()
    
    kb = KnowledgeBase(
        title=data["title"],
        content=data["content"],
        source=data.get("source", "manual"),
        customer_id=data.get("customer_id", "manual"),
        category=data.get("category", "general"),
        is_active=data.get("is_active", True)
    )
    db.add(kb)
    await db.commit()
    await db.refresh(kb)
    
    # Xử lý Google Sheet nếu source là sheet ID
    if kb.source and len(kb.source) > 20:  # Google Sheet ID thường dài > 20 ký tự
        try:
            result = await get_sheet(kb.source, kb.id)
            if not result["success"]:
                logger.error(f"Lỗi xử lý Google Sheet: {result['message']}")
                # Có thể raise exception hoặc return error tùy yêu cầu
            else:
                logger.info(f"Đã xử lý thành công Google Sheet: {result['message']}")
        except Exception as e:
            logger.error(f"Lỗi không mong muốn khi xử lý Google Sheet: {str(e)}")
    
    return kb


async def search_kb_service(query: str, db: AsyncSession):
    
    return "Chức năng tìm kiếm đang được phát triển."
    
    