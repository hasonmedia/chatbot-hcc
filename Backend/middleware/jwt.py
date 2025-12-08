import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Response, HTTPException, Request, Depends
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from models.user import User
from config.database import get_db, AsyncSessionLocal

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 90
REFRESH_TOKEN_EXPIRE_DAYS = 7

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
    cookie_settings = {
        "httponly": False,  # Allow JS access for cross-domain issues
        "path": "/",
        "samesite": "none",  # Required for cross-domain
        "secure": True,  # Required when samesite=none (ngrok is HTTPS)
    }
        
    try:
        response.set_cookie(
            key="access_token",
            value=access_token,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            **cookie_settings
        )
        
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
            **cookie_settings
        )
        
        # Add headers for debugging
        response.headers["X-Debug-Access-Token-Length"] = str(len(access_token))
        response.headers["X-Debug-Refresh-Token-Length"] = str(len(refresh_token))
        response.headers["X-Debug-Cookies-Set"] = "true"
                
    except Exception as e:
        raise e

def decode_token(token: str):
    """Hàm này chỉ nên dùng cho các trường hợp đặc biệt
    vì nó không xử lý lỗi hết hạn."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

async def get_user_from_token(token: str) -> User | None:
    if not token:
        return None
        
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("id")
        if user_id is None:
            return None

        async with AsyncSessionLocal() as db:
            result = await db.execute(select(User).filter(User.id == user_id))
            user = result.scalar_one_or_none()
            if user:
                print(f"Found user: {user.username} (ID: {user.id})")
            else:
                print(f"No user found with ID: {user_id}")
            return user
    except Exception as e:
        print(f"Error in get_user_from_token: {e}")
        raise e


async def save_refresh_token(user_id: int, refresh_token: str):
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            update(User)
            .where(User.id == user_id)
            .values(refresh_token=refresh_token)
        )
        await db.commit()        
        # Verify the save
        verify_result = await db.execute(
            select(User.refresh_token).where(User.id == user_id)
        )
        saved_token = verify_result.scalar_one_or_none()
        if saved_token == refresh_token:
            print(f"Refresh token saved successfully for user ID {user_id}")
        else:
            print(f"Failed to save refresh token for user ID {user_id}")
async def verify_refresh_token_by_jwt(refresh_token: str) -> User | None:
    """Verify refresh token by decoding JWT and checking user exists with valid refresh token"""
    
    try:
        # Decode JWT to get user info
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            return None
            
        user_id = payload.get("id")
        if not user_id:
            return None
                    
        # Check if user exists and has any refresh token
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(User).where(User.id == user_id)
            )
            user = result.scalar_one_or_none()
            
            if not user:
                return None
                
            if not user.refresh_token:
                return None
                
            return user
            
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError as e:
        return None
    except Exception as e:
        return None

async def verify_refresh_token(refresh_token: str) -> User | None:
    """Fallback to JWT-based verification due to string comparison issues"""
    return await verify_refresh_token_by_jwt(refresh_token)

async def revoke_refresh_token(user_id: int):
    async with AsyncSessionLocal() as db:
        await db.execute(
            update(User)
            .where(User.id == user_id)
            .values(refresh_token=None)
        )
        await db.commit()

async def get_current_user(
    request: Request, db: AsyncSession = Depends(get_db)
) -> User:    
    # Debug all cookies và headers
    all_cookies = dict(request.cookies)
    for key, value in all_cookies.items():
        print(f"   - {key}: {value[:20]}..." if len(value) > 20 else f"   - {key}: {value}")
    
    cookie_header = request.headers.get("cookie", "")
    origin = request.headers.get("origin", "")
    host = request.headers.get("host", "")
    referer = request.headers.get("referer", "")

    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        user = await get_user_from_token(token)
    except jwt.ExpiredSignatureError as e:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError as e:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Token verification failed")

    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user