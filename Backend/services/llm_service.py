from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from models.llm import LLM, LLMKey, LLMDetail

async def create_llm_service(data: dict, db: AsyncSession):
    llm_instance = LLM(
        prompt=data.get("prompt"),
        system_greeting=data.get("system_greeting"),
        botName=data.get("botName"),
        bot_model_detail_id=data.get("bot_model_detail_id"),
        embedding_model_detail_id=data.get("embedding_model_detail_id"),
        company_id=data.get("company_id")
    )
    db.add(llm_instance)
    await db.commit()
    await db.refresh(llm_instance)
    return llm_instance


async def update_llm_service(llm_id: int, data: dict, db: AsyncSession):
    result = await db.execute(
        select(LLM)
        .filter(LLM.id == llm_id)
        .options(selectinload(LLM.llm_details))
    )
    llm_instance = result.scalar_one_or_none()
    if not llm_instance:
        return None
    
    # Cập nhật thông tin LLM
    llm_instance.prompt = data.get('prompt', llm_instance.prompt)
    llm_instance.system_greeting = data.get('system_greeting', llm_instance.system_greeting)
    llm_instance.botName = data.get('botName', llm_instance.botName)
    
    # Cập nhật model được chọn cho bot và embedding
    if 'bot_model_detail_id' in data:
        # Dùng int() thay vì .parse_int()
        llm_instance.bot_model_detail_id = int(data.get('bot_model_detail_id'))

    if 'embedding_model_detail_id' in data:
        # Dùng int() thay vì .parse_int()
        llm_instance.embedding_model_detail_id = int(data.get('embedding_model_detail_id'))
    
    await db.commit()
    await db.refresh(llm_instance)
    return llm_instance


async def delete_llm_service(llm_id: int, db: AsyncSession):
    result = await db.execute(select(LLM).filter(LLM.id == llm_id))
    llm_instance = result.scalar_one_or_none()
    if not llm_instance:
        return None
    await db.delete(llm_instance)
    await db.commit()
    return llm_instance


async def get_llm_by_id_service(llm_id: int, db: AsyncSession):
    result = await db.execute(
        select(LLM)
        .filter(LLM.id == llm_id)
        .options(
            selectinload(LLM.llm_details).selectinload(LLMDetail.llm_keys)
        )
    )
    llm = result.scalar_one_or_none()
    print("results ", llm)
    if llm:
        print("Found LLM:", llm.id)   # in ra id trong DB
    else:
        print("No LLM found with id:", llm_id)
    return llm


async def get_all_llms_service(db: AsyncSession):
    result = await db.execute(
        select(LLM).options(
            selectinload(LLM.llm_details).selectinload(LLMDetail.llm_keys)
        )
    )
    return result.scalars().all()


# ===== LLM Key Services =====

async def create_llm_key_service(llm_detail_id: int, data: dict, db: AsyncSession):
    """Tạo key mới cho LLMDetail"""
    llm_key = LLMKey(
        name=data.get("name"),
        key=data.get("key"),
        type=data.get("type", "bot"),  # Mặc định là "bot"
        llm_detail_id=llm_detail_id
    )
    db.add(llm_key)
    await db.commit()
    await db.refresh(llm_key)
    return llm_key


async def update_llm_key_service(key_id: int, data: dict, db: AsyncSession):
    """Cập nhật thông tin của một key"""
    result = await db.execute(select(LLMKey).filter(LLMKey.id == key_id))
    llm_key = result.scalar_one_or_none()
    if not llm_key:
        return None
    
    llm_key.name = data.get('name', llm_key.name)
    llm_key.key = data.get('key', llm_key.key)
    llm_key.type = data.get('type', llm_key.type)
    await db.commit()
    await db.refresh(llm_key)
    return llm_key


async def delete_llm_key_service(key_id: int, db: AsyncSession):
    """Xóa một key"""
    result = await db.execute(select(LLMKey).filter(LLMKey.id == key_id))
    llm_key = result.scalar_one_or_none()
    if not llm_key:
        return None
    await db.delete(llm_key)
    await db.commit()
    return llm_key


async def get_llm_keys_by_detail_id_service(llm_detail_id: int, db: AsyncSession):
    """Lấy tất cả keys của một LLMDetail"""
    result = await db.execute(select(LLMKey).filter(LLMKey.llm_detail_id == llm_detail_id))
    return result.scalars().all()


# ===== LLM Detail Services =====

async def get_all_llm_details_service(llm_id: int, db: AsyncSession):
    """Lấy tất cả llm_detail của một LLM (gemini và gpt)"""
    result = await db.execute(
        select(LLMDetail)
        .filter(LLMDetail.llm_id == llm_id)
        .options(selectinload(LLMDetail.llm_keys))
    )
    return result.scalars().all()


async def get_llm_detail_by_id_service(detail_id: int, db: AsyncSession):
    """Lấy thông tin chi tiết của một llm_detail"""
    result = await db.execute(
        select(LLMDetail)
        .filter(LLMDetail.id == detail_id)
        .options(selectinload(LLMDetail.llm_keys))
    )
    return result.scalar_one_or_none()