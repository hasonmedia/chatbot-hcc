from middleware.jwt import get_current_user
from models.user import User
from fastapi import APIRouter, Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from controllers.company_controller import (
    create_company_controller,
    update_company_controller,
    delete_company_controller,
    get_company_by_id_controller,
    get_all_companies_controller
)
from config.save_base64_image import save_base64_image

router = APIRouter(prefix="/companies", tags=["Companies"])

@router.post("/")
async def create_company(request: Request, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user) ):
    data = await request.json()
    return await create_company_controller(data, db)

@router.put("/{company_id}")
async def update_company(company_id: int, request: Request, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user) ):
    data = await request.json()
    return await update_company_controller(company_id, data, db)

@router.delete("/{company_id}")
async def delete_company(company_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user) ):
    return await delete_company_controller(company_id, db)

@router.get("/{company_id}")
async def get_company_by_id(company_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user) ):
    return await get_company_by_id_controller(company_id, db)

@router.get("/")
async def get_all_companies(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user) ):
    return await get_all_companies_controller(db)

@router.post("/upload-logo")
async def upload_logo(request: Request, current_user: User = Depends(get_current_user) ):
    try:
        data = await request.json()
        image_list = data.get("image", [])
        
        if not image_list:
            return {"error": "No image provided"}
        
        # Chỉ lấy ảnh đầu tiên (logo chỉ 1 ảnh)
        base64_image = image_list[0]
        
        # Sử dụng save_base64_image như chat service
        image_urls = save_base64_image([base64_image])
        
        return {
            "message": "Logo uploaded successfully",
            "image_urls": image_urls
        }
        
    except Exception as e:
        return {"error": str(e)}