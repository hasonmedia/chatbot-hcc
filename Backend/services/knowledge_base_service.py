from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from models.knowledge_base import KnowledgeBase
from config.sheet import get_sheet
import logging

logger = logging.getLogger(__name__)


async def get_all_kb_service(db: AsyncSession):
    result = await db.execute(select(KnowledgeBase))
    kbs = result.scalar_one_or_none()
    return kbs


async def update_kb_service(kb_id: int, data: dict, db: AsyncSession):
    result = await db.execute(select(KnowledgeBase).filter(KnowledgeBase.id == kb_id))
    kb = result.scalar_one_or_none()
    if not kb:
        return None
    kb.title = data.get("title", kb.title)
    kb.content = data.get("content", kb.content)
    kb.source = data.get("source", kb.source)
    kb.category = data.get("category", kb.category)
    kb.is_active = data.get("is_active", kb.is_active)
    kb.customer_id = data.get("customer_id", kb.customer_id)
    
    await db.commit()
    await db.refresh(kb)
    
    # Xử lý Google Sheet nếu source là sheet ID
    if kb.source and len(kb.source) > 20:  # Google Sheet ID thường dài > 20 ký tự
        try:
            result = await get_sheet(kb.source, kb.id)
            if not result["success"]:
                logger.error(f"Lỗi xử lý Google Sheet: {result['message']}")
                # Có thể return error hoặc tiếp tục tùy yêu cầu
            else:
                logger.info(f"Đã xử lý thành công Google Sheet: {result['message']}")
        except Exception as e:
            logger.error(f"Lỗi không mong muốn khi xử lý Google Sheet: {str(e)}")

    return kb


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
    
    