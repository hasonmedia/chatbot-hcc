import sys
import os
import asyncio

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.chromadb_config import list_chunks  
async def main():
    try:
        chunks = list_chunks()  # Lấy tất cả chunks
        if not chunks or not chunks.get('documents'):
            print("Không có dữ liệu trong ChromaDB")
            return

        # Hiển thị thông tin
        for doc, meta in zip(chunks['documents'], chunks['metadatas']):
            print("Content:", doc)
            print("Metadata:", meta)
            print("-" * 50)

    except Exception as e:
        print("Lỗi khi xem dữ liệu:", e)

if __name__ == "__main__":
    asyncio.run(main())