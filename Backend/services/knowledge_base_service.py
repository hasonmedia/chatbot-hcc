from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from models.knowledge_base import KnowledgeBase, KnowledgeBaseDetail, DocumentChunk
from fastapi import UploadFile
from helper.file_processor import (
    process_uploaded_file, 
    delete_chunks_by_detail_id,
    process_rich_text 
)
from typing import Optional, List
import logging
import os
import aiofiles

logger = logging.getLogger(__name__)

UPLOAD_DIR = "upload/knowledge_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def get_all_kbs_service(db: AsyncSession):
    """
    Lấy knowledge base DUY NHẤT với tất cả details
    (Vì hệ thống chỉ hỗ trợ 1 KB)
    """
    result = await db.execute(
        select(KnowledgeBase).options(
            selectinload(KnowledgeBase.details).selectinload(KnowledgeBaseDetail.user)
        )
    )
    kb = result.scalars().first() 
    return _convert_kb_to_dict(kb)

async def update_kb_service(kb_id: int, data: dict, db: AsyncSession):
    """Update knowledge base cơ bản (chỉ title, customer_id)"""
    result = await db.execute(select(KnowledgeBase).filter(KnowledgeBase.id == kb_id))
    kb = result.scalar_one_or_none()
    if not kb:
        return None
    kb.title = data.get("title", kb.title)
    kb.customer_id = data.get("customer_id", kb.customer_id)
    
    await db.commit()
    await db.refresh(kb)
    return kb


async def update_kb_with_files_service(
    kb_id: int,
    title: Optional[str],
    customer_id: Optional[int],
    user_id: int,
    files: List[UploadFile],
    db: AsyncSession
):
    """
    Cập nhật knowledge base (thêm files mới)
    """
    result = await db.execute(select(KnowledgeBase).filter(KnowledgeBase.id == kb_id))
    kb = result.scalar_one_or_none()
    if not kb:
        return None
    
    if title is not None:
        kb.title = title
    if customer_id is not None:
        kb.customer_id = customer_id
    
    if files and len(files) > 0:
        for file in files:
            detail = None
            file_path = None
            try:
                file_path = os.path.join(UPLOAD_DIR, file.filename)
                async with aiofiles.open(file_path, 'wb') as f:
                    content_file = await file.read()
                    await f.write(content_file)
                
                detail = KnowledgeBaseDetail(
                    knowledge_base_id=kb.id,
                    file_name=file.filename,
                    source_type="FILE", 
                    file_type=os.path.splitext(file.filename)[1].upper().replace('.', ''),
                    file_path=file_path,
                    is_active=True,
                    user_id= user_id
                )
                db.add(detail)
                print("them ok")
                await db.flush() 
                await db.commit() 
                
                file_result = await process_uploaded_file(
                    file_path, 
                    file.filename,
                    knowledge_base_detail_id=detail.id
                )
                
                if file_result['success']:
                    logger.info(f"Đã thêm file: {file.filename} với {file_result.get('chunks_created', 0)} chunks")
                else:
                    logger.error(f"Lỗi xử lý file {file.filename}: {file_result.get('error')}")
                    await delete_chunks_by_detail_id(detail.id)
                    await db.delete(detail)
                    await db.commit()
                    if os.path.exists(file_path):
                        os.remove(file_path)
                        
            except Exception as e:
                logger.error(f"Lỗi khi xử lý file {file.filename}: {str(e)}")
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

# knowledge_base_service.py

