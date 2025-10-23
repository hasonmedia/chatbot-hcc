#!/usr/bin/env python3
"""
Debug script để kiểm tra key hiện tại trong database
"""
import sys
import os

# Add the Backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from config.database import SessionLocal
from models.llm import LLM

def check_current_key():
    """Check current key in database"""
    print("🔍 Checking current LLM key in database...")
    
    db = SessionLocal()
    
    try:
        # Get current LLM config
        llm_config = db.query(LLM).filter(LLM.id == 1).first()
        if not llm_config:
            print("❌ No LLM config found in database")
            return
        
        print(f"📋 LLM Name: {llm_config.name}")
        print(f"🔑 Current Key: {llm_config.key}")
        print(f"📝 Full Key Length: {len(llm_config.key)} characters")
        
        # Check if key looks like valid OpenAI key
        if llm_config.key.startswith('sk-'):
            print("✅ Key format looks like OpenAI")
        else:
            print("⚠️ Key format doesn't look like OpenAI")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_current_key()