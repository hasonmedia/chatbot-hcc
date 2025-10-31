from models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from services.role_service import get_users_with_permission
async def get_users_with_permission_controller(db: AsyncSession, current_user: User):
    users = await get_users_with_permission(db, current_user)
    return users