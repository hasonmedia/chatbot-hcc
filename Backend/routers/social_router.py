from typing import Optional
# Sửa: 'Request' đến từ 'fastapi', không phải 'urllib'
from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, Response, HTTPException, Request 
import json
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db, AsyncSessionLocal # Sửa: Import AsyncSessionLocal
import asyncio
from middleware.jwt import get_user_from_token
import requests

from config.websocket_manager import ConnectionManager

from controllers.social_controller import (
    chat_platform,
    customer_chat,
    admin_chat
)

router = APIRouter(prefix="/chat", tags=["Chat"])

manager = ConnectionManager()


@router.websocket("/ws/customer")
async def customer_ws(websocket: WebSocket):
    session_id_str = websocket.query_params.get("sessionId")
    if not session_id_str:
        await websocket.close(code=1008, reason="Missing sessionId")
        return
    try:
        session_id = int(session_id_str)
    except ValueError:
        await websocket.close(code=1008, reason="Invalid sessionId")
        return

    try:
        
        await customer_chat(websocket, session_id)
    except WebSocketDisconnect:
        print(f"Customer WS disconnected: {session_id}")
    except Exception as e:
        print(f"❌ Lỗi Customer WS: {e}")
        import traceback
        traceback.print_exc()
        try:
            await websocket.close(code=1011, reason="Server error")
        except:
            pass


@router.websocket("/ws/admin")
async def admin_ws(websocket: WebSocket):
    token = websocket.cookies.get("access_token")
    user = None
    
    try:
        user = await get_user_from_token(token)
        
        
        

        
        await admin_chat(websocket, user)

    except WebSocketDisconnect:
        username = user.username if user else "unknown_admin"
        print(f"Admin WS disconnected: {username}")
    except Exception as e:
        print(f"❌ Lỗi Admin WS: {e}")
        import traceback
        traceback.print_exc()
        try:
            await websocket.close(code=1011, reason="Server error")
        except:
            pass


async def process_message(platform: str, body: dict):
    try:
        
        async with AsyncSessionLocal() as db:
            await chat_platform(platform, body, db)
    except Exception as e:
        print(f"❌ Lỗi xử lý tin nhắn {platform}: {e}")


# FB
@router.get("/webhook/fb") 
async def receive_message(request: Request):
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    
    if mode and token:
        if mode == "subscribe":
            return Response(content=challenge, media_type="text/plain", status_code=200)
        else:
            return Response(status_code=403)
    return Response(status_code=400)


@router.post("/webhook/fb")
async def receive_fb_message(request: Request):
    body = await request.json()
    asyncio.create_task(process_message("fb", body))
    return Response(status_code=200)


# TELEGRAM_BOT
@router.post("/webhook/telegram") 
async def receive_tele_message(request: Request): 
    data = await request.json()
     
    
    asyncio.create_task(process_message("tele", data))

    return Response(status_code=200)


# ZALO
@router.post("/zalo/webhook") 
async def receive_zalo_message(request: Request): 
    data = await request.json()
    asyncio.create_task(process_message("zalo", data))
    return Response(status_code=200)