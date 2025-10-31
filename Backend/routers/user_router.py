from fastapi import APIRouter, HTTPException, Request, Response, Depends
from controllers import user_controller
from middleware.jwt import authentication
from middleware.jwt import decode_token
router = APIRouter(prefix="/users", tags=["Users"])


from config.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

@router.get("/me")
async def get_me(request: Request):
    access_token = request.cookies.get("access_token")  # lấy từ cookie
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = decode_token(access_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    print(payload)
    return {
        "id": payload.get("id"),
        "username": payload.get("sub"),
        "role": payload.get("role"),
        "full_name": payload.get("fullname"),
        "email": payload.get("email"),
        "password_hash": payload.get("password"),
        "access_token": access_token
    }
    
@router.post("/login")
async def login_user(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    data = await request.json()
    return await user_controller.login_user_controller(data, response, db)


@router.get("/")
async def get_users(user=Depends(authentication), db: AsyncSession = Depends(get_db)):
    return await user_controller.get_all_users_controller(user, db)

@router.post("/logout")
async def logout_user(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}

@router.post("/")
async def create_user(request: Request, db: AsyncSession = Depends(get_db)):
    data = await request.json()
    return await user_controller.create_user_controller(data, db)

@router.put("/{user_id}")
async def update_user(user_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    data = await request.json()
    return await user_controller.update_user_controller(user_id, data, db)



