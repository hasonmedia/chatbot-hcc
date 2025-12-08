from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from sqlalchemy import text
from models.knowledge_base import KnowledgeBase, KnowledgeBaseDetail, KnowledgeCategory
from fastapi import UploadFile
from helper.file_processor import (
    process_uploaded_file, 
    process_rich_text 
)

from config.chromadb_config import delete_chunks

from typing import Optional, List
import logging
import os
import aiofiles
from collections import defaultdict
from config.database import AsyncSessionLocal

logger = logging.getLogger(__name__)

UPLOAD_DIR = "upload/knowledge_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)




async def get_all_kbs_service(
    db: AsyncSession,
    category_ids: Optional[List[int]] = None,
    file_types: Optional[List[str]] = None,
):
    """
    Lấy tất cả knowledge bases, có thể filter theo danh sách category_ids và/hoặc danh sách file_types.
    file_types: list of strings như ['PDF','DOCX','XLSX','TEXT'] (không phân biệt hoa thường)
    """
    # build where clause dynamically to support category_ids and file_types
    filters = []
    params = {}

    if category_ids:
        filters.append("kc.id = ANY(:category_ids)")
        params["category_ids"] = category_ids

    if file_types:
        # normalize to upper-case and strip dots if any
        normalized = [ft.upper().replace('.', '') for ft in file_types if ft]
        if normalized:
            filters.append("kbd.file_type = ANY(:file_types)")
            params["file_types"] = normalized

    category_filter = f"WHERE {' AND '.join(filters)}" if filters else ""

    sql_query = text(f"""
    WITH detail_cte AS (
        SELECT
            kbd.id AS detail_id,
            kbd.file_name,
            kbd.file_type,
            kbd.file_path,
            kbd.description,
            kbd.source_type,
            kbd.raw_content,
            kbd.created_at AS detail_created_at,
            kbd.updated_at AS detail_updated_at,
            kbd.is_active,
            u.id AS user_id,
            u.username,
            kc.id AS category_id,
            kc.name AS category_name,
            kb.id AS kb_id,
            kb.title AS kb_title,
            kb.created_at AS kb_created_at,
            kb.updated_at AS kb_updated_at
        FROM knowledge_base_detail kbd
        LEFT JOIN knowledge_category kc ON kbd.category_id = kc.id
        LEFT JOIN knowledge_base kb ON kc.knowledge_base_id = kb.id
        LEFT JOIN users u ON u.id = kbd.user_id
        {category_filter}
        ORDER BY  kbd.created_at DESC
    )
    SELECT
        kb_id,
        kb_title,
        kb_created_at,
        kb_updated_at,
        jsonb_agg(
            jsonb_build_object(
                'detail_id', detail_id,
                'file_name', file_name,
                'file_type', file_type,
                'file_path', file_path,
                'description', description,
                'source_type', source_type,
                'raw_content', raw_content,
                'detail_created_at', detail_created_at,
                'detail_updated_at', detail_updated_at,
                'is_active', is_active,
                'user_id', user_id,
                'username', username,
                'category_id', category_id,
                'category_name', category_name
            ) ORDER BY detail_created_at DESC
        ) AS details
    FROM detail_cte
    GROUP BY kb_id, kb_title, kb_created_at, kb_updated_at
    ORDER BY kb_id;
    """)

    result = await db.execute(sql_query, params)
    rows = result.fetchall()

    
    kb_data = [
        {
            "id": row.kb_id,
            "title": row.kb_title,
            "created_at": row.kb_created_at,
            "updated_at": row.kb_updated_at,
            "details": row.details
        }
        for row in rows
    ]
    
    return kb_data



