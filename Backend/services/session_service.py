"""
Chat Session Service - Quản lý chat sessions
"""
import random
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text
from models.chat import ChatSession, CustomerInfo
from models.facebook_page import FacebookPage
from config.redis_cache import cache_get, cache_set, cache_delete


class SessionService:
    """Service quản lý chat sessions"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_session(self, channel: str = "web", page_id: Optional[str] = None) -> int:
        """Tạo session mới"""
        session = ChatSession(
            name=f"W-{random.randint(10**7, 10**8 - 1)}",
            channel=channel,
            url_channel="https://chatbot.haduyson.com/chat",
            page_id=page_id
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session.id
    
    def get_or_create_session(self, session_id: Optional[int] = None, 
                            channel: str = "web", 
                            page_id: Optional[str] = None) -> int:
        """Lấy session hiện có hoặc tạo mới"""
        if session_id:
            session = self.db.query(ChatSession).filter(ChatSession.id == session_id).first()
            if session:
                return session.id
        
        return self.create_session(channel, page_id)
    
    def get_session_by_id(self, session_id: int) -> Optional[ChatSession]:
        """Lấy session theo ID với caching"""
        # Kiểm tra cache trước
        session_cache_key = f"session:{session_id}"
        cached_session = cache_get(session_cache_key)
        
        if cached_session:
            # Tạo session object từ cache
            session = ChatSession(
                id=cached_session['id'],
                name=cached_session['name'],
                status=cached_session['status'],
                channel=cached_session['channel'],
                page_id=cached_session.get('page_id'),
                current_receiver=cached_session.get('current_receiver'),
                previous_receiver=cached_session.get('previous_receiver'),
                time=datetime.fromisoformat(cached_session['time']) if cached_session.get('time') else None
            )
            return session
        
        # Lấy từ database và cache lại
        session = self.db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if session:
            self.update_session_cache(session)
        
        return session
    
    def get_session_by_name(self, name: str) -> Optional[ChatSession]:
        """Lấy session theo tên"""
        return self.db.query(ChatSession).filter(ChatSession.name == name).first()
    
    def update_session_status(self, session_id: int, status: str, 
                            current_receiver: Optional[str] = None,
                            time_offset_hours: int = 1) -> bool:
        """Cập nhật trạng thái session"""
        try:
            session = self.db.query(ChatSession).filter(ChatSession.id == session_id).first()
            if not session:
                return False
            
            session.status = status
            session.time = datetime.now() + timedelta(hours=time_offset_hours)
            session.previous_receiver = session.current_receiver
            session.current_receiver = current_receiver or "Bot"
            
            self.db.commit()
            self.db.refresh(session)
            
            # Cập nhật cache
            self.update_session_cache(session)
            
            return True
        except Exception as e:
            self.db.rollback()
            return False
    
    def update_session_cache(self, session: ChatSession, ttl: int = 300):
        """Cập nhật cache cho session"""
        session_cache_key = f"session:{session.id}"
        session_data = {
            'id': session.id,
            'name': session.name,
            'status': session.status,
            'channel': session.channel,
            'page_id': session.page_id,
            'current_receiver': session.current_receiver,
            'previous_receiver': session.previous_receiver,
            'time': session.time.isoformat() if session.time else None
        }
        cache_set(session_cache_key, session_data, ttl=ttl)
    
    def clear_session_cache(self, session_id: int):
        """Xóa cache của session"""
        session_cache_key = f"session:{session_id}"
        repply_cache_key = f"check_repply:{session_id}"
        cache_delete(session_cache_key)
        cache_delete(repply_cache_key)
    
    def check_can_reply(self, session_id: int) -> bool:
        """Kiểm tra có thể reply tự động không với Redis cache"""
        try:
            # Kiểm tra cache trước
            repply_cache_key = f"check_repply:{session_id}"
            cached_result = cache_get(repply_cache_key)
            
            if cached_result is not None:
                return cached_result['can_reply']
            
            # Lấy session
            session = self.get_session_by_id(session_id)
            if not session:
                return False
            
            can_reply = False
            
            # Logic check repply
            if (session.time and datetime.now() > session.time and 
                session.status == "false"):
                # Cập nhật database
                db_session = self.db.query(ChatSession).filter(ChatSession.id == session_id).first()
                db_session.status = "true"
                db_session.time = None
                self.db.commit()
                self.db.refresh(db_session)
                
                # Cập nhật cache session
                self.update_session_cache(db_session)
                can_reply = True
            elif session.status == "true":
                can_reply = True
            
            # Cache kết quả check_repply
            cache_set(repply_cache_key, {'can_reply': can_reply}, ttl=300)
            
            return can_reply
            
        except Exception as e:
            return False
    
    def get_all_customers(self, channel: Optional[str] = None, 
                         tag_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Lấy danh sách tất cả customers"""
        query = """
            SELECT DISTINCT
                cs.id AS session_id,
                cs.channel,
                cs.name,
                cs.page_id
            FROM chat_sessions cs
        """

        conditions = []
        params = {}

        if tag_id:
            query += " INNER JOIN chat_session_tag cst ON cs.id = cst.chat_session_id"
            conditions.append("cst.tag_id = :tag_id")
            params["tag_id"] = tag_id

        if channel:
            conditions.append("cs.channel = :channel")
            params["channel"] = channel

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " ORDER BY cs.id DESC;"

        stmt = text(query)
        result = self.db.execute(stmt, params).mappings().all()
        return [dict(row) for row in result]
    
    def update_session(self, session_id: int, data: Dict[str, Any], 
                      user: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Cập nhật session với data mới"""
        try:
            session = self.db.query(ChatSession).filter(ChatSession.id == session_id).first()
            if not session:
                return None

            new_status = data.get("status")
            new_time = data.get("time")
            
            if not (session.status == "true" and new_status == "true"):
                receiver_name = session.current_receiver
                session.current_receiver = "Bot" if new_status == "true" else user.get("fullname")
                session.previous_receiver = receiver_name
                session.status = new_status
                session.time = new_time 
            
            # Cập nhật tags nếu có
            if "tags" in data and isinstance(data["tags"], list):
                from models.tag import Tag
                tags = self.db.query(Tag).filter(Tag.id.in_(data["tags"])).all()
                session.tags = tags
            
            self.db.commit()
            self.db.refresh(session)
            
            # Xóa cache cũ
            self.clear_session_cache(session_id)
            
            return {
                "chat_session_id": session.id,
                "session_status": session.status,
                "current_receiver": session.current_receiver,
                "previous_receiver": session.previous_receiver,
                "time": session.time.isoformat() if session.time else None
            }
            
        except Exception as e:
            self.db.rollback()
            return None
    
    def delete_sessions(self, session_ids: List[int]) -> int:
        """Xóa nhiều sessions"""
        sessions = self.db.query(ChatSession).filter(ChatSession.id.in_(session_ids)).all()
        if not sessions:
            return 0
        
        for session in sessions:
            self.clear_session_cache(session.id)
            self.db.delete(session)
        
        self.db.commit()
        return len(sessions)
    
    def create_platform_session(self, platform: str, sender_id: str, 
                              page_id: Optional[str] = None) -> ChatSession:
        """Tạo session cho platform (Facebook, Telegram, Zalo)"""
        prefix_map = {
            "facebook": "F",
            "telegram": "T", 
            "zalo": "Z"
        }
        
        prefix = prefix_map.get(platform, "U")
        session_name = f"{prefix}-{sender_id}"
        
        # Kiểm tra session đã tồn tại
        existing_session = self.get_session_by_name(session_name)
        if existing_session:
            return existing_session
        
        # Lấy URL channel cho platform
        url_channel = None
        if platform == "facebook" and page_id:
            fb = self.db.query(FacebookPage).filter(
                FacebookPage.page_id == page_id
            ).first()
            url_channel = fb.url if fb else ""
        
        # Tạo session mới
        session = ChatSession(
            name=session_name,
            channel=platform,
            page_id=page_id,
            url_channel=url_channel
        )
        
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        
        return session


# Backward compatibility functions
def create_session_service(db: Session) -> int:
    """Backward compatibility cho create_session_service"""
    service = SessionService(db)
    return service.create_session()


def check_session_service(session_id: int, db: Session) -> int:
    """Backward compatibility cho check_session_service"""
    service = SessionService(db)
    return service.get_or_create_session(session_id)