async def add_kb_rich_text_service(
    kb_id: int,
    customer_id: Optional[int],
    user_id: int,
    raw_content: str,
    db: AsyncSession
):
    """
    Thêm một detail (Rich Text) mới vào KB đã có
    """
    try:
        result = await db.execute(select(KnowledgeBase).filter(KnowledgeBase.id == kb_id))
        kb = result.scalar_one_or_none()
        
        if not kb:
            logger.error(f"Không tìm thấy KB {kb_id} để thêm rich text")
            return None

        # Bỏ 2 dòng cập nhật kb.title và kb.customer_id

        detail = KnowledgeBaseDetail(
            knowledge_base_id=kb.id,
            source_type="RICH_TEXT",
            raw_content=raw_content,
            is_active=True,
            user_id= user_id
        )
        db.add(detail)
        await db.flush() # Vẫn cần flush để lấy detail.id
        await db.commit()
        text_result = await process_rich_text(
            raw_content,
            knowledge_base_detail_id=detail.id
        )
        
        if not text_result['success']:
            logger.error(f"Lỗi xử lý rich text: {text_result.get('error')}")
            # Nếu lỗi, rollback toàn bộ transaction
            await db.rollback()
            await db.commit()
            return None # Hoặc raise Exception
        
        
        
        logger.info(f"Đã thêm rich text detail mới vào KB {kb_id}")
        await db.refresh(kb, ['details'])
        return _convert_kb_to_dict(kb)

    except Exception as e:
        logger.error(f"Lỗi khi thêm rich text vào KB (service): {str(e)}")
        await db.rollback() 
        raise
async def create_kb_with_files_service(
    kb_id: int,
    title: str,
    customer_id: Optional[int],
    user_id: int,
    files: List[UploadFile],
    db: AsyncSession
):
    """
    Tạo knowledge base mới với nhiều files
    """
    kb = None 
    try:
        result = await db.execute(select(KnowledgeBase).filter(KnowledgeBase.id == kb_id))
        kb = result.scalar_one_or_none()
        
        if not kb:
            logger.error(f"Không tìm thấy KB {kb_id} để thêm file")
            return None
        
        for file in files:
            detail = None
            file_path = None
            try:
                file_path = os.path.join(UPLOAD_DIR, file.filename)
                async with aiofiles.open(file_path, 'wb') as f:
                    content_file = await file.read()
                    await f.write(content_file)
                
                detail = KnowledgeBaseDetail(
                    knowledge_base_id=kb.id,
                    file_name=file.filename,
                    source_type="FILE", 
                    file_type=os.path.splitext(file.filename)[1].upper().replace('.', ''),
                    file_path=file_path,
                    is_active=True,
                    user_id= user_id
                )
                db.add(detail)
                await db.flush() 
                await db.commit() 
                
                file_result = await process_uploaded_file(
                    file_path, 
                    file.filename,
                    knowledge_base_detail_id=detail.id
                )
                
                if file_result['success']:
                    logger.info(f"Đã xử lý file: {file.filename} với {file_result.get('chunks_created', 0)} chunks")
                else:
                    logger.error(f"Lỗi xử lý file {file.filename}: {file_result.get('error')}")
                    await delete_chunks_by_detail_id(detail.id)
                    await db.delete(detail)
                    await db.commit()
                    if os.path.exists(file_path):
                        os.remove(file_path)
                        
            except Exception as e:
                logger.error(f"Lỗi khi xử lý file {file.filename}: {str(e)}")
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