async def create_kb_with_files_service(
    user_id: int,
    category_id: int,
    category_name: str,
    description: str,
    files: List[UploadFile],
    db: AsyncSession
):

    successful_files = []
    failed_files = []
    
    try:
        for file in files:
            detail = None
            file_path = None
            error_message = None
            
            try:
                file_path = os.path.join(UPLOAD_DIR, file.filename)
                async with aiofiles.open(file_path, 'wb') as f:
                    content_file = await file.read()
                    await f.write(content_file)
                
                
                detail = KnowledgeBaseDetail(
                    category_id=category_id,  
                    file_name=file.filename,
                    source_type="FILE", 
                    file_type=os.path.splitext(file.filename)[1].upper().replace('.', ''),
                    file_path=file_path,
                    description=description,
                    is_active=True,
                    user_id=user_id
                )
                db.add(detail)
                await db.flush() 
                await db.commit()
                
                
                success = await process_uploaded_file(
                    category_id,
                    category_name,
                    file_path, 
                    file.filename,
                    knowledge_base_detail_id=detail.id,
                    db=db
                )
                
                if success:
                    logger.info(f"✅ Xử lý thành công file: {file.filename}")
                    successful_files.append({
                        "filename": file.filename,
                        "detail_id": detail.id
                    })
                else:
                    error_message = "Không thể xử lý nội dung file (extract hoặc chunking thất bại)"
                    logger.error(f"❌ {error_message}: {file.filename}")
                    
                    try:
                        await delete_chunks(detail.id)
                    except Exception as chunk_err:
                        logger.warning(f"Không thể xóa chunks: {str(chunk_err)}")
                    
                    await db.refresh(detail)
                    await db.delete(detail)
                    await db.commit()
                    
                    if os.path.exists(file_path):
                        try:
                            os.remove(file_path)
                        except Exception as e:
                            logger.error(f"Không thể xóa file: {str(e)}")
                    
                    failed_files.append({
                        "filename": file.filename,
                        "error": error_message
                    })
                        
            except Exception as e:
                error_message = str(e)
                logger.error(f"❌ Lỗi khi xử lý file {file.filename}: {error_message}")
                
                failed_files.append({
                    "filename": file.filename,
                    "error": error_message
                })
                
                await db.rollback()
                
                if detail and detail.id:
                    try:
                        await delete_chunks(detail.id)
                    except:
                        pass
                
                if file_path and os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                    except Exception as rm_e:
                        logger.error(f"Không thể xóa file sau lỗi: {str(rm_e)}")
                
                continue
        
        total_files = len(files)
        success_count = len(successful_files)
        failed_count = len(failed_files)
        
        if success_count == total_files:
            status = "success"
            message = f"Đã xử lý thành công tất cả {success_count} file"
        elif success_count > 0:
            status = "partial_success"
            message = f"Đã xử lý thành công {success_count}/{total_files} file"
        else:
            status = "error"
            message = f"Tất cả {total_files} file đều bị lỗi"
        
        return {
            "status": status,
            "message": message,
            "total": total_files,
            "successful_count": success_count,
            "failed_count": failed_count,
            "successful": successful_files,
            "failed": failed_files
        }
        
    except Exception as e:
        logger.error(f"Lỗi nghiêm trọng khi tạo knowledge base: {str(e)}")
        await db.rollback()
        raise



async def add_kb_rich_text_service(
    file_name: str,
    user_id: int,
    raw_content: str,
    category_id: int,
    description: str,
    db: AsyncSession
):
    try:
       
        detail = KnowledgeBaseDetail(
            category_id=category_id,
            source_type="RICH_TEXT",
            file_type = "TEXT",
            file_name=file_name,
            raw_content=raw_content,
            description=description,
            is_active=True,
            user_id=user_id
        )
        db.add(detail)
        await db.flush() 
        await db.commit() 
        
        
        
        success = await process_rich_text(
            raw_content,
            knowledge_base_detail_id=detail.id,
            db=db
        )
        
        if success:
            return detail
        
        else:
            
            await delete_chunks(detail.id)
            await db.delete(detail)
            await db.commit() 
            
            return None
        

    except Exception as e:
        logger.error(f"Lỗi khi thêm rich text vào KB (service): {str(e)}")
        await db.rollback() 
        raise

