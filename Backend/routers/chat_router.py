from typing import Optional
from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, Response, HTTPException, BackgroundTasks
import json
from models.field_config import FieldConfig
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
    update_chat_session_controller,
    delete_chat_session_controller,
    delete_message_controller,
    check_session_controller,
    get_all_customer_controller,
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

@router.put("/alert/{session_id}")
async def update_alert_status(session_id: int, alert_data: dict, db: AsyncSession = Depends(get_db)):
    """Cập nhật trạng thái alert cho chat session"""
    try:
        from models.chat import ChatSession
        from sqlalchemy import select
        
        result = await db.execute(select(ChatSession).filter(ChatSession.id == session_id))
        chat_session = result.scalar_one_or_none()
        if not chat_session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        chat_session.alert = alert_data.get("alert", "false")
        await db.commit()
        
        return {"success": True, "message": "Alert status updated successfully"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating alert status: {str(e)}")



@router.get("/admin/history")
async def get_history_chat(db: AsyncSession = Depends(get_db)):
    return await get_all_history_chat_controller(db)

@router.get("/admin/count_by_channel")
async def count_messages_by_channel(db: AsyncSession = Depends(get_db)):
    return await get_dashboard_summary_controller(db)

@router.get("/admin/customers")
async def get_customer_chat(
    channel: Optional[str] = Query(None, description="Lọc theo channel"),
    tag_id: Optional[int] = Query(None, description="Lọc theo tag"),
    db: AsyncSession = Depends(get_db)
):
    data = {"channel": channel, "tag_id": tag_id}
    return await get_all_customer_controller(data, db)

@router.patch("/{id}")
async def update_config(id: int, request: Request, db: AsyncSession = Depends(get_db)):
    user = await get_current_user(request)
    data = await request.json()
    return await update_chat_session_controller(id, data, user, db)

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

