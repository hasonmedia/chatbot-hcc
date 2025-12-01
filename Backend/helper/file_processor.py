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


async def create_chunks_from_procedures(procedures: List[Dict[str, Any]], embedding_key: str) -> List[Dict[str, Any]]:
    
    chunks = []
    procedure_names = [proc["procedure_name"] for proc in procedures]

    all_vectors = await get_embedding_chatgpt(procedure_names, api_key=embedding_key)
    
    for i, proc in enumerate(procedures):
        chunk_id = str(uuid.uuid4())
        content = proc["procedure_name"]
        embedding = all_vectors[i]
        
        metadata_raw = proc.get("metadata_json", {})
        metadata = normalize_metadata(metadata_raw) if metadata_raw else {}
        metadata["procedure_name"] = content

        chunks.append({
            "id": chunk_id,
            "content": content,
            "embedding": embedding,
            "metadata": metadata
        })
    
    return chunks




def normalize_metadata(meta: Dict) -> Dict:
    normalized = {}
    for k, v in meta.items():
        if isinstance(v, (str, int, float, bool)) or v is None:
            normalized[k] = v
        else:
            normalized[k] = json.dumps(v, ensure_ascii=False)
    return normalized
    
async def process_uploaded_file(
    category_id : str,
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
            content = await extract_procedures_from_excel_tthc(file_path)
        else:
            logger.error(f"Định dạng file không được hỗ trợ: {ext}")
            return False

        if not content:
            logger.error(f"Không đọc được nội dung từ file {filename}")
            return False

        

        chunks = await create_chunks_from_procedures(procedures = content[:10], embedding_key="your-embedding-key")


        await add_chunks_tthc(chunks)
        
        

        # # Lấy thông tin model embedding
        # model = await get_current_model(db_session=db)
        # embedding_info = model["embedding"]
        # embedding_key = embedding_info["key"]

        
        
        
        

        # # 2) Chunk nội dung
        # text_splitter = RecursiveCharacterTextSplitter(
        #     chunk_size=chunk_size,
        #     chunk_overlap=chunk_overlap
        # )
        # all_chunks = text_splitter.split_text(content)
        # if not all_chunks:
        #     logger.error("Không có nội dung để chunk")
        #     return False

        
        
            # # 3) Batch embedding
            # if "gemini" in embedding_info["name"].lower():
            #     all_vectors = await get_embedding_gemini(all_chunks, api_key="AIzaSyDAX9ccTaWrfmwMGmFpYojfJpkgqzLIzLM")
            # else:
            #     all_vectors = await get_embedding_chatgpt(all_chunks, api_key=embedding_key)

        # all_vectors = await get_embedding_chatgpt(all_chunks, api_key=embedding_key)
        
        
        # # 4) Chuẩn bị data cho ChromaDB
        # chunks_data = []
        
        # for idx, (chunk, emb) in enumerate(zip(all_chunks, all_vectors), start=1):
        #     chunk_meta = {
        #         "category_id": str(category_id),  # Lưu dạng string để tương thích với ChromaDB
        #         "file_name": filename,                               
        #         "chunk_index": idx,
        #         "knowledge_id": str(knowledge_base_detail_id)
        #     }
            
        #     # Chuẩn bị data cho ChromaDB truyền thống
        #     chunks_data.append({
        #         "id": f"{filename}_chunk_{idx}",
        #         "content": chunk,
        #         "embedding": list(emb) if hasattr(emb, "__iter__") else [emb],
        #         "metadata": normalize_metadata(chunk_meta),
        #         "knowledge_id": knowledge_base_detail_id
        #     })
            

        # # 5) Lưu vào ChromaDB (legacy)
        # if chunks_data:
        #     await add_chunks(chunks_data)
        
        
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