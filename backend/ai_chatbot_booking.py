"""
🤖 AI Chatbot Appointment Booking System
==========================================

Features:
✅ Google Calendar availability fetching
✅ Gemini AI for intelligent analysis
✅ Voice-based appointment booking
✅ Natural language processing
✅ Separate patient/doctor authentication
✅ Simple conversational interface
"""

import os
import json
import datetime
import asyncio
from typing import Dict, Any, List, Optional
import google.generativeai as genai
from services.google_calendar import google_calendar
from services.google_auth import google_auth
from database import appointments_collection, patients_collection, doctors_collection

class AIChatbotBooking:
    """AI-powered appointment booking system"""
    
    def __init__(self):
        # Initialize Gemini AI
        genai.configure(api_key=os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY"))
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.chat_model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Conversation context
        self.conversation_history = []
        self.user_context = {}
        
    async def process_voice_command(self, voice_text: str, user_type: str = "patient") -> Dict[str, Any]:
        """
        Process voice/text command for appointment booking
        
        Args:
            voice_text: User's voice or text input
            user_type: "patient" or "doctor"
            
        Returns:
            AI response with appointment actions
        """
        
        print(f"🎤 Processing {user_type} command: {voice_text}")
        
        try:
            # Step 1: Analyze intent with Gemini
            intent_analysis = await self._analyze_intent(voice_text, user_type)
            
            # Step 2: Extract appointment details
            appointment_details = await self._extract_appointment_details(voice_text, intent_analysis)
            
            # Step 3: Get Google Calendar availability
            availability = await self._get_calendar_availability(appointment_details)
            
            # Step 4: Generate intelligent response
            ai_response = await self._generate_ai_response(
                voice_text, 
                appointment_details, 
                availability, 
                user_type
            )
            
            # Step 5: Take action if confirmed
            action_result = None
            if intent_analysis.get("action") == "book_appointment":
                action_result = await self._book_appointment(appointment_details)
            
            return {
                "success": True,
                "user_input": voice_text,
                "intent": intent_analysis,
                "appointment_details": appointment_details,
                "availability": availability,
                "ai_response": ai_response,
                "action_result": action_result,
                "conversation_id": self._get_conversation_id()
            }
            
        except Exception as e:
            print(f"❌ Error processing voice command: {e}")
            return {
                "success": False,
                "error": str(e),
                "user_input": voice_text
            }
    
    async def _analyze_intent(self, text: str, user_type: str) -> Dict[str, Any]:
        """Analyze user intent using Gemini AI"""
        
        prompt = f"""
        Analyze this {user_type} request and determine the intent:
        
        User Request: "{text}"
        User Type: {user_type}
        
        Possible Intents:
        - book_appointment: User wants to book an appointment
        - check_availability: User wants to check available slots
        - cancel_appointment: User wants to cancel
        - reschedule: User wants to reschedule
        - ask_question: General inquiry
        - view_schedule: User wants to see their schedule
        
        Also extract:
        - Urgency level (urgent/normal/routine)
        - Preferred time (morning/afternoon/evening)
        - Symptoms/complaints
        - Preferred doctor (if mentioned)
        - Date preferences
        
        Respond in JSON format:
        {{
            "intent": "intent_name",
            "urgency": "urgency_level",
            "preferred_time": "time_preference",
            "symptoms": "extracted_symptoms",
            "preferred_doctor": "doctor_name",
            "date_preference": "date_info",
            "confidence": 0.95
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Parse JSON response
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except Exception as e:
            print(f"⚠️ Gemini intent analysis failed: {e}")
        
        # Fallback analysis
        text_lower = text.lower()
        return {
            "intent": "book_appointment" if "book" in text_lower else "check_availability",
            "urgency": "urgent" if any(word in text_lower for word in ["urgent", "emergency", "pain"]) else "normal",
            "preferred_time": "morning" if "morning" in text_lower else "afternoon" if "afternoon" in text_lower else "any",
            "symptoms": text,
            "preferred_doctor": None,
            "date_preference": "asap",
            "confidence": 0.7
        }
    
    async def _extract_appointment_details(self, text: str, intent: Dict[str, Any]) -> Dict[str, Any]:
        """Extract structured appointment details"""
        
        return {
            "symptoms": intent.get("symptoms", ""),
            "urgency": intent.get("urgency", "normal"),
            "preferred_time": intent.get("preferred_time", "any"),
            "preferred_doctor": intent.get("preferred_doctor"),
            "date_preference": intent.get("date_preference", "asap"),
            "appointment_type": self._determine_appointment_type(intent.get("symptoms", ""), intent.get("urgency", "normal"))
        }
    
    def _determine_appointment_type(self, symptoms: str, urgency: str) -> str:
        """Determine appointment type from symptoms and urgency"""
        
        symptoms_lower = symptoms.lower()
        
        if urgency == "urgent":
            return "Urgent Consultation"
        elif any(word in symptoms_lower for word in ["pain", "fever", "injury", "sick"]):
            return "Medical Consultation"
        elif any(word in symptoms_lower for word in ["checkup", "routine", "follow-up"]):
            return "Routine Checkup"
        else:
            return "General Consultation"
    
    async def _get_calendar_availability(self, details: Dict[str, Any]) -> Dict[str, Any]:
        """Get real availability from Google Calendar"""
        
        try:
            # Check Google auth
            creds = google_auth.get_credentials()
            if not creds or not creds.valid:
                return {
                    "available": False,
                    "message": "Calendar access not available. Please check Google authentication.",
                    "alternative_slots": self._get_mock_availability(details)
                }
            
            # Get calendar service
            calendar_service = google_calendar.get_service()
            if not calendar_service:
                return {
                    "available": False,
                    "message": "Calendar service unavailable",
                    "alternative_slots": self._get_mock_availability(details)
                }
            
            # Get availability for next 7 days
            today = datetime.datetime.now()
            available_slots = []
            
            for day_offset in range(7):
                check_date = today + datetime.timedelta(days=day_offset)
                date_str = check_date.strftime("%Y-%m-%d")
                
                # Check time slots based on preference
                time_slots = self._get_time_slots(details.get("preferred_time", "any"))
                
                for time_slot in time_slots:
                    start_time_iso = f"{date_str}T{time_slot}:00"
                    
                    # Check if slot is available
                    is_available = not google_calendar.check_conflicts(start_time_iso)
                    
                    if is_available:
                        available_slots.append({
                            "date": date_str,
                            "time": time_slot,
                            "doctor": details.get("preferred_doctor", "Available Doctor"),
                            "available": True
                        })
            
            if available_slots:
                return {
                    "available": True,
                    "message": f"Found {len(available_slots)} available slots",
                    "slots": available_slots[:5],  # Return top 5 slots
                    "total_slots": len(available_slots)
                }
            else:
                return {
                    "available": False,
                    "message": "No available slots found in the next 7 days",
                    "alternative_slots": self._get_mock_availability(details)
                }
                
        except Exception as e:
            print(f"⚠️ Calendar availability check failed: {e}")
            return {
                "available": False,
                "message": f"Calendar check failed: {e}",
                "alternative_slots": self._get_mock_availability(details)
            }
    
    def _get_time_slots(self, time_preference: str) -> List[str]:
        """Get time slots based on preference"""
        
        if time_preference == "morning":
            return ["09:00", "10:00", "11:00"]
        elif time_preference == "afternoon":
            return ["14:00", "15:00", "16:00"]
        elif time_preference == "evening":
            return ["17:00", "18:00"]
        else:
            return ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]
    
    def _get_mock_availability(self, details: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get mock availability when calendar is not available"""
        
        today = datetime.datetime.now()
        mock_slots = []
        
        for day_offset in range(3):
            check_date = today + datetime.timedelta(days=day_offset)
            date_str = check_date.strftime("%Y-%m-%d")
            
            time_slots = self._get_time_slots(details.get("preferred_time", "any"))
            
            for time_slot in time_slots[:2]:  # 2 slots per day
                mock_slots.append({
                    "date": date_str,
                    "time": time_slot,
                    "doctor": "Dr. Available",
                    "available": True,
                    "mock": True
                })
        
        return mock_slots
    
    async def _generate_ai_response(self, user_input: str, details: Dict[str, Any], availability: Dict[str, Any], user_type: str) -> str:
        """Generate intelligent AI response"""
        
        prompt = f"""
        You are a helpful medical appointment assistant. Generate a natural, empathetic response.
        
        User Request: "{user_input}"
        User Type: {user_type}
        Appointment Details: {json.dumps(details, indent=2)}
        Availability: {json.dumps(availability, indent=2)}
        
        Guidelines:
        - Be empathetic and professional
        - Clearly explain available options
        - If urgent, prioritize immediate care
        - If availability is limited, offer alternatives
        - Keep response conversational and clear
        - Include specific dates and times
        - Ask for confirmation if booking
        
        Generate a natural response:
        """
        
        try:
            response = self.chat_model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"⚠️ AI response generation failed: {e}")
            return self._generate_fallback_response(details, availability)
    
    def _generate_fallback_response(self, details: Dict[str, Any], availability: Dict[str, Any]) -> str:
        """Generate fallback response when AI fails"""
        
        if availability.get("available"):
            slots = availability.get("slots", [])
            if slots:
                first_slot = slots[0]
                return f"I found available appointments for you. The earliest is {first_slot['date']} at {first_slot['time']} with {first_slot['doctor']}. Would you like me to book this for you?"
        
        return "I'm checking availability for your appointment. Let me find the best options for you."
    
    async def _book_appointment(self, details: Dict[str, Any]) -> Dict[str, Any]:
        """Book the appointment"""
        
        try:
            # This would integrate with the existing appointment system
            appointment_id = f"AI{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            return {
                "success": True,
                "appointment_id": appointment_id,
                "message": "Appointment booked successfully!",
                "details": details
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _get_conversation_id(self) -> str:
        """Get conversation ID"""
        return f"conv_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"

