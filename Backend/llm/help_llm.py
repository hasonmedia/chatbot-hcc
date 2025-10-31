import json
import re
import time
from typing import List, Dict, Tuple, Optional, Any
from sqlalchemy import text, select, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from config.get_embedding import get_embedding_chatgpt, get_embedding_gemini
from models.chat import Message
from models.field_config import FieldConfig
from models.llm import LLM
from config.redis_cache import cache_get, cache_set, cache_delete


async def get_llm_keys_cached(llm_detail_id: int, db_session: AsyncSession, key_type: str = None) -> list:
    """
    Lấy danh sách API keys từ cache hoặc database theo llm_detail_id
    
    Args:
        llm_detail_id: ID của LLMDetail (1=gemini, 2=gpt)
        db_session: AsyncSession - Database session
        key_type: Loại key cần lấy ("bot" hoặc "embedding"). Nếu None, lấy tất cả
    
    Returns:
        list - Danh sách các keys
    """
    from models.llm import LLMKey
    from config.redis_cache import async_cache_get, async_cache_set
    
    # Cache key cho danh sách keys (bao gồm cả type trong cache key)
    cache_key = f"llm_keys:llm_detail_id_{llm_detail_id}:type_{key_type or 'all'}"
    
    # 1. Thử lấy từ cache trước
    cached_keys = await async_cache_get(cache_key)
    if cached_keys is not None:
        print(f"✅ Cache hit: Lấy {len(cached_keys)} {key_type or 'all'} keys từ cache cho LLMDetail id={llm_detail_id}")
        return cached_keys
    
    # 2. Nếu không có trong cache, query từ database
    query = select(LLMKey).filter(LLMKey.llm_detail_id == llm_detail_id)
    
    # Thêm filter theo type nếu có
    if key_type:
        query = query.filter(LLMKey.type == key_type)
    
    query = query.order_by(LLMKey.id)  # Đảm bảo thứ tự cố định
    
    result = await db_session.execute(query)
    llm_keys = result.scalars().all()
    
    if not llm_keys:
        raise ValueError(f"Không tìm thấy API key {key_type or ''} nào cho LLMDetail id={llm_detail_id}")
    
    # 3. Chuyển đổi thành list dict để cache (vì không thể cache SQLAlchemy objects)
    keys_data = [
        {"id": key.id, "name": key.name, "key": key.key, "type": key.type}
        for key in llm_keys
    ]
    
    # 4. Cache với TTL 1 giờ (3600 giây) - keys ít thay đổi
    await async_cache_set(cache_key, keys_data, ttl=3600)
    print(f"💾 Cache miss: Lưu {len(keys_data)} {key_type or 'all'} keys vào cache cho LLMDetail id={llm_detail_id}")
    
    return keys_data


async def get_round_robin_api_key(
    llm_detail_id: int,
    chat_session_id: int,
    db_session: AsyncSession,
    key_type: str = "bot"
) -> tuple[str, str]:
    """
    Lấy API key theo thuật toán Round-Robin cho mỗi chat session
    
    Args:
        llm_detail_id: ID của LLMDetail (1=gemini, 2=gpt)
        chat_session_id: ID của chat session
        db_session: AsyncSession - Database session
        key_type: Loại key cần lấy ("bot" hoặc "embedding"), mặc định "bot"
    
    Returns:
        tuple[str, str] - (api_key, key_name)
    """
    from config.redis_cache import async_cache_get, async_cache_set
    
    try:
        # 1. Lấy danh sách tất cả các keys của LLMDetail này theo type (có cache)
        llm_keys = await get_llm_keys_cached(llm_detail_id, db_session, key_type=key_type)
        
        # Nếu chỉ có 1 key, trả về luôn
        if len(llm_keys) == 1:
            return llm_keys[0]["key"], llm_keys[0]["name"]
        
        # 2. Kiểm tra xem chat_session_id này đã được gán key chưa (theo type)
        session_key = f"llm_key_session:llm_detail_{llm_detail_id}:session_{chat_session_id}:type_{key_type}"
        assigned_index = await async_cache_get(session_key)
        
        if assigned_index is not None:
            # Session đã có key được gán, dùng lại key đó
            selected_index = int(assigned_index)
            selected_key = llm_keys[selected_index]
            print(f"✅ Chat session {chat_session_id} tiếp tục dùng {key_type} key: {selected_key['name']}")
            return selected_key["key"], selected_key["name"]
        
        # 3. Session mới chưa có key, lấy counter toàn cục để gán key mới (theo type)
        counter_key = f"llm_key_global_counter:llm_detail_{llm_detail_id}:type_{key_type}"
        current_counter = await async_cache_get(counter_key)
        
        if current_counter is None:
            # Lần đầu tiên, khởi tạo counter = 0
            current_counter = 0
        else:
            current_counter = int(current_counter)
        
        # 4. Tính index từ counter (Round-Robin)
        selected_index = current_counter % len(llm_keys)
        
        # 5. Tăng counter lên 1 cho session tiếp theo
        next_counter = current_counter + 1
        await async_cache_set(counter_key, next_counter, ttl=86400)
        
        # 6. Lưu mapping session -> key index (TTL 24 giờ)
        await async_cache_set(session_key, selected_index, ttl=3600)
        
        # 7. Trả về API key tương ứng
        selected_key = llm_keys[selected_index]
        print(f"🔄 Chat session {chat_session_id} được gán {key_type} key mới: {selected_key['name']}")
        
        return selected_key["key"], selected_key["name"]
        
    except Exception as e:
        print(f"❌ Lỗi khi lấy Round-Robin API key ({key_type}): {e}")
        raise


