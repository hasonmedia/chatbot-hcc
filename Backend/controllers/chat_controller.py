from models.chat import ChatSession
from services.chat_service import (
    create_session_service,
    get_history_chat_service,
    get_all_history_chat_service,
    update_chat_session,
    delete_chat_session,
    delete_message,
    check_session_service,
    get_dashboard_summary
)
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from config.websocket_manager import ConnectionManager
manager = ConnectionManager()


async def create_session_controller(url_channel: str, db: AsyncSession):
    chat = await create_session_service(url_channel, db)    
    return {
        "id": chat
    }

async def check_session_controller(sessionId, url_channel, db: AsyncSession):
    chat = await check_session_service(sessionId, url_channel, db)    
    return {
        "id": chat
    }

    
async def get_history_chat_controller(chat_session_id: int, page: int = 1, limit: int = 10, db: AsyncSession = None):
    messages = await get_history_chat_service(chat_session_id, page, limit, db)
    return messages


async def get_all_history_chat_controller(db: AsyncSession):
    messages = await get_all_history_chat_service(db)
    return messages

async def update_chat_session_controller(id: int, data: dict, user, db: AsyncSession):
    chatSession = await update_chat_session(id, data, user, db)
    if not chatSession:
        return {"message": "Not Found"}
    
    
    await manager.broadcast_to_admins(chatSession)
    
    return chatSession

async def delete_chat_session_controller(ids: list[int], db: AsyncSession):
    deleted_count = await delete_chat_session(ids, db)   # gọi xuống service
    return {
        "deleted": deleted_count,
        "ids": ids
    }

async def delete_message_controller(chatId: int, ids: list[int], db: AsyncSession):
    deleted_count = await delete_message(chatId, ids, db)   # gọi xuống service
    return {
        "deleted": deleted_count,
        "ids": ids
    }
async def get_dashboard_summary_controller(db: AsyncSession):
    result = await get_dashboard_summary(db)
    return result