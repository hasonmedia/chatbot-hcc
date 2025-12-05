from typing import Optional
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from controllers import facebook_page_controller
import requests
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
import os

load_dotenv()  

URL = os.getenv("URL_BE")
URL_FE = os.getenv("URL")
router = APIRouter(prefix="/facebook-pages", tags=["Facebook Pages"])


@router.get("/")
async def get_all_pages(db: AsyncSession = Depends(get_db)):
    return await facebook_page_controller.get_all_pages_controller(db)


@router.post("/")
async def create_page(request: Request, db: AsyncSession = Depends(get_db)):
    data = await request.json()
    return await facebook_page_controller.create_page_controller(data, db)


@router.put("/{page_id}")
async def update_page(page_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    data = await request.json()
    return await facebook_page_controller.update_page_controller(page_id, data, db)


@router.delete("/{page_id}")
async def delete_page(page_id: int, db: AsyncSession = Depends(get_db)):
    return await facebook_page_controller.delete_page_controller(page_id, db)


@router.patch("/{page_id}/toggle-status")
async def toggle_page_status(page_id: int, db: AsyncSession = Depends(get_db)):
    return await facebook_page_controller.toggle_page_status_controller(page_id, db)

FB_CLIENT_ID = "864035886072571"
FB_CLIENT_SECRET = "72759ebacd1a8c50821678a0ca4eb3f3"

REDIRECT_URI = f"{URL}/facebook-pages/callback"

@router.get("/callback")
async def facebook_callback(code: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    if code is None:
        return {"message": "Facebook callback endpoint - waiting for code"}
    
    await facebook_page_controller.facebook_callback_controller(code, db)

    return RedirectResponse(url=f"{URL_FE}/admin/facebook_page")  