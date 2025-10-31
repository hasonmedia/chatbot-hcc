"""
Module xử lý GPT Model
Chứa các hàm để generate response cho GPT (function-based)
"""

import json
import re
from typing import Optional
from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession
from llm.help_llm import (
    generate_response_prompt
)


async def generate_gpt_response(
    api_key: str,
    db_session: AsyncSession,
    query: str,
    chat_session_id: int,
    model_name: str = "gpt-4o-mini",
    model_type: str = "gpt"
) -> str:
    """
    Generate response sử dụng GPT model
    api_key ở đây là BOT KEY (được truyền từ task.py)
    Trả về JSON string với format: {"message": "...", "links": [...]}
    """
    try:
        client = AsyncOpenAI(api_key=api_key)
        
        # generate_response_prompt sẽ tự động lấy embedding key riêng
        prompt = await generate_response_prompt(
            model=client,
            db_session=db_session,
            query=query,
            chat_session_id=chat_session_id,
            model_name=model_type
        )
        
        response = await client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        response_text = response.choices[0].message.content.strip()
        
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
        print(f"❌ Error generating GPT response: {e}")
        error_response = {
            "message": "Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn.",
            "links": []
        }
        return json.dumps(error_response, ensure_ascii=False)