async def get_llm_model_info_cached(db_session: AsyncSession) -> dict:
    
    from config.redis_cache import async_cache_get, async_cache_set
    from models.llm import LLMDetail
    
    # Cache key cho thông tin model
    cache_key = "llm_model_info:id_1"
    
    # 1. Thử lấy từ cache trước
    cached_model = await async_cache_get(cache_key)
    if cached_model is not None:
        print(f"✅ Cache hit: Lấy thông tin model từ cache")
        # Validate cache data có đầy đủ llm_details không
        if "llm_details" not in cached_model or not cached_model["llm_details"]:
            print(f"⚠️ Cache thiếu llm_details, xóa cache và query lại")
            from config.redis_cache import async_cache_delete
            await async_cache_delete(cache_key)
        else:
            return cached_model
    
    # 2. Nếu không có trong cache, query từ database
    result = await db_session.execute(
        select(LLM)
        .where(LLM.id == 1)
        .options(selectinload(LLM.llm_details))
    )
    model = result.scalars().first()

    if not model:
        raise ValueError("❌ Không tìm thấy model có id = 1 trong bảng LLM")
    
    # 3. Tạo model data với thông tin llm_details
    model_data = {
        "id": model.id,
        "bot_model_detail_id": model.bot_model_detail_id,
        "embedding_model_detail_id": model.embedding_model_detail_id,
        "llm_details": {}
    }
    
    # Thêm thông tin về từng llm_detail
    for detail in model.llm_details:
        model_data["llm_details"][detail.id] = {
            "id": detail.id,
            "name": detail.name,
            "key_free": detail.key_free
        }
    
    # Validate: Phải có ít nhất 1 llm_detail
    if not model_data["llm_details"]:
        raise ValueError("❌ Không tìm thấy llm_detail nào trong bảng LLMDetail cho LLM id=1")
    
    # 4. Cache với TTL 1 giờ (3600 giây) - model config ít thay đổi
    await async_cache_set(cache_key, model_data, ttl=3600)
    print(f"💾 Cache miss: Lưu thông tin model vào cache (llm_details: {list(model_data['llm_details'].keys())})")
    
    return model_data


