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
                
                # Kiểm tra detail.id có tồn tại sau khi commit
                if not detail.id:
                    logger.error(f"Lỗi: detail.id không tồn tại sau khi commit cho file {file.filename}")
                    raise Exception("Detail ID không tồn tại sau khi commit")
                
                # Kiểm tra detail có tồn tại trong DB không
                check_result = await db.execute(
                    select(KnowledgeBaseDetail).filter(KnowledgeBaseDetail.id == detail.id)
                )
                if not check_result.scalar_one_or_none():
                    logger.error(f"Lỗi: detail_id={detail.id} không tồn tại trong DB cho file {file.filename}")
                    raise Exception(f"Detail ID {detail.id} không tồn tại trong database")
                
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
                
                # Kiểm tra detail.id có tồn tại sau khi commit
                if not detail.id:
                    logger.error(f"Lỗi: detail.id không tồn tại sau khi commit cho file {file.filename}")
                    raise Exception("Detail ID không tồn tại sau khi commit")
                
                # Kiểm tra detail có tồn tại trong DB không
                check_result = await db.execute(
                    select(KnowledgeBaseDetail).filter(KnowledgeBaseDetail.id == detail.id)
                )
                if not check_result.scalar_one_or_none():
                    logger.error(f"Lỗi: detail_id={detail.id} không tồn tại trong DB cho file {file.filename}")
                    raise Exception(f"Detail ID {detail.id} không tồn tại trong database")
                
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

async def add_kb_rich_text_service(
    kb_id: int,
    customer_id: Optional[int],
    file_name: str,
    user_id: int,
    raw_content: str,
    db: AsyncSession
):
    try:
        # 1. Truy vấn kb (không cần selectinload ở đây)
        result = await db.execute(select(KnowledgeBase).filter(KnowledgeBase.id == kb_id))
        kb = result.scalar_one_or_none()
        
        if not kb:
            logger.error(f"Không tìm thấy KB {kb_id} để thêm rich text")
            return None

        detail = KnowledgeBaseDetail(
            knowledge_base_id=kb.id,
            source_type="RICH_TEXT",
            file_name=file_name,
            raw_content=raw_content,
            is_active=True,
            user_id= user_id
        )
        db.add(detail)
        await db.flush() # Vẫn cần flush để lấy detail.id
        await db.commit() # Commit ngay để đảm bảo detail được lưu
        
        # Kiểm tra detail.id có tồn tại sau khi commit
        if not detail.id:
            logger.error(f"Lỗi: detail.id không tồn tại sau khi commit cho rich text")
            await db.rollback()
            return None
        
        # Kiểm tra detail có tồn tại trong DB không
        check_result = await db.execute(
            select(KnowledgeBaseDetail).filter(KnowledgeBaseDetail.id == detail.id)
        )
        if not check_result.scalar_one_or_none():
            logger.error(f"Lỗi: detail_id={detail.id} không tồn tại trong DB cho rich text")
            await db.rollback()
            return None
        
        # 2. Xử lý logic nghiệp vụ (KHÔNG COMMIT)
        text_result = await process_rich_text(
            raw_content,
            knowledge_base_detail_id=detail.id
        )
        
        # 3. SỬA LỖI TRANSACTION (Vấn đề 2)
        if not text_result['success']:
            logger.error(f"Lỗi xử lý rich text: {text_result.get('error')}")
            # Xóa detail vừa tạo vì xử lý thất bại
            await db.delete(detail)
            await db.commit()
            return None # KHÔNG commit
        
        # 4. Commit CHỈ KHI mọi thứ thành công
        # Đã commit ở trên rồi, không cần commit lại
        
        logger.info(f"Đã thêm rich text detail mới vào KB {kb_id}")
        
        # 5. SỬA LỖI MISSINGGREENLET (Vấn đề 1)
        # Tải lại đối tượng kb HOÀN CHỈNH với đầy đủ 'details' và 'user'
        
        stmt = (
            select(KnowledgeBase)
            .options(
                selectinload(KnowledgeBase.details)  # Tải 'details'
                .selectinload(KnowledgeBaseDetail.user) # Tải 'user' bên trong 'details'
            )
            .filter(KnowledgeBase.id == kb_id)
        )
        result = await db.execute(stmt)
        refreshed_kb = result.scalar_one_or_none() # Lấy kb đã tải đầy đủ
        
        # Trả về đối tượng đã tải đầy đủ (an toàn)
        return _convert_kb_to_dict(refreshed_kb)

    except Exception as e:
        logger.error(f"Lỗi khi thêm rich text vào KB (service): {str(e)}")
        await db.rollback() 
        raise

async def update_kb_with_rich_text_service(
    detail_id: int, 
    customer_id: Optional[int], 
    user_id: Optional[int],
    raw_content: str, 
    file_name: str,
    db: AsyncSession
):
    """
    Cập nhật một knowledge base detail (RICH_TEXT)
    Sẽ xóa chunks cũ và tạo lại chunks mới (TRONG CÙNG 1 TRANSACTION)
    """
    try:
        # Bước 1: Lấy detail và kb cha (phần này đã đúng)
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

        # Bước 2: Cập nhật thuộc tính (chưa commit)
        if customer_id is not None:
            kb.customer_id = customer_id
        
        detail.raw_content = raw_content
        detail.user_id = user_id
        detail.file_name = file_name
        
        logger.info(f"Đã cập nhật thuộc tính cho detail_id={detail_id} (chưa commit).")

        # Bước 3: Xóa chunks cũ (chưa commit)
        # Hàm delete_chunks_by_detail_id không nhận tham số db
        logger.info(f"Đang xóa các chunks cũ của detail_id={detail.id} (transaction)")
        await delete_chunks_by_detail_id(detail_id) # Không truyền db parameter

        # Bước 4: Tạo chunks mới (chưa commit)
        logger.info(f"Đang tạo chunks mới cho detail_id={detail.id} (transaction)")
        text_result = await process_rich_text(
            raw_content=raw_content,
            knowledge_base_detail_id=detail.id
        )

        if not text_result['success']:
            # Nếu thất bại, ném Exception để kích hoạt rollback ở khối 'except'
            error_msg = f"LỖI TÁI TẠO CHUNK: {text_result.get('error')}"
            logger.error(error_msg)
            raise Exception(error_msg)
        
        logger.info(f"Đã tạo {text_result.get('chunks_created', 0)} chunks mới.")

        # Bước 5: Commit MỘT LẦN DUY NHẤT
        # Chỉ commit khi tất cả các bước trên thành công
        await db.commit()
        logger.info(f"Đã commit thành công toàn bộ thay đổi cho detail_id={detail_id}.")

        # Bước 6: SỬA LỖI MissingGreenlet
        # Tải lại 'kb' với đầy đủ quan hệ để trả về
        stmt = (
            select(KnowledgeBase)
            .options(
                selectinload(KnowledgeBase.details)
                .selectinload(KnowledgeBaseDetail.user)
            )
            .filter(KnowledgeBase.id == kb.id)
        )
        result = await db.execute(stmt)
        refreshed_kb = result.scalar_one_or_none()
        
        return _convert_kb_to_dict(refreshed_kb)

    except Exception as e:
        logger.error(f"Lỗi nghiêm trọng khi cập nhật rich text (detail_id={detail_id}), ĐANG ROLLBACK: {str(e)}")
        await db.rollback() # Hoàn tác tất cả thay đổi (cả update text và xóa chunk)
        raise
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