from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.pool import NullPool
from typing import AsyncGenerator

from dotenv import load_dotenv
import os

load_dotenv()  

DATABASE_URL = os.getenv("DATABASE_URL")
# Kiểm tra và đảm bảo sử dụng async driver
if DATABASE_URL:
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    elif DATABASE_URL.startswith("mysql://"):
        DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+aiomysql://")

# Tạo async engine
engine = create_async_engine(
    url=DATABASE_URL,
    pool_size=20,           # Số lượng connection tối thiểu
    max_overflow=40,        # Số connection bổ sung khi cần
    pool_timeout=30,         # Timeout khi chờ connection
    pool_recycle=1800,       # Recycle connection sau 30 phút
    pool_pre_ping=True,      # Kiểm tra connection trước khi sử dụng
    echo=False,              # Set True để debug SQL queries
)

# Tạo async session maker
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False  
)


SessionLocal = AsyncSessionLocal

Base = declarative_base()


# Async dependency để inject vào FastAPI routes
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# Async function để tạo tables
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)