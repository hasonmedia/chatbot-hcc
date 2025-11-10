"""
Script kiểm tra cấu trúc database sau migration
Chạy script này để verify rằng migration đã hoạt động đúng
"""
import asyncio
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

async def check_database_structure():
    """
    Kiểm tra cấu trúc database sau migration
    """
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    if not DATABASE_URL:
        print("❌ Không tìm thấy DATABASE_URL trong file .env")
        return
    
    # Sử dụng psycopg2 cho sync connection để inspect
    sync_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql+psycopg2://")
    sync_engine = create_engine(sync_url)
    inspector = inspect(sync_engine)
    
    print("="*80)
    print("🔍 KIỂM TRA CẤU TRÚC DATABASE SAU MIGRATION")
    print("="*80)
    
    # 1. Kiểm tra các bảng tồn tại
    tables = inspector.get_table_names()
    print("\n✅ Các bảng trong database:")
    for table in sorted(tables):
        print(f"   - {table}")
    
    required_tables = ['knowledge_base', 'knowledge_category', 'knowledge_base_detail', 'document_chunks']
    missing_tables = [t for t in required_tables if t not in tables]
    
    if missing_tables:
        print(f"\n❌ Thiếu các bảng: {', '.join(missing_tables)}")
    else:
        print(f"\n✅ Tất cả các bảng cần thiết đã tồn tại")
    
    # 2. Kiểm tra cấu trúc bảng knowledge_category
    if 'knowledge_category' in tables:
        print("\n" + "="*80)
        print("📋 Cấu trúc bảng KNOWLEDGE_CATEGORY:")
        print("="*80)
        
        columns = inspector.get_columns('knowledge_category')
        for col in columns:
            nullable = "NULL" if col['nullable'] else "NOT NULL"
            default = f" (default: {col.get('default', 'N/A')})" if col.get('default') else ""
            print(f"   {col['name']:20} {str(col['type']):20} {nullable}{default}")
        
        # Foreign keys
        fks = inspector.get_foreign_keys('knowledge_category')
        if fks:
            print("\n   Foreign Keys:")
            for fk in fks:
                print(f"      {fk['constrained_columns']} -> {fk['referred_table']}.{fk['referred_columns']}")
    
    # 3. Kiểm tra cấu trúc bảng knowledge_base_detail
    if 'knowledge_base_detail' in tables:
        print("\n" + "="*80)
        print("📋 Cấu trúc bảng KNOWLEDGE_BASE_DETAIL:")
        print("="*80)
        
        columns = inspector.get_columns('knowledge_base_detail')
        column_names = [col['name'] for col in columns]
        
        for col in columns:
            nullable = "NULL" if col['nullable'] else "NOT NULL"
            default = f" (default: {col.get('default', 'N/A')})" if col.get('default') else ""
            print(f"   {col['name']:25} {str(col['type']):20} {nullable}{default}")
        
        # Kiểm tra xem đã có category_id chưa
        if 'category_id' in column_names:
            print("\n   ✅ Cột 'category_id' đã tồn tại")
        else:
            print("\n   ❌ Cột 'category_id' KHÔNG tồn tại (migration chưa chạy?)")
        
        # Kiểm tra xem knowledge_base_id đã bị xóa chưa
        if 'knowledge_base_id' in column_names:
            print("   ⚠️  Cột 'knowledge_base_id' VẪN CÒN (migration chưa hoàn tất?)")
        else:
            print("   ✅ Cột 'knowledge_base_id' đã được xóa")
        
        # Foreign keys
        fks = inspector.get_foreign_keys('knowledge_base_detail')
        if fks:
            print("\n   Foreign Keys:")
            for fk in fks:
                print(f"      {fk['constrained_columns']} -> {fk['referred_table']}.{fk['referred_columns']}")
    
    # 4. Kiểm tra dữ liệu mẫu
    print("\n" + "="*80)
    print("📊 KIỂM TRA DỮ LIỆU:")
    print("="*80)
    
    # Async connection để query
    async_engine = create_async_engine(DATABASE_URL)
    async_session = async_sessionmaker(async_engine, class_=AsyncSession)
    
    async with async_session() as session:
        # Đếm số lượng bản ghi
        kb_count = await session.execute(text("SELECT COUNT(*) FROM knowledge_base"))
        kb_count = kb_count.scalar()
        print(f"   Knowledge Base: {kb_count} bản ghi")
        
        if 'knowledge_category' in tables:
            cat_count = await session.execute(text("SELECT COUNT(*) FROM knowledge_category"))
            cat_count = cat_count.scalar()
            print(f"   Knowledge Category: {cat_count} bản ghi")
            
            if cat_count > 0:
                # Lấy mẫu categories
                sample = await session.execute(text("""
                    SELECT id, name, knowledge_base_id 
                    FROM knowledge_category 
                    LIMIT 5
                """))
                print("\n   Mẫu Categories:")
                for row in sample:
                    print(f"      ID={row[0]}, Name='{row[1]}', KB_ID={row[2]}")
        
        detail_count = await session.execute(text("SELECT COUNT(*) FROM knowledge_base_detail"))
        detail_count = detail_count.scalar()
        print(f"\n   Knowledge Base Detail: {detail_count} bản ghi")
        
        if detail_count > 0 and 'category_id' in column_names:
            # Kiểm tra xem tất cả detail đã có category_id chưa
            null_category = await session.execute(text("""
                SELECT COUNT(*) FROM knowledge_base_detail 
                WHERE category_id IS NULL
            """))
            null_category = null_category.scalar()
            
            if null_category > 0:
                print(f"   ⚠️  Có {null_category} detail chưa có category_id")
            else:
                print(f"   ✅ Tất cả detail đã có category_id")
    
    await async_engine.dispose()
    
    # 5. Tổng kết
    print("\n" + "="*80)
    print("📝 TỔNG KẾT:")
    print("="*80)
    
    all_good = True
    
    if 'knowledge_category' not in tables:
        print("   ❌ Bảng knowledge_category chưa được tạo")
        all_good = False
    else:
        print("   ✅ Bảng knowledge_category đã tồn tại")
    
    if 'knowledge_base_detail' in tables:
        if 'category_id' not in column_names:
            print("   ❌ Cột category_id chưa được thêm vào knowledge_base_detail")
            all_good = False
        else:
            print("   ✅ Cột category_id đã được thêm")
        
        if 'knowledge_base_id' in column_names:
            print("   ❌ Cột knowledge_base_id vẫn còn trong knowledge_base_detail")
            all_good = False
        else:
            print("   ✅ Cột knowledge_base_id đã được xóa")
    
    if all_good:
        print("\n🎉 Migration hoàn tất thành công!")
        print("\n⚠️  LƯU Ý: Bạn cần cập nhật code trong services/controllers")
        print("   Xem chi tiết trong file: UPDATE_CODE_AFTER_MIGRATION.md")
    else:
        print("\n⚠️  Migration chưa hoàn tất hoặc có lỗi")
        print("   Chạy lệnh: alembic upgrade head")
    
    print("="*80)

if __name__ == "__main__":
    try:
        asyncio.run(check_database_structure())
    except Exception as e:
        print(f"\n❌ Lỗi khi kiểm tra database: {e}")
        import traceback
        traceback.print_exc()
