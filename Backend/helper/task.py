import asyncio
import json
import os
import traceback
from datetime import datetime, timedelta
from sqlalchemy import select
from models.chat import ChatSession, Message
from helper.help_redis import (
    cache_session_data,
    clear_check_reply_cache
)
from config.database import AsyncSessionLocal
from sqlalchemy.ext.asyncio import AsyncSession
from llm.help_llm import generate_response_prompt, get_current_model

    
from config.websocket_manager import ConnectionManager
manager = ConnectionManager()


async def save_message_to_db_background(data: dict, sender_name: str, image_url: list):
    async with AsyncSessionLocal() as new_db:
        try:
            message = Message(
                chat_session_id=data.get("chat_session_id"),
                sender_type=data.get("sender_type"),
                content=data.get("content"),
                sender_name=sender_name,
                image=json.dumps(image_url) if image_url else None
            )
            new_db.add(message)
            await new_db.commit()
            print(f"✅ [Background] Đã lưu tin nhắn ID: {message.id}")
            
        except Exception as e:
            print(f"❌ [Background] Lỗi lưu tin nhắn: {e}")
            traceback.print_exc()
            await new_db.rollback()




async def update_session_admin_background(chat_session_id: int, sender_name: str):
    async with AsyncSessionLocal() as new_db:
        try:
            result = await new_db.execute(
                select(ChatSession).filter(ChatSession.id == chat_session_id)
            )
            db_session = result.scalar_one_or_none()
            
            
            if db_session:
                old_receiver = db_session.current_receiver

                db_session.status = "false"
                db_session.time = datetime.now() + timedelta(hours=1)
                db_session.previous_receiver = old_receiver
                db_session.current_receiver = sender_name

                await new_db.commit()
                
                # Cập nhật cache
                session_data = {
                    "id": db_session.id,
                    "name": db_session.name,
                    "status": db_session.status,
                    "channel": db_session.channel,
                    "page_id": db_session.page_id,
                    "current_receiver": db_session.current_receiver,
                    "previous_receiver": db_session.previous_receiver,
                    "time": db_session.time.isoformat() if db_session.time else None
                }
                
                
                cache_session_data(chat_session_id, session_data, ttl=300)
                clear_check_reply_cache(chat_session_id)
                
        except Exception as e:
            traceback.print_exc()
            await new_db.rollback()


async def send_to_platform_background(channel: str, page_id: str, recipient_id: str, message_data: dict, images=None):
    try:
        from helper.help_send_social import send_fb, send_telegram, send_zalo
        
        if channel == "facebook":
            await send_fb(page_id, recipient_id, message_data, images)
        elif channel == "telegram":
            await send_telegram(recipient_id, message_data)
        elif channel == "zalo":
            await send_zalo(recipient_id, message_data, images)
            
            
    except Exception as e:
        print(f"❌ [Background] Lỗi gửi tin nhắn {channel}: {e}")
        traceback.print_exc()


async def send_socket_message(chat_session_id: int, message: dict):
    try:
        
        await manager.broadcast_to_admins(message)

        await manager.send_to_customer(chat_session_id, message)

    except Exception as e:
        print(f"Socket send error: {e}")
        traceback.print_exc()


async def notify_missing_information(chat_session_id: int, user_question: str, bot_response: str):
    try:

        from helper.help_send_social import send_telegram
        
        ADMIN_CHAT_ID = "7913265581"
        
        notification_message = f"""🚨 THÔNG BÁO: CÂU HỎI KHÔNG CÓ DỮ LIỆU TRẢ LỜI

            📌 Session ID: {chat_session_id}

            ❓ Câu hỏi của khách hàng:
            {user_question}

            ⚠️ Không có thông tin dữ liệu để trả lời
            """
        
        message_data = {
            "content": notification_message
        }
        
        await send_telegram(ADMIN_CHAT_ID, message_data)
            
    except Exception as e:
        print(f"❌ Exception trong notify_missing_information: {e}")
        traceback.print_exc()


async def generate_bot_response_common(
    user_content: str,
    chat_session_id: int,
    new_db: AsyncSession
) -> dict:
   
    model_info = await get_current_model(
        new_db, 
        chat_session_id=chat_session_id
    )
    
    

    bot_key = model_info["bot"]["key"]
    bot_model_name = model_info["bot"]["name"]

    embedding_key = model_info["embedding"]["key"]
    embedding_model_name = model_info["embedding"]["name"]
    
    response_json = await generate_response_prompt(
        db_session=new_db,
        query=user_content,
        chat_session_id=chat_session_id,
        bot_key=bot_key,
        bot_model_name=bot_model_name,
        embedding_key=embedding_key,
        embedding_model_name=embedding_model_name
    )
    
        
    message_bot = Message(
        chat_session_id=chat_session_id,
        sender_type="bot",
        content=response_json
    )
    new_db.add(message_bot)
    await new_db.commit()
    await new_db.refresh(message_bot)
    
    
    try:
        response_data = json.loads(response_json)
        message_content = response_data.get("message", "")
        
        if "chưa có thông tin chính thức" in message_content.lower():
            asyncio.create_task(
                notify_missing_information(chat_session_id, user_content, message_content)
            )
    except json.JSONDecodeError:
        if "chưa có thông tin chính thức" in response_json.lower():
            asyncio.create_task(
                notify_missing_information(chat_session_id, user_content, response_json)
            )
    
    return {
        "id": message_bot.id,
        "chat_session_id": message_bot.chat_session_id,
        "sender_type": message_bot.sender_type,
        "sender_name": message_bot.sender_name,
        "content": response_json,
        "created_at": message_bot.created_at.isoformat() if message_bot.created_at else datetime.now().isoformat()
    }



async def generate_and_send_bot_response(
    user_content: str,
    chat_session_id: int,
    session_data: dict,
    platform: str = None,
    page_id: str = None,
    sender_id: str = None
):
    async with AsyncSessionLocal() as new_db:
        try:
            
            
            bot_message_data = await generate_bot_response_common(
                user_content, chat_session_id, new_db
            )
            
            bot_message = {
                **bot_message_data,
                "session_name": session_data.get("name"),
                "session_status": session_data.get("status"),
                "created_at": datetime.now().isoformat()
            }

            if platform:
                
                bot_message["platform"] = platform
            else:
                bot_message["current_receiver"] = session_data.get("current_receiver")
                bot_message["previous_receiver"] = session_data.get("previous_receiver")


            await send_socket_message(chat_session_id, bot_message)

            if platform:
                await send_to_platform_background(
                    channel=platform,
                    page_id=page_id,
                    recipient_id=sender_id,
                    message_data=bot_message,
                    images=None
                )
                

        except Exception as e:
            traceback.print_exc()
            await new_db.rollback()