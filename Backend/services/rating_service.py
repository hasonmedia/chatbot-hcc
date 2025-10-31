"""
Rating Service - Quản lý đánh giá cuộc hội thoại
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.chat import Rating, ChatSession
from datetime import datetime


async def create_rating_service(session_id: int, rate: int, comment: str, db: AsyncSession):
    """Tạo đánh giá mới cho chat session"""
    try:
        # Kiểm tra xem session có tồn tại không
        result = await db.execute(select(ChatSession).filter(ChatSession.id == session_id))
        session = result.scalar_one_or_none()
        
        if not session:
            return {"error": "Session not found"}
        
        # Kiểm tra xem đã có rating chưa
        result = await db.execute(select(Rating).filter(Rating.session_id == session_id))
        existing_rating = result.scalar_one_or_none()
        
        if existing_rating:
            # Cập nhật rating hiện có
            existing_rating.rate = rate
            existing_rating.comment = comment
            existing_rating.created_at = datetime.now()
            await db.commit()
            await db.refresh(existing_rating)
            return existing_rating
        else:
            # Tạo rating mới
            new_rating = Rating(
                session_id=session_id,
                rate=rate,
                comment=comment
            )
            db.add(new_rating)
            await db.commit()
            await db.refresh(new_rating)
            return new_rating
            
    except Exception as e:
        await db.rollback()
        print(f"❌ Error creating rating: {e}")
        return {"error": str(e)}


async def get_rating_by_session_service(session_id: int, db: AsyncSession):
    """Lấy rating theo session_id"""
    try:
        result = await db.execute(select(Rating).filter(Rating.session_id == session_id))
        rating = result.scalar_one_or_none()
        return rating
    except Exception as e:
        print(f"❌ Error getting rating: {e}")
        return None


async def check_if_rated_service(session_id: int, db: AsyncSession):
    """Kiểm tra xem session đã được đánh giá chưa"""
    try:
        result = await db.execute(select(Rating).filter(Rating.session_id == session_id))
        rating = result.scalar_one_or_none()
        return rating is not None
    except Exception as e:
        print(f"❌ Error checking rating: {e}")
        return False