async def update_kb_with_rich_text_service(
    detail_id: int, 
    customer_id: Optional[int], 
    user_id: Optional[int],
    raw_content: str, 
    db: AsyncSession
):
    """
    Cập nhật một knowledge base detail (RICH_TEXT)
    Sẽ xóa chunks cũ và tạo lại chunks mới
    """
    try:
        result = await db.execute(
            select(KnowledgeBaseDetail)
            .options(selectinload(KnowledgeBaseDetail.knowledge_base)) 
            .filter(KnowledgeBaseDetail.id == detail_id)
        )
        detail = result.scalar_one_or_none()
        
        if not detail:
            logger.error(f"Không tìm thấy KnowledgeBaseDetail với id={detail_id} để cập nhật.")
            return None
        
        if detail.source_type != "RICH_TEXT":
            logger.error(f"Lỗi: detail_id={detail_id} không phải là RICH_TEXT.")
            return None
            
        kb = detail.knowledge_base
        if not kb:
             logger.error(f"Không tìm thấy KnowledgeBase cha cho detail_id={detail_id}.")
             return None

        if customer_id is not None:
            kb.customer_id = customer_id
        
        detail.raw_content = raw_content
        detail.user_id = user_id
        await db.commit() 
        logger.info(f"Đã cập nhật text cho detail_id={detail_id}.")

   
        logger.info(f"Đang xóa các chunks cũ của detail_id={detail.id}...")
        await delete_chunks_by_detail_id(detail.id)

        logger.info(f"Đang tạo chunks mới cho detail_id={detail.id}...")
        text_result = await process_rich_text(
            raw_content=raw_content,
            knowledge_base_detail_id=detail.id
        )

        if not text_result['success']:
            logger.error(f"LỖI TÁI TẠO CHUNK: {text_result.get('error')}. "
                         f"Detail {detail.id} sẽ không có chunk cho đến khi được cập nhật lại.")
        else:
            logger.info(f"Đã tạo {text_result.get('chunks_created', 0)} chunks mới.")

        await db.refresh(kb)
        
        await db.refresh(kb, ['details']) 
        
        return _convert_kb_to_dict(kb)

    except Exception as e:
        logger.error(f"Lỗi nghiêm trọng khi cập nhật rich text (detail_id={detail_id}): {str(e)}")
        await db.rollback()
        raise

async def delete_kb_detail_service(detail_id: int, db: AsyncSession):
    """
    Xóa một file detail khỏi knowledge base (File hoặc Rich Text)
    Đồng thời xóa tất cả chunks liên quan
    """
    result = await db.execute(
        select(KnowledgeBaseDetail).filter(KnowledgeBaseDetail.id == detail_id)
    )
    detail = result.scalar_one_or_none()
    
    if detail:
        await delete_chunks_by_detail_id(detail_id)
        logger.info(f"Đã xóa chunks của detail_id={detail_id}")
        
        if detail.file_path and os.path.exists(detail.file_path):
            try:
                os.remove(detail.file_path)
                logger.info(f"Đã xóa file: {detail.file_path}")
            except Exception as e:
                logger.error(f"Lỗi xóa file: {str(e)}")
        
        await db.delete(detail)
        await db.commit()
        return True
    
    return False


async def search_kb_service(query: str, db: AsyncSession):
    """
    Tìm kiếm tài liệu tương tự trong knowledge base
    
    Args:
        query: Câu hỏi tìm kiếm
        db: Database session
    
    Returns:
        list: Danh sách kết quả tìm kiếm với similarity score
    """
    try:
        from llm.help_llm import search_similar_documents, get_current_model
        
        # Lấy thông tin model embedding
        model_info = await get_current_model(
            db_session=db,
            chat_session_id=None,  # Không cần session_id cho search
            key_type="embedding"
        )
        
        # Gọi hàm search với top_k=5
        results = await search_similar_documents(
            db_session=db,
            query=query,
            top_k=5,
            api_key=model_info["key"],
            model_name=model_info["name"]
        )
        
        # Format lại kết quả để trả về cho frontend
        formatted_results = []
        for result in results:
            formatted_results.append({
                "content": result.get("content", ""),
                "similarity_score": result.get("similarity_score", 0)
            })
        
        return formatted_results
        
    except Exception as e:
        print(f"❌ Lỗi khi tìm kiếm: {e}")
        import traceback
        traceback.print_exc()
        raise Exception(f"Lỗi khi tìm kiếm trong knowledge base: {str(e)}")

def _convert_kb_to_dict(kb: KnowledgeBase):
    """Hàm nội bộ để chuyển KB (model) sang dict (an toàn)"""
    if not kb:
        return None
    
    return {
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
                "source_type": detail.source_type,
                "raw_content": detail.raw_content,
                "created_at": detail.created_at,
                "is_active": detail.is_active,
                "user_id": detail.user_id,
                "user": {
                    "id": detail.user.id,
                    "username": detail.user.username,
                    "full_name": detail.user.full_name,
                    "email": detail.user.email
                } if detail.user else None
            }
            for detail in kb.details
        ] if kb.details else []
    }