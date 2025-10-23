from sqlalchemy.ext.asyncio import AsyncSession
from services import zalo_bot_service


async def get_all_bots_controller(db: AsyncSession):
    return await zalo_bot_service.get_all_bots_service(db)


async def create_bot_controller(data: dict, db: AsyncSession):
    bot = await zalo_bot_service.create_bot_service(data, db)
    return {
        "message": "Zalo Bot created successfully",
        "bot": bot
    }


async def update_bot_controller(bot_id: int, data: dict, db: AsyncSession):
    bot = await zalo_bot_service.update_bot_service(bot_id, data, db)
    if not bot:
        return {"error": "Bot not found"}
    return {
        "message": "Zalo Bot updated successfully",
        "bot": bot
    }


async def delete_bot_controller(bot_id: int, db: AsyncSession):
    success = await zalo_bot_service.delete_bot_service(bot_id, db)
    if not success:
        return {"error": "Bot not found"}
    return {"message": "Zalo Bot deleted successfully"}


async def toggle_bot_status_controller(bot_id: int, db: AsyncSession):
    bot = await zalo_bot_service.toggle_bot_status_service(bot_id, db)
    if not bot:
        return {"error": "Bot not found"}
    return {
        "message": "Zalo Bot status updated successfully",
        "bot": bot
    }