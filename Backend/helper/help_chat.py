"""
Helper functions cho chat service
Chứa các logic chung được sử dụng bởi nhiều services
"""

import traceback
from datetime import datetime
from sqlalchemy import select
from models.chat import ChatSession
from models.facebook_page import FacebookPage
from models.telegram_page import TelegramBot
from models.zalo import ZaloBot
from helper.help_redis import (
    get_cached_session_data,
    cache_session_data,
    get_cached_session_id_by_name,
    cache_session_name_mapping,
    get_cached_check_reply_result,
    cache_check_reply_result,
    update_session_cache,
    session_to_dict,  # Import session_to_dict từ help_redis
    get_cached_page_active_status,
    cache_page_active_status
)


async def get_session_by_id_cached(session_id: int, db) -> dict:

    cached_session = get_cached_session_data(session_id)
    
    if cached_session:
        return cached_session
    
    result = await db.execute(select(ChatSession).filter(ChatSession.id == session_id))
    session = result.scalar_one_or_none()
    
    if not session:
        return None
    
    session_data = session_to_dict(session)
    cache_session_data(session_id, session_data, ttl=300)
    
    return session_data


async def get_or_create_session_by_name_cached(session_name: str, platform: str, page_id: str, db) -> dict:
  
    cached_session_id = get_cached_session_id_by_name(session_name)
    
    if cached_session_id:
        # Lấy session data từ cache theo ID (sử dụng helper)
        session_data = get_cached_session_data(cached_session_id)
        if session_data:
            return session_data
    
    # Nếu không có trong cache, query từ database
    result = await db.execute(select(ChatSession).filter(ChatSession.name == session_name))
    session = result.scalar_one_or_none()
    
    # Nếu không tồn tại, tạo mới
    if not session:
        session = ChatSession(
            name=session_name,
            channel=platform,
            page_id=page_id,
            url_channel=None
        )
        
        db.add(session)
        await db.commit()
        await db.refresh(session)
    
    # Convert sang dict và cache (sử dụng helper)
    session_data = session_to_dict(session)
    
    # Cache session theo cả ID và name
    cache_session_data(session.id, session_data, ttl=300)
    cache_session_name_mapping(session_name, session.id, ttl=300)
    
    return session_data


def get_platform_prefix(platform: str) -> str:
    """
    Lấy prefix cho session name dựa trên platform
    
    Args:
        platform: Tên platform (facebook, telegram, zalo, etc.)
        
    Returns:
        str: Prefix character (F, T, Z, U)
    """
    platform_map = {
        "facebook": "F",
        "telegram": "T",
        "zalo": "Z"
    }
    return platform_map.get(platform, "U")


def build_session_name(platform: str, sender_id: str) -> str:
   
    prefix = get_platform_prefix(platform)
    return f"{prefix}-{sender_id}"


async def check_repply_cached(id: int, db):

    try:
        cached_result = get_cached_check_reply_result(id)
        
        if cached_result is not None:
            return cached_result['can_reply']
        
        session_data = await get_session_by_id_cached(id, db)
        
        if not session_data:
            return False
        
        session_status = session_data['status']
        session_time = datetime.fromisoformat(session_data['time']) if session_data.get('time') else None
        
        can_reply = False
        
        # Logic check repply
        if session_time and datetime.now() > session_time and session_status == "false":
            # Hết thời gian block → Cập nhật database và cho phép bot reply
            result = await db.execute(select(ChatSession).filter(ChatSession.id == id))
            session = result.scalar_one_or_none()
            if session:
                session.status = "true"
                session.time = None
                await db.commit()
                await db.refresh(session)
                
                # Cập nhật cache session (sử dụng helper)
                update_session_cache(session)
                can_reply = True
        elif session_status == "true":
            # Bot đang được phép reply
            can_reply = True
        else:
            # Các trường hợp còn lại: status="false" và chưa hết thời gian block
            can_reply = False
        
        # Cache kết quả check_reply trong 300 giây (sử dụng helper)
        cache_check_reply_result(id, can_reply, ttl=300)
        
        return can_reply
        
    except Exception as e:
        print(e)
        traceback.print_exc()
        return False


async def check_page_active_status(platform: str, page_id: str, db) -> bool:

    try:
        cached_result = get_cached_page_active_status(platform, page_id)
        
        if cached_result is not None:
            return cached_result['is_active']
        
        is_active = False
        
        if platform == "facebook":
            result = await db.execute(
                select(FacebookPage).filter(FacebookPage.page_id == page_id)
            )
            page = result.scalar_one_or_none()
            is_active = page.is_active if page else False
            
        elif platform == "telegram":
            result = await db.execute(
                select(TelegramBot).filter(TelegramBot.bot_token == page_id)
            )
            bot = result.scalar_one_or_none()
            is_active = bot.is_active if bot else False
            
        elif platform == "zalo":
            result = await db.execute(
                select(ZaloBot).filter(ZaloBot.access_token == page_id)
            )
            bot = result.scalar_one_or_none()
            is_active = bot.is_active if bot else False
        
        cache_page_active_status(platform, page_id, is_active, ttl=600)
        
        return is_active
            
    except Exception as e:
        print(f"❌ Error checking page active status: {e}")
        traceback.print_exc()
        return False
