from sqlalchemy.ext.asyncio import AsyncSession
from services.llm_service import (
    create_llm_key_service,
    update_llm_key_service,
    delete_llm_key_service,
    get_llm_keys_by_llm_id_service
)
from llm.help_llm import clear_llm_keys_cache

async def create_llm_key_controller(llm_id: int, data: dict, db: AsyncSession):
    """Tạo key mới cho LLM"""
    llm_key = await create_llm_key_service(llm_id, data, db)
    
    # Xóa cache để force reload danh sách keys mới
    await clear_llm_keys_cache(llm_id)
    
    return {
        "message": "LLM key created",
        "llm_key": {
            "id": llm_key.id,
            "name": llm_key.name,
            "key": llm_key.key,
            "type": llm_key.type,
            "llm_id": llm_key.llm_id,
            "created_at": llm_key.created_at,
            "updated_at": llm_key.updated_at
        }
    }


async def update_llm_key_controller(key_id: int, data: dict, db: AsyncSession):
    """Cập nhật key"""
    llm_key = await update_llm_key_service(key_id, data, db)
    if not llm_key:
        return {"message": "LLM key not found"}
    
    # Xóa cache để force reload danh sách keys mới
    await clear_llm_keys_cache(llm_key.llm_id)
    
    return {
        "message": "LLM key updated",
        "llm_key": {
            "id": llm_key.id,
            "name": llm_key.name,
            "key": llm_key.key,
            "type": llm_key.type,
            "llm_id": llm_key.llm_id,
            "created_at": llm_key.created_at,
            "updated_at": llm_key.updated_at
        }
    }


async def delete_llm_key_controller(key_id: int, db: AsyncSession):
    """Xóa key"""
    llm_key = await delete_llm_key_service(key_id, db)
    if not llm_key:
        return {"message": "LLM key not found"}
    
    # Xóa cache để force reload danh sách keys mới
    await clear_llm_keys_cache(llm_key.llm_id)
    
    return {"message": "LLM key deleted", "key_id": llm_key.id}


async def get_llm_keys_controller(llm_id: int, db: AsyncSession):
    """Lấy tất cả keys của một LLM"""
    llm_keys = await get_llm_keys_by_llm_id_service(llm_id, db)
    return [
        {
            "id": k.id,
            "name": k.name,
            "key": k.key,
            "type": k.type,
            "llm_id": k.llm_id,
            "created_at": k.created_at,
            "updated_at": k.updated_at
        }
        for k in llm_keys
    ]
