from typing import Optional
from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, Response, HTTPException, BackgroundTasks
import json
from models.field_config import FieldConfig
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
import asyncio
router = APIRouter()
from middleware.jwt import authentication_cookie
import requests
from fastapi import APIRouter, Request

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
    session_id = int(websocket.query_params.get("sessionId"))
    await customer_chat(websocket, session_id)


@router.websocket("/ws/admin")
async def admin_ws(websocket: WebSocket):
    user = await authentication_cookie(websocket.cookies.get("access_token"))
    await admin_chat(websocket, user)



   
 
# FB
@router.get("/webhook/fb") 
async def receive_message(request: Request):
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    
    if mode and token:
        if mode == "subscribe":
            print("WEBHOOK_VERIFIED")
            return Response(content=challenge, media_type="text/plain", status_code=200)
        else:
            return Response(status_code=403)
    return Response(status_code=400)



@router.post("/webhook/fb")
async def receive_message(request: Request):
    body = await request.json()
    
    asyncio.create_task(process_facebook_message(body))
        
    return Response(status_code=200)

async def process_facebook_message(body: dict):
    try:
        from config.database import AsyncSessionLocal
        async with AsyncSessionLocal() as db:
            await chat_platform("fb", body, db)
    except Exception as e:
        print(f"❌ Lỗi xử lý tin nhắn Facebook: {e}")


# TELEGRAM_BOT
@router.post("/webhook/telegram") 
async def tele(request: Request, db: AsyncSession = Depends(get_db)): 
    data = await request.json()
    
    print(data)
    
    res = await chat_platform("tele", data, db)

 
# ZALO
@router.post("/zalo/webhook") 
async def zalo(request: Request): 
    data = await request.json()
    
    asyncio.create_task(process_zalo_message(data))
    
    return Response(status_code=200)  
    

async def process_zalo_message(body: dict):

    try:
        from config.database import AsyncSessionLocal
        async with AsyncSessionLocal() as db:
            await chat_platform("zalo", body, db)
    except Exception as e:
        print(f"❌ Lỗi xử lý tin nhắn Zalo: {e}")