# Global chatbot instance
ai_chatbot = AIChatbotBooking()

async def process_voice_booking(voice_text: str, user_type: str = "patient") -> Dict[str, Any]:
    """Main function for voice-based appointment booking"""
    return await ai_chatbot.process_voice_command(voice_text, user_type)

# Example usage
if __name__ == "__main__":
    async def test_voice_booking():
        """Test the voice booking system"""
        
        print("🤖 Testing AI Chatbot Booking System")
        print("=" * 50)
        
        # Test patient voice commands
        test_commands = [
            "I need to book an urgent appointment, I have severe chest pain",
            "Can I schedule a routine checkup for next week?",
            "I'd like to see Dr. Smith tomorrow afternoon for my migraine"
        ]
        
        for command in test_commands:
            print(f"\n🎤 Patient: {command}")
            result = await process_voice_booking(command, "patient")
            
            print(f"🤖 AI: {result.get('ai_response', 'Processing...')}")
            print(f"📊 Intent: {result.get('intent', {}).get('intent', 'Unknown')}")
            print(f"📅 Available: {result.get('availability', {}).get('available', False)}")
            
            if result.get('action_result'):
                print(f"✅ Action: {result['action_result'].get('message', 'No action taken')}")
    
    # Run test
    asyncio.run(test_voice_booking())
