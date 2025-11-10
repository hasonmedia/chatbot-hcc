import os
import asyncio
import google.generativeai as genai
from typing import List, Union
from openai import AsyncOpenAI



async def get_embedding_gemini(
    text_input: Union[str, List[str]], 
    api_key: str
) -> Union[List[float], List[List[float]], None]:
    
   
    try:
        genai.configure(api_key=api_key)
        loop = asyncio.get_event_loop()

        def embed_call():
            return genai.embed_content(
                model="models/gemini-embedding-001",
                content=text_input
            )

        response = await loop.run_in_executor(None, embed_call)

        embeddings = response.get("embedding")
        if not embeddings:
            return [] if isinstance(text_input, list) else []

        
        if isinstance(text_input, str):
            return list(embeddings)

        return [list(vec) for vec in embeddings]

    except Exception as e:
        print(f"❌ Gemini embedding error: {e}")
        return [] if isinstance(text_input, list) else []




async def get_embedding_chatgpt(
    text_input: Union[str, List[str]],
    api_key: str
) -> Union[List[float], List[List[float]]]:

  
    try:
        client = AsyncOpenAI(api_key=api_key)

        response = await client.embeddings.create(
            model="text-embedding-3-large",
            input=text_input
        )

        vectors = [list(item.embedding) for item in response.data]

        # Single
        if isinstance(text_input, str):
            return vectors[0] if vectors else []

        # Batch
        return vectors

    except Exception as e:
        print(f"❌ ChatGPT embedding error: {e}")
        return [] if isinstance(text_input, list) else []