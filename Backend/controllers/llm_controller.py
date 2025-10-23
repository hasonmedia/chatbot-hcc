from sqlalchemy.ext.asyncio import AsyncSession
from services.llm_service import (
    create_llm_service,
    update_llm_service,
    delete_llm_service,
    get_llm_by_id_service,
    get_all_llms_service
)
from llm.help_llm import clear_llm_model_cache

async def create_llm_controller(data: dict, db: AsyncSession):
    llm_instance = await create_llm_service(data, db)
    
    # Xóa cache nếu tạo LLM id=1
    if llm_instance.id == 1:
        await clear_llm_model_cache()
    
    return {
        "message": "LLM created",
        "llm": {
            "id": llm_instance.id,
            "name": llm_instance.name,
            "key": llm_instance.key,
            "prompt": llm_instance.prompt,
            "created_at": llm_instance.created_at
        }
    }

async def update_llm_controller(llm_id: int, data: dict, db: AsyncSession):
    llm_instance = await update_llm_service(llm_id, data, db)
    if not llm_instance:
        return {"message": "LLM not found"}
    
    # Xóa cache nếu cập nhật LLM id=1
    if llm_id == 1:
        await clear_llm_model_cache()
    
    return {
        "message": "LLM updated",
        "llm": {
            "id": llm_instance.id,
            "name": llm_instance.name,
            "key": llm_instance.key,
            "prompt": llm_instance.prompt,
            "created_at": llm_instance.created_at
        }
    }

async def delete_llm_controller(llm_id: int, db: AsyncSession):
    llm_instance = await delete_llm_service(llm_id, db)
    if not llm_instance:
        return {"message": "LLM not found"}
    
    # Xóa cache nếu xóa LLM id=1
    if llm_id == 1:
        await clear_llm_model_cache()
    
    return {"message": "LLM deleted", "llm_id": llm_instance.id}

async def get_llm_by_id_controller(llm_id: int, db: AsyncSession):
    llm_instance = await get_llm_by_id_service(llm_id, db)
    if not llm_instance:
        return {"message": "LLM not found"}
    return {
        "id": llm_instance.id,
        "name": llm_instance.name,
        "key": llm_instance.key,
        "prompt": llm_instance.prompt,
        "created_at": llm_instance.created_at,
        "system_greeting": llm_instance.system_greeting,
        "llm_keys": [
            {
                "id": key.id,
                "name": key.name,
                "key": key.key,
                "created_at": key.created_at,
                "updated_at": key.updated_at
            }
            for key in llm_instance.llm_keys
        ]
    }

async def get_all_llms_controller(db: AsyncSession):
    llms = await get_all_llms_service(db)
    return [
        {
            "id": l.id,
            "name": l.name,
            "key": l.key,
            "prompt": l.prompt,
            "created_at": l.created_at,
            "system_greeting": l.system_greeting,
            "botName": l.botName,
            "llm_keys": [
                {
                    "id": key.id,
                    "name": key.name,
                    "key": key.key,
                    "created_at": key.created_at,
                    "updated_at": key.updated_at
                }
                for key in l.llm_keys
            ]
        }
        for l in llms
    ]