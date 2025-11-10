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
    prompt: str,
    model_name: str = "gemini-2.0-flash-001"
) -> str:
    
    try:
        # Cấu hình GenAI
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)

        # Sinh response
        response_text = model.generate_content(prompt).text.strip()

        # Parse JSON response
        try:
            cleaned_response = re.sub(r'```json\s*|\s*```', '', response_text).strip()
            json_data = json.loads(cleaned_response)

            # Validate
            if not isinstance(json_data, dict) or 'message' not in json_data or 'links' not in json_data:
                raise ValueError("Invalid JSON structure")

            return json.dumps(json_data, ensure_ascii=False)

        except (json.JSONDecodeError, ValueError) as e:
            fallback_response = {
                "message": response_text,
                "links": []
            }
            return json.dumps(fallback_response, ensure_ascii=False)

    except Exception as e:
        error_response = {
            "message": "Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn.",
            "links": []
        }
        return json.dumps(error_response, ensure_ascii=False)



