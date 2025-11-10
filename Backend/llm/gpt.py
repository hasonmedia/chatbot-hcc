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
    prompt: str,
    model_name: str = "gpt-4o-mini"
) -> str:

    try:
        client = AsyncOpenAI(api_key=api_key)
        response = await client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        await client.close()

        response_text = response.choices[0].message.content.strip()

        # Parse JSON response
        try:
            cleaned_response = re.sub(r'```json\s*|\s*```', '', response_text).strip()
            json_data = json.loads(cleaned_response)

            # Validate cấu trúc
            if not isinstance(json_data, dict) or 'message' not in json_data or 'links' not in json_data:
                raise ValueError("Invalid JSON structure")

            return json.dumps(json_data, ensure_ascii=False)

        except (json.JSONDecodeError, ValueError) as e:
            # Fallback: trả về response gốc
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


