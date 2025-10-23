import random
import asyncio
import base64
import io
from typing import Any, Dict
from sqlalchemy.orm import Session
from models.chat import ChatSession, Message, CustomerInfo
from models.facebook_page import FacebookPage
from models.telegram_page import TelegramBot
from models.zalo import ZaloBot 
from config.database import SessionLocal, AsyncSessionLocal
from sqlalchemy import text, select
from models.llm import LLM  # Import LLM model để check name
from datetime import datetime, timedelta
from fastapi import WebSocket
import random
import json
import requests
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

async def update_tag_chat_session(id: int, data: dict, db):
    result = await db.execute(select(ChatSession).filter(ChatSession.id == id))
    chatSession = result.scalar_one_or_none()
    if not chatSession:
        return None
    from models.tag import Tag
    result = await db.execute(select(Tag).filter(Tag.id.in_(data["tags"])))
    tags = result.scalars().all()
    chatSession.tags = tags
    await db.commit()
    await db.refresh(chatSession)
    
    # Clear cache sau khi update
    clear_session_cache(id)
    
    return chatSession
        
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
                    ci.customer_data::text AS customer_data, 
                    cs.name,
                    cs.time,
                    cs.current_receiver,
                    cs.previous_receiver,
                    m.sender_type,
                    m.content,
                    m.sender_name, 
                    m.created_at AS created_at,
                    COALESCE(JSON_AGG(t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS tag_names,
                    COALESCE(JSON_AGG(t.id) FILTER (WHERE t.id IS NOT NULL), '[]') AS tag_ids
                FROM chat_sessions cs
                LEFT JOIN customer_info ci ON cs.id = ci.chat_session_id
                JOIN messages m ON cs.id = m.chat_session_id
                JOIN (
                    SELECT
                        chat_session_id,
                        MAX(created_at) AS latest_time
                    FROM messages
                    GROUP BY chat_session_id
                ) AS latest ON cs.id = latest.chat_session_id AND m.created_at = latest.latest_time
                LEFT JOIN chat_session_tag cst ON cs.id = cst.chat_session_id
                LEFT JOIN tag t ON t.id = cst.tag_id
                GROUP BY 
                    cs.id, cs.status, cs.channel, ci.customer_data::text,
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

async def get_all_customer_service(data: dict, db):
    channel = data.get("channel")
    tag_id = data.get("tag_id")

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
    result = await db.execute(stmt, params)
    rows = result.mappings().all()

    # result lúc này là list[RowMapping] → có thể convert sang list[dict]
    return [dict(row) for row in rows]




def clear_session_cache(session_id: int):
    """Clear cache cho session và check_repply"""
    session_cache_key = f"session:{session_id}"
    repply_cache_key = f"check_repply:{session_id}"
    cache_delete(session_cache_key)
    cache_delete(repply_cache_key)



async def update_chat_session(id: int, data: dict, user, db: Session):
    try:
        result = await db.execute(select(ChatSession).filter(ChatSession.id == id))
        chatSession = result.scalar_one_or_none()
        if not chatSession:
            return None

        new_status = data.get("status")
        new_time = data.get("time")
        
        print(new_status)
        if not (chatSession.status == "true" and new_status == "true"):
            receiver_name = chatSession.current_receiver
            chatSession.current_receiver = "Bot" if new_status == "true" else user.get("fullname")
            chatSession.previous_receiver = receiver_name
            chatSession.status = new_status
            chatSession.time = new_time 
        
        if "tags" in data and isinstance(data["tags"], list):
            from models.tag import Tag
            result = await db.execute(select(Tag).filter(Tag.id.in_(data["tags"])))
            tags = result.scalars().all()
            chatSession.tags = tags
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
        
async def update_tag_chat_session_service(id: int, data: dict, db):
    try:
        result = await db.execute(select(ChatSession).filter(ChatSession.id == id))
        chatSession = result.scalar_one_or_none()
        if not chatSession:
            return None
        if "tags" in data and isinstance(data["tags"], list):
            from models.tag import Tag
            result = await db.execute(select(Tag).filter(Tag.id.in_(data["tags"])))
            tags = result.scalars().all()
            chatSession.tags = tags
        
        await db.commit()
        await db.refresh(chatSession)
        return chatSession
        
    except Exception as e:
        print(e)

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

async def update_chat_session_tag(id: int, data: dict, db: Session):
    try:
        result = await db.execute(select(ChatSession).filter(ChatSession.id == id))
        chatSession = result.scalar_one_or_none()
        if not chatSession:
            return None
        from models.tag import Tag
        result = await db.execute(select(Tag).filter(Tag.id.in_(data["tags"])))
        tags = result.scalars().all()
        chatSession.tags = tags
        await db.commit()
        await db.refresh(chatSession)
        
        # Clear cache sau khi update
        clear_session_cache(id)
        
        return chatSession
        
    except Exception as e:
        print(e)
        await db.rollback()
        return None