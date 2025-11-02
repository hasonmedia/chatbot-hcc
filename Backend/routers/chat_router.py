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

from config.websocket_manager import ConnectionManager

from controllers.chat_controller import (
    create_session_controller,
    get_history_chat_controller,
    get_all_history_chat_controller,
    delete_chat_session_controller,
    delete_message_controller,
    check_session_controller,
    get_dashboard_summary_controller,
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

