import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/aichat")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    
settings = Settings()