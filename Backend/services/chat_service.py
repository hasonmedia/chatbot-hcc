import random
import asyncio
import base64
import io
from typing import Any, Dict
from sqlalchemy.orm import Session
from models.chat import ChatSession, Message
from sqlalchemy import text, select
from models.llm import LLM  # Import LLM model để check name
from datetime import datetime, timedelta
import random
import json
import traceback
from config.redis_cache import cache_delete

async def create_session_service(url_channel: str, db):
    session = ChatSession(
        name=f"W-{random.randint(10**7, 10**8 - 1)}",
        channel="web",
        url_channel = url_channel or "https://chatbotbe.a2alab.vn/chat"  # Sử dụng url_channel từ widget
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session.id

async def check_session_service(sessionId, url_channel, db):
    result = await db.execute(select(ChatSession).filter(ChatSession.id == sessionId))
    session = result.scalar_one_or_none()
    if session:
        return session.id
    
    # Nếu session không tồn tại, tạo session mới với url_channel
    session = ChatSession(
        name=f"W-{random.randint(10**7, 10**8 - 1)}",
        channel="web",
        url_channel = url_channel or "https://chatbotbe.a2alab.vn/chat"
    )
    
    db.add(session)
    await db.flush()   # để session.id được gán ngay
    session_id = session.id
    await db.commit()
    return session_id
    

async def get_history_chat_service(chat_session_id: int, page: int = 1, limit: int = 10, db=None):
    # ✅ Validate chat_session_id
    if not chat_session_id or chat_session_id <= 0:
        print(f"❌ Invalid chat_session_id: {chat_session_id}")
        return []
    
    # ✅ Kiểm tra session có tồn tại không
    result = await db.execute(select(ChatSession).filter(ChatSession.id == chat_session_id))
    session_exists = result.scalar_one_or_none()
    if not session_exists:
        print(f"❌ Session {chat_session_id} không tồn tại")
        return []
    
    offset = (page - 1) * limit
    
    from sqlalchemy import func
    result = await db.execute(
        select(func.count(Message.id)).filter(Message.chat_session_id == chat_session_id)
    )
    total_messages = result.scalar()

    result = await db.execute(
        select(Message)
        .filter(Message.chat_session_id == chat_session_id)
        .order_by(Message.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    messages = result.scalars().all()
    
    messages = list(reversed(messages))
    
    # Detach objects from session để tránh UPDATE không mong muốn
    for msg in messages:
        db.expunge(msg)
        # ✅ Đảm bảo chat_session_id luôn đúng
        if msg.chat_session_id != chat_session_id:
            print(f"⚠️ WARNING: Message {msg.id} có chat_session_id không khớp!")
            continue
        try:
            msg.image = json.loads(msg.image) if msg.image else []
        except Exception:
            msg.image = []

    return messages
    
async def get_all_history_chat_service(db):
    try:
        query = text("""
                SELECT 
                    cs.id AS session_id,
                    cs.status,
                    cs.channel,
                    cs.url_channel,
                    cs.alert,
                    cs.name,
                    cs.time,
                    cs.current_receiver,
                    cs.previous_receiver,
                    m.sender_type,
                    m.content,
                    m.sender_name, 
                    m.created_at AS created_at
                FROM chat_sessions cs
                JOIN messages m ON cs.id = m.chat_session_id
                JOIN (
                    SELECT
                        chat_session_id,
                        MAX(created_at) AS latest_time
                    FROM messages
                    GROUP BY chat_session_id
                ) AS latest ON cs.id = latest.chat_session_id AND m.created_at = latest.latest_time
                GROUP BY 
                    cs.id, cs.status, cs.channel,
                    cs.name, cs.time, cs.alert, cs.current_receiver, cs.previous_receiver,
                    m.sender_type, m.content, m.sender_name, m.created_at
                ORDER BY m.created_at DESC;
        """)
        
        result = await db.execute(query)
        rows = result.fetchall()
        conversations = []
        for row in rows:
            row_dict = dict(row._mapping)
            try:
                row_dict["image"] = json.loads(row_dict["image"]) if row_dict.get("image") else []
            except Exception:
                row_dict["image"] = []  
            conversations.append(row_dict)
            
        return conversations
    except Exception as e:
        print(e)
        traceback.print_exc()


def clear_session_cache(session_id: int):
    """Clear cache cho session và check_repply"""
    session_cache_key = f"session:{session_id}"
    repply_cache_key = f"check_repply:{session_id}"
    cache_delete(session_cache_key)
    cache_delete(repply_cache_key)

def get_expire_time(option: str):
    now = datetime.now()
    
    if option == "1h":
        return now + timedelta(hours=1)
    elif option == "4h":
        return now + timedelta(hours=4)
    elif option == "8am":
        tomorrow = now.date() + timedelta(days=1)
        return datetime.combine(tomorrow, datetime.min.time()) + timedelta(hours=8)
    elif option == "forever":
        return None  
    else:
        raise ValueError("Option không hợp lệ")
     

async def update_chat_session(id: int, data: dict, user, db: Session):
    try:
        result = await db.execute(select(ChatSession).filter(ChatSession.id == id))
        chatSession = result.scalar_one_or_none()
        if not chatSession:
            return None

        new_status = data.get("status")
        new_time = data.get("time")
        if not (chatSession.status == "true" and new_status == "true"):
            receiver_name = chatSession.current_receiver
            chatSession.current_receiver = "Bot" if new_status == "true" else user.full_name
            chatSession.previous_receiver = receiver_name
            chatSession.status = new_status
            chatSession.time = get_expire_time(new_time)
        
        await db.commit()
        await db.refresh(chatSession)
        
        # Clear cache sau khi update
        clear_session_cache(id)
        
        return {
            "chat_session_id": chatSession.id,
            "session_status": chatSession.status,
            "current_receiver": chatSession.current_receiver,
            "previous_receiver": chatSession.previous_receiver,
            "time" : chatSession.time.isoformat() if chatSession.time else None
        }
        
    except Exception as e:
        print(e)
        await db.rollback()
        return None

async def delete_chat_session(ids: list[int], db):
    result = await db.execute(select(ChatSession).filter(ChatSession.id.in_(ids)))
    sessions = result.scalars().all()
    if not sessions:
        return 0
    
    # Clear cache cho từng session trước khi xóa
    for s in sessions:
        clear_session_cache(s.id)
        await db.delete(s)
    await db.commit()
    return len(sessions)

async def delete_message(chatId: int, ids: list[int], db):
    print("chatId", chatId)
    print("data", ids)
    result = await db.execute(
        select(Message).filter(
            Message.id.in_(ids),
            Message.chat_session_id == chatId
        )
    )
    messages = result.scalars().all()
    
    if not messages:
        return 0
        
    for m in messages:
        await db.delete(m)
    await db.commit()
    return len(messages)

async def get_dashboard_summary(db: Session) -> Dict[str, Any]:
    try:
        # 1️⃣ Tổng số tin nhắn theo kênh (barData + pieData)
        bar_query = text("""
            SELECT 
                cs.channel AS channel,
                COUNT(m.id) AS messages
            FROM messages m
            JOIN chat_sessions cs ON cs.id = m.chat_session_id
            GROUP BY cs.channel
            ORDER BY messages DESC;
        """)
        result = await db.execute(bar_query)
        bar_rows = result.fetchall()
        bar_data = [{"channel": r.channel, "messages": r.messages} for r in bar_rows]
        pie_data = [{"name": r.channel, "value": r.messages} for r in bar_rows]

        # 2️⃣ So sánh tin nhắn giữa 2 tháng gần nhất (lineData)
        line_query = text("""
            SELECT 
                cs.channel,
                TO_CHAR(DATE_TRUNC('month', m.created_at), 'YYYY-MM') AS month,
                COUNT(m.id) AS messages
            FROM messages m
            JOIN chat_sessions cs ON cs.id = m.chat_session_id
            WHERE m.created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
            GROUP BY cs.channel, DATE_TRUNC('month', m.created_at)
            ORDER BY month;
        """)
        result = await db.execute(line_query)
        line_rows = result.fetchall()

        line_data_dict = {}
        current_month = datetime.now().strftime("%Y-%m")

        for row in line_rows:
            month_label = (
                "Tháng hiện tại" if row.month == current_month else "Tháng trước"
            )
            if month_label not in line_data_dict:
                line_data_dict[month_label] = {"month": month_label}
            line_data_dict[month_label][row.channel] = row.messages

        line_data = list(line_data_dict.values())

        # 3️⃣ Bảng chi tiết: khách hàng, tin nhắn, % thay đổi (tableData)
        table_query = text("""
            WITH month_stats AS (
                SELECT 
                    cs.channel,
                    DATE_TRUNC('month', m.created_at) AS month,
                    COUNT(DISTINCT ci.id) AS customers,
                    COUNT(m.id) AS messages
                FROM messages m
                JOIN chat_sessions cs ON cs.id = m.chat_session_id
                LEFT JOIN customer_info ci ON cs.id = ci.chat_session_id
                GROUP BY cs.channel, DATE_TRUNC('month', m.created_at)  
            )
            SELECT 
                curr.channel,
                curr.customers,
                curr.messages,
                ROUND(((curr.messages - prev.messages)::numeric / NULLIF(prev.messages, 0)) * 100, 2) AS change
            FROM month_stats curr
            LEFT JOIN month_stats prev 
                ON curr.channel = prev.channel 
                AND curr.month = DATE_TRUNC('month', NOW())
                AND prev.month = DATE_TRUNC('month', NOW() - INTERVAL '1 month');
        """)
        result = await db.execute(table_query)
        table_rows = result.fetchall()
        table_data = [
            {
                "channel": r.channel,
                "customers": r.customers,
                "messages": r.messages,
                "change": float(r.change or 0),
            }
            for r in table_rows
        ]

        # ✅ Trả về dữ liệu tổng hợp
        return {
            "barData": bar_data,
            "pieData": pie_data,
            "lineData": line_data,
            "tableData": table_data,
        }

    except Exception as e:
        print(f"Error generating dashboard summary: {e}")
        traceback.print_exc()
        return {
            "barData": [],
            "pieData": [],
            "lineData": [],
            "tableData": [],
        }


async def get_messages_by_time_service(start_date: str, end_date: str, db: Session) -> Dict[str, Any]:
    """
    API 1: Thống kê tổng lượng tin nhắn theo thời gian
    """
    try:
        # Parse dates
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1) - timedelta(seconds=1)
        
        # Query tổng số tin nhắn
        total_query = text("""
            SELECT COUNT(m.id) AS total
            FROM messages m
            WHERE m.created_at BETWEEN :start_date AND :end_date
        """)
        
        result = await db.execute(total_query, {"start_date": start, "end_date": end})
        total_row = result.fetchone()
        total_messages = total_row.total if total_row else 0
        
        # Query thống kê theo ngày
        daily_query = text("""
            SELECT 
                TO_CHAR(DATE(m.created_at), 'YYYY-MM-DD') AS date,
                COUNT(m.id) AS count
            FROM messages m
            WHERE m.created_at BETWEEN :start_date AND :end_date
            GROUP BY DATE(m.created_at)
            ORDER BY DATE(m.created_at)
        """)
        
        result = await db.execute(daily_query, {"start_date": start, "end_date": end})
        daily_rows = result.fetchall()
        daily_statistics = [{"date": row.date, "count": row.count} for row in daily_rows]
        
        return {
            "totalMessages": total_messages,
            "dailyStatistics": daily_statistics
        }
        
    except Exception as e:
        print(f"Error in get_messages_by_time_service: {e}")
        traceback.print_exc()
        return {
            "totalMessages": 0,
            "dailyStatistics": []
        }


async def get_messages_by_platform_service(start_date: str, end_date: str, db: Session) -> Dict[str, int]:
    """
    API 2: Thống kê lượng tin nhắn theo nền tảng trong khoảng thời gian
    """
    try:
        # Parse dates
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1) - timedelta(seconds=1)
        
        # Query thống kê theo platform
        platform_query = text("""
            SELECT 
                cs.channel AS platform,
                COUNT(m.id) AS count
            FROM messages m
            JOIN chat_sessions cs ON cs.id = m.chat_session_id
            WHERE m.created_at BETWEEN :start_date AND :end_date
            GROUP BY cs.channel
        """)
        
        result = await db.execute(platform_query, {"start_date": start, "end_date": end})
        platform_rows = result.fetchall()
        
        # Khởi tạo kết quả với các nền tảng mặc định
        platform_data = {
            "facebook": 0,
            "telegram": 0,
            "zalo": 0,
            "web": 0
        }
        
        # Cập nhật dữ liệu từ query
        for row in platform_rows:
            platform_name = row.platform.lower()
            if platform_name in platform_data:
                platform_data[platform_name] = row.count
        
        return platform_data
        
    except Exception as e:
        print(f"Error in get_messages_by_platform_service: {e}")
        traceback.print_exc()
        return {
            "facebook": 0,
            "telegram": 0,
            "zalo": 0,
            "web": 0
        }


async def get_ratings_by_time_service(start_date: str, end_date: str, db: Session) -> Dict[str, Any]:
    """
    API 1: Thống kê tổng lượng đánh giá theo thời gian
    """
    try:
        # Parse dates
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1) - timedelta(seconds=1)
        
        # Query tổng số đánh giá
        total_query = text("""
            SELECT COUNT(r.id) AS total
            FROM rating r
            WHERE r.created_at BETWEEN :start_date AND :end_date
        """)
        
        result = await db.execute(total_query, {"start_date": start, "end_date": end})
        total_row = result.fetchone()
        total_reviews = total_row.total if total_row else 0
        
        # Query thống kê theo ngày
        daily_query = text("""
            SELECT 
                TO_CHAR(DATE(r.created_at), 'YYYY-MM-DD') AS date,
                COUNT(r.id) AS count
            FROM rating r
            WHERE r.created_at BETWEEN :start_date AND :end_date
            GROUP BY DATE(r.created_at)
            ORDER BY DATE(r.created_at)
        """)
        
        result = await db.execute(daily_query, {"start_date": start, "end_date": end})
        daily_rows = result.fetchall()
        daily_statistics = [{"date": row.date, "count": row.count} for row in daily_rows]
        
        return {
            "totalReviews": total_reviews,
            "dailyStatistics": daily_statistics
        }
        
    except Exception as e:
        print(f"Error in get_ratings_by_time_service: {e}")
        traceback.print_exc()
        return {
            "totalReviews": 0,
            "dailyStatistics": []
        }


