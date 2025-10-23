from fastapi import WebSocket, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from services import messenger_service

# Danh sách client kết nối
active_connections: list[WebSocket] = []

async def connect(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)

async def disconnect(websocket: WebSocket):
    active_connections.remove(websocket)

# Thông báo tới socket
async def broadcast_message(message: dict):
    for conn in active_connections:
        await conn.send_json(message)

async def handle_chat(websocket: WebSocket, conversation_id: int, db: AsyncSession = Depends(get_db)):
    await connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            content = data["message"]
            
            # Lưu vào DB
            msg = await messenger_service.save_message(db, conversation_id, content)
            
            
            # Gửi lại cho tất cả client
            await broadcast_message({
                "id": msg.id,
                "conversation_id": conversation_id,
                "message_content": msg.message_content
            })
    except Exception:
        await disconnect(websocket)
