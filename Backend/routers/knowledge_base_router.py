from fastapi import (
    APIRouter, Query, Request, Depends, 
    UploadFile, File, Form, Body
)
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from controllers import knowledge_base_controller
from typing import Optional, List

router = APIRouter(prefix="/knowledge-base", tags=["Knowledge Base"])

# ----------------------------------------------------------------
# GET / READ
# ----------------------------------------------------------------

@router.get("/")
async def get_all_kbs(db: AsyncSession = Depends(get_db)):
    """
    Lấy tất cả Knowledge Base và details của chúng
    """
    # Sửa tên controller (thêm 's')
    return await knowledge_base_controller.get_all_kbs_controller(db)

@router.get("/search")
async def search_kb(query: str = Query(...), db: AsyncSession = Depends(get_db)):
    return await knowledge_base_controller.search_kb_controller(query, db)

# ----------------------------------------------------------------
# CREATE (Tạo mới)
# ----------------------------------------------------------------

@router.post("/rich-text")
async def create_kb_rich_text(
    data: dict = Body(...), 
    db: AsyncSession = Depends(get_db)
):
    """
    Tạo knowledge base mới từ Rich Text (Nhập thủ công)
    Body: {"title": "...", "customer_id": "...", "raw_content": "..."}
    """
    return await knowledge_base_controller.create_kb_with_rich_text_controller(data, db)

@router.post("/upload-files")
async def create_kb_files(
    title: str = Form(...),
    customer_id: str = Form("manual"),
    files: List[UploadFile] = File(...),
    user_id: Optional[int] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Tạo knowledge base mới từ nhiều files upload
    """
    return await knowledge_base_controller.create_kb_with_files_controller(
        title=title,
        customer_id=customer_id,
        files=files,
        user_id=user_id,
        db=db
    )


@router.patch("/update-files/{kb_id}")
async def update_kb_files(
    kb_id: int,
    title: Optional[str] = Form(None),
    customer_id: Optional[str] = Form(None),
    user_id: Optional[int] = Form(None),
    files: List[UploadFile] = File(None), # Thêm file là optional
    db: AsyncSession = Depends(get_db)
):
    """
    Cập nhật knowledge base (thêm file mới vào KB đã có)
    """
    return await knowledge_base_controller.update_kb_with_files_controller(
        kb_id=kb_id,
        title=title,
        customer_id=customer_id,
        files=files,
        user_id=user_id,
        db=db
    )

@router.put("/rich-text/{detail_id}")
async def update_kb_rich_text(
    detail_id: int,
    data: dict = Body(...), 
    db: AsyncSession = Depends(get_db)
):
    """
    Cập nhật một KB Detail dạng Rich Text (sẽ xóa chunk cũ, tạo chunk mới)
    """
    return await knowledge_base_controller.update_kb_with_rich_text_controller(
        detail_id=detail_id,
        data=data,
        db=db
    )

@router.delete("/detail/{detail_id}")
async def delete_kb_detail(
    detail_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Xóa một file/text detail (và các chunks của nó)
    """
    return await knowledge_base_controller.delete_kb_detail_controller(detail_id, db)

@router.post("/rich-text/{kb_id}")
async def add_kb_rich_text(
    kb_id: int,
    data: dict = Body(...), # Body: {"title": "...", "customer_id": "...", "raw_content": "..."}
    db: AsyncSession = Depends(get_db)
):
    """
    Thêm một detail (Rich Text) mới vào KB đã có
    """
    return await knowledge_base_controller.add_kb_rich_text_controller(
        kb_id=kb_id,
        data=data,
        db=db
    )