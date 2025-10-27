from fastapi import APIRouter, Query, Request, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from controllers import knowledge_base_controller
from typing import Optional, List


router = APIRouter(prefix="/knowledge-base", tags=["Knowledge Base"])

@router.get("/")
async def get_all_kb(db: AsyncSession = Depends(get_db)):
    return await knowledge_base_controller.get_all_kb_controller(db)

@router.post("/")
async def create_kb(request: Request, db: AsyncSession = Depends(get_db)):
    data = await request.json()
    return await knowledge_base_controller.create_kb_controller(data, db)

@router.patch("/{kb_id}")
async def update_kb(
    kb_id: int,
    title: Optional[str] = Form(None),
    customer_id: Optional[str] = Form(None),
    files: List[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Update knowledge base - hỗ trợ cả JSON và form-data với nhiều files upload
    """
    return await knowledge_base_controller.update_kb_with_files_controller(
        kb_id=kb_id,
        title=title,
        customer_id=customer_id,
        files=files,
        db=db
    )

@router.post("/upload")
async def upload_files_kb(
    title: str = Form(...),
    customer_id: str = Form("manual"),
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Tạo knowledge base mới từ nhiều files upload
    """
    return await knowledge_base_controller.create_kb_with_files_controller(
        title=title,
        customer_id=customer_id,
        files=files,
        db=db
    )

@router.delete("/detail/{detail_id}")
async def delete_kb_detail(
    detail_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Xóa một file detail khỏi knowledge base
    """
    return await knowledge_base_controller.delete_kb_detail_controller(detail_id, db)

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