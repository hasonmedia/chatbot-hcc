from typing import List, Dict, Tuple, Optional, Any
from sqlalchemy import text, select, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from config.get_embedding import get_embedding_chatgpt, get_embedding_gemini
from models.chat import Message
from models.llm import LLM, LLMKey
from config.redis_cache import async_cache_get, async_cache_set
from llm.prompt import prompt_builder
from llm.help_search_query import search_data


async def get_all_key(db_session: AsyncSession) -> list:
    
    cache_key = "list_keys"
    
    # 1. Thử lấy từ cache trước
    cached_keys = await async_cache_get(cache_key)
    if cached_keys is not None:
        return cached_keys
    
    
    # 2. Nếu không có trong cache, query từ database
    result = await db_session.execute(
        select(LLMKey.key, LLMKey.type).order_by(LLMKey.id)
    )
    
    keys = [{"key": row.key, "type": row.type} for row in result.all()]
    
   
    await async_cache_set(cache_key, keys, ttl=3600)
    
    return keys


async def get_round_robin_api_key(
    chat_session_id: int,
    db_session: AsyncSession
) -> dict:

    try:
        # Lấy tất cả key
        llm_keys_all = await get_all_key(db_session)
        keys_result = {}

        for key_type in ["bot", "embedding"]:
            # Lọc key theo type
            llm_keys = [k for k in llm_keys_all if k["type"] == key_type]

            # Kiểm tra session cache
            session_key = f"llm_key_session:session_{chat_session_id}:type_{key_type}"
            assigned_index = await async_cache_get(session_key)

            if assigned_index is not None:
                keys_result[f"{key_type}_key"] = llm_keys[int(assigned_index)]["key"]
                continue

            # Session mới, Round-Robin
            counter_key = f"llm_key_global_counter:type_{key_type}"
            current_counter = await async_cache_get(counter_key)
            current_counter = int(current_counter) if current_counter is not None else 0

            selected_index = current_counter % len(llm_keys)

            # Cập nhật counter
            await async_cache_set(counter_key, current_counter + 1, ttl=86400)

            # Lưu session -> index
            await async_cache_set(session_key, selected_index, ttl=3600)

            # Lưu key vào kết quả
            keys_result[f"{key_type}_key"] = llm_keys[selected_index]["key"]

        return keys_result

    except Exception as e:
        raise



async def get_llm_model_info_cached(db_session: AsyncSession) -> dict:
    
    from models.llm import LLMDetail
    
    # Cache key cho thông tin model
    cache_key = "model_info"
    
    # 1. Thử lấy từ cache trước
    cached_model = await async_cache_get(cache_key)
    if cached_model is not None:
        return cached_model
    
    
    # 2. Nếu không có trong cache, query từ database
    bot_result = await db_session.execute(
        select(LLMDetail.name, LLMDetail.key_free)
        .join(LLM, LLM.bot_model_detail_id == LLMDetail.id)
        .where(LLM.id == 1)
    )
    bot_row = bot_result.first()
    
    embedding_result = await db_session.execute(
        select(LLMDetail.name, LLMDetail.key_free)
        .join(LLM, LLM.embedding_model_detail_id == LLMDetail.id)
        .where(LLM.id == 1)
    )
    
    embedding_row = embedding_result.first()
    
    
    model_data = {
        "bot": bot_row.name,
        "embedding": embedding_row.name
    }
    
    
    await async_cache_set(cache_key, model_data, ttl=3600)
    
    return model_data


async def get_current_model(db_session: AsyncSession, chat_session_id: int = None) -> dict:
   
    try:
        model_info = await get_llm_model_info_cached(db_session)
        
        
        if chat_session_id is None:
            return {
                "embedding": {
                    "name": model_info["embedding"],
                    "key": model_info.get("embedding_free_key")
                }
            }


        result = {}
        
        keys = await get_round_robin_api_key(chat_session_id, db_session)
        
        
        result["bot"] = {
                "name": model_info["bot"],
                "key": keys["bot_key"] if keys["bot_key"] else model_info.get("bot_free_key", None)
            }
        
        result["embedding"] = {
            "name": model_info["embedding"],
            "key": keys["embedding_key"] if keys["embedding_key"] else model_info.get("embedding_free_key", None)
        }
        return result
            
    except Exception as e:
        print(f"❌ Error getting current model: {e}")
        import traceback
        traceback.print_exc()
        raise













