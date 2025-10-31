import asyncio
import json
import os
import traceback
from datetime import datetime, timedelta
from httplib2 import Credentials
from sqlalchemy.orm import Session
from sqlalchemy import select
from models.knowledge_base import KnowledgeBase
from models.chat import ChatSession, Message
from config.redis_cache import cache_set
from config.database import AsyncSessionLocal
import gspread
from sqlalchemy.ext.asyncio import AsyncSession








async def save_message_to_db_background(data: dict, sender_name: str, image_url: list):
    """Background task: Tạo DB session riêng để lưu tin nhắn"""
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
    """Background task: Tạo DB session riêng để cập nhật session"""
    async with AsyncSessionLocal() as new_db:
        try:
            result = await new_db.execute(select(ChatSession).filter(ChatSession.id == chat_session_id))
            db_session = result.scalar_one_or_none()
            if db_session:
                db_session.status = "false"
                db_session.time = datetime.now() + timedelta(hours=1)
                db_session.previous_receiver = db_session.current_receiver
                db_session.current_receiver = sender_name
                await new_db.commit()
                
                # Cập nhật cache
                session_cache_key = f"session:{chat_session_id}"
                session_data = {
                    'id': db_session.id,
                    'name': db_session.name,
                    'status': db_session.status,
                    'channel': db_session.channel,
                    'page_id': db_session.page_id,
                    'current_receiver': db_session.current_receiver,
                    'previous_receiver': db_session.previous_receiver,
                    'time': db_session.time.isoformat() if db_session.time else None
                }
                cache_set(session_cache_key, session_data, ttl=300)
                print(f"✅ [Background] Đã cập nhật session {chat_session_id}")
                
        except Exception as e:
            print(f"❌ [Background] Lỗi cập nhật session: {e}")
            traceback.print_exc()
            await new_db.rollback()


async def send_to_platform_background(channel: str, page_id: str, recipient_id: str, message_data: dict, images=None):
    """Background task: Gửi tin nhắn đến platform tương ứng"""
    try:
        # Import các hàm send platform từ helper
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


from sqlalchemy.ext.asyncio import AsyncSession


async def notify_missing_information(chat_session_id: int, user_question: str, bot_response: str):
    """
    Hàm thông báo khi bot không có thông tin trong cơ sở dữ liệu
    Gửi thông báo đến Telegram admin
    
    Args:
        chat_session_id: ID của chat session
        user_question: Câu hỏi của người dùng
        bot_response: Câu trả lời của bot
    """
    try:

        # Import hàm send_telegram từ helper
        from helper.help_send_social import send_telegram
        
        # Bạn có thể lưu chat ID admin trong database hoặc biến môi trường
        ADMIN_CHAT_ID = "7913265581"
        
        # Tạo nội dung thông báo
        notification_message = f"""🚨 THÔNG BÁO: CÂU HỎI KHÔNG CÓ DỮ LIỆU TRẢ LỜI

            📌 Session ID: {chat_session_id}

            ❓ Câu hỏi của khách hàng:
            {user_question}

            ⚠️ Không có thông tin dữ liệu để trả lời
            """
        
        # Tạo message dict để gửi qua hàm send_telegram
        message_data = {
            "content": notification_message
        }
        
        # Gửi thông báo đến Telegram admin sử dụng hàm có sẵn
        await send_telegram(ADMIN_CHAT_ID, message_data)
        print("✅ Đã gửi thông báo đến Telegram admin thành công")
            
    except Exception as e:
        print(f"❌ Exception trong notify_missing_information: {e}")
        traceback.print_exc()


