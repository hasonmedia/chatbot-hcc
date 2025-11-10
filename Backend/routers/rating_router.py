"""
Rating Router - API endpoints cho đánh giá
"""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from controllers.rating_controller import (
    create_rating_controller,
    get_rating_controller,
    check_rating_controller
)

router = APIRouter(prefix="/rating", tags=["Rating"])


@router.post("/{session_id}")
async def create_rating(session_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    data = await request.json()
    return await create_rating_controller(session_id, data, db)


@router.get("/{session_id}")
async def get_rating(session_id: int, db: AsyncSession = Depends(get_db)):
    """Lấy đánh giá của chat session"""
    return await get_rating_controller(session_id, db)


@router.get("/{session_id}/check")
async def check_rating(session_id: int, db: AsyncSession = Depends(get_db)):
    """Kiểm tra xem session đã được đánh giá chưa"""
    return await check_rating_controller(session_id, db)
