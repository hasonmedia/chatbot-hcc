import asyncio
import traceback
from datetime import datetime, timedelta
from config.save_base64_image import save_base64_image
from config.websocket_manager import ConnectionManager
from helper.task import (
    save_message_to_db_background, 
    update_session_admin_background,
    send_to_platform_background,
    generate_and_send_bot_response_background,
    generate_and_send_platform_bot_response_background
)
from helper.help_chat import (
    get_session_by_id_cached,
    get_or_create_session_by_name_cached,
    build_session_name,
    check_repply_cached,
    check_page_active_status
)
from helper.help_redis import (
    cache_session_data,
    clear_check_reply_cache
)

# ✅ Get ConnectionManager singleton instance
manager = ConnectionManager()






async def send_message_fast_service(data: dict, user, db):
    sender_name = user.full_name if user else None
    chat_session_id = data.get("chat_session_id")
    
    # Xử lý ảnh nếu có
    image_url = []
    if data.get("image"):
        try:
            image_url = save_base64_image(data.get("image"))
        except Exception as e:
            print("❌ Error saving images:", e) 
            traceback.print_exc()
    
    # Lấy session từ cache hoặc database (sử dụng helper)
    session_data = await get_session_by_id_cached(chat_session_id, db)
    
    if not session_data:
        return []
    
    response_messages = []
    user_message = {
        "id": None,
        "chat_session_id": chat_session_id,
        "sender_type": data.get("sender_type"),
        "sender_name": sender_name,
        "content": data.get("content"),
        "image": image_url,
        "session_name": session_data["name"],
        "session_status": session_data["status"]
    }
    
    response_messages.append(user_message)
    
    # 🚀 Lưu tin nhắn vào database (background task với DB session riêng)
    asyncio.create_task(save_message_to_db_background(data, sender_name, image_url))
    
    # Xử lý admin message
    if data.get("sender_type") == "admin":
        # ✅ CẬP NHẬT CACHE NGAY LẬP TỨC để chặn bot reply
        new_time = datetime.now() + timedelta(hours=1)
        
        # Cập nhật session_data trong cache
        session_data["status"] = "false"
        session_data["current_receiver"] = sender_name
        session_data["previous_receiver"] = session_data.get("current_receiver")
        session_data["time"] = new_time.isoformat()
        
        # Lưu lại cache với status mới (sử dụng helper)
        cache_session_data(chat_session_id, session_data, ttl=300)
        
        # ✅ XÓA cache check_reply để force check lại (sử dụng helper)
        clear_check_reply_cache(chat_session_id)
        
        
        # 🚀 Cập nhật database trong background (không block)
        asyncio.create_task(update_session_admin_background(chat_session_id, sender_name))
        
        response_messages[0] = {
            "id": None,
            "chat_session_id": chat_session_id,
            "sender_type": data.get("sender_type"),
            "sender_name": sender_name,
            "content": data.get("content"),
            "image": image_url,
            "session_name": session_data["name"],
            "session_status": "false",
            "current_receiver": sender_name,
            "previous_receiver": session_data.get("previous_receiver"),
            "time": new_time.isoformat()
        }

        # 🚀 Gửi tin nhắn đến platform trong background
        name_to_send = session_data["name"][2:]
        asyncio.create_task(send_to_platform_background(
            session_data["channel"], 
            session_data.get("page_id"),
            name_to_send, 
            response_messages[0], 
            data.get("image")
        ))
            
        return response_messages
    
    # 🚀 Xử lý bot reply
    should_reply = await check_repply_cached(chat_session_id, db)
    if should_reply:
        asyncio.create_task(generate_and_send_bot_response_background(
            data.get("content"),
            chat_session_id,
            session_data,
            manager
        ))
        
    
    return response_messages


async def send_message_page_service(data: dict, db):
    # Tạo session name từ platform và sender_id (sử dụng helper)
    session_name = build_session_name(data["platform"], data["sender_id"])
    
    # Lấy hoặc tạo session (sử dụng helper)
    session_data = await get_or_create_session_by_name_cached(
        session_name,
        data["platform"],
        data.get("page_id", ""),
        db
    )
    
    response_messages = []
    
    # Tạo response message trước (với id=None)
    customer_message = {
        "id": None,
        "chat_session_id": session_data['id'],
        "sender_type": "customer",
        "sender_name": None,
        "content": data["message"],
        "session_name": session_data['name'],
        "session_status": session_data['status'],
        "platform": data["platform"]
    }
    
    response_messages.append(customer_message)
    
    # 🚀 Lưu tin nhắn vào database (background task với DB session riêng)
    message_data = {
        "chat_session_id": session_data['id'],
        "sender_type": "customer",
        "content": data["message"]
    }
    asyncio.create_task(save_message_to_db_background(message_data, None, []))
    
    # 🚀 Xử lý bot reply trong background (không block webhook response)
    # Bước 1: Kiểm tra trạng thái page/bot trước
    page_is_active = await check_page_active_status(data["platform"], data.get("page_id"), db)
    
    if not page_is_active:
        # Page/bot bị tắt, không reply
        print(f"⚠️ Page/Bot {data['platform']} - {data.get('page_id')} is inactive, skipping bot reply")
        return response_messages
    
    # Bước 2: Nếu page/bot active, kiểm tra tiếp should_reply theo session
    should_reply = await check_repply_cached(session_data['id'], db)
    if should_reply:
        asyncio.create_task(generate_and_send_platform_bot_response_background(
            data["message"],
            session_data['id'],
            session_data,
            data["platform"],
            data.get("page_id"),
            data["sender_id"],
            manager  # ✅ FIX: Add manager parameter
        ))
    
    return response_messages