async def _generate_bot_response_common(
    user_content: str,
    chat_session_id: int,
    session_data: dict,
    new_db: AsyncSession
) -> dict:
    """
    Hàm chung để generate bot response
    Sử dụng bot key cho việc generate response
    Tương thích với cấu trúc bảng mới: llm, llm_detail, llm_key
    """
    from llm.help_llm import get_current_model
    from llm.gpt import generate_gpt_response
    from llm.gemini import generate_gemini_response
    
    # Lấy thông tin model hiện tại với Round-Robin BOT API key
    # get_current_model sẽ trả về:
    # - name: "gemini" hoặc "gpt" 
    # - key: API key được chọn theo Round-Robin
    # - key_name: Tên của key (từ LLMKey.name)
    # - key_type: "bot" hoặc "embedding"
    # - llm_detail_id: ID của LLMDetail (1=gemini, 2=gpt)
    model_info = await get_current_model(
        new_db, 
        chat_session_id=chat_session_id,
        key_type="bot"  # Chỉ định rõ dùng bot key
    )
    
    model_type = model_info["name"].lower()  # "gemini" hoặc "gpt"
    api_key = model_info["key"]  # API key đã được chọn theo Round-Robin
    key_name = model_info.get("key_name", "free")  # Tên key hoặc "free"
    key_type = model_info.get("key_type", "bot")  # "bot"
    llm_detail_id = model_info.get("llm_detail_id")  # ID của LLMDetail
    
    print(f"🤖 Session {chat_session_id} - Model: {model_type} (LLMDetail ID: {llm_detail_id}), Bot Key: {key_name} (type: {key_type})")
    
    # Gọi hàm generate tương ứng (function-based)
    # Response là JSON string: {"message": "...", "links": [...]}
    if "gpt" in model_type:
        response_json = await generate_gpt_response(
            api_key=api_key,
            db_session=new_db,
            query=user_content,
            chat_session_id=session_data["id"],
            model_type=model_type
        )
    elif "gemini" in model_type:
        response_json = await generate_gemini_response(
            api_key=api_key,
            db_session=new_db,
            query=user_content,
            chat_session_id=session_data["id"],
            model_type=model_type
        )
    else:
        raise ValueError(f"Unknown model type: {model_type}")
    
    # Lưu bot message vào database (lưu JSON string đầy đủ)
    message_bot = Message(
        chat_session_id=chat_session_id,
        sender_type="bot",
        content=response_json  # Lưu JSON string: {"message": "...", "links": [...]}
    )
    new_db.add(message_bot)
    await new_db.commit()
    await new_db.refresh(message_bot)
    
    # ✅ Kiểm tra xem bot có trả lời "chưa có thông tin" không
    try:
        response_data = json.loads(response_json)
        message_content = response_data.get("message", "")
        
        if "chưa có thông tin chính thức" in message_content.lower():
            print("⚠️ Phát hiện bot không có thông tin - Gọi hàm thông báo...")
            # Gọi hàm thông báo trong background để không block response
            asyncio.create_task(
                notify_missing_information(chat_session_id, user_content, message_content)
            )
    except json.JSONDecodeError:
        # Nếu không parse được JSON, fallback về check toàn bộ string
        if "chưa có thông tin chính thức" in response_json.lower():
            print("⚠️ Phát hiện bot không có thông tin - Gọi hàm thông báo...")
            asyncio.create_task(
                notify_missing_information(chat_session_id, user_content, response_json)
            )
    
    return {
        "id": message_bot.id,
        "chat_session_id": message_bot.chat_session_id,
        "sender_type": message_bot.sender_type,
        "sender_name": message_bot.sender_name,
        "content": response_json  # Trả về JSON string, FE sẽ tự parse
    }


async def generate_and_send_bot_response_background(
    user_content: str, 
    chat_session_id: int, 
    session_data: dict,
    manager
):
    """🚀 Background task: Generate bot response và gửi qua WebSocket"""
    async with AsyncSessionLocal() as new_db:
        try:
            # Generate response sử dụng hàm chung
            bot_message_data = await _generate_bot_response_common(
                user_content, chat_session_id, session_data, new_db
            )
            
            # Tạo bot message để gửi qua websocket
            bot_message = {
                **bot_message_data,
                "session_name": session_data["name"],
                "session_status": session_data["status"],
                "current_receiver": session_data.get("current_receiver"),
                "previous_receiver": session_data.get("previous_receiver")
            }
            
            # Gửi bot response qua websocket
            await manager.broadcast_to_admins(bot_message)
            
            await manager.send_to_customer(chat_session_id, bot_message)
            
            
        except Exception as e:
            print(f"❌ [Background] Lỗi tạo bot response: {e}")
            traceback.print_exc()
            await new_db.rollback()


async def generate_and_send_platform_bot_response_background(
    user_content: str, 
    chat_session_id: int, 
    session_data: dict,
    platform: str,
    page_id: str,
    sender_id: str,
    manager
):
    async with AsyncSessionLocal() as new_db:
        try:
            from helper.help_send_social import send_fb, send_telegram, send_zalo
            
            # Generate response sử dụng hàm chung
            bot_message_data = await _generate_bot_response_common(
                user_content, chat_session_id, session_data, new_db
            )
            
            # Tạo bot message để gửi
            bot_message = {
                **bot_message_data,
                "session_name": session_data["name"],
                "platform": platform,
                "session_status": session_data["status"]
            }
            
            # Gửi bot response qua websocket cho admin
            await manager.broadcast_to_admins(bot_message)

            
            # ✅ Gửi về platform tương ứng (async, không block)
            if platform == "facebook":
                await send_fb(page_id, sender_id, bot_message, None)
            elif platform == "telegram":
                await send_telegram(sender_id, bot_message)
            elif platform == "zalo":
                await send_zalo(sender_id, bot_message, None)            
        except Exception as e:
            traceback.print_exc()
            await new_db.rollback()