async def get_current_model(db_session: AsyncSession, chat_session_id: int = None, key_type: str = "bot") -> dict:
    """
    Lấy thông tin model hiện tại và API key phù hợp
    
    Args:
        db_session: AsyncSession - Database session
        chat_session_id: int - ID của chat session (optional)
        key_type: str - Loại key cần lấy ("bot" hoặc "embedding"), mặc định "bot"
    
    Returns:
        dict - Thông tin model bao gồm name, key, key_name, llm_detail_id
    """
    try:
        # Lấy thông tin LLM model từ cache (giảm thiểu query DB)
        model_info = await get_llm_model_info_cached(db_session)
        
        # Xác định llm_detail_id dựa vào key_type
        if key_type == "bot":
            llm_detail_id = model_info.get("bot_model_detail_id")
        elif key_type == "embedding":
            llm_detail_id = model_info.get("embedding_model_detail_id")
        else:
            raise ValueError(f"Invalid key_type: {key_type}")
        
        # Nếu chưa cấu hình model cho key_type này, sử dụng model đầu tiên
        if not llm_detail_id:
            print(f"⚠️ Chưa cấu hình {key_type} model, dùng model mặc định")
            # Lấy llm_detail đầu tiên
            if model_info.get("llm_details"):
                llm_detail_id = list(model_info["llm_details"].keys())[0]
            else:
                raise ValueError("Không tìm thấy llm_detail nào trong hệ thống")
        
        # Kiểm tra llm_detail_id có tồn tại trong llm_details không
        # Chuyển đổi keys về int để so sánh (vì cache có thể lưu dạng string)
        available_detail_ids = [int(k) if isinstance(k, str) else k for k in model_info["llm_details"].keys()]
        if llm_detail_id not in available_detail_ids:
            print(f"⚠️ llm_detail_id={llm_detail_id} không tồn tại trong cache. Available IDs: {available_detail_ids}")
            print(f"⚠️ Fallback về llm_detail đầu tiên: {available_detail_ids[0]}")
            llm_detail_id = available_detail_ids[0]
        
        # Lấy thông tin llm_detail (convert key sang string nếu cần)
        detail_info = model_info["llm_details"].get(llm_detail_id) or model_info["llm_details"].get(str(llm_detail_id))
        if not detail_info:
            raise ValueError(f"Không tìm thấy llm_detail id={llm_detail_id} trong llm_details: {list(model_info['llm_details'].keys())}")
        
        model_name = detail_info["name"]  # "gemini" hoặc "gpt"
        
        # Nếu có chat_session_id, sử dụng Round-Robin để chọn key
        if chat_session_id is not None:
            try:
                api_key, key_name = await get_round_robin_api_key(
                    llm_detail_id, 
                    chat_session_id, 
                    db_session,
                    key_type=key_type
                )
                model_data = {
                    "name": model_name, 
                    "key": api_key,
                    "key_name": key_name,
                    "key_type": key_type,
                    "llm_detail_id": llm_detail_id
                }
                return model_data
            except ValueError as e:
                # Nếu không có key trong llm_key, fallback về key_free
                print(f"⚠️ Fallback to key_free for {key_type}: {e}")
                model_data = {
                    "name": model_name, 
                    "key": detail_info["key_free"],
                    "key_name": "free",
                    "key_type": key_type,
                    "llm_detail_id": llm_detail_id
                }
                return model_data
        else:
            # Không có chat_session_id, trả về key_free
            model_data = {
                "name": model_name, 
                "key": detail_info["key_free"],
                "key_type": key_type,
                "llm_detail_id": llm_detail_id
            }
            return model_data
            
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
    """
    Lấy lịch sử tin nhắn gần đây từ database
    
    Args:
        db_session: AsyncSession - Database session
        chat_session_id: int - ID của chat session
        limit: int - Số lượng tin nhắn tối đa cần lấy
    
    Returns:
        str - Lịch sử hội thoại dưới dạng text, mỗi dòng format: "sender_type: content"
    """
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


