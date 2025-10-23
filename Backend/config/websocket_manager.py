from fastapi import WebSocket
from typing import Dict, List
import json
from datetime import datetime

class ConnectionManager:
    """
    ✅ Singleton ConnectionManager để quản lý tất cả WebSocket connections
    - Mọi module import sẽ dùng CÙNG 1 instance
    - Background tasks có thể gửi message qua WebSocket
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ConnectionManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        # Key = session_id, value =  dict list các websocket của customer trong session
        self.customers: Dict[int, List[WebSocket]] = {}
        # Admin có thể xem tất cả session  --> danh sách các kết nối websocket của admin
        self.admins: List[WebSocket] = []
        self.active_connections: list[WebSocket] = []
        self._initialized = True

    async def connect_customer(self, websocket: WebSocket, session_id : int):
        await websocket.accept()
        if session_id not in self.customers:
            self.customers[session_id] = []
        self.customers[session_id].append(websocket)

    async def connect_admin(self, websocket: WebSocket):
        await websocket.accept()
        self.admins.append(websocket)

    def disconnect_customer(self, websocket: WebSocket, session_id: int):
        if session_id in self.customers and websocket in self.customers[session_id]:
            self.customers[session_id].remove(websocket)
            if not self.customers[session_id]:
                del self.customers[session_id]

    def disconnect_admin(self, websocket: WebSocket):
        if websocket in self.admins:
            self.admins.remove(websocket)

    async def send_to_customer(self, session_id: int, message):
        if session_id in self.customers:
            disconnected = []
            for ws in self.customers[session_id]:
                try:
                    await ws.send_json(message)
                except Exception as e:
                    disconnected.append(ws)
            for ws in disconnected:
                self.customers[session_id].remove(ws)


    async def broadcast_to_admins(self, message): 
        """
        ✅ Gửi tin nhắn đến tất cả admin đang online
        - Xử lý lỗi khi admin disconnect
        """
        disconnected = []
        for admin in self.admins:
            try:
                await admin.send_json(message)
            except Exception as e:
                print(f"⚠️ Admin disconnect, removing from list")
                disconnected.append(admin)
        
        # Xóa các admin đã disconnect
        for admin in disconnected:
            self.admins.remove(admin)

    async def broadcast_to_other_admins(self, sender_websocket: WebSocket, message): 
        """
        ✅ Gửi tin nhắn đến TẤT CẢ admin KHÁC (trừ admin đang gửi)
        - Tránh duplicate message khi admin gửi tin nhắn
        """
        disconnected = []
        for admin in self.admins:
            # ✅ Bỏ qua admin đang gửi tin nhắn
            if admin == sender_websocket:
                continue
                
            try:
                await admin.send_json(message)
            except Exception as e:
                print(f"⚠️ Admin disconnect, removing from list")
                disconnected.append(admin)
        
        # Xóa các admin đã disconnect
        for admin in disconnected:
            self.admins.remove(admin)



    async def broadcast(self, message):
    
        for connection in self.active_connections:
            
            await connection.send_json(message)
            
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)