import os
import logging
from typing import Any, Dict, Optional, List, Union
import uuid

from langchain_text_splitters import RecursiveCharacterTextSplitter
from config.get_embedding import get_embedding_gemini, get_embedding_chatgpt
from llm.help_llm import get_current_model
from bs4 import BeautifulSoup
from config.chromadb_config import add_chunks, add_chunks_tthc
from .process_file import extract_text_from_pdf, extract_text_from_docx, extract_text_from_excel, extract_procedures_from_excel_tthc
import json


logger = logging.getLogger(__name__)

def normalize_metadata(meta: Dict) -> Dict:
    normalized = {}
    for k, v in meta.items():
        if isinstance(v, (str, int, float, bool)) or v is None:
            normalized[k] = v
        else:
            normalized[k] = json.dumps(v, ensure_ascii=False)
    return normalized


async def create_chunks_from_procedures(
    procedures: List[Dict[str, Any]], 
    embedding_key: str,
    embedding_model: str,
    category_id: str,
    knowledge_base_detail_id: int,
    filename: str
) -> bool:
    
    chunks = []
    procedure_names = [proc["procedure_name"] for proc in procedures]
    
    if "gemini" in embedding_model.lower():
        all_vectors = await get_embedding_gemini(procedure_names, api_key=embedding_key)
    else:
        all_vectors = await get_embedding_chatgpt(procedure_names, api_key=embedding_key) 
    
    for i, proc in enumerate(procedures):
        chunk_id = str(uuid.uuid4())
        content = proc["procedure_name"]
        embedding = all_vectors[i]
        
        metadata_raw = proc.get("metadata_json", {})
        metadata = normalize_metadata(metadata_raw) if metadata_raw else {}
        metadata["procedure_name"] = content
        metadata["category_id"] = str(category_id)
        metadata["knowledge_id"] = str(knowledge_base_detail_id)
        metadata["file_name"] = filename

        chunks.append({
            "id": chunk_id,
            "content": content,
            "embedding": embedding,
            "metadata": metadata
        })
    
    await add_chunks_tthc(chunks)
    return True




async def create_chunks(
    embedding_key: str, 
    embedding_model: str, 
    content: str,
    category_id: str,
    knowledge_base_detail_id: int,
    filename: str,
    chunk_size: int = 3000,
    chunk_overlap: int = 500
) -> bool:
    
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    all_chunks = text_splitter.split_text(content)

    if not all_chunks:
        return False


    if "gemini" in embedding_model.lower():
        all_vectors = await get_embedding_gemini(all_chunks, api_key=embedding_key)
    else:
        all_vectors = await get_embedding_chatgpt(all_chunks, api_key=embedding_key) 
        
    chunks_data = []
    
    for idx, (chunk, emb) in enumerate(zip(all_chunks, all_vectors), start=1):
        chunk_id = str(uuid.uuid4())
        chunk_meta = {
            "chunk_index": idx,
            "category_id": str(category_id),
            "knowledge_id": str(knowledge_base_detail_id),
            "file_name": filename
        }
        
        chunks_data.append({
            "id": chunk_id,
            "content": chunk,
            "embedding": emb,
            "metadata": normalize_metadata(chunk_meta)
        })
    
    
    
    await add_chunks(chunks_data)

    return True

    
async def process_uploaded_file(
    category_id : str,
    category_name: str,
    file_path: str,
    filename: str, 
    knowledge_base_detail_id: int,
    db
) -> bool:
    
    try:
        ext = os.path.splitext(filename)[1].lower()
        
        if ext == '.pdf':
            content = await extract_text_from_pdf(file_path)
        elif ext in ['.docx', '.doc']:
            content = await extract_text_from_docx(file_path)
        elif ext in ['.xlsx', '.xls']:
            if "dịch vụ công" in category_name.lower():
                content = await extract_procedures_from_excel_tthc(file_path)
            else:
                content = await extract_text_from_excel(file_path)
        else:
            logger.error(f"Định dạng file không được hỗ trợ: {ext}")
            return False

        if not content:
            logger.error(f"Không đọc được nội dung từ file {filename}")
            return False
            
        logger.info(f"Đã extract nội dung từ file {filename}, type: {type(content)}, is_list: {isinstance(content, list)}")

        
        
        

        model = await get_current_model(db_session=db)    
        embedding_model = model["embedding"]["name"]
        embedding_key = model["embedding"]["key"]

        
        if ext in ['.xlsx', '.xls'] and isinstance(content, list):
            chunks = await create_chunks_from_procedures(
                procedures=content, 
                embedding_model=embedding_model,
                embedding_key=embedding_key,
                category_id=category_id,
                knowledge_base_detail_id=knowledge_base_detail_id,
                filename=filename
            )
        
        else:
            chunks = await create_chunks(
                embedding_key=embedding_key, 
                embedding_model=embedding_model, 
                content=content,
                category_id=category_id,
                knowledge_base_detail_id=knowledge_base_detail_id,
                filename=filename
            )
        
        
        
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
        chunks_data = []
        
        for idx, (text, vector) in enumerate(zip(all_chunks, all_vectors), start=1):
            chunk_id = str(uuid.uuid4())
            chunk_meta = {
                "knowledge_id": str(knowledge_base_detail_id),
                "chunk_index": idx,
                "content_type": "rich_text"
            }
            
            # Chuẩn bị data cho ChromaDB
            chunks_data.append({
                'id': chunk_id,
                'content': text,
                'embedding': vector,
                'metadata': normalize_metadata(chunk_meta),
                'knowledge_id': knowledge_base_detail_id
            })
            
            
        
        # Lưu vào ChromaDB
        if chunks_data:
            await add_chunks(chunks_data)
        
        return True

    except Exception as e:
        print(f"Lỗi xử lý rich text: {str(e)}")
        return False