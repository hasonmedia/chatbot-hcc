"""
Rating Controller - Xử lý logic đánh giá
"""
from sqlalchemy.ext.asyncio import AsyncSession
from services.rating_service import (
    create_rating_service,
    get_rating_by_session_service,
    check_if_rated_service
)


async def create_rating_controller(session_id: int, data: dict, db: AsyncSession):
    rate = data.get("rate")
    comment = data.get("comment", "")
    
    if not rate or rate < 1 or rate > 5:
        return {"error": "Rating must be between 1 and 5"}
    
    rating = await create_rating_service(session_id, rate, comment, db)
    
    if isinstance(rating, dict) and "error" in rating:
        return rating
    
    return {
        "message": "Rating created successfully",
        "rating": {
            "id": rating.id,
            "session_id": rating.session_id,
            "rate": rating.rate,
            "comment": rating.comment,
            "created_at": rating.created_at.isoformat() if rating.created_at else None
        }
    }


async def get_rating_controller(session_id: int, db: AsyncSession):
    """Lấy rating của session"""
    rating = await get_rating_by_session_service(session_id, db)
    
    if not rating:
        return {"message": "No rating found"}
    
    return {
        "id": rating.id,
        "session_id": rating.session_id,
        "rate": rating.rate,
        "comment": rating.comment,
        "created_at": rating.created_at.isoformat() if rating.created_at else None
    }


async def check_rating_controller(session_id: int, db: AsyncSession):
    """Kiểm tra xem session đã được đánh giá chưa"""
    is_rated = await check_if_rated_service(session_id, db)
    return {"is_rated": is_rated}
