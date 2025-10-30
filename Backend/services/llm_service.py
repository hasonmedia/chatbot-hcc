from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from models.llm import LLM, LLMKey

async def create_llm_service(data: dict, db: AsyncSession):
    llm_instance = LLM(
        name=data.get("name"),
        key=data.get("key"),
        prompt=data.get("prompt"),
    )
    db.add(llm_instance)
    await db.commit()
    await db.refresh(llm_instance)
    return llm_instance


async def update_llm_service(llm_id: int, data: dict, db: AsyncSession):
    result = await db.execute(
        select(LLM)
        .filter(LLM.id == llm_id)
        .options(selectinload(LLM.llm_keys))
    )
    llm_instance = result.scalar_one_or_none()
    if not llm_instance:
        return None
    
    # Cập nhật thông tin LLM
    llm_instance.prompt = data.get('prompt', llm_instance.prompt)
    llm_instance.system_greeting = data.get('system_greeting', llm_instance.system_greeting)
    llm_instance.botName = data.get('botName', llm_instance.botName)
    
    # Xử lý llm_keys
    llm_keys_data = data.get('llm_keys', [])
    if llm_keys_data:
        # Xóa tất cả keys cũ
        for old_key in llm_instance.llm_keys:
            await db.delete(old_key)
        
        # Thêm keys mới
        for key_data in llm_keys_data:
            new_key = LLMKey(
                name=key_data.get('name'),
                key=key_data.get('key'),
                type=key_data.get('type', 'bot'),
                llm_id=llm_id
            )
            db.add(new_key)
    
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
        .options(selectinload(LLM.llm_keys))
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
        select(LLM).options(selectinload(LLM.llm_keys))
    )
    return result.scalars().all()


# ===== LLM Key Services =====

async def create_llm_key_service(llm_id: int, data: dict, db: AsyncSession):
    """Tạo key mới cho LLM"""
    llm_key = LLMKey(
        name=data.get("name"),
        key=data.get("key"),
        type=data.get("type", "bot"),  # Mặc định là "bot"
        llm_id=llm_id
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


async def get_llm_keys_by_llm_id_service(llm_id: int, db: AsyncSession):
    """Lấy tất cả keys của một LLM"""
    result = await db.execute(select(LLMKey).filter(LLMKey.llm_id == llm_id))
    return result.scalars().all()