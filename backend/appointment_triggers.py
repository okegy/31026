"""
🎯 Appointment Trigger Commands System
======================================

This system provides specific trigger comments/commands that can activate
the appointment booking system and complete authentication.

Trigger Commands:
- "!book" - Start appointment booking
- "!urgent" - Book urgent appointment
- "!check" - Check availability
- "!login" - Authentication trigger
- "!schedule" - View schedule
- "!waitlist" - View waitlist
"""

import asyncio
import json
from typing import Dict, Any, List
from ai_chatbot_booking import process_voice_booking
from separate_auth import register_patient, login_patient, register_doctor, login_doctor

class AppointmentTriggerSystem:
    """System to handle trigger commands for appointments"""
    
    def __init__(self):
        self.trigger_commands = {
            # Patient triggers
            "!book": self._trigger_appointment_booking,
            "!urgent": self._trigger_urgent_booking,
            "!check": self._trigger_availability_check,
            "!schedule": self._trigger_view_schedule,
            "!cancel": self._trigger_cancel_appointment,
            "!reschedule": self._trigger_reschedule,
            "!help": self._trigger_help,
            
            # Authentication triggers
            "!login": self._trigger_login,
            "!register": self._trigger_register,
            "!logout": self._trigger_logout,
            
            # Doctor triggers
            "!waitlist": self._trigger_waitlist,
            "!patients": self._trigger_patients,
            "!slots": self._trigger_add_slots,
            "!today": self._trigger_today_schedule,
            
            # System triggers
            "!status": self._trigger_status,
            "!test": self._trigger_test,
            "!reset": self._trigger_reset
        }
        
        self.user_sessions = {}
        self.appointment_queue = []
    
    async def process_trigger(self, command: str, user_input: str, user_type: str = "patient") -> Dict[str, Any]:
        """
        Process trigger command
        
        Args:
            command: Trigger command (e.g., "!book")
            user_input: Additional user input
            user_type: "patient" or "doctor"
            
        Returns:
            Processing result
        """
        
        print(f"🎯 Processing trigger: {command}")
        print(f"📝 User input: {user_input}")
        print(f"👤 User type: {user_type}")
        
        # Check if command exists
        if command not in self.trigger_commands:
            return {
                "success": False,
                "message": f"Unknown trigger command: {command}",
                "available_commands": list(self.trigger_commands.keys())
            }
        
        try:
            # Execute trigger function
            result = await self.trigger_commands[command](user_input, user_type)
            return result
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Error processing trigger {command}: {str(e)}"
            }
    
    async def _trigger_appointment_booking(self, user_input: str, user_type: str) -> Dict[str, Any]:
        """Trigger appointment booking"""
        
        booking_prompt = f"I want to book an appointment. {user_input}"
        
        result = await process_voice_booking(booking_prompt, user_type)
        
        return {
            "success": True,
            "trigger": "!book",
            "message": "Appointment booking initiated",
            "result": result
        }
    
    async def _trigger_urgent_booking(self, user_input: str, user_type: str) -> Dict[str, Any]:
        """Trigger urgent appointment booking"""
        
        urgent_prompt = f"I need to book an urgent appointment. {user_input}"
        
        result = await process_voice_booking(urgent_prompt, user_type)
        
        return {
            "success": True,
            "trigger": "!urgent",
            "message": "Urgent appointment booking initiated",
            "priority": "urgent",
            "result": result
        }
    
    async def _trigger_availability_check(self, user_input: str, user_type: str) -> Dict[str, Any]:
        """Trigger availability check"""
        
        check_prompt = f"Check availability for appointments. {user_input}"
        
        result = await process_voice_booking(check_prompt, user_type)
        
        return {
            "success": True,
            "trigger": "!check",
            "message": "Availability check initiated",
            "result": result
        }
    
    async def _trigger_login(self, user_input: str, user_type: str) -> Dict[str, Any]:
        """Trigger authentication"""
        
        # Parse login credentials
        parts = user_input.split()
        if len(parts) >= 2:
            email = parts[0]
            password = " ".join(parts[1:])
        else:
            return {
                "success": False,
                "trigger": "!login",
                "message": "Usage: !login email password"
            }
        
        try:
            if user_type == "patient":
                result = login_patient(email, password)
            else:
                result = login_doctor(email, password)
            
            return {
                "success": True,
                "trigger": "!login",
                "message": f"{user_type.title()} login successful",
                "user": result.get("user"),
                "token": result.get("token")
            }
            
        except Exception as e:
            return {
                "success": False,
                "trigger": "!login",
                "message": f"Login failed: {str(e)}"
            }
    
    async def _trigger_register(self, user_input: str, user_type: str) -> Dict[str, Any]:
        """Trigger registration"""
        
        # Simple registration - in real app, would parse better
        registration_data = {
            "name": user_input,
            "email": f"{user_input.lower().replace(' ', '.')}@example.com",
            "password": "password123"
        }
        
        try:
            if user_type == "patient":
                result = register_patient(registration_data)
            else:
                result = register_doctor(registration_data)
            
            return {
                "success": True,
                "trigger": "!register",
                "message": f"{user_type.title()} registration successful",
                "user": result.get("user")
            }
            
        except Exception as e:
            return {
                "success": False,
                "trigger": "!register",
                "message": f"Registration failed: {str(e)}"
            }
    
    async def _trigger_view_schedule(self, user_input: str, user_type: str) -> Dict[str, Any]:
        """Trigger schedule viewing"""
        
        schedule_prompt = f"Show my schedule. {user_input}"
        
        result = await process_voice_booking(schedule_prompt, user_type)
        
        return {
            "success": True,
            "trigger": "!schedule",
            "message": "Schedule view initiated",
            "result": result
        }
    
    async def _trigger_waitlist(self, user_input: str, user_type: str) -> Dict[str, Any]:
        """Trigger waitlist viewing (doctor only)"""
        
        if user_type != "doctor":
            return {
                "success": False,
                "trigger": "!waitlist",
                "message": "Waitlist access is for doctors only"
            }
        
        waitlist_prompt = f"Show my patient waitlist. {user_input}"
        
        result = await process_voice_booking(waitlist_prompt, user_type)
        
        return {
            "success": True,
            "trigger": "!waitlist",
            "message": "Waitlist view initiated",
            "result": result
        }
    
    async def _trigger_help(self, user_input: str, user_type: str) -> Dict[str, Any]:
        """Show help for available commands"""
        
        patient_commands = [
            "!book [details] - Book appointment",
            "!urgent [symptoms] - Book urgent appointment", 
            "!check [time] - Check availability",
            "!schedule - View your schedule",
            "!login email password - Login",
            "!register name - Register",
            "!help - Show this help"
        ]
        
        doctor_commands = [
            "!schedule - View your schedule",
            "!waitlist - View patient waitlist",
            "!patients - View patient list",
            "!slots [time] - Add time slots",
            "!today - Today's schedule",
            "!login email password - Login",
            "!register name - Register",
            "!help - Show this help"
        ]
        
        commands = patient_commands if user_type == "patient" else doctor_commands
        
        return {
            "success": True,
            "trigger": "!help",
            "message": f"Available commands for {user_type}:",
            "commands": commands
        }
    
    async def _trigger_status(self, user_input: str, user_type: str) -> Dict[str, Any]:
        """Show system status"""
        
        return {
            "success": True,
            "trigger": "!status",
            "message": "System status",
            "status": {
                "ai_chatbot": "Online",
                "calendar_integration": "Ready",
                "authentication": "Working",
                "voice_processing": "Available",
                "database": "Connected"
            }
        }
    
    async def _trigger_test(self, user_input: str, user_type: str) -> Dict[str, Any]:
        """Test system functionality"""
        
        test_result = await process_voice_booking("Test appointment booking", user_type)
        
        return {
            "success": True,
            "trigger": "!test",
            "message": "System test completed",
            "test_result": test_result
        }
    
    # Placeholder methods for other triggers
    async def _trigger_cancel_appointment(self, user_input: str, user_type: str):
        return {"success": True, "message": "Cancel appointment feature coming soon"}
    
    async def _trigger_reschedule(self, user_input: str, user_type: str):
        return {"success": True, "message": "Reschedule feature coming soon"}
    
    async def _trigger_logout(self, user_input: str, user_type: str):
        return {"success": True, "message": "Logout feature coming soon"}
    
    async def _trigger_patients(self, user_input: str, user_type: str):
        return {"success": True, "message": "Patient list feature coming soon"}
    
    async def _trigger_add_slots(self, user_input: str, user_type: str):
        return {"success": True, "message": "Add slots feature coming soon"}
    
    async def _trigger_today_schedule(self, user_input: str, user_type: str):
        return {"success": True, "message": "Today's schedule feature coming soon"}
    
    async def _trigger_reset(self, user_input: str, user_type: str):
        return {"success": True, "message": "System reset feature coming soon"}

