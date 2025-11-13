from typing import Optional
from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, Response, HTTPException, BackgroundTasks
import json
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
import asyncio
router = APIRouter()
from middleware.jwt import get_current_user
import requests
from fastapi import APIRouter, Request
from pydantic import BaseModel
from config.websocket_manager import ConnectionManager

from controllers.chat_controller import (
    create_session_controller,
    get_history_chat_controller,
    get_all_history_chat_controller,
    delete_chat_session_controller,
    delete_message_controller,
    check_session_controller,
    get_dashboard_summary_controller,
    get_messages_by_time_controller,
    get_messages_by_platform_controller,
    get_ratings_by_time_controller,
    get_ratings_by_star_controller,
    update_session_controller
)

router = APIRouter(prefix="/chat", tags=["Chat"])

manager = ConnectionManager()

@router.post("/session")
async def create_session(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        body = await request.json()
        url_channel = body.get("url_channel")
    except:
        url_channel = None
    return await create_session_controller(url_channel, db)



@router.get("/session/{sessionId}")
async def check_session(
    sessionId: int, 
    url_channel: Optional[str] = Query(None, description="URL của trang web sử dụng widget"),
    db: AsyncSession = Depends(get_db)
):
    return await check_session_controller(sessionId, url_channel, db)

class SessionUpdate(BaseModel):
    time: str | None = None
    status: str | None = None

@router.patch("/session/{sessionId}")
async def update_session(
    sessionId: str,
    data: SessionUpdate,  
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    return await update_session_controller(
        data.time,
        data.status,
        db,
        int(sessionId),
        user
    )
@router.get("/history/{chat_session_id}")
async def get_history_chat(
    chat_session_id: int, 
    page: int = 1, 
    limit: int = 10, 
    db: AsyncSession = Depends(get_db)
):
    return await get_history_chat_controller(chat_session_id, page, limit, db)

@router.get("/admin/history")
async def get_history_chat(db: AsyncSession = Depends(get_db)):
    return await get_all_history_chat_controller(db)

@router.get("/admin/count_by_channel")
async def count_messages_by_channel(db: AsyncSession = Depends(get_db)):
    return await get_dashboard_summary_controller(db)

@router.delete("/chat_sessions")
async def delete_chat_sessions(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.json()   # nhận JSON từ client
    ids = body.get("ids", [])     # lấy danh sách ids
    return await delete_chat_session_controller(ids, db)

@router.delete("/messages/{chatId}")
async def delete_messages(chatId: int, request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.json()        # lấy JSON từ body
    ids = body.get("ids", [])          # danh sách id messages
    return await delete_message_controller(chatId, ids, db)


@router.get("/statistics/messages/time")
async def get_messages_by_time(
    startDate: str = Query(..., description="Ngày bắt đầu, định dạng YYYY-MM-DD"),
    endDate: str = Query(..., description="Ngày kết thúc, định dạng YYYY-MM-DD"),
    db: AsyncSession = Depends(get_db)
):
    """
    API 1: Thống kê tổng lượng tin nhắn theo thời gian
    
    Tham số:
    - startDate: Ngày bắt đầu (YYYY-MM-DD)
    - endDate: Ngày kết thúc (YYYY-MM-DD)
    
    Trả về:
    - totalMessages: Tổng số tin nhắn
    - dailyStatistics: Thống kê theo từng ngày
    """
    return await get_messages_by_time_controller(startDate, endDate, db)


@router.get("/statistics/messages/platform")
async def get_messages_by_platform(
    startDate: str = Query(..., description="Ngày bắt đầu, định dạng YYYY-MM-DD"),
    endDate: str = Query(..., description="Ngày kết thúc, định dạng YYYY-MM-DD"),
    db: AsyncSession = Depends(get_db)
):
    """
    API 2: Thống kê lượng tin nhắn theo nền tảng trong khoảng thời gian
    
    Tham số:
    - startDate: Ngày bắt đầu (YYYY-MM-DD)
    - endDate: Ngày kết thúc (YYYY-MM-DD)
    
    Trả về số lượng tin nhắn theo từng nền tảng:
    - facebook
    - telegram
    - zalo
    - web
    """
    return await get_messages_by_platform_controller(startDate, endDate, db)


@router.get("/statistics/ratings/time")
async def get_ratings_by_time(
    startDate: str = Query(..., description="Ngày bắt đầu, định dạng YYYY-MM-DD"),
    endDate: str = Query(..., description="Ngày kết thúc, định dạng YYYY-MM-DD"),
    db: AsyncSession = Depends(get_db)
):
    """
    API 1: Thống kê tổng lượng đánh giá theo thời gian
    
    Tham số:
    - startDate: Ngày bắt đầu (YYYY-MM-DD)
    - endDate: Ngày kết thúc (YYYY-MM-DD)
    
    Trả về:
    - totalReviews: Tổng số đánh giá
    - dailyStatistics: Thống kê theo từng ngày
    """
    return await get_ratings_by_time_controller(startDate, endDate, db)


@router.get("/statistics/ratings/star")
async def get_ratings_by_star(
    startDate: str = Query(..., description="Ngày bắt đầu, định dạng YYYY-MM-DD"),
    endDate: str = Query(..., description="Ngày kết thúc, định dạng YYYY-MM-DD"),
    db: AsyncSession = Depends(get_db)
):
    """
    API 2: Thống kê đánh giá theo số sao
    
    Tham số:
    - startDate: Ngày bắt đầu (YYYY-MM-DD)
    - endDate: Ngày kết thúc (YYYY-MM-DD)
    
    Trả về số lượng đánh giá theo từng mức sao:
    - 1_star
    - 2_star
    - 3_star
    - 4_star
    - 5_star
    """
    return await get_ratings_by_star_controller(startDate, endDate, db)





