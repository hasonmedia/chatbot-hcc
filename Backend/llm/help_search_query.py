import json
from typing import Any, List, Dict, Optional
from llm.gemini import generate_gemini_response
from llm.gpt import generate_gpt_response
from config.chromadb_config import search_chunks_tthc, search_chunks_with_metadata, search_chunks_with_metadata_tthc
from config.get_embedding import get_embedding_gemini, get_embedding_chatgpt
from sqlalchemy import select
from collections import defaultdict
from config.database import AsyncSessionLocal
from models.knowledge_base import KnowledgeBase, KnowledgeBaseDetail, KnowledgeCategory





async def search_metadata(query: str, model_name: str, api_key: str) -> Dict[str, any]:
    
    categories = await get_all_categories_service_for_chunk()
    
    category_text = ""
    for cat in categories:
        category_text += f"- Category {cat['id']} - {cat['name']}:\n"
        for f in cat["files"]:
            category_text += f"    • {f}\n"
            
    
    prompt = f"""
You are a classifier for a RAG system.

Dựa trên câu hỏi và danh sách category + file dưới đây,
hãy xác định câu hỏi thuộc category nào và file nào có chứa thông tin phù hợp.

### Categories:
{category_text}

### User Question:
{query}

### Yêu cầu output:
Chỉ trả về JSON với đúng 2 trường:
- category_id: ID của category có liên quan nhất
- file_names: danh sách 1 hoặc nhiều file phù hợp trong category đó

### Example:
{{
  "category_id": 2,
  "file_names": ["thutuc_cap_giay_chung_nhan.pdf"]
}}

Return ONLY JSON, no explanation.
"""
        
    
    if "gemini" in model_name.lower():
        data = await generate_gemini_response(
            api_key=api_key,
            prompt=prompt
        )
    else:
        data = await generate_gpt_response(
            api_key=api_key,
            prompt=prompt
        )
    
    try:
        return json.loads(data)
    except Exception:
        print("❌ Lỗi phân tích JSON từ AI.")
        return {
            "category_id": None,
            "file_names": []
        }
    
async def get_all_categories_service_for_chunk():
    async with AsyncSessionLocal() as session:
        
        result = await session.execute(
            select(
                KnowledgeCategory.id,
                KnowledgeCategory.name,
                KnowledgeBaseDetail.file_name
            ).outerjoin(KnowledgeBaseDetail, KnowledgeCategory.id == KnowledgeBaseDetail.category_id)
        )
        rows = result.all()

        category_dict = defaultdict(list)
        for cat_id, cat_name, file_name in rows:
            if file_name:
                category_dict[(cat_id, cat_name)].append(file_name)

        categories = []
        for (cat_id, cat_name), files in category_dict.items():
            categories.append({
                "id": cat_id,
                "name": cat_name,
                "files": files
            })
            
        return categories
    




async def search_metadata_tthc(
    query: str,
    procedure_names: List[Dict[str, str]],
    model_name: str,
    api_key: str
) -> Dict[str, Any]:

    procedures_list_str = "\n".join([f"- {p['content']}" for p in procedure_names])

    # Prompt cho LLM
    prompt = f"""
Bạn là một trợ lý giúp tìm thủ tục hành chính phù hợp với yêu cầu của khách hàng.

Danh sách thủ tục:
{procedures_list_str}

Câu hỏi của khách hàng: "{query}"

Hãy trả về danh sách các thủ tục phù hợp với câu hỏi này, **chỉ trả về tên thủ tục**, dưới dạng **JSON array**, ví dụ:
["Thủ tục đăng ký khai sinh", "Thủ tục đăng ký lại khai sinh"]
"""

    if "gemini" in model_name.lower():
        data = await generate_gemini_response(api_key=api_key, prompt=prompt)
    else:
        data = await generate_gpt_response(api_key=api_key, prompt=prompt)
    
    
    
    return data
        

async def search_data(
    query: str, 
    embedding_key: str,
    embedding_model_name: str, 
    top_k: int,
    metadata_filter: Optional[Dict] = None
) -> List[Dict]:

    if not query:
        return []
    
    
    
    if "gemini" in embedding_model_name.lower():
        q_emb = await get_embedding_gemini(query, embedding_key)
    else:
        q_emb = await get_embedding_chatgpt(query, embedding_key)



    # normalized = None

    # if metadata_filter:
    #     # Nếu có cả category_id và file_names
    #     if ("category_id" in metadata_filter and metadata_filter["category_id"] is not None 
    #         and "file_names" in metadata_filter and metadata_filter["file_names"]):
    #         # Sử dụng $and để kết hợp
    #         normalized = {
    #             "$and": [
    #                 {"category_id": {"$eq": str(metadata_filter["category_id"])}},
    #                 {"file_name": {"$in": metadata_filter["file_names"]}}
    #             ]
    #         }
    #     # Chỉ có category_id
    #     elif "category_id" in metadata_filter and metadata_filter["category_id"] is not None:
    #         normalized = {"category_id": {"$eq": str(metadata_filter["category_id"])}}
    #     # Chỉ có file_names
    #     elif "file_names" in metadata_filter and metadata_filter["file_names"]:
    #         normalized = {"file_name": {"$in": metadata_filter["file_names"]}}

    
    
    candidates = await search_chunks_tthc(
        query_embedding=q_emb,
        top_k=top_k
    )
    
    data = await search_metadata_tthc(
        query=query,
        procedure_names=candidates,
        model_name=embedding_model_name,
        api_key=embedding_key)
    
    
    #Để ý để làm gọn chổ này
    if isinstance(data, str):
        import json
        try:
            matched_procedures = json.loads(data)
        except json.JSONDecodeError:
            matched_procedures = [data] if data else []
    else:
        matched_procedures = data if isinstance(data, list) else [data]
    
    result = await search_chunks_with_metadata_tthc(query_embedding=q_emb, matched_procedures=matched_procedures)


    return result
    
    




