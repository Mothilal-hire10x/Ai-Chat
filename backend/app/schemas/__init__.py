from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ChatMessageRequest(BaseModel):
    message: str
    session_id: str
    system_prompt: Optional[str] = ""

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChatSessionResponse(BaseModel):
    session_id: str
    system_prompt: str
    messages: List[ChatMessageResponse]
    created_at: datetime
    
    class Config:
        from_attributes = True

class SystemPromptRequest(BaseModel):
    session_id: str
    system_prompt: str