async def get_latest_messages(
    db_session: AsyncSession, 
    chat_session_id: int, 
    limit: int
) -> str:
   
    result = await db_session.execute(
        select(Message)
        .filter(Message.chat_session_id == chat_session_id)
        .order_by(desc(Message.created_at))
        .limit(limit)
    )
    messages = result.scalars().all()
    
    results = [
        {
            "id": m.id,
            "content": m.content,
            "sender_type": m.sender_type,
            "created_at": m.created_at.isoformat() if m.created_at else None
        }
        for m in reversed(messages) 
    ]

    conversation = []
    for msg in results:
        line = f"{msg['sender_type']}: {msg['content']}"
        conversation.append(line)
    
    conversation_text = "\n".join(conversation)
    
    return conversation_text




async def search_similar_documents(
    query: str, 
    top_k: int,
    bot_key: str,
    bot_model_name: str,
    embedding_key: str = None,
    embedding_model_name: str = None
    
) -> List[Dict]:
    
    try:
        # 1) Lấy metadata filter từ query
        # metadata = await search_metadata(
        #     query=query,
        #     model_name=bot_model_name,
        #     api_key=bot_key
        # )
        
        # metadata_filter = {}
        # if metadata.get("category_id"):
        #     metadata_filter["category_id"] = metadata["category_id"]

        # # file_names
        # if metadata.get("file_names") and len(metadata["file_names"]) > 0:
        #     metadata_filter["file_names"] = metadata["file_names"]

        # print(f"🔍 Metadata filter: {metadata_filter}")
    
        
        candidates = await search_data(
            query=query,
            embedding_key=embedding_key,
            embedding_model_name=embedding_model_name,
            top_k=top_k
        )
        
        
        return candidates
        
        
        
        
        

        # # 4) Nếu không ra kết quả, tìm lại không filter
        # if not candidates:
        #     print(f"⚠️ Không tìm thấy kết quả với filter {metadata_filter}, tìm lại không filter...")
        #     candidates = await search_data(
        #         query=query,
        #         embedding_key=embedding_key,
        #         metadata_filter=None,
        #         top_k=top_k
        #     )

        # reranked = rerank_candidates(query, candidates, top_n=top_k)
        # return reranked

    except Exception as e:
        raise Exception(f"Lỗi khi tìm kiếm: {str(e)}")






async def generate_response_prompt(
    db_session: AsyncSession,
    query: str,
    chat_session_id: int,
    bot_key: str,
    bot_model_name: str,
    embedding_key: str,
    embedding_model_name: str
) -> dict:
    
    try:
        # Lấy lịch sử
        history = await get_latest_messages(db_session, chat_session_id, limit=10)
        
                
        # Tìm kiếm tài liệu
        knowledge = await search_similar_documents(
            query, 
            top_k=10,
            embedding_key=embedding_key,
            embedding_model_name=embedding_model_name,
            bot_key=bot_key,
            bot_model_name=bot_model_name
        )
        
        
        
        # Tạo prompt
        prompt = await prompt_builder(
            knowledge=knowledge,
            history=history,
            query=query
        )
        
        
        
        if "gemini" in bot_model_name.lower():
            from llm.gemini import generate_gemini_response
            response_json = await generate_gemini_response(
                api_key=bot_key,
                prompt=prompt
            )
        else:
            from llm.gpt import generate_gpt_response
            response_json = await generate_gpt_response(
                api_key=bot_key,
                prompt=prompt
            )


        return response_json
        
        
    except Exception as e:
        return f"Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn: {str(e)}"



async def clear_llm_keys_cache(llm_detail_id: int = None, key_type: str = None) -> bool:
    
    from config.redis_cache import async_cache_delete
    
    try:
        # 1. Luôn xóa cache danh sách keys
        await async_cache_delete("list_keys")
        print(f"🗑️ Đã xóa cache 'list_keys'")
        
        # 2. Luôn xóa cache model info
        await async_cache_delete("model_info")
        print(f"🗑️ Đã xóa cache 'model_info'")
        
        # 3. Reset counters cho round-robin nếu cần
        if key_type:
            counter_key = f"llm_key_global_counter:type_{key_type}"
            await async_cache_delete(counter_key)
            print(f"🗑️ Đã xóa counter '{counter_key}'")
        else:
            # Xóa tất cả counters
            for ktype in ["bot", "embedding"]:
                counter_key = f"llm_key_global_counter:type_{ktype}"
                await async_cache_delete(counter_key)
                print(f"🗑️ Đã xóa counter '{counter_key}'")
        
        print(f"✅ Đã xóa cache LLM keys thành công")
        return True
        
    except Exception as e:
        print(f"❌ Lỗi khi xóa cache keys: {e}")
        return False



