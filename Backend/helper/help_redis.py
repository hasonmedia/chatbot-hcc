"""
Helper functions cho Redis cache operations
Quản lý tập trung các cache keys và operations liên quan đến chat sessions
"""

from config.redis_cache import cache_get, cache_set, cache_delete


# ==================== Helper Functions ====================

def session_to_dict(session) -> dict:
    """
    Convert ChatSession object thành dictionary để cache
    
    Args:
        session: ChatSession object từ database
        
    Returns:
        dict: Session data dạng dictionary
    """
    return {
        'id': session.id,
        'name': session.name,
        'status': session.status,
        'channel': session.channel,
        'page_id': session.page_id,
        'current_receiver': session.current_receiver,
        'previous_receiver': session.previous_receiver,
        'time': session.time.isoformat() if session.time else None
    }


# ==================== Cache Key Builders ====================

def get_session_cache_key(session_id: int) -> str:
    """
    Tạo cache key cho session theo ID
    
    Args:
        session_id: ID của chat session
        
    Returns:
        str: Cache key (format: "session:{id}")
    """
    return f"session:{session_id}"


def get_session_by_name_cache_key(session_name: str) -> str:
    """
    Tạo cache key cho session theo name
    
    Args:
        session_name: Tên session (format: "F-123", "T-456")
        
    Returns:
        str: Cache key (format: "session_by_name:{name}")
    """
    return f"session_by_name:{session_name}"


def get_check_reply_cache_key(session_id: int) -> str:
    """
    Tạo cache key cho check reply
    
    Args:
        session_id: ID của chat session
        
    Returns:
        str: Cache key (format: "check_repply:{id}")
    """
    return f"check_repply:{session_id}"


def get_page_active_cache_key(platform: str, page_id: str) -> str:
    """
    Tạo cache key cho trạng thái active của page/bot
    
    Args:
        platform: Tên platform (facebook, telegram, zalo)
        page_id: ID của page/bot
        
    Returns:
        str: Cache key (format: "page_active:{platform}:{page_id}")
    """
    return f"page_active:{platform}:{page_id}"


# ==================== Session Cache Operations ====================

def cache_session_data(session_id: int, session_data: dict, ttl: int = 300) -> None:
    """
    Cache session data theo ID
    
    Args:
        session_id: ID của chat session
        session_data: Session data dạng dictionary
        ttl: Time to live (seconds), default 300s
    """
    cache_key = get_session_cache_key(session_id)
    cache_set(cache_key, session_data, ttl=ttl)


def get_cached_session_data(session_id: int) -> dict:
    """
    Lấy session data từ cache theo ID
    
    Args:
        session_id: ID của chat session
        
    Returns:
        dict: Session data hoặc None nếu không có trong cache
    """
    cache_key = get_session_cache_key(session_id)
    return cache_get(cache_key)


def cache_session_name_mapping(session_name: str, session_id: int, ttl: int = 300) -> None:
    """
    Cache mapping từ session name → session ID
    
    Args:
        session_name: Tên session
        session_id: ID của session
        ttl: Time to live (seconds), default 300s
    """
    cache_key = get_session_by_name_cache_key(session_name)
    cache_set(cache_key, session_id, ttl=ttl)


def get_cached_session_id_by_name(session_name: str) -> int:
    """
    Lấy session ID từ cache theo name
    
    Args:
        session_name: Tên session
        
    Returns:
        int: Session ID hoặc None nếu không có trong cache
    """
    cache_key = get_session_by_name_cache_key(session_name)
    return cache_get(cache_key)


def update_session_cache(session, ttl: int = 300) -> None:
    """
    Cập nhật cache cho session
    Convert session object sang dict và cache
    
    Args:
        session: ChatSession object
        ttl: Time to live (seconds), default 300s
    """
    session_data = session_to_dict(session)
    cache_session_data(session.id, session_data, ttl=ttl)


def clear_session_cache(session_id: int) -> None:
    """
    Clear cache cho session và check_reply
    
    Args:
        session_id: ID của chat session
    """
    session_cache_key = get_session_cache_key(session_id)
    reply_cache_key = get_check_reply_cache_key(session_id)
    
    cache_delete(session_cache_key)
    cache_delete(reply_cache_key)


# ==================== Check Reply Cache Operations ====================

def cache_check_reply_result(session_id: int, can_reply: bool, ttl: int = 300) -> None:
    """
    Cache kết quả check reply
    
    Args:
        session_id: ID của chat session
        can_reply: Bot có thể reply hay không
        ttl: Time to live (seconds), default 300s
    """
    cache_key = get_check_reply_cache_key(session_id)
    cache_set(cache_key, {'can_reply': can_reply}, ttl=ttl)


def get_cached_check_reply_result(session_id: int) -> dict:
    """
    Lấy kết quả check reply từ cache
    
    Args:
        session_id: ID của chat session
        
    Returns:
        dict: {'can_reply': bool} hoặc None nếu không có trong cache
    """
    cache_key = get_check_reply_cache_key(session_id)
    return cache_get(cache_key)


def clear_check_reply_cache(session_id: int) -> None:
    """
    Xóa cache check reply
    
    Args:
        session_id: ID của chat session
    """
    cache_key = get_check_reply_cache_key(session_id)
    cache_delete(cache_key)


# ==================== Bulk Operations ====================

def clear_all_session_caches(session_id: int) -> None:
    """
    Xóa tất cả cache liên quan đến session
    Bao gồm: session data, check reply
    
    Args:
        session_id: ID của chat session
    """
    clear_session_cache(session_id)


# ==================== Page Active Status Cache Operations ====================

def cache_page_active_status(platform: str, page_id: str, is_active: bool, ttl: int = 600) -> None:
    """
    Cache trạng thái active của page/bot
    
    Args:
        platform: Tên platform (facebook, telegram, zalo)
        page_id: ID của page/bot
        is_active: Trạng thái active
        ttl: Time to live (seconds), default 600s (10 phút)
    """
    cache_key = get_page_active_cache_key(platform, page_id)
    cache_set(cache_key, {'is_active': is_active}, ttl=ttl)


def get_cached_page_active_status(platform: str, page_id: str) -> dict:
    """
    Lấy trạng thái active của page/bot từ cache
    
    Args:
        platform: Tên platform (facebook, telegram, zalo)
        page_id: ID của page/bot
        
    Returns:
        dict: {'is_active': bool} hoặc None nếu không có trong cache
    """
    cache_key = get_page_active_cache_key(platform, page_id)
    return cache_get(cache_key)


def clear_page_active_cache(platform: str, page_id: str) -> None:
    """
    Xóa cache trạng thái active của page/bot
    Gọi hàm này sau khi toggle status page/bot
    
    Args:
        platform: Tên platform (facebook, telegram, zalo)
        page_id: ID của page/bot
    """
    cache_key = get_page_active_cache_key(platform, page_id)
    cache_delete(cache_key)
