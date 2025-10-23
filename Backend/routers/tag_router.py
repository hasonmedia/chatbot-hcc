from fastapi import APIRouter, Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from controllers.tag_controller import (
    create_tag_controller,
    get_tags_by_chat_session_controller,
    update_tag_controller,
    delete_tag_controller,
    get_tag_by_id_controller,
    get_all_tags_controller,
)

router = APIRouter(prefix="/tags", tags=["Tags"])

@router.post("/")
async def create_tag(request: Request, db: AsyncSession = Depends(get_db)):
    data = await request.json()
    return await create_tag_controller(data, db)

@router.put("/{tag_id}")
async def update_tag(tag_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    data = await request.json()
    return await update_tag_controller(tag_id, data, db)

@router.delete("/{tag_id}")
async def delete_tag(tag_id: int, db: AsyncSession = Depends(get_db)):
    return await delete_tag_controller(tag_id, db)

@router.get("/{tag_id}")
async def get_tag_by_id(tag_id: int, db: AsyncSession = Depends(get_db)):
    return await get_tag_by_id_controller(tag_id, db)

@router.get("/")
async def get_all_tags(db: AsyncSession = Depends(get_db)):
    return await get_all_tags_controller(db)

@router.get("/chat_session/{chat_session_id}")
async def get_tags_by_chat_session(chat_session_id: int, db: AsyncSession = Depends(get_db)):
    return await get_tags_by_chat_session_controller(chat_session_id, db)