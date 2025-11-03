import gspread
from google.oauth2.service_account import Credentials
from langchain_community.document_loaders import UnstructuredExcelLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from config.get_embedding import get_embedding_gemini
from models.knowledge_base import DocumentChunk
from config.database import AsyncSessionLocal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select


async def insert_chunks(chunks_data: list):
    async with AsyncSessionLocal() as session:
        try:
            # Chèn từng record một
            for d in chunks_data:
                chunk = DocumentChunk(
                    chunk_text=str(d['chunk_text']),
                    search_vector=d.get('search_vector'), 
                    knowledge_base_id=d['knowledge_base_id']
                )
                session.add(chunk)
                await session.commit()  # commit ngay sau mỗi record
        except Exception as e:
            print(e)
            await session.rollback()
            raise

async def get_sheet(sheet_id: str, id: int):
    all_chunks = []
    loader = UnstructuredExcelLoader("config/chatbot.xlsx", mode="elements")
    docs = loader.load()
    async with AsyncSessionLocal() as session:
        # Xóa tất cả dữ liệu cũ
        await session.execute(delete(DocumentChunk))
        await session.commit()  # commit để xác nhận bảng trống
    # Không cần ghi file MD ở đây nếu chỉ dùng để insert DB
    for doc in docs:
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=3000,
            chunk_overlap=500
        )
        row_chunks = splitter.split_text(doc.page_content)
        all_chunks.extend(row_chunks)

    # Insert từng chunk
    for chunk in all_chunks:
        vector = await get_embedding_gemini(chunk)
        await insert_chunks([{
            "chunk_text": chunk,
            "search_vector": vector.tolist(),
            "knowledge_base_id": id
        }])

    return {
        "success": True,
        "message": f"Đã xử lý {len(all_chunks)} chunks từ Excel",
        "chunks_created": len(all_chunks)
    }
    