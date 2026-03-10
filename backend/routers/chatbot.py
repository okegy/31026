"""
🤖 Chatbot API Routes
=====================

API endpoints for AI-powered appointment booking
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional
from ai_chatbot_booking import process_voice_booking
from separate_auth import verify_token

router = APIRouter()

class ChatbotRequest(BaseModel):
    message: str
    userType: str = "patient"
    token: Optional[str] = None

class ChatbotResponse(BaseModel):
    success: bool
    ai_response: str
    intent: Optional[Dict[str, Any]] = None
    appointment_details: Optional[Dict[str, Any]] = None
    availability: Optional[Dict[str, Any]] = None
    action_result: Optional[Dict[str, Any]] = None
    conversation_id: Optional[str] = None
    error: Optional[str] = None

@router.post("/process", response_model=ChatbotResponse)
async def process_chatbot_message(request: ChatbotRequest):
    """
    Process chatbot message for appointment booking
    
    Args:
        request: Chatbot request with message and user type
        
    Returns:
        AI response with appointment processing results
    """
    
    try:
        # Verify token if provided
        user_info = None
        if request.token:
            user_info = verify_token(request.token)
        
        # Process the message through AI chatbot
        result = await process_voice_booking(
            voice_text=request.message,
            user_type=request.userType
        )
        
        if result.get("success"):
            return ChatbotResponse(
                success=True,
                ai_response=result.get("ai_response", "Processing your request..."),
                intent=result.get("intent"),
                appointment_details=result.get("appointment_details"),
                availability=result.get("availability"),
                action_result=result.get("action_result"),
                conversation_id=result.get("conversation_id")
            )
        else:
            return ChatbotResponse(
                success=False,
                ai_response="I'm having trouble processing your request. Please try again.",
                error=result.get("error", "Unknown error")
            )
            
    except Exception as e:
        print(f"Chatbot processing error: {e}")
        return ChatbotResponse(
            success=False,
            ai_response="Sorry, I'm experiencing technical difficulties. Please try again later.",
            error=str(e)
        )

@router.get("/status")
async def get_chatbot_status():
    """Get chatbot system status"""
    
    try:
        return {
            "success": True,
            "status": "online",
            "features": {
                "voice_processing": True,
                "gemini_ai": True,
                "calendar_integration": True,
                "appointment_booking": True,
                "natural_language": True
            },
            "supported_languages": ["en-US"],
            "voice_recognition": "webkitSpeechRecognition" if True else "Not supported"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")

@router.post("/voice-to-text")
async def voice_to_text(audio_data: bytes):
    """
    Convert voice to text (placeholder for future implementation)
    
    Args:
        audio_data: Raw audio data
        
    Returns:
        Transcribed text
    """
    
    # This is a placeholder for future speech-to-text implementation
    # For now, we'll rely on browser's built-in speech recognition
    
    return {
        "success": True,
        "text": "Voice processing handled by browser",
        "note": "Using browser's built-in speech recognition"
    }

@router.get("/quick-actions/{user_type}")
async def get_quick_actions(user_type: str):
    """Get quick actions for user type"""
    
    if user_type == "patient":
        return {
            "success": True,
            "actions": [
                {
                    "id": "urgent",
                    "text": "I need to book an urgent appointment",
                    "icon": "🚨",
                    "color": "red"
                },
                {
                    "id": "routine",
                    "text": "I want to schedule a routine checkup",
                    "icon": "📅",
                    "color": "blue"
                },
                {
                    "id": "appointments",
                    "text": "Show my upcoming appointments",
                    "icon": "📋",
                    "color": "green"
                }
            ]
        }
    elif user_type == "doctor":
        return {
            "success": True,
            "actions": [
                {
                    "id": "schedule",
                    "text": "Show my schedule for today",
                    "icon": "📅",
                    "color": "blue"
                },
                {
                    "id": "waitlist",
                    "text": "Show my patient waitlist",
                    "icon": "📋",
                    "color": "orange"
                },
                {
                    "id": "slots",
                    "text": "Add available time slots",
                    "icon": "➕",
                    "color": "green"
                }
            ]
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid user type")

# Example usage and testing
if __name__ == "__main__":
    import asyncio
    
    async def test_chatbot():
        """Test the chatbot API"""
        
        print("🤖 Testing Chatbot API")
        print("=" * 40)
        
        # Test patient request
        patient_request = ChatbotRequest(
            message="I need to book an urgent appointment, I have severe chest pain",
            userType="patient"
        )
        
        result = await process_chatbot_message(patient_request)
        print(f"Patient Request Result: {result.ai_response}")
        
        # Test doctor request
        doctor_request = ChatbotRequest(
            message="Show my schedule for today",
            userType="doctor"
        )
        
        result = await process_chatbot_message(doctor_request)
        print(f"Doctor Request Result: {result.ai_response}")
    
    # Run test
    asyncio.run(test_chatbot())
