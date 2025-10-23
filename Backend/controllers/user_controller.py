from fastapi import Response
from sqlalchemy.ext.asyncio import AsyncSession
from services import user_service
from middleware.jwt import create_access_token, set_cookie, create_refresh_token

async def login_user_controller(data: dict, response: Response, db: AsyncSession):
    user = await user_service.authenticate_user(db, data["username"], data["password"])
    if not user:
        return {"error": "Invalid username or password"}
    
    access_token = create_access_token({
        "sub": user.username,
        "id": user.id,
        "role": user.role,
        "fullname": user.full_name,
        "email": user.email
    })
    refresh_token = create_refresh_token({
        "sub": user.username,
        "id": user.id,
        "role": user.role,
        "fullname": user.full_name,
        "email": user.email
    })
    
    set_cookie(response, access_token, refresh_token)
    
    return { 
        "message": "Login successful",
        "user": {
            "id": user.id, 
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "token": access_token
        }
    }

async def get_all_users_controller(user, db: AsyncSession):
    return await user_service.get_all_users_service(db)

async def create_user_controller(data: dict, db: AsyncSession):
    user = await user_service.create_user_service(db, data)
    return {
        "message": "User created successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

async def update_user_controller(user_id: int, data: dict, db: AsyncSession):
    user = await user_service.update_user_service(db, user_id, data)
    if not user:
        return {"error": "User not found"}
    return {
        "message": "User updated successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

async def get_all_customer_info_controller(db: AsyncSession):
    return await user_service.get_all_customer_info_service(db)