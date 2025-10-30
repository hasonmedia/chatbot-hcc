"""
Module xử lý Gemini Model
Chứa các hàm để generate response cho Gemini (function-based)
"""

import os
import json
import re
from typing import Optional
import google.generativeai as genai
from sqlalchemy.ext.asyncio import AsyncSession
from llm.help_llm import (
    generate_response_prompt
)


async def generate_gemini_response(
    api_key: str,
    db_session: AsyncSession,
    query: str,
    chat_session_id: int,
    model_name: str = "gemini-2.0-flash-001",
    model_type: str = "gemini"
) -> str:
    """
    Generate response sử dụng Gemini model
    api_key ở đây là BOT KEY (được truyền từ task.py)
    Trả về JSON string với format: {"message": "...", "links": [...]}
    """
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)
        
        # generate_response_prompt sẽ tự động lấy embedding key riêng
        prompt = await generate_response_prompt(
            model=model,
            db_session=db_session,              
            query=query,
            chat_session_id=chat_session_id,
            model_name=model_type
        )
        
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Parse JSON response
        try:
            # Loại bỏ markdown code blocks nếu có
            cleaned_response = re.sub(r'```json\s*|\s*```', '', response_text).strip()
            
            # Parse JSON
            json_data = json.loads(cleaned_response)
            
            # Validate cấu trúc
            if not isinstance(json_data, dict) or 'message' not in json_data or 'links' not in json_data:
                raise ValueError("Invalid JSON structure")
            
            # Trả về JSON string
            return json.dumps(json_data, ensure_ascii=False)
            
        except (json.JSONDecodeError, ValueError) as e:
            print(f"⚠️ Failed to parse JSON response: {e}")
            print(f"Raw response: {response_text}")
            
            # Fallback: trả về format JSON với message là response gốc
            fallback_response = {
                "message": response_text,
                "links": []
            }
            return json.dumps(fallback_response, ensure_ascii=False)
        
    except Exception as e:
        print(f"❌ Error generating Gemini response: {e}")
        error_response = {
            "message": "Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn.",
            "links": []
        }
        return json.dumps(error_response, ensure_ascii=False)