async def update_kb_with_rich_text_service(
    detail_id: int, 
    user_id: Optional[int],
    raw_content: str, 
    file_name: str,
    description: Optional[str],
    db: AsyncSession
):
    
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
        if description is not None:
            detail.description = description
        
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



def _convert_kb_to_dict(kb: KnowledgeBase, category_ids: Optional[List[int]] = None):
    """
    Chuyển KB model sang dict với filter theo category_ids
    
    Args:
        kb: KnowledgeBase object
        category_ids: List category IDs để filter. Nếu None thì lấy tất cả.
    
    Returns:
        dict: KB data với details đã flatten và filter
    """
    if not kb:
        return None
    
    # Flatten tất cả details từ các categories
    all_details = []
    
    if kb.categories:
        for category in kb.categories:
            # Nếu có filter và category này không trong filter thì skip
            if category_ids is not None and category.id not in category_ids:
                continue
            
            # Thêm details của category này vào list
            if category.details:
                for detail in category.details:
                    all_details.append({
                        "id": detail.id,
                        "file_name": detail.file_name,
                        "file_type": detail.file_type,
                        "file_path": detail.file_path,
                        "source_type": detail.source_type,
                        "raw_content": detail.raw_content,
                        "created_at": detail.created_at,
                        "updated_at": detail.updated_at,
                        "is_active": detail.is_active,
                        "user_id": detail.user_id,
                        "category_id": category.id,
                        "category_name": category.name,
                        "user": {
                            "id": detail.user.id,
                            "username": detail.user.username,
                            "full_name": detail.user.full_name,
                            "email": detail.user.email
                        } if detail.user else None
                    })
    
    return {
        "id": kb.id,
        "title": kb.title,
        "created_at": kb.created_at,
        "updated_at": kb.updated_at,
        "details": all_details
    }
    

async def delete_kb_detail_service(detail_id: int, db: AsyncSession):
    try:
        
        await delete_chunks(knowledge_id = detail_id)
        detail = await db.get(KnowledgeBaseDetail, detail_id)
        await db.delete(detail)
        await db.commit()
        return True
    except Exception as e:
        await db.rollback()
        return False

async def delete_multiple_kb_details_service(detail_ids: list, db: AsyncSession):
    """
    Xóa nhiều knowledge base details cùng lúc
    """
    deleted_count = 0
    failed_count = 0
    failed_ids = []
    
    for detail_id in detail_ids:
        try:
            # Xóa chunks trong ChromaDB
            await delete_chunks(knowledge_id=str(detail_id))
            
            # Xóa detail trong database
            detail = await db.get(KnowledgeBaseDetail, detail_id)
            if detail:
                await db.delete(detail)
                await db.commit()
                deleted_count += 1
                logger.info(f"Đã xóa detail ID {detail_id}")
            else:
                failed_count += 1
                failed_ids.append(detail_id)
                logger.warning(f"Không tìm thấy detail ID {detail_id}")
            
        except Exception as e:
            await db.rollback()
            failed_count += 1
            failed_ids.append(detail_id)
            logger.error(f"Lỗi khi xóa detail {detail_id}: {str(e)}")
    
    return {
        "total_count": len(detail_ids),
        "deleted_count": deleted_count,
        "failed_count": failed_count,
        "failed_ids": failed_ids
    }
    

async def search_kb_service(query: str, db: AsyncSession):
   
    try:
        from llm.help_llm import search_similar_documents, get_current_model
        
        # Lấy thông tin model embedding
        model_info = await get_current_model(
            db_session=db,
            chat_session_id=None,  
            key_type="embedding"
        )
        
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