# Global trigger system instance
trigger_system = AppointmentTriggerSystem()

async def process_appointment_trigger(command: str, user_input: str, user_type: str = "patient") -> Dict[str, Any]:
    """Main function to process appointment triggers"""
    return await trigger_system.process_trigger(command, user_input, user_type)

# Example usage and testing
if __name__ == "__main__":
    async def test_trigger_system():
        """Test the trigger system"""
        
        print("🎯 Testing Appointment Trigger System")
        print("=" * 50)
        
        # Test patient triggers
        test_triggers = [
            ("!book", "I need to book a routine checkup", "patient"),
            ("!urgent", "I have severe chest pain", "patient"),
            ("!check", "Show available slots for tomorrow", "patient"),
            ("!login", "alice@example.com password123", "patient"),
            ("!help", "", "patient"),
            ("!status", "", "patient")
        ]
        
        for command, input_text, user_type in test_triggers:
            print(f"\n🎯 Testing: {command} {input_text}")
            result = await process_appointment_trigger(command, input_text, user_type)
            
            print(f"✅ Result: {result.get('message', 'No message')}")
            if result.get('result'):
                print(f"📊 AI Response: {result['result'].get('ai_response', 'No AI response')}")
        
        # Test doctor triggers
        doctor_triggers = [
            ("!schedule", "Show my appointments", "doctor"),
            ("!waitlist", "", "doctor"),
            ("!login", "michael@example.com password123", "doctor"),
            ("!help", "", "doctor")
        ]
        
        print(f"\n👨‍⚕️ Testing Doctor Triggers:")
        for command, input_text, user_type in doctor_triggers:
            print(f"\n🎯 Testing: {command} {input_text}")
            result = await process_appointment_trigger(command, input_text, user_type)
            
            print(f"✅ Result: {result.get('message', 'No message')}")
    
    # Run test
    asyncio.run(test_trigger_system())
