from fastapi import APIRouter, Query, Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from controllers import knowledge_base_controller


router = APIRouter(prefix="/knowledge-base", tags=["Knowledge Base"])

@router.get("/")
async def get_all_kb(db: AsyncSession = Depends(get_db)):
    return await knowledge_base_controller.get_all_kb_controller(db)

@router.post("/")
async def create_kb(request: Request, db: AsyncSession = Depends(get_db)):
    data = await request.json()
    return await knowledge_base_controller.create_kb_controller(data, db)

@router.patch("/{kb_id}")
async def update_kb(kb_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    data = await request.json()
    return await knowledge_base_controller.update_kb_controller(kb_id, data, db)

@router.get("/search")
async def search_kb(query: str = Query(...), db: AsyncSession = Depends(get_db)):
    return await knowledge_base_controller.search_kb_controller(query, db)

@router.post("/test-sheet")
async def test_sheet_processing(request: Request):
    """
    Endpoint test để kiểm tra chức năng xử lý Google Sheet
    Body: {"sheet_id": "...", "kb_id": 1}
    """
    data = await request.json()
    sheet_id = data.get("sheet_id")
    kb_id = data.get("kb_id", 1)
    
    if not sheet_id:
        return {"success": False, "message": "sheet_id is required"}
    
    return await knowledge_base_controller.test_sheet_processing_controller(sheet_id, kb_id)