from fastapi import APIRouter, Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from controllers.llm_controller import (
    create_llm_controller,
    update_llm_controller,
    delete_llm_controller,
    get_llm_by_id_controller,
    get_all_llms_controller
)
from controllers.llm_key_controller import (
    create_llm_key_controller,
    update_llm_key_controller,
    delete_llm_key_controller,
    get_llm_keys_controller
)

router = APIRouter(prefix="/llms", tags=["LLMs"])

@router.post("/")
async def create_llm(request: Request, db: AsyncSession = Depends(get_db)):
    data = await request.json()
    return await create_llm_controller(data, db)

@router.put("/{llm_id}")
async def update_llm(llm_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    data = await request.json()
    return await update_llm_controller(llm_id, data, db)

@router.delete("/{llm_id}")
async def delete_llm(llm_id: int, db: AsyncSession = Depends(get_db)):
    return await delete_llm_controller(llm_id, db)

@router.get("/{llm_id}")
async def get_llm_by_id(llm_id: int, db: AsyncSession = Depends(get_db)):
    return await get_llm_by_id_controller(llm_id, db)

@router.get("/")
async def get_all_llms(db: AsyncSession = Depends(get_db)):
    return await get_all_llms_controller(db)


# ===== LLM Key Routes =====
# Keys thuộc về llm_detail, không phải llm

@router.post("/details/{llm_detail_id}/keys")
async def create_llm_key(llm_detail_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    """Tạo key mới cho LLMDetail"""
    data = await request.json()
    return await create_llm_key_controller(llm_detail_id, data, db)

@router.put("/details/{llm_detail_id}/keys/{key_id}")
async def update_llm_key(llm_detail_id: int, key_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    """Cập nhật key"""
    data = await request.json()
    return await update_llm_key_controller(key_id, data, db)

@router.delete("/details/{llm_detail_id}/keys/{key_id}")
async def delete_llm_key(llm_detail_id: int, key_id: int, db: AsyncSession = Depends(get_db)):
    """Xóa key"""
    return await delete_llm_key_controller(key_id, db)

@router.get("/details/{llm_detail_id}/keys")
async def get_llm_keys(llm_detail_id: int, db: AsyncSession = Depends(get_db)):
    """Lấy tất cả keys của LLMDetail"""
    return await get_llm_keys_controller(llm_detail_id, db)