#!/usr/bin/env python3
"""
Script để test upload file knowledge base
Chạy trong container hoặc local để debug
"""

import asyncio
import sys
import os
from pathlib import Path

async def test_upload_environment():
    """Test môi trường upload"""
    print("=" * 60)
    print("KIỂM TRA MÔI TRƯỜNG UPLOAD")
    print("=" * 60)
    
    # 1. Kiểm tra current working directory
    cwd = os.getcwd()
    print(f"\n1. Current Working Directory: {cwd}")
    
    # 2. Kiểm tra upload directory
    upload_dir = os.path.join(cwd, "upload", "knowledge_files")
    print(f"\n2. Upload Directory: {upload_dir}")
    print(f"   - Exists: {os.path.exists(upload_dir)}")
    print(f"   - Is directory: {os.path.isdir(upload_dir)}")
    
    if os.path.exists(upload_dir):
        print(f"   - Readable: {os.access(upload_dir, os.R_OK)}")
        print(f"   - Writable: {os.access(upload_dir, os.W_OK)}")
        print(f"   - Executable: {os.access(upload_dir, os.X_OK)}")
        
        # Lấy permissions
        stat_info = os.stat(upload_dir)
        import stat
        mode = stat.filemode(stat_info.st_mode)
        print(f"   - Permissions: {mode}")
        print(f"   - Owner UID: {stat_info.st_uid}")
        print(f"   - Group GID: {stat_info.st_gid}")
    
    # 3. Test tạo file
    print(f"\n3. Test tạo file trong upload directory:")
    test_file = os.path.join(upload_dir, "test_upload.txt")
    try:
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir, mode=0o777, exist_ok=True)
            print(f"   ✅ Created directory: {upload_dir}")
        
        with open(test_file, 'w') as f:
            f.write("Test content")
        print(f"   ✅ Successfully created test file: {test_file}")
        
        # Đọc lại file
        with open(test_file, 'r') as f:
            content = f.read()
        print(f"   ✅ Successfully read test file: {content}")
        
        # Xóa file test
        os.remove(test_file)
        print(f"   ✅ Successfully removed test file")
        
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    
    # 4. Kiểm tra các thư mục khác
    print(f"\n4. Kiểm tra các thư mục khác:")
    directories = [
        "upload",
        "static",
        "chroma_data",
        "config",
        "controllers",
        "services"
    ]
    
    for dir_name in directories:
        dir_path = os.path.join(cwd, dir_name)
        exists = os.path.exists(dir_path)
        symbol = "✅" if exists else "❌"
        print(f"   {symbol} {dir_name}: {exists}")
    
    # 5. Kiểm tra database config
    print(f"\n5. Kiểm tra biến môi trường:")
    env_vars = [
        "DATABASE_URL",
        "REDIS_URL",
        "GOOGLE_API_KEY",
        "OPENAI_API_KEY"
    ]
    
    for var in env_vars:
        value = os.getenv(var)
        masked_value = value[:20] + "..." if value and len(value) > 20 else value
        status = "✅" if value else "❌"
        print(f"   {status} {var}: {masked_value if value else 'Not set'}")
    
    print("\n" + "=" * 60)
    print("KẾT THÚC KIỂM TRA")
    print("=" * 60)


async def test_file_processing():
    """Test xử lý file"""
    print("\n" + "=" * 60)
    print("TEST XỬ LÝ FILE")
    print("=" * 60)
    
    try:
        from helper.process_file import extract_text_from_pdf, extract_text_from_docx
        print("\n✅ Import file processors thành công")
    except Exception as e:
        print(f"\n❌ Import file processors thất bại: {str(e)}")
        return
    
    # Test với file PDF giả
    print("\n1. Test PDF extraction:")
    print("   (Cần file PDF thật để test)")
    
    print("\n2. Test DOCX extraction:")
    print("   (Cần file DOCX thật để test)")


async def test_database_connection():
    """Test kết nối database"""
    print("\n" + "=" * 60)
    print("TEST KẾT NỐI DATABASE")
    print("=" * 60)
    
    try:
        from config.database import get_db, AsyncSessionLocal
        from sqlalchemy import text
        
        print("\n✅ Import database modules thành công")
        
        # Test connection
        async with AsyncSessionLocal() as session:
            result = await session.execute(text("SELECT 1"))
            print("✅ Database connection thành công")
            
            # Test query
            result = await session.execute(text("SELECT COUNT(*) FROM knowledge_category"))
            count = result.scalar()
            print(f"✅ Knowledge categories count: {count}")
            
    except Exception as e:
        print(f"❌ Database connection thất bại: {str(e)}")
        import traceback
        traceback.print_exc()


async def main():
    """Main test function"""
    print("\n" + "=" * 60)
    print("BẮT ĐẦU KIỂM TRA HỆ THỐNG UPLOAD KNOWLEDGE BASE")
    print("=" * 60)
    
    await test_upload_environment()
    await test_database_connection()
    await test_file_processing()
    
    print("\n" + "=" * 60)
    print("HOÀN TẤT TẤT CẢ KIỂM TRA")
    print("=" * 60)


if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    asyncio.run(main())
