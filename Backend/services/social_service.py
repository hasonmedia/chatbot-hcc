import asyncio
import traceback
from datetime import datetime, timedelta
from config.save_base64_image import save_base64_image
from helper.task import (
    save_message_to_db_background, 
    update_session_admin_background,
    send_to_platform_background,
    generate_and_send_bot_response,
    send_socket_message
)
from helper.help_chat import (
    get_session_by_id_cached,
    get_or_create_session_by_name_cached,
    build_session_name,
    check_repply_cached,
    check_page_active_status
)







async def send_message_fast_service(data: dict, user, db):
    sender_name = user.full_name if user else None
    chat_session_id = data.get("chat_session_id")
    
    
    image_url = []
    if data.get("image"):
        try:
            image_url = save_base64_image(data.get("image"))
        except Exception as e:
            print("❌ Error saving images:", e) 
            traceback.print_exc()
    
    session_data = await get_session_by_id_cached(chat_session_id, db)
    
    if not session_data:
        return []
    
    user_message = {
        "id": None,
        "chat_session_id": chat_session_id,
        "sender_type": data.get("sender_type"),
        "sender_name": sender_name,
        "content": data.get("content"),
        "image": image_url,
        "session_name": session_data["name"],
        "session_status": session_data["status"],
        "created_at": datetime.now().isoformat()
    }
    
    asyncio.create_task(send_socket_message(chat_session_id, user_message)) 
    asyncio.create_task(save_message_to_db_background(data, sender_name, image_url))
    
    
    if data.get("sender_type") == "admin":
        
        asyncio.create_task(update_session_admin_background(chat_session_id, sender_name))
        
        
        name_to_send = session_data["name"][2:]
        asyncio.create_task(send_to_platform_background(
            session_data["channel"], 
            session_data.get("page_id"),
            name_to_send, 
            user_message, 
            data.get("image")
        ))
        
        return
    
    should_reply = await check_repply_cached(chat_session_id, db)
    if should_reply:
        asyncio.create_task(generate_and_send_bot_response(
            data.get("content"),
            chat_session_id,
            session_data
        ))
        
    


async def send_message_page_service(data: dict, db):
    session_name = build_session_name(data["platform"], data["sender_id"])
    
    session_data = await get_or_create_session_by_name_cached(
        session_name,
        data["platform"],
        data.get("page_id", ""),
        db
    )
    
    customer_message = {
        "id": None,
        "chat_session_id": session_data['id'],
        "sender_type": "customer",
        "sender_name": None,
        "content": data["message"],
        "session_name": session_data['name'],
        "session_status": session_data['status'],
        "platform": data["platform"],
        "created_at": datetime.now().isoformat()
    }
    
    asyncio.create_task(send_socket_message(session_data['id'], customer_message))
    
    message_data = {
        "chat_session_id": session_data['id'],
        "sender_type": "customer",
        "content": data["message"]
    }
    asyncio.create_task(save_message_to_db_background(message_data, None, []))
    
    
    page_is_active = await check_page_active_status(data["platform"], data.get("page_id"), db)
    
    if page_is_active:
        should_reply = await check_repply_cached(session_data['id'], db)
        
        if should_reply:
            asyncio.create_task(generate_and_send_bot_response(
                data["message"],
                session_data['id'],
                session_data,
                platform=data["platform"],
                page_id=data.get("page_id"),
                sender_id=data["sender_id"]
            ))



