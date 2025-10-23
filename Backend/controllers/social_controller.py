from services.social_service import (
    send_message_page_service,
    send_message_fast_service
)
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime
from models.chat import CustomerInfo
from sqlalchemy.ext.asyncio import AsyncSession
import requests
from config.websocket_manager import ConnectionManager
import datetime
import json
import asyncio
manager = ConnectionManager()
from helper.task import extract_customer_info_background



async def customer_chat(websocket: WebSocket, session_id: int):
    await manager.connect_customer(websocket, session_id)
    
    try:
        while True:
            data = await websocket.receive_json()
            

            
            # ✅ Tạo db session MỚI cho mỗi message
            from config.database import AsyncSessionLocal
            async with AsyncSessionLocal() as db:
                res_messages = await send_message_fast_service(data, None, db)

                # Gửi tin nhắn đến người dùng ngay lập tức
                for msg in res_messages:
                    await manager.broadcast_to_admins(msg)
                    await manager.send_to_customer(session_id, msg)
                
            
            # ✅ Thu thập thông tin khách hàng (background)
            asyncio.create_task(extract_customer_info_background(session_id, manager))

    except WebSocketDisconnect:
        manager.disconnect_customer(websocket, session_id)
    except Exception as e:
        print(f"❌ [ERROR] Lỗi trong customer_chat: session {session_id}")
        import traceback
        traceback.print_exc()
        manager.disconnect_customer(websocket, session_id)

async def admin_chat(websocket: WebSocket, user: dict):
    await manager.connect_admin(websocket)
    
    try:
        while True:
            data = await websocket.receive_json()
            
            from config.database import AsyncSessionLocal
            async with AsyncSessionLocal() as db:
                            
                res_messages = await send_message_fast_service(data, user, db)
                
                # Gửi đến tất cả customer đang kết nối
                for msg in res_messages:
                    await manager.send_to_customer(msg["chat_session_id"], msg)
                    await manager.broadcast_to_other_admins(websocket, msg)
            
                    
    except WebSocketDisconnect:
        manager.disconnect_admin(websocket)
    except Exception as e:
        import traceback
        traceback.print_exc()
        manager.disconnect_admin(websocket)
            
       


def parse_telegram(body: dict):
    print("ok")
    msg = body.get("message", {})
    sender_id = msg.get("from", {}).get("id")
    text = msg.get("text", "")
    
    # Kiểm tra nếu không phải tin nhắn text
    if not text:
        text = "Hiện tại hệ thống chỉ hỗ trợ tin nhắn dạng text. Vui lòng gửi lại tin nhắn bằng văn bản."
            

    return {
        "platform": "telegram",
        "sender_id": sender_id,
        "message": text  
    }
    

def parse_facebook(body: dict):
    entry = body.get("entry", [])[0]
    page_id = entry.get("id")

    messaging_event = entry.get("messaging", [])[0]
    sender_id = messaging_event["sender"]["id"]
    timestamp = messaging_event.get("timestamp")

    timestamp_str = datetime.datetime.fromtimestamp(timestamp/1000).strftime("%Y-%m-%d %H:%M:%S")

    message = messaging_event.get("message", {})
    message_text = message.get("text", "")
    
    # Kiểm tra nếu không phải tin nhắn text
    if not message_text:
        message_text = "Hiện tại hệ thống chỉ hỗ trợ tin nhắn dạng text. Vui lòng gửi lại tin nhắn bằng văn bản."


    return {
        "platform": "facebook",
        "page_id": page_id,
        "sender_id": sender_id,
        "message": message_text,
        "timestamp": timestamp_str
    }


def parse_zalo(body: dict):
    event_name = body.get("event_name")
    sender_id = None
    text = None

    if event_name == "user_send_text":
        sender_id = body["sender"]["id"]
        text = body["message"]["text"]
    else:
        # Xử lý các loại tin nhắn không phải text
        sender_id = body["sender"]["id"]
        text = "Hiện tại hệ thống chỉ hỗ trợ tin nhắn dạng text. Vui lòng gửi lại tin nhắn bằng văn bản."
        

    return {
        "platform": "zalo",
        "sender_id": sender_id,
        "message": text
    }

async def chat_platform(channel, body: dict, db: AsyncSession):
    
    
    data = None
    
    if channel == "tele":
        data = parse_telegram(body)
        print("ok")
    
    elif channel == "fb":
        data = parse_facebook(body)
     
    elif channel == "zalo":
        data = parse_zalo(body)
        
        
     
    message = await send_message_page_service(data, db)   
    
    for msg in message:
        await manager.broadcast_to_admins(msg)
    
    # Thu thập thông tin khách hàng sau MỖI tin nhắn từ platform - chạy background task
    if message:
        session_id = message[0].get("chat_session_id")
        asyncio.create_task(extract_customer_info_background(session_id, manager))

