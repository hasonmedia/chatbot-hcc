"""
Module xử lý GPT Model
Chứa các hàm để generate response cho GPT (function-based)
"""

from typing import Optional
from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession
from llm.help_llm import (
    generate_response_prompt,
    extract_customer_info_realtime
)


async def generate_gpt_response(
    api_key: str,
    db_session: AsyncSession,
    query: str,
    chat_session_id: int,
    model_name: str = "gpt-4o-mini",
    model_type: str = "gpt"
) -> str:
   
    try:
        client = AsyncOpenAI(api_key=api_key)
        
        prompt = await generate_response_prompt(
            model=client,
            db_session=db_session,
            query=query,
            chat_session_id=chat_session_id,
            api_key_for_embedding=api_key,
            model_name=model_type
        )
        
        response = await client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        print(f"❌ Error generating GPT response: {e}")
        return "Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn."


async def extract_customer_info_gpt(
    api_key: str,
    db_session: AsyncSession,
    chat_session_id: int,
    limit_messages: int,
    model_name: str = "gpt-4o-mini"
) -> Optional[str]:

    # Khởi tạo GPT client
    client = AsyncOpenAI(api_key=api_key)
    
    return await extract_customer_info_realtime(
        client,
        db_session,
        chat_session_id,
        limit_messages
    )
