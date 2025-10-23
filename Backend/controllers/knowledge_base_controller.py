from services import knowledge_base_service
from config.sheet import get_sheet
from sqlalchemy.ext.asyncio import AsyncSession
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

async def update_kb_controller(kb_id: int, data: dict, db: AsyncSession):
    kb = await knowledge_base_service.update_kb_service(kb_id, data, db)
    if not kb:
        return {"error": "Knowledge Base not found"}
    return {
        "message": "Knowledge Base updated",
        "knowledge_base": kb
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