async def get_all_categories_service(db: AsyncSession):
   
    try:
        result = await db.execute(
            select(KnowledgeCategory)
            .order_by(KnowledgeCategory.id)
        )
        categories = result.scalars().all()
        
        
        categories_list = []
        for category in categories:
            # Đếm số lượng file trong danh mục
            count_result = await db.execute(
                select(KnowledgeBaseDetail)
                .filter(KnowledgeBaseDetail.category_id == category.id)
            )
            file_count = len(count_result.scalars().all())
            
            categories_list.append({
                "id": category.id,
                "name": category.name,
                "description": category.description,
                "knowledge_base_id": category.knowledge_base_id,
                "created_at": category.created_at,
                "updated_at": category.updated_at,
                "file_count": file_count
            })
        
        return categories_list
        
    except Exception as e:
        logger.error(f"Lỗi khi lấy danh sách categories: {str(e)}")
        raise Exception(f"Lỗi khi lấy danh sách categories: {str(e)}")

async def create_category_service(name: str, description: Optional[str], db: AsyncSession):

    try:
        # Kiểm tra tên danh mục đã tồn tại chưa
        existing_category = await db.execute(
            select(KnowledgeCategory).filter(KnowledgeCategory.name == name.strip())
        )
        if existing_category.scalar_one_or_none():
            raise Exception("Tên danh mục đã tồn tại")
        
        category = KnowledgeCategory(
            name=name.strip(),
            description=description.strip(),
            knowledge_base_id=1  # Luôn là 1
        )
        db.add(category)
        await db.commit()
        await db.refresh(category)
        
        logger.info(f"Đã tạo category mới: {name}")
        
        return {
            "id": category.id,
            "name": category.name,
            "description": category.description,
            "knowledge_base_id": category.knowledge_base_id,
            "created_at": category.created_at,
            "updated_at": category.updated_at
        }
        
    except Exception as e:
        await db.rollback()
        logger.error(f"Lỗi khi tạo category: {str(e)}")
        raise Exception(f"Lỗi khi tạo category: {str(e)}")

async def update_category_service(category_id: int, name: str, description: Optional[str], db: AsyncSession):
   
    try:
        result = await db.execute(
            select(KnowledgeCategory).filter(KnowledgeCategory.id == category_id)
        )
        category = result.scalar_one_or_none()
        
        if not category:
            return None
        
        # Kiểm tra tên danh mục trùng với danh mục khác (không phải chính nó)
        existing_category = await db.execute(
            select(KnowledgeCategory).filter(
                KnowledgeCategory.name == name.strip(),
                KnowledgeCategory.id != category_id
            )
        )
        if existing_category.scalar_one_or_none():
            raise Exception("Tên danh mục đã tồn tại")
        
        category.name = name.strip()
        category.description = description.strip()
        
        await db.commit()
        await db.refresh(category)
        
        logger.info(f"Đã cập nhật category ID {category_id}")
        
        return {
            "id": category.id,
            "name": category.name,
            "description": category.description,
            "knowledge_base_id": category.knowledge_base_id,
            "created_at": category.created_at,
            "updated_at": category.updated_at
        }
        
    except Exception as e:
        await db.rollback()
        logger.error(f"Lỗi khi cập nhật category: {str(e)}")
        raise Exception(f"Lỗi khi cập nhật category: {str(e)}")

async def delete_category_service(category_id: int, db: AsyncSession):
    
    try:
        result = await db.execute(
            select(KnowledgeCategory).filter(KnowledgeCategory.id == category_id)
        )
        category = result.scalar_one_or_none()
        
        if not category:
            return False
        
        # Xóa tất cả chunks của category này bằng 1 lần gọi
        await delete_chunks(category_id=str(category_id))
        logger.info(f"Đã xóa tất cả chunks của category_id={category_id}")
        
        # Xóa category (cascade sẽ xóa các details)
        await db.delete(category)
        await db.commit()
        
        logger.info(f"Đã xóa category ID {category_id}")
        return True
        
    except Exception as e:
        await db.rollback()
        logger.error(f"Lỗi khi xóa category: {str(e)}")
        raise Exception(f"Lỗi khi xóa category: {str(e)}")
    
    


