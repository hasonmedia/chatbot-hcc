"""
Module xử lý Gemini Model
Chứa các hàm để generate response cho Gemini (function-based)
"""

import os
from typing import Optional
import google.generativeai as genai
from sqlalchemy.ext.asyncio import AsyncSession
from llm.help_llm import (
    generate_response_prompt,
    extract_customer_info_realtime
)


async def generate_gemini_response(
    api_key: str,
    db_session: AsyncSession,
    query: str,
    chat_session_id: int,
    model_name: str = "gemini-2.0-flash-001",
    model_type: str = "gemini"
) -> str:
   
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)
        
        prompt = await generate_response_prompt(
            model=model,
            db_session=db_session,              
            query=query,
            chat_session_id=chat_session_id,
            api_key_for_embedding=api_key,
            model_name=model_type
        )
        
        
        
        response = model.generate_content(prompt)
        return response.text
        
    except Exception as e:
        print(f"❌ Error generating Gemini response: {e}")
        return "Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn."


async def extract_customer_info_gemini(
    api_key: str,
    db_session: AsyncSession,
    chat_session_id: int,
    limit_messages: int,
    model_name: str = "gemini-2.0-flash-001"
) -> Optional[str]:
   
    # Khởi tạo Gemini model
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name)
    
    return await extract_customer_info_realtime(
        model,
        db_session,
        chat_session_id,
        limit_messages
    )
