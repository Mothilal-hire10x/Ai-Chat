from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.models import ChatSession, ChatMessage
from app.schemas import ChatMessageRequest, ChatMessageResponse, ChatSessionResponse, SystemPromptRequest
from app.services.gemini import gemini_service

router = APIRouter()

@router.post("/chat", response_model=ChatMessageResponse)
async def send_message(request: ChatMessageRequest, db: Session = Depends(get_db)):
    """Send a message and get AI response"""
    try:
        # Get or create chat session
        session = db.query(ChatSession).filter(ChatSession.session_id == request.session_id).first()
        if not session:
            session = ChatSession(
                session_id=request.session_id,
                system_prompt=request.system_prompt or ""
            )
            db.add(session)
            db.commit()
            db.refresh(session)
        
        # Update system prompt if provided
        if request.system_prompt and request.system_prompt != session.system_prompt:
            session.system_prompt = request.system_prompt
            db.commit()
        
        # Save user message
        user_message = ChatMessage(
            session_id=request.session_id,
            role="user",
            content=request.message
        )
        db.add(user_message)
        db.commit()
        db.refresh(user_message)
        
        # Get chat history for context
        chat_history = db.query(ChatMessage).filter(
            ChatMessage.session_id == request.session_id
        ).order_by(ChatMessage.created_at.desc()).limit(20).all()
        chat_history.reverse()  # Oldest first
        
        # Generate AI response
        ai_response = await gemini_service.generate_response(
            message=request.message,
            system_prompt=session.system_prompt,
            chat_history=chat_history[:-1]  # Exclude the current message
        )
        
        # Save AI response
        ai_message = ChatMessage(
            session_id=request.session_id,
            role="assistant",
            content=ai_response
        )
        db.add(ai_message)
        db.commit()
        db.refresh(ai_message)
        
        return ai_message
        
    except Exception as e:
        print(f"Error in send_message: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/chat/{session_id}", response_model=ChatSessionResponse)
async def get_chat_history(session_id: str, db: Session = Depends(get_db)):
    """Get chat history for a session"""
    session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at).all()
    
    return ChatSessionResponse(
        session_id=session.session_id,
        system_prompt=session.system_prompt,
        messages=messages,
        created_at=session.created_at
    )

@router.post("/chat/{session_id}/reset")
async def reset_chat(session_id: str, db: Session = Depends(get_db)):
    """Reset chat history for a session"""
    # Delete all messages for the session
    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
    db.commit()
    
    return {"message": "Chat history reset successfully"}

@router.post("/chat/{session_id}/system-prompt")
async def update_system_prompt(session_id: str, request: SystemPromptRequest, db: Session = Depends(get_db)):
    """Update system prompt for a session"""
    session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    if not session:
        session = ChatSession(
            session_id=session_id,
            system_prompt=request.system_prompt
        )
        db.add(session)
    else:
        session.system_prompt = request.system_prompt
    
    db.commit()
    return {"message": "System prompt updated successfully"}

@router.get("/sessions", response_model=List[str])
async def get_sessions(db: Session = Depends(get_db)):
    """Get all chat session IDs"""
    sessions = db.query(ChatSession.session_id).all()
    return [session.session_id for session in sessions]