async def build_search_key(
    model,
    db_session: AsyncSession,
    chat_session_id: int, 
    question: str, 
    customer_info: Optional[dict] = None
) -> str:
    """
    Tạo từ khóa tìm kiếm tối ưu từ câu hỏi của khách hàng
    Sử dụng LLM để phân tích context và tạo search key phù hợp
    
    Args:
        model: LLM model (Gemini hoặc GPT) - model đã được khởi tạo
        db_session: AsyncSession - Database session
        chat_session_id: int - ID của chat session
        question: str - Câu hỏi của khách hàng
        customer_info: dict - Thông tin khách hàng (optional)
    
    Returns:
        str - Từ khóa tìm kiếm đã được tối ưu
    """
    history = await get_latest_messages(db_session, chat_session_id, limit=5)
    
    # Chuẩn bị thông tin khách hàng cho context
    customer_context = ""
    if customer_info:
        customer_context = f"\nThông tin khách hàng: {customer_info}"
    
    # Import prompt từ file prompt_search_key.py
    from llm.prompt_search_key import get_search_key_prompt
    
    # Tạo prompt
    prompt = get_search_key_prompt(history, customer_context, question)
    
    # Gọi model tùy theo loại (Gemini hoặc GPT)
    if hasattr(model, 'generate_content'):
        # Cả GPT và Gemini đều có generate_content, nhưng GPT là async
        if hasattr(model, 'client'):
            # GPTModel - async function
            response_text = await model.generate_content(prompt)
            return response_text.strip()
        else:
            # GeminiModel - sync function
            response = model.generate_content(prompt)
            return response.text.strip()
    else:
        # Fallback cho các model khác
        response = await model.chat.completions.create(
            model=model.model_name if hasattr(model, 'model_name') else "gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        return response.choices[0].message.content.strip()


async def search_similar_documents(
    db_session: AsyncSession,
    query: str, 
    top_k: int,
    api_key: str = None,
    model_name: str = None
) -> List[Dict]:
    
    try:
        if "gemini" in model_name:
            query_embedding = await get_embedding_gemini(query, api_key=api_key)
        else: 
            query_embedding = await get_embedding_chatgpt(query, api_key=api_key)
        
        if query_embedding is None:
            print("⚠️ Failed to create embedding for query")
            return []

        query_embedding = query_embedding.tolist()
        query_embedding = "[" + ",".join([str(x) for x in query_embedding]) + "]"

        sql = text("""
            SELECT id, chunk_text, search_vector <-> (:query_embedding)::vector AS similarity
            FROM document_chunks
            ORDER BY search_vector <-> (:query_embedding)::vector
            LIMIT :top_k
        """)

        result = await db_session.execute(
            sql, {"query_embedding": query_embedding, "top_k": top_k}
        )
        rows = result.fetchall()

        results = []
        for row in rows:
            results.append({
                "content": row.chunk_text
            })

        return results

    except Exception as e:
        raise Exception(f"Lỗi khi tìm kiếm: {str(e)}")


async def get_field_configs(db_session: AsyncSession) -> Tuple[Dict[str, str], Dict[str, str]]:
   
    cache_key = "field_configs:required_optional"
    
    # Thử lấy từ cache trước
    cached_result = cache_get(cache_key)
    if cached_result is not None:
        return cached_result.get('required_fields', {}), cached_result.get('optional_fields', {})
    
    try:
        result = await db_session.execute(
            select(FieldConfig).order_by(FieldConfig.excel_column_letter)
        )
        field_configs = result.scalars().all()
        
        required_fields = {}
        optional_fields = {}
        
        for config in field_configs:
            field_name = config.excel_column_name
            if config.is_required:
                required_fields[field_name] = field_name
            else:
                optional_fields[field_name] = field_name
        
        # Cache kết quả với TTL 24 giờ (86400 giây)
        cache_data = {
            'required_fields': required_fields,
            'optional_fields': optional_fields
        }
        cache_set(cache_key, cache_data, ttl=86400)
                
        return required_fields, optional_fields
    except Exception as e:
        print(f"Lỗi khi lấy field configs: {str(e)}")
        # Trả về dict rỗng nếu có lỗi
        return {}, {}



def clear_field_configs_cache() -> bool:
    """
    Xóa cache field configs khi có thay đổi cấu hình
    
    Returns:
        bool - True nếu xóa cache thành công, False nếu thất bại
    """
    cache_key = "field_configs:required_optional"
    success = cache_delete(cache_key)
    return success


async def clear_llm_keys_cache(llm_detail_id: int = None, key_type: str = None) -> bool:
    """
    Xóa cache danh sách API keys khi có thay đổi (thêm, sửa, xóa key)
    
    Args:
        llm_detail_id: ID của LLMDetail. Nếu None, xóa cache cho tất cả LLMDetails
        key_type: Loại key ("bot" hoặc "embedding"). Nếu None, xóa cache cho tất cả types
    
    Returns:
        bool - True nếu xóa cache thành công, False nếu thất bại
    """
    from config.redis_cache import async_cache_delete
    
    try:
        if llm_detail_id is not None:
            if key_type is not None:
                # Xóa cache cho một LLMDetail và type cụ thể
                cache_key = f"llm_keys:llm_detail_id_{llm_detail_id}:type_{key_type}"
                success = await async_cache_delete(cache_key)
                print(f"🗑️ Đã xóa cache {key_type} keys cho LLMDetail id={llm_detail_id}")
            else:
                # Xóa cache cho tất cả types của một LLMDetail
                for ktype in ["bot", "embedding", "all"]:
                    cache_key = f"llm_keys:llm_detail_id_{llm_detail_id}:type_{ktype}"
                    await async_cache_delete(cache_key)
                print(f"🗑️ Đã xóa cache tất cả keys cho LLMDetail id={llm_detail_id}")
                success = True
            return success
        else:
            # Xóa cache cho tất cả LLMDetails (gemini và gpt)
            for detail_id in [1, 2]:  # Giả sử có 2 llm_detail: 1=gemini, 2=gpt
                for ktype in ["bot", "embedding", "all"]:
                    cache_key = f"llm_keys:llm_detail_id_{detail_id}:type_{ktype}"
                    await async_cache_delete(cache_key)
            print(f"🗑️ Đã xóa cache keys cho tất cả LLMDetails")
            return True
    except Exception as e:
        print(f"❌ Lỗi khi xóa cache keys: {e}")
        return False


async def clear_llm_model_cache() -> bool:
    """
    Xóa cache thông tin model khi có thay đổi (cập nhật name, key mặc định, etc.)
    
    Returns:
        bool - True nếu xóa cache thành công, False nếu thất bại
    """
    from config.redis_cache import async_cache_delete
    
    try:
        cache_key = "llm_model_info:id_1"
        success = await async_cache_delete(cache_key)
        return success
    except Exception as e:
        print(f"❌ Lỗi khi xóa cache model: {e}")
        return False


async def generate_response_prompt(
    model,
    db_session: AsyncSession,
    query: str,
    chat_session_id: int,
    model_name: str = None
) -> str:
    """
    Tạo prompt cho bot response
    
    Args:
        model: LLM model đã được khởi tạo
        db_session: AsyncSession - Database session
        query: str - Câu hỏi của user
        chat_session_id: int - ID của chat session
        model_name: str - Tên model (gemini/gpt)
    
    Returns:
        str - Prompt đã được tạo
    """
    try:
        # Lấy lịch sử và thông tin khách hàng
        history = await get_latest_messages(db_session, chat_session_id, limit=10)
        
        # customer_info = await get_customer_infor(db_session, chat_session_id)
        
        if not query or query.strip() == "":
            return "Nội dung câu hỏi trống, vui lòng nhập lại."
        
        # Lấy embedding model info riêng cho việc tạo embedding
        embedding_model_info = await get_current_model(
            db_session,
            chat_session_id=chat_session_id,
            key_type="embedding"
        )
        
        embedding_key = embedding_model_info["key"]
        embedding_model_name = embedding_model_info["name"]
        
        print(f"🔑 Sử dụng {embedding_model_name} embedding key: {embedding_model_info.get('key_name', 'free')}")
        
        # Tìm kiếm tài liệu liên quan (sử dụng embedding key)
        knowledge = await search_similar_documents(
            db_session, 
            query, 
            top_k=10,
            api_key=embedding_key,
            model_name=embedding_model_name
        )
        
        
        # Lấy cấu hình fields
        # required_fields, optional_fields = await get_field_configs(db_session)
        
        # Tạo danh sách thông tin cần thu thập
        # required_info_list = "\n".join([f"- {field_name} (bắt buộc)" for field_name in required_fields.values()])
        # optional_info_list = "\n".join([f"- {field_name} (tùy chọn)" for field_name in optional_fields.values()])
        
        # Import prompt_builder từ prompt.py
        from llm.prompt import prompt_builder
        
        # Tạo prompt
        prompt = await prompt_builder(
            knowledge=knowledge,
            history=history,
            query=query
        )
        
        return prompt
        
    except Exception as e:
        print(f"❌ Error generating response: {e}")
        return f"Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn: {str(e)}"




