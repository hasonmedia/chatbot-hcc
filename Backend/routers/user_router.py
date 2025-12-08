from services.role_service import get_global_abilities_for_user, get_user_id, get_users_with_permission
from models.user import User
from fastapi import APIRouter, HTTPException, Request, Response, Depends
from controllers import user_controller
from services import user_service 
from middleware.jwt import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user,  
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
    save_refresh_token,
    revoke_refresh_token,
    set_cookie,
    SECRET_KEY,
    ALGORITHM
)
from jose import jwt 
router = APIRouter(prefix="/users", tags=["Users"])
from controllers import role_controller
from config.database import get_db
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select 

@router.get("/me")
async def get_me(
    request: Request,
    current_user: User = Depends(get_current_user) 
):
    access_token = request.cookies.get("access_token") 
    refresh_token = request.cookies.get("refresh_token")
    abilities = get_global_abilities_for_user(current_user)
    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "company_id": current_user.company_id,
        "access_token": access_token,
        "abilities": abilities
    }

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login_user(
    data: LoginRequest, 
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    return await user_controller.login_user_controller(data.dict(), response, db)


@router.get("/")
async def get_all_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user) 
):
    return await role_controller.get_users_with_permission_controller(db, current_user)

@router.post("/logout")
async def logout_user(
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_user)
):
    # Xóa refresh token khỏi database
    await revoke_refresh_token(current_user.id)
    
    # Xóa cookie với settings tương thích môi trường
    import os
    is_development = os.getenv("ENVIRONMENT", "development") == "development"
    
    cookie_settings = {
        "httponly": True,
        "path": "/",
        "samesite": "lax" if is_development else "none",
        "secure": not is_development
    }
    
    response.delete_cookie("access_token", **cookie_settings)
    response.delete_cookie("refresh_token", **cookie_settings)
    return {"message": "Logged out successfully"}

@router.post("/")
async def create_user(
    request: Request, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user) 
):
    abilities = get_global_abilities_for_user(current_user)
    allowed_roles = abilities["users"]["avalilable_roles"]
    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=403, 
            detail="Bạn không có quyền tạo người dùng"
        )
    data = await request.json()
    return await user_controller.create_user_controller(data, db)

@router.put("/{user_id}")
async def update_user(
    user_id: int, 
    request: Request, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user) # SỬA: Thêm bảo mật
):
    abilities = await get_users_with_permission(db, current_user)
    current_ability = next(
        (item for item in abilities if get_user_id(item["user"]) == user_id),
        None
    )
    
    if current_ability is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy quyền của user")
    if current_ability["permission"]["can_edit"] is False:
        raise HTTPException(
            status_code=403,
            detail="Bạn không có quyền cập nhật thông tin người dùng này"
        )

    data = await request.json()
    return await user_controller.update_user_controller(user_id, data, db)

@router.delete("/{user_id}")
async def delete_user(
    user_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user) 
): 
    abilities = await get_users_with_permission(db, current_user)
    current_ability = next(
        (item for item in abilities if get_user_id(item["user"]) == user_id),
        None
    )
    
    if current_ability is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy quyền của user")
    if current_ability["permission"]["can_edit"] is False:
        raise HTTPException(
            status_code=403, 
            detail="Bạn không có quyền xóa người dùng"
        )
    return await user_controller.delete_user_controller(user_id, db)
@router.post("/refresh")
async def refresh_token(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token not found")

    try:
        
        user = await verify_refresh_token(refresh_token)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
            
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
            
        access_token = create_access_token({
            "sub": user.username,
            "id": user.id,
            "role": user.role,
            "fullname": user.full_name,
            "email": user.email,
            "company_id": user.company_id
        })
        
        new_refresh_token = create_refresh_token({
            "sub": user.username,
            "id": user.id,
            "type": "refresh"
        })
        
        await save_refresh_token(user.id, new_refresh_token)
        
        set_cookie(response, access_token, new_refresh_token)
        
        return {
            "message": "Token refreshed successfully", 
            "access_token": access_token,
            "access_token_length": len(access_token),
            "refresh_token_length": len(new_refresh_token),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            },
            "debug": {
                "cookies_set": True,
                "cookie_settings": "httponly=True, path=/, samesite=lax, secure=False"
            }
        }

    except HTTPException as e:
        raise e
    except jwt.ExpiredSignatureError as e:
        try:
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": False})
            user_id = payload.get("id")
            if user_id:
                await revoke_refresh_token(user_id)
        except Exception as cleanup_error:
            print(f"Error during cleanup: {cleanup_error}")
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.JWTError as e:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/token-status")  
async def check_token_status(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Debug endpoint để kiểm tra trạng thái token"""
    access_token = request.cookies.get("access_token")
    refresh_token = request.cookies.get("refresh_token")
    
    return {
        "user_id": current_user.id,
        "username": current_user.username,
        "has_access_token": bool(access_token),
        "has_refresh_token": bool(refresh_token),
        "access_token_preview": access_token[:20] + "..." if access_token else None,
        "refresh_token_preview": refresh_token[:20] + "..." if refresh_token else None,
        "refresh_token_in_db": bool(current_user.refresh_token),
        "refresh_token_db_preview": current_user.refresh_token[:20] + "..." if current_user.refresh_token else None
    }

