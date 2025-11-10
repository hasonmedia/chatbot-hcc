from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.telegram_page import TelegramBot
from fastapi import HTTPException


async def get_all_bots_service(db: AsyncSession):
    result = await db.execute(select(TelegramBot))
    return result.scalars().all()


async def create_bot_service(data: dict, db: AsyncSession):
    print(data)
    
    # Kiểm tra bot_token đã tồn tại
    result = await db.execute(select(TelegramBot).filter(TelegramBot.bot_token == data["bot_token"]))
    existing_token = result.scalar_one_or_none()
    if existing_token:
        raise HTTPException(status_code=400, detail=f"Bot Token đã tồn tại trong hệ thống")
    
    # Kiểm tra bot_name đã tồn tại
    result = await db.execute(select(TelegramBot).filter(TelegramBot.bot_name == data["bot_name"]))
    existing_name = result.scalar_one_or_none()
    if existing_name:
        raise HTTPException(status_code=400, detail=f"Tên Telegram Bot '{data['bot_name']}' đã được sử dụng")
    
    bot = TelegramBot(
        bot_name=data["bot_name"],
        bot_token=data["bot_token"],
        description=data.get("description"),
        is_active=data.get("is_active", True),
        company_id=1  # cố định company_id
    )
    db.add(bot)
    await db.commit()
    await db.refresh(bot)
    return bot


async def update_bot_service(bot_id: int, data: dict, db: AsyncSession):
    result = await db.execute(select(TelegramBot).filter(TelegramBot.id == bot_id))
    bot = result.scalar_one_or_none()
    if not bot:
        return None

    # Kiểm tra bot_token nếu được cập nhật
    if "bot_token" in data and data["bot_token"] != bot.bot_token:
        result = await db.execute(select(TelegramBot).filter(TelegramBot.bot_token == data["bot_token"]))
        existing_token = result.scalar_one_or_none()
        if existing_token:
            raise HTTPException(status_code=400, detail=f"Bot Token đã tồn tại trong hệ thống")
        bot.bot_token = data["bot_token"]
    
    # Kiểm tra bot_name nếu được cập nhật
    if "bot_name" in data and data["bot_name"] != bot.bot_name:
        result = await db.execute(select(TelegramBot).filter(TelegramBot.bot_name == data["bot_name"]))
        existing_name = result.scalar_one_or_none()
        if existing_name:
            raise HTTPException(status_code=400, detail=f"Tên Telegram Bot '{data['bot_name']}' đã được sử dụng")
        bot.bot_name = data["bot_name"]

    if "description" in data: bot.description = data["description"]
    if "is_active" in data: bot.is_active = data["is_active"]
    bot.company_id = 1  # cố định company_id

    await db.commit()
    await db.refresh(bot)
    return bot


async def delete_bot_service(bot_id: int, db: AsyncSession):
    result = await db.execute(select(TelegramBot).filter(TelegramBot.id == bot_id))
    bot = result.scalar_one_or_none()
    if not bot:
        return None
    await db.delete(bot)
    await db.commit()
    return True


async def toggle_bot_status_service(bot_id: int, db: AsyncSession):
    result = await db.execute(select(TelegramBot).filter(TelegramBot.id == bot_id))
    bot = result.scalar_one_or_none()
    if not bot:
        return None
    
    # Toggle trạng thái
    bot.is_active = not bot.is_active
    
    await db.commit()
    await db.refresh(bot)
    
    # Clear cache để force check lại trạng thái
    from helper.help_redis import clear_page_active_cache
    clear_page_active_cache("telegram", bot.bot_token)
    
    return bot