async def get_ratings_by_star_service(start_date: str, end_date: str, db: Session) -> Dict[str, int]:
    """
    API 2: Thống kê đánh giá theo số sao
    """
    try:
        # Parse dates
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1) - timedelta(seconds=1)
        
        # Query thống kê theo số sao
        star_query = text("""
            SELECT 
                r.rate AS star,
                COUNT(r.id) AS count
            FROM rating r
            WHERE r.created_at BETWEEN :start_date AND :end_date
                AND r.rate IS NOT NULL
            GROUP BY r.rate
            ORDER BY r.rate
        """)
        
        result = await db.execute(star_query, {"start_date": start, "end_date": end})
        star_rows = result.fetchall()
        
        # Khởi tạo kết quả với các mức sao mặc định
        star_data = {
            "1_star": 0,
            "2_star": 0,
            "3_star": 0,
            "4_star": 0,
            "5_star": 0
        }
        
        # Cập nhật dữ liệu từ query
        for row in star_rows:
            star_key = f"{row.star}_star"
            if star_key in star_data:
                star_data[star_key] = row.count
        
        return star_data
        
    except Exception as e:
        print(f"Error in get_ratings_by_star_service: {e}")
        traceback.print_exc()
        return {
            "1_star": 0,
            "2_star": 0,
            "3_star": 0,
            "4_star": 0,
            "5_star": 0
        }


