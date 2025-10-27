from fastapi import FastAPI, Request
from config.database import create_tables
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from models import user, company, llm, chat, facebook_page, field_config, telegram_page, tag


from routers import user_router
from routers import company_router
from routers import chat_router
from routers import knowledge_base_router
from routers import facebook_router
from routers import llm_router
from routers import field_config_router
from routers import telegram_router
from routers import tag_router
from routers import zalotest
from routers import zalo_router
from routers import robots
from routers import social_router

from dotenv import load_dotenv
import os
import asyncio

load_dotenv()  

app = FastAPI()

# Startup event để tạo tables async
@app.on_event("startup")
async def startup_event():
    await create_tables()

app.include_router(user_router.router)
app.include_router(company_router.router)
app.include_router(chat_router.router)
app.include_router(knowledge_base_router.router)
app.include_router(facebook_router.router)
app.include_router(llm_router.router)
app.include_router(field_config_router.router)
app.include_router(telegram_router.router)
app.include_router(tag_router.router)
app.include_router(zalotest.router)
app.include_router(zalo_router.router)
app.include_router(robots.router)
app.include_router(social_router.router)

# CORS Configuration - Không được dùng wildcard (*) khi allow_credentials=True
origins = [
    "https://chatbot.a2alab.vn",  # Frontend production URL
    "http://localhost:5173",       # Frontend local development
    "http://localhost:3000",       # Alternative local port
    "https://chatbot.thanhmaihsk.edu.vn"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,         # Chỉ định cụ thể các domain được phép
    allow_credentials=True,        # Cho phép gửi cookies/credentials
    allow_methods=["*"],           # GET, POST, PUT, DELETE ...
    allow_headers=["*"],           # Cho phép tất cả headers
)

app.mount("/app/upload", StaticFiles(directory="upload"), name="upload")


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "upload")
app.mount("/upload", StaticFiles(directory=UPLOAD_DIR), name="upload")




@app.get("/")
def read_root():
    return {"message": "Hello FastAPI"}