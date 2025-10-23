from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.zalo import ZaloBot


async def get_all_bots_service(db: AsyncSession):
    result = await db.execute(select(ZaloBot))
    return result.scalars().all()

async def create_bot_service(data: dict, db: AsyncSession):
    bot = ZaloBot(
        bot_name=data["bot_name"],
        access_token=data["access_token"],
        description=data.get("description", ""),
        is_active=data.get("is_active", True),
        company_id=1  # tạm cố định company_id
    )
    db.add(bot)
    await db.commit()
    await db.refresh(bot)
    return bot

async def update_bot_service(bot_id: int, data: dict, db: AsyncSession):
    result = await db.execute(select(ZaloBot).filter(ZaloBot.id == bot_id))
    bot = result.scalar_one_or_none()
    if not bot:
        return None

    bot.bot_name = data.get("bot_name", bot.bot_name)
    bot.access_token = data.get("access_token", bot.access_token)
    bot.description = data.get("description", bot.description)
    bot.is_active = data.get("is_active", bot.is_active)
    bot.company_id = 1  # tạm cố định company_id

    await db.commit()
    await db.refresh(bot)
    return bot

async def delete_bot_service(bot_id: int, db: AsyncSession):
    result = await db.execute(select(ZaloBot).filter(ZaloBot.id == bot_id))
    bot = result.scalar_one_or_none()
    if not bot:
        return None
    await db.delete(bot)
    await db.commit()
    return True


async def toggle_bot_status_service(bot_id: int, db: AsyncSession):
    result = await db.execute(select(ZaloBot).filter(ZaloBot.id == bot_id))
    bot = result.scalar_one_or_none()
    if not bot:
        return None
    
    # Toggle trạng thái
    bot.is_active = not bot.is_active
    
    await db.commit()
    await db.refresh(bot)
    
    # Clear cache để force check lại trạng thái
    from helper.help_redis import clear_page_active_cache
    clear_page_active_cache("zalo", bot.access_token)
    
    return bot