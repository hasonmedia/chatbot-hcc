import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Response, HTTPException, Request, Depends
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


from models.user import User
from config.database import get_db

# Tải biến môi trường từ file .env
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("Không tìm thấy SECRET_KEY trong biến môi trường")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Giảm thời gian xuống 30 phút
REFRESH_TOKEN_EXPIRE_DAYS = 7
IS_PRODUCTION = os.getenv("ENVIRONMENT") == "production"

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now() + (timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

def set_cookie(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=IS_PRODUCTION,  # Sửa: Đặt True khi deploy production
        samesite="lax"
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        secure=IS_PRODUCTION,  # Sửa: Đặt True khi deploy production
        samesite="lax"
    )

def decode_token(token: str):
    """Hàm này chỉ nên dùng cho các trường hợp đặc biệt
    vì nó không xử lý lỗi hết hạn."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

async def get_user_from_token(token: str, db: AsyncSession) -> User | None:
    """
    HÀM HELPER MỚI:
    Giải mã token một cách an toàn và lấy User từ CSDL.
    Trả về None nếu có bất kỳ lỗi nào (hết hạn, không lệ, không tìm thấy user).
    """
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("id")
        if user_id is None:
            return None
            
    except (jwt.ExpiredSignatureError, jwt.JWTError):
        # Nếu token hết hạn hoặc không hợp lệ, trả về None
        return None

    # Truy vấn CSDL để lấy user thật sự
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    
    # Trả về user nếu tìm thấy, ngược lại trả về None
    return user


async def get_current_user(
    request: Request, db: AsyncSession = Depends(get_db)
) -> User:
    """
    SỬA LẠI: Dependency cho HTTP, giờ sẽ gọi hàm helper.
    """
    token = request.cookies.get("access_token")
    
    user = await get_user_from_token(token, db) # <-- Dùng hàm helper
    
    # Nếu không có user, văng lỗi HTTP cụ thể
    if user is None:
        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        # Kiểm tra để biết lý do chính xác (hết hạn hay không hợp lệ)
        try:
            jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Nếu token hợp lệ nhưng không tìm thấy user
        raise HTTPException(status_code=401, detail="User not found")
            
    return user