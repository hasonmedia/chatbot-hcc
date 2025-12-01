from fastapi import (
    APIRouter, Query, Request, Depends, 
    UploadFile, File, Form, Body
)
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from controllers import knowledge_base_controller
from typing import Optional, List

router = APIRouter(prefix="/knowledge-base", tags=["Knowledge Base"])


@router.get("/")
async def get_all_kbs(
    category_ids: Optional[List[int]] = Query(None, description="List category IDs để filter. Nếu không truyền thì lấy tất cả."),
    file_types: Optional[List[str]] = Query(None, description="List file types to filter. Example: PDF,DOCX,XLSX,TEXT"),
    db: AsyncSession = Depends(get_db)
):
   
    return await knowledge_base_controller.get_all_kbs_controller(db, category_ids, file_types)


@router.get("/search")
async def search_kb(query: str = Query(...), db: AsyncSession = Depends(get_db)):
    return await knowledge_base_controller.search_kb_controller(query, db)



@router.post("/upload-files")
async def create_kb_files(
    category_id: int = Form(...),
    files: List[UploadFile] = File(...),
    user_id: Optional[int] = Form(None),
    db: AsyncSession = Depends(get_db)
):

    return await knowledge_base_controller.create_kb_with_files_controller(
        category_id=category_id,
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

    return await knowledge_base_controller.delete_kb_detail_controller(detail_id, db)

@router.post("/rich-text/{kb_id}")
async def add_kb_rich_text(
    data: dict = Body(...),
    db: AsyncSession = Depends(get_db)
):
    return await knowledge_base_controller.add_kb_rich_text_controller(
        data=data,
        db=db
    )
    
    
#Categories
@router.get("/categories")
async def get_all_categories(db: AsyncSession = Depends(get_db)):

    return await knowledge_base_controller.get_all_categories_controller(db)

@router.post("/categories")
async def create_category(
    data: dict = Body(...),
    db: AsyncSession = Depends(get_db)
):

    return await knowledge_base_controller.create_category_controller(data, db)

@router.put("/categories/{category_id}")
async def update_category(
    category_id: int,
    data: dict = Body(...),
    db: AsyncSession = Depends(get_db)
):

    return await knowledge_base_controller.update_category_controller(category_id, data, db)

@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db)
):

    return await knowledge_base_controller.delete_category_controller(category_id, db)