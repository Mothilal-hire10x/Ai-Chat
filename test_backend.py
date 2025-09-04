#!/usr/bin/env python3

"""
Test script to verify the AI Chat backend works correctly.
This script tests the basic functionality without requiring external dependencies.
"""

import sys
import os
import asyncio
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

async def test_backend():
    """Test basic backend functionality"""
    print("🧪 Testing AI Chat Backend...")
    
    try:
        # Set environment variables for testing
        os.environ.setdefault("DATABASE_URL", "postgresql://postgres:password@localhost:5432/aichat")
        os.environ.setdefault("GEMINI_API_KEY", "test_key")
        os.environ.setdefault("SECRET_KEY", "test_secret")
        
        # Test imports
        print("✅ Testing imports...")
        from app.core.config import settings
        from app.models import ChatSession, ChatMessage
        from app.schemas import ChatMessageRequest, ChatMessageResponse
        print("   ✓ All imports successful")
        
        # Test database models
        print("✅ Testing database models...")
        session = ChatSession(session_id="test_session", system_prompt="Test prompt")
        message = ChatMessage(session_id="test_session", role="user", content="Test message")
        print("   ✓ Models can be instantiated")
        
        # Test schemas
        print("✅ Testing Pydantic schemas...")
        request = ChatMessageRequest(
            message="Test message", 
            session_id="test_session",
            system_prompt="Test prompt"
        )
        print("   ✓ Schemas work correctly")
        
        print("\n🎉 All backend tests passed!")
        print("💡 To run the full application:")
        print("   1. Set up PostgreSQL database (use docker-compose up -d)")
        print("   2. Add your Gemini API key to backend/.env file")
        print("   3. Run: python backend/main.py")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_backend())
    sys.exit(0 if success else 1)