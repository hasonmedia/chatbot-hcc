from sqlalchemy.ext.asyncio import AsyncSession
from services import facebook_page_service
import requests
from fastapi import APIRouter, Request, HTTPException
from dotenv import load_dotenv
import os

load_dotenv()  

URL_BE = os.getenv("URL_BE")
# FB_CLIENT_ID = "4238615406374117"
# FB_CLIENT_SECRET = "47d60fe20efd7ce023c35380683ba6ef"

FB_CLIENT_ID = "864035886072571"
FB_CLIENT_SECRET = "72759ebacd1a8c50821678a0ca4eb3f3"
REDIRECT_URI = f"{URL_BE}/facebook-pages/callback"

async def get_all_pages_controller(db: AsyncSession):
    return await facebook_page_service.get_all_pages_service(db)


async def create_page_controller(data: dict, db: AsyncSession):
    page = await facebook_page_service.create_page_service(data, db)
    return {
        "message": "Facebook Page created successfully",
        "page": page
    }


async def update_page_controller(page_id: int, data: dict, db: AsyncSession):
    page = await facebook_page_service.update_page_service(page_id, data, db)
    if not page:
        return {"error": "Page not found"}
    return {
        "message": "Facebook Page updated successfully",
        "page": page
    }


async def delete_page_controller(page_id: int, db: AsyncSession):
    success = await facebook_page_service.delete_page_service(page_id, db)
    if not success:
        return {"error": "Page not found"}
    return {"message": "Facebook Page deleted successfully"}


async def toggle_page_status_controller(page_id: int, db: AsyncSession):
    page = await facebook_page_service.toggle_page_status_service(page_id, db)
    if not page:
        return {"error": "Page not found"}
    return {
        "message": "Facebook Page status updated successfully",
        "page": page
    }


async def facebook_callback_controller(code: str, db: AsyncSession):
    
    token_url = "https://graph.facebook.com/v21.0/oauth/access_token"
    params = {
        "client_id": FB_CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "client_secret": FB_CLIENT_SECRET,
        "code": code
    }

    response = requests.get(token_url, params=params)
    if response.status_code != 200:
        print(response)
        raise HTTPException(status_code=400, detail="Failed to get access token")

    data = response.json()
    access_token = data.get("access_token")
    # 2. Lấy thông tin page
    get_pages = "https://graph.facebook.com/me/accounts"
    page_params = {
        "access_token": access_token
    }
    pages_raw = requests.get(get_pages, params=page_params).json()
    pages = pages_raw.get("data", [])
    for page in pages:
        page_id = page["id"]
        page_token = page["access_token"]

        webhook_url = f"https://graph.facebook.com/v21.0/{page_id}/subscribed_apps"

        subscribe_params = {
            "subscribed_fields": "messages",
            "access_token": page_token
        }

        webhook_res = requests.post(webhook_url, data=subscribe_params)

        if webhook_res.status_code != 200:
            print(f"Lỗi subscribe webhook Page {page_id}: {webhook_res.text}")
        else:
            print(f"Đã đăng ký webhook cho Page {page_id}")

    
    return await facebook_page_service.facebook_callback_service(pages_raw, db)

