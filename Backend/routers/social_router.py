from typing import Optional
# Sửa: 'Request' đến từ 'fastapi', không phải 'urllib'
from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, Response, HTTPException, Request 
import json
from models.field_config import FieldConfig
from models.chat import CustomerInfo
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

    # SỬA: Phải lấy DB session thủ công cho WebSocket
    async for db in get_db():
        try:
            # Bạn cần đảm bảo hàm 'customer_chat' chấp nhận 'db'
            await customer_chat(websocket, session_id, db)
        except WebSocketDisconnect:
            print(f"Customer WS disconnected: {session_id}")
            return
        except Exception as e:
            print(f"❌ Lỗi Customer WS: {e}")
            await websocket.close(code=1011, reason="Server error")
            return
    
    # Nếu không lấy được DB
    await websocket.close(code=1011, reason="DB connection failed")


@router.websocket("/ws/admin")
async def admin_ws(websocket: WebSocket):
    token = websocket.cookies.get("access_token")

    # SỬA: Phải lấy DB session thủ công cho WebSocket
    async for db in get_db():
        user = None
        try:
            # SỬA: Truyền 'db' (session) chứ không phải 'get_db' (generator)
            user = await get_user_from_token(token, db) 
            
            # Thêm kiểm tra quyền
            if not user or user.role != "admin":
                await websocket.close(code=1008, reason="Not authorized")
                return

            await websocket.accept()
            # Bạn cần đảm bảo hàm 'admin_chat' chấp nhận 'db'
            await admin_chat(websocket, user, db) 

        except WebSocketDisconnect:
            username = user.username if user else "unknown_admin"
            print(f"Admin WS disconnected: {username}")
            return
        except Exception as e:
            print(f"❌ Lỗi Admin WS: {e}")
            await websocket.close(code=1011, reason="Server error")
            return
            
    # Nếu không lấy được DB
    await websocket.close(code=1011, reason="DB connection failed")


async def process_message(platform: str, body: dict):
    """
    Hàm helper chung để xử lý tin nhắn trong background
    để đảm bảo mỗi task có DB session riêng.
    """
    try:
        # Tạo session CSDL mới chỉ cho task này
        async with AsyncSessionLocal() as db:
            await chat_platform(platform, body, db)
    except Exception as e:
        print(f"❌ Lỗi xử lý tin nhắn {platform}: {e}")


# FB
@router.get("/webhook/fb") 
async def verify_fb_webhook(request: Request): # Đổi tên hàm
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
 
    VERIFY_TOKEN = "YOUR_VERIFY_TOKEN" # Bạn nên lấy từ .env
     
    if mode == "subscribe" and token == VERIFY_TOKEN:
        print("✅ WEBHOOK_VERIFIED")
        return Response(content=challenge, media_type="text/plain", status_code=200)
    else:
        print("❌ WEBHOOK_VERIFICATION_FAILED")
        return Response(status_code=403)


@router.post("/webhook/fb")
async def receive_fb_message(request: Request): # Đổi tên hàm
    body = await request.json()
    asyncio.create_task(process_message("fb", body))
    return Response(status_code=200)


# TELEGRAM_BOT
@router.post("/webhook/telegram") 
async def receive_tele_message(request: Request): # Đổi tên hàm
    data = await request.json()
     
    # SỬA: Không 'await' ở đây, dùng task background
    asyncio.create_task(process_message("tele", data))

    return Response(status_code=200) # Trả về OK ngay lập tức


# ZALO
@router.post("/zalo/webhook") 
async def receive_zalo_message(request: Request): # Đổi tên hàm
    data = await request.json()
    asyncio.create_task(process_message("zalo", data))
    return Response(status_code=200)