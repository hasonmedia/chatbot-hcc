# Trong file: config/get_embedding.py
import os
import asyncio
import logging # Thêm logging
import google.generativeai as genai
import numpy as np
from typing import List, Union
from concurrent.futures import ThreadPoolExecutor
from openai import AsyncOpenAI

logger = logging.getLogger(__name__) # Thêm logger

# Lấy API key (chỉ cần lấy 1 lần)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    logger.warning("⚠️ Google API key is missing in environment variables!")
else:
    try:
        genai.configure(api_key=GOOGLE_API_KEY)
        logger.info("✅ GenAI configured successfully.")
    except Exception as e:
        logger.exception(f"❌ Error configuring GenAI: {e}")
        # Bạn có thể muốn raise lỗi ở đây để dừng ứng dụng nếu không có key

# Executor để chạy code sync (chỉ cần tạo 1 lần)
executor = ThreadPoolExecutor()

async def get_embedding_gemini(
    text_input: Union[str, List[str]], 
    api_key: str = None # Vẫn giữ để tương thích, nhưng ưu tiên env
) -> Union[List[float], List[List[float]], None]:
    """
    Async version của get_embedding_gemini, HỖ TRỢ BATCH INPUT.
    Sử dụng ThreadPoolExecutor để chạy sync code trong async context.
    
    Args:
        text_input: str | List[str] - Text hoặc List text cần tạo embedding
        api_key: str - Google API key (optional, ít dùng hơn env)
    
    Returns:
        List[float] (cho 1 str) | List[List[float]] (cho List[str]) | None nếu lỗi
    """
    if not text_input:
        logger.warning("Input rỗng được truyền vào get_embedding_gemini")
        return [] if isinstance(text_input, list) else None
        
    # Xác định API key (ưu tiên env)
    key_to_use = GOOGLE_API_KEY
    if api_key: # Chỉ dùng key từ tham số nếu env không có
        logger.warning("Sử dụng API key từ tham số thay vì environment variable.")
        key_to_use = api_key
        
    if not key_to_use:
        logger.error("❌ Google API key is missing!")
        return None
        
    # Cấu hình lại nếu key từ tham số khác env (ít xảy ra)
    # Lưu ý: configure là global, có thể ảnh hưởng nếu dùng key khác nhau
    if api_key and api_key != GOOGLE_API_KEY:
         genai.configure(api_key=api_key)

    try:
        loop = asyncio.get_event_loop()
        
        # --- SỬA LOGIC XỬ LÝ INPUT ---
        is_batch = isinstance(text_input, list)
        
        # Gọi hàm sync embed_content trong executor
        response = await loop.run_in_executor(
            executor,
            lambda: genai.embed_content(
                model="models/gemini-embedding-001",
                content=text_input, 
                # Có thể thêm task_type nếu cần, vd: "RETRIEVAL_DOCUMENT"
                # task_type="RETRIEVAL_DOCUMENT" 
            )
        )
        # --- KẾT THÚC SỬA LOGIC ---

        # Trích xuất embedding(s)
        # API trả về dict với key "embedding" chứa list embedding vector(s)
        embeddings = response["embedding"] 
        
        if not embeddings:
             logger.error("API không trả về embedding nào.")
             return None

        # Trả về đúng định dạng: 
        # - Nếu input là list (batch): trả về list of lists (embeddings as-is)
        # - Nếu input là str (single): trả về embeddings (vẫn là list vector)
        # Không dùng embeddings[0] vì embeddings đã là vector cho single input
        return embeddings

    except Exception as e:
        logger.exception(f"❌ Error getting Gemini embedding: {e}") # Dùng exception để có traceback
        return None # Hoặc raise lỗi




async def get_embedding_chatgpt(text: str, api_key: str = None) -> np.ndarray | None:
    """
    Async version của get_embedding_chatgpt
    Sử dụng AsyncOpenAI client
    
    Args:
        text: str - Text cần tạo embedding
        api_key: str - OpenAI API key (optional, nếu không có sẽ lấy từ env)
    
    Returns:
        np.ndarray - Embedding vector hoặc None nếu có lỗi
    """
    if not text or not text.strip():
        return None

    try:
        # Ưu tiên dùng api_key từ tham số, nếu không có thì lấy từ env
        key = api_key or os.getenv("OPENAI_API_KEY")
        if not key:
            print("⚠️ OpenAI API key is missing!")
            return None
            
        client = AsyncOpenAI(api_key=key)
        response = await client.embeddings.create(
            model="text-embedding-3-large",
            input=text
        )
        await client.close()
        
        if not response.data or not response.data[0].embedding:
            return None
        
        return np.array(response.data[0].embedding, dtype=np.float32)
    except Exception as e:
        print(f"❌ Error getting ChatGPT embedding: {e}")
        return None