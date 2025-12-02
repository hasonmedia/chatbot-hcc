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



# Đang dùng
async def get_all_categories_service_for_chunk():
    async with AsyncSessionLocal() as session:
        
        result = await session.execute(
            select(
                KnowledgeCategory.id,
                KnowledgeCategory.name,
                KnowledgeCategory.description,
                KnowledgeBaseDetail.file_name,
                KnowledgeBaseDetail.description
            ).outerjoin(KnowledgeBaseDetail, KnowledgeCategory.id == KnowledgeBaseDetail.category_id)
        )
        rows = result.all()

        category_dict = defaultdict(lambda: {"file_list": [], "category_description": None})

        for cat_id, cat_name, cat_desc, file_name, file_desc in rows:
            key = (cat_id, cat_name)
            category_dict[key]["category_description"] = cat_desc

            if file_name:
                category_dict[key]["file_list"].append({
                    "file_name": file_name,
                    "summary": file_desc
                })

        formatted_categories = []
        for (cat_id, cat_name), data in category_dict.items():
            if not data["file_list"]:
                continue 

            formatted_categories.append({
                "category_id": cat_id,
                "category_name": cat_name,
                "category_description": data["category_description"],
                "file_list": data["file_list"]
            })

        return formatted_categories
    
    
# Đang dùng
async def search_metadata(query: str, model_name: str, api_key: str) -> Dict[str, any]:
    
    categories = await get_all_categories_service_for_chunk()
         
    
    prompt = f"""
Bạn là hệ thống phân loại tri thức cho chatbot.

Nhiệm vụ:
- Dựa vào câu hỏi của người dùng.
- Và dữ liệu categories bên dưới.
- Hãy xác định category phù hợp nhất và danh sách file cần thiết.

Dữ liệu categories:
{json.dumps(categories, ensure_ascii=False)}

Yêu cầu trả về đúng JSON theo format:
{{
  "category_id": <int hoặc null>,
  "file_names": [<danh sách tên file hoặc rỗng>]
}}

Quy tắc:
1. Chỉ chọn category nếu nội dung câu hỏi phù hợp với category_description hoặc summary của file.
2. Nếu không phù hợp với category nào → trả về file_names rỗng và category_id = null.
3. Luôn trả về JSON hợp lệ.

Câu hỏi người dùng:
"{query}"
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
        

# Đang dùng
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



    result = await search_chunks_with_metadata(
        query_embedding=q_emb,
        top_k=top_k,
        metadata_filter=metadata_filter,
    )
    
    
    
    return result
    
    
    
    




