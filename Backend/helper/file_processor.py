import os
import logging
from typing import Dict, Optional, List, Union
import uuid

from langchain_text_splitters import RecursiveCharacterTextSplitter
from config.get_embedding import get_embedding_gemini, get_embedding_chatgpt
from llm.help_llm import get_current_model
from bs4 import BeautifulSoup
from config.chromadb_config import add_chunks, delete_chunks
from .process_file import extract_text_from_pdf, extract_text_from_docx, extract_text_from_excel

logger = logging.getLogger(__name__)


    
async def process_uploaded_file(
    file_path: str,
    filename: str,
    knowledge_base_detail_id: int,
    db,
    chunk_size: int = 3000,
    chunk_overlap: int = 500
) -> bool:
    
    try:
        # 1)Extract text từ file
        ext = os.path.splitext(filename)[1].lower()
        if ext == '.pdf':
            content = await extract_text_from_pdf(file_path)
        elif ext in ['.docx', '.doc']:
            content = await extract_text_from_docx(file_path)
        elif ext in ['.xlsx', '.xls']:
            content = await extract_text_from_excel(file_path)
        else:
            logger.error(f"Định dạng file không được hỗ trợ: {ext}")
            return False

        if not content:
            logger.error(f"Không đọc được nội dung từ file {filename}")
            return False

        # 2) Chunk nội dung
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )
        all_chunks = text_splitter.split_text(content)
        if not all_chunks:
            logger.error("Không có nội dung để chunk")
            return False

        # 3) Batch embedding
        model = await get_current_model(db_session=db)
        embedding_info = model["embedding"]
        embedding_key = embedding_info["key"]
        
    
        
        if "gemini" in embedding_info["name"].lower():
            all_vectors = await get_embedding_gemini(all_chunks, api_key=embedding_key)
        else:
            all_vectors = await get_embedding_chatgpt(all_chunks, api_key=embedding_key)
            
        
        # 4) Chuẩn bị data lưu vào ChromaDB
        chunks_data = [
            {
                'id': str(uuid.uuid4()),
                'content': text,
                'embedding': vector,
                'knowledge_id': knowledge_base_detail_id
            }
            for text, vector in zip(all_chunks, all_vectors)
        ]

        # 5) Lưu trực tiếp vào ChromaDB
        if chunks_data:
            await add_chunks(chunks_data)

        return True

    except Exception as e:
        logger.error(f"Lỗi xử lý file {filename}: {str(e)}")
        return False



async def process_rich_text(
    raw_content: str, 
    knowledge_base_detail_id: int,
    db
) -> Dict[str, any]:
    try:
        soup = BeautifulSoup(raw_content, "html.parser")
        text_content = soup.get_text(separator="\n", strip=True)
        
        if not text_content:
            return False

        # Bước 2: Chunk text
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=5000,
            chunk_overlap=1000
        )
        
       
        
        
        all_chunks = text_splitter.split_text(text_content)
        
        if not all_chunks:
            return False


        # Bước 3: Tạo Embeddings (Batch)
        model = await get_current_model(db_session=db)
        embedding_info = model["embedding"]
        embedding_key = embedding_info["key"]
        
    
        
        if "gemini" in embedding_info["name"].lower():
            all_vectors = await get_embedding_gemini(all_chunks, api_key=embedding_key)
        else:
            all_vectors = await get_embedding_chatgpt(all_chunks, api_key=embedding_key)

        
        # Bước 4: Chuẩn bị data
        chunks_data = [
            {
                'id': str(uuid.uuid4()),
                'content': text,
                'embedding': vector,
                'knowledge_id': knowledge_base_detail_id
            }
            for text, vector in zip(all_chunks, all_vectors)
        ]
        
        if chunks_data:
            await add_chunks(chunks_data)
        
        return True

    except Exception as e:
        print(f"Lỗi xử lý rich text: {str(e)}")
        return False