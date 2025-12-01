from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.facebook_page import FacebookPage
from fastapi import HTTPException

async def get_all_pages_service(db: AsyncSession):
    try:
        result = await db.execute(select(FacebookPage))
        return result.scalars().all()
    except Exception as e:
        raise Exception(f"Lỗi lấy danh sách trang Facebook: {str(e)}")         

async def create_page_service(data: dict, db: AsyncSession):
    # Kiểm tra page_id đã tồn tại
    result = await db.execute(select(FacebookPage).filter(FacebookPage.page_id == data["page_id"]))
    existing_page = result.scalar_one_or_none()
    if existing_page:
        raise HTTPException(status_code=400, detail=f"Facebook Page ID '{data['page_id']}' đã tồn tại")
    
    # Kiểm tra page_name đã tồn tại
    result = await db.execute(select(FacebookPage).filter(FacebookPage.page_name == data["page_name"]))
    existing_name = result.scalar_one_or_none()
    if existing_name:
        raise HTTPException(status_code=400, detail=f"Tên Facebook Page '{data['page_name']}' đã được sử dụng")
    
    page = FacebookPage(
        page_id=data["page_id"],
        page_name=data["page_name"],
        access_token=data["access_token"],
        webhook_verify_token=data.get("webhook_verify_token"),
        is_active=data.get("is_active", True),
        auto_response_enabled=data.get("auto_response_enabled", True),
        url=data.get("url"),
        description=data.get("description"),
        category=data.get("category"),
        avatar_url=data.get("avatar_url"),
        cover_url=data.get("cover_url"),
        company_id=1  # cố định company_id
    )
    db.add(page)
    await db.commit()
    await db.refresh(page)
    return page


async def update_page_service(page_id: int, data: dict, db: AsyncSession):
    result = await db.execute(select(FacebookPage).filter(FacebookPage.id == page_id))
    page = result.scalar_one_or_none()
    if not page:
        return None
    
    # Kiểm tra page_id nếu được cập nhật
    if "page_id" in data and data["page_id"] != page.page_id:
        result = await db.execute(select(FacebookPage).filter(FacebookPage.page_id == data["page_id"]))
        existing_page = result.scalar_one_or_none()
        if existing_page:
            raise HTTPException(status_code=400, detail=f"Facebook Page ID '{data['page_id']}' đã tồn tại")
        page.page_id = data["page_id"]
    
    # Kiểm tra page_name nếu được cập nhật
    if "page_name" in data and data["page_name"] != page.page_name:
        result = await db.execute(select(FacebookPage).filter(FacebookPage.page_name == data["page_name"]))
        existing_name = result.scalar_one_or_none()
        if existing_name:
            raise HTTPException(status_code=400, detail=f"Tên Facebook Page '{data['page_name']}' đã được sử dụng")
        page.page_name = data["page_name"]
    
    if "access_token" in data: page.access_token = data["access_token"]
    if "webhook_verify_token" in data: page.webhook_verify_token = data["webhook_verify_token"]
    if "is_active" in data: page.is_active = data["is_active"]
    if "auto_response_enabled" in data: page.auto_response_enabled = data["auto_response_enabled"]
    if "url" in data: page.url = data["url"]
    if "description" in data: page.description = data["description"]
    if "category" in data: page.category = data["category"]
    if "avatar_url" in data: page.avatar_url = data["avatar_url"]
    if "cover_url" in data: page.cover_url = data["cover_url"]
    page.company_id = 1  

    await db.commit()
    await db.refresh(page)
    return page


async def delete_page_service(page_id: int, db: AsyncSession):
    result = await db.execute(select(FacebookPage).filter(FacebookPage.id == page_id))
    page = result.scalar_one_or_none()
    if not page:
        return None
    await db.delete(page)
    await db.commit()
    return True


async def toggle_page_status_service(page_id: int, db: AsyncSession):
    result = await db.execute(select(FacebookPage).filter(FacebookPage.id == page_id))
    page = result.scalar_one_or_none()
    if not page:
        return None
    
    # Toggle trạng thái
    page.is_active = not page.is_active
    
    await db.commit()
    await db.refresh(page)
    
    # Clear cache để force check lại trạng thái
    from helper.help_redis import clear_page_active_cache
    clear_page_active_cache("facebook", page.page_id)
    
    return page
        
        
async def facebook_callback_service(payload: dict, db: AsyncSession):
    
    print(payload)
    
    pages = payload.get("data", []) 
    print(pages)
    
    for page in pages:
        page_access_token = page.get("access_token")
        page_id = page.get("id")
        page_name = page.get("name")
        page_category = page.get("category")
        
        
        
        
        result = await db.execute(select(FacebookPage).filter(FacebookPage.page_id == page_id))
        existing_page = result.scalar_one_or_none()
        
        if existing_page:
            existing_page.access_token = page_access_token
            existing_page.page_name = page_name
            await db.commit()
            await db.refresh(existing_page)
        else:
            new_page = FacebookPage(
                page_id=page_id,
                page_name=page_name,
                access_token=page_access_token,
                category=page_category,
                company_id=1  # cố định company_id
            )
            
            db.add(new_page)
            await db.commit()
            await db.refresh(new_page)
    
    result = await db.execute(select(FacebookPage))
    return result.scalars().all()