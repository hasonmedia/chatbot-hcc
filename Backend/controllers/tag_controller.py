from sqlalchemy.ext.asyncio import AsyncSession
from services.tag_service import (
    create_tag_service,
    get_tags_by_chat_session_service,
    update_tag_service,
    delete_tag_service,
    get_tag_by_id_service,
    get_all_tags_service
)

async def create_tag_controller(data: dict, db: AsyncSession):
    tag = await create_tag_service(data, db)
    return {
        "message": "Tag created",
        "tag": {
            "id": tag.id,
            "name": tag.name,
            "description": tag.description,
            "color": tag.color
        }
    }


async def update_tag_controller(tag_id: int, data: dict, db: AsyncSession):
    tag = await update_tag_service(tag_id, data, db)
    if not tag:
        return {"message": "Tag not found"}
    return {
        "message": "Tag updated",
        "tag": {
            "id": tag.id,
            "name": tag.name,
            "description": tag.description,
            "color": tag.color
        }
    }


async def delete_tag_controller(tag_id: int, db: AsyncSession):
    tag = await delete_tag_service(tag_id, db)
    if not tag:
        return {"message": "Tag not found"}
    return {"message": "Tag deleted", "tag_id": tag.id}


async def get_tag_by_id_controller(tag_id: int, db: AsyncSession):
    tag = await get_tag_by_id_service(tag_id, db)
    if not tag:
        return {"message": "Tag not found"}
    return {
        "id": tag.id,
        "name": tag.name,
        "description": tag.description,
        "color": tag.color
    }


async def get_all_tags_controller(db: AsyncSession):
    tags = await get_all_tags_service(db)
    return [
        {
            "id": tag.id,
            "name": tag.name,
            "description": tag.description,
            "color": tag.color
        }
        for tag in tags
    ]

async def get_tags_by_chat_session_controller(chat_session_id: int, db: AsyncSession):
    tags = await get_tags_by_chat_session_service(chat_session_id, db)
    if tags is None:
        return {"message": "Chat session not found"}
    return [ 
        {
            "id": tag.id,
            "name": tag.name,
            "description": tag.description,
            "color": tag.color
        }
        for tag in tags
    ]