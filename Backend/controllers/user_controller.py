from models.exceptions import AuthException, InactiveAccountException, InvalidCredentialsException
from fastapi import Response, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from services import user_service
from middleware.jwt import create_access_token, set_cookie, create_refresh_token

async def login_user_controller(data: dict, response: Response, db: AsyncSession):
    try:
        user = await user_service.authenticate_user(db, data["username"], data["password"])
        if not user:
            raise InvalidCredentialsException()
        
        access_token_data = {
            "sub": user.username,
            "id": user.id,
            "role": user.role,
            "fullname": user.full_name,
            "email": user.email,
            "company_id": user.company_id
        }
        access_token = create_access_token(access_token_data)
        
        refresh_token_data = {
            "sub": user.username,
            "id": user.id,
            "type": "refresh" 
        }
        refresh_token = create_refresh_token(refresh_token_data)
        
        set_cookie(response, access_token, refresh_token)
        
        return { 
            "message": "Login successful",
            "user": {
                "id": user.id, 
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "company_id": user.company_id,
                "token": access_token
            }
        }
    except InvalidCredentialsException as e:
        # Lỗi sai thông tin đăng nhập
        raise HTTPException(
            status_code=401,
            detail=str(e),
        )
    except InactiveAccountException as e:
        # Lỗi tài khoản bị vô hiệu hóa
        raise HTTPException(
            status_code=403, # 403 (Forbidden) rõ nghĩa hơn 401
            detail=str(e),
        )
    except AuthException as e:
        # Lỗi chung chung khác từ hàm authenticate
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi hệ thống: {e}",
        )
async def get_all_users_controller(user, db: AsyncSession):
    return await user_service.get_all_users_service(db)

async def create_user_controller(data: dict, db: AsyncSession):
    # Cân nhắc: Kiểm tra xem email/username đã tồn tại chưa ở service
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
        raise HTTPException(status_code=404, detail="User not found")
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

async def delete_user_controller(user_id: int, db: AsyncSession):
    success = await user_service.delete_user_service(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "message": "User deleted successfully"
    }