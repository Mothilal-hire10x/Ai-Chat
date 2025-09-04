import google.generativeai as genai
from app.core.config import settings

# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

class GeminiService:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-pro')
    
    async def generate_response(self, message: str, system_prompt: str = "", chat_history: list = None) -> str:
        """Generate a response using Gemini API"""
        try:
            # Build the prompt with system context and chat history
            full_prompt = ""
            
            if system_prompt:
                full_prompt += f"System: {system_prompt}\n\n"
            
            if chat_history:
                for chat_msg in chat_history[-10:]:  # Include last 10 messages for context
                    role = "Human" if chat_msg.role == "user" else "Assistant"
                    full_prompt += f"{role}: {chat_msg.content}\n"
            
            full_prompt += f"Human: {message}\nAssistant:"
            
            response = self.model.generate_content(full_prompt)
            return response.text
            
        except Exception as e:
            print(f"Error generating response: {e}")
            return "I apologize, but I'm experiencing technical difficulties. Please try again later."

gemini_service = GeminiService()