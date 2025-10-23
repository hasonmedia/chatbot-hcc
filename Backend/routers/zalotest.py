import os
from fastapi import APIRouter
from fastapi.responses import FileResponse

router = APIRouter()

@router.get("/zalo_verifierFEAvAjpaQY4kxCyVpz8LE3B0kcxUjcqrDp8p.html")
async def zalo_verify():
    # Lấy thư mục gốc project (nơi chứa main.py)
    base_dir = os.path.dirname(os.path.abspath(__file__))  
    base_dir = os.path.dirname(base_dir)  # đi lên 1 cấp để về root
    
    # Đường dẫn file xác thực
    file_name = "zalo_verifierFEAvAjpaQY4kxCyVpz8LE3B0kcxUjcqrDp8p.html"
    file_path = os.path.join(base_dir, "static", file_name)

    if not os.path.isfile(file_path):
        return {"error": f"File not found at {file_path}"}

    return FileResponse(path=file_path, media_type="text/html")
