# from models.chat import CustomerInfo
# from models.user import User
# from datetime import datetime
# import bcrypt
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy import select

# def hash_password(password: str) -> str:
#     return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# def verify_password(password: str, hashed_password: str):
#     return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

# async def authenticate_user(db: AsyncSession, username: str, password: str):
#     result = await db.execute(select(User).filter(User.username == username))
#     user = result.scalar_one_or_none()
#     if not user or not verify_password(password, user.password_hash):
#         return None
#     user.last_login = datetime.now()
#     await db.commit()
#     await db.refresh(user)
#     return user 

# async def get_all_users_service(db: AsyncSession):
#     result = await db.execute(select(User))
#     return result.scalars().all()

# async def create_user_service(db: AsyncSession, data: dict):
#     hashed_pwd = hash_password(data["password"]) 
#     user = User(
#         username=data["username"],
#         email=data["email"],
#         full_name=data["full_name"],
#         password_hash=hashed_pwd,
#         role=data.get("role", "user"),
#         company_id=data["company_id"]
#     )
#     db.add(user)
#     await db.commit()
#     await db.refresh(user)
#     return user

# async def update_user_service(db: AsyncSession, user_id: int, data: dict):
#     result = await db.execute(select(User).filter(User.id == user_id))
#     user = result.scalar_one_or_none()
#     if not user:
#         return None

#     if "username" in data: user.username = data["username"]
#     if "email" in data: user.email = data["email"]
#     if "full_name" in data: user.full_name = data["full_name"]
#     if "password" in data: user.password_hash = hash_password(data["password"])
#     if "role" in data: user.role = data["role"]
#     if "company_id" in data: user.company_id = data["company_id"]

#     await db.commit()
#     await db.refresh(user)
#     return user

# async def get_all_customer_info_service(db: AsyncSession):
#     result = await db.execute(select(CustomerInfo).order_by(CustomerInfo.created_at.desc()))
#     return result.scalars().all()

from models.user import User
from datetime import datetime
import bcrypt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from fastapi import HTTPException

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed_password: str):
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

async def authenticate_user(db: AsyncSession, username: str, password: str):
    result = await db.execute(select(User).filter(User.username == username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.password_hash):
        return None
    user.last_login = datetime.now()
    await db.commit()
    await db.refresh(user)
    return user 

async def get_all_users_service(db: AsyncSession):
    result = await db.execute(select(User))
    return result.scalars().all()

async def create_user_service(db: AsyncSession, data: dict):
    # Kiểm tra username đã tồn tại
    result = await db.execute(select(User).filter(User.username == data["username"]))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail=f"Tên người dùng '{data['username']}' đã tồn tại")
    
    # Kiểm tra email đã tồn tại
    result = await db.execute(select(User).filter(User.email == data["email"]))
    existing_email = result.scalar_one_or_none()
    if existing_email:
        raise HTTPException(status_code=400, detail=f"Email '{data['email']}' đã được sử dụng")
    
    hashed_pwd = hash_password(data["password"]) 
    user = User(
        username=data["username"],
        email=data["email"],
        full_name=data["full_name"],
        password_hash=hashed_pwd,
        role=data.get("role", "user"),
        company_id=data["company_id"]
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def update_user_service(db: AsyncSession, user_id: int, data: dict):
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        return None

    # Kiểm tra username nếu được cập nhật
    if "username" in data and data["username"] != user.username:
        result = await db.execute(select(User).filter(User.username == data["username"]))
        existing_user = result.scalar_one_or_none()
        if existing_user:
            raise HTTPException(status_code=400, detail=f"Tên người dùng '{data['username']}' đã tồn tại")
        user.username = data["username"]
    
    # Kiểm tra email nếu được cập nhật
    if "email" in data and data["email"] != user.email:
        result = await db.execute(select(User).filter(User.email == data["email"]))
        existing_email = result.scalar_one_or_none()
        if existing_email:
            raise HTTPException(status_code=400, detail=f"Email '{data['email']}' đã được sử dụng")
        user.email = data["email"]

    if "full_name" in data: user.full_name = data["full_name"]
    if "password" in data: user.password_hash = hash_password(data["password"])
    if "role" in data: user.role = data["role"]
    if "company_id" in data: user.company_id = data["company_id"]

    await db.commit()
    await db.refresh(user)
    return user
