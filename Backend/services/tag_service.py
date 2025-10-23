from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.chat import ChatSession
from models.tag import Tag

async def create_tag_service(data: dict, db: AsyncSession):
    tag = Tag(
        name=data.get("name"),
        description=data.get("description"),
        color=data.get("color")
    )
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    return tag


async def update_tag_service(tag_id: int, data: dict, db: AsyncSession):
    result = await db.execute(select(Tag).filter(Tag.id == tag_id))
    tag = result.scalar_one_or_none()
    if not tag:
        return None
    tag.name = data.get("name", tag.name)
    tag.description = data.get("description", tag.description)
    tag.color = data.get("color", tag.color)
    await db.commit()
    await db.refresh(tag)
    return tag


async def delete_tag_service(tag_id: int, db: AsyncSession):
    result = await db.execute(select(Tag).filter(Tag.id == tag_id))
    tag = result.scalar_one_or_none()
    if not tag:
        return None
    await db.delete(tag)
    await db.commit()
    return tag


async def get_tag_by_id_service(tag_id: int, db: AsyncSession):
    result = await db.execute(select(Tag).filter(Tag.id == tag_id))
    return result.scalar_one_or_none()


async def get_all_tags_service(db: AsyncSession):
    result = await db.execute(select(Tag))
    return result.scalars().all()

async def get_tags_by_chat_session_service(chat_session_id: int, db: AsyncSession):
    result = await db.execute(select(ChatSession).filter(ChatSession.id == chat_session_id))
    chat_session = result.scalar_one_or_none()
    if not chat_session:
        return None
    return chat_session.tags