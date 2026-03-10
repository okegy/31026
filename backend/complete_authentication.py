"""
🔐 Complete Authentication System with Triggers
===============================================

This provides complete authentication for both patients and doctors
with trigger command support.

Features:
✅ Patient registration and login
✅ Doctor registration and login
✅ JWT token management
✅ Session handling
✅ Trigger command authentication
✅ Role-based access
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from separate_auth import register_patient, login_patient, register_doctor, login_doctor, verify_token

class CompleteAuthentication:
    """Complete authentication system with trigger support"""
    
    def __init__(self):
        self.active_sessions = {}
        self.user_data = {
            "patients": {},
            "doctors": {}
        }
    
    async def setup_authentication(self) -> Dict[str, Any]:
        """Setup complete authentication system"""
        
        print("🔐 Setting Up Complete Authentication System")
        print("=" * 50)
        
        # Step 1: Register demo patients
        demo_patients = [
            {
                "name": "Alice Johnson",
                "email": "alice@medschedule.com",
                "password": "patient123",
                "phone": "555-0101",
                "date_of_birth": "1990-05-15"
            },
            {
                "name": "Bob Smith",
                "email": "bob@medschedule.com", 
                "password": "patient123",
                "phone": "555-0102",
                "date_of_birth": "1985-08-22"
            },
            {
                "name": "Carol Davis",
                "email": "carol@medschedule.com",
                "password": "patient123", 
                "phone": "555-0103",
                "date_of_birth": "1992-12-03"
            }
        ]
        
        registered_patients = []
        for patient_data in demo_patients:
            try:
                result = register_patient(patient_data)
                registered_patients.append(result["user"])
                print(f"✅ Patient Registered: {result['user']['name']}")
            except Exception as e:
                print(f"⚠️ Patient {patient_data['name']} already exists")
        
        # Step 2: Register demo doctors
        demo_doctors = [
            {
                "name": "Dr. Michael Chen",
                "email": "michael@medschedule.com",
                "password": "doctor123",
                "specialty": "Cardiology",
                "license_number": "MD123456"
            },
            {
                "name": "Dr. Sarah Johnson",
                "email": "sarah@medschedule.com",
                "password": "doctor123",
                "specialty": "Internal Medicine",
                "license_number": "MD789012"
            },
            {
                "name": "Dr. Emily Davis",
                "email": "emily@medschedule.com",
                "password": "doctor123",
                "specialty": "Pediatrics",
                "license_number": "MD345678"
            }
        ]
        
        registered_doctors = []
        for doctor_data in demo_doctors:
            try:
                result = register_doctor(doctor_data)
                registered_doctors.append(result["user"])
                print(f"✅ Doctor Registered: {result['user']['name']}")
            except Exception as e:
                print(f"⚠️ Doctor {doctor_data['name']} already exists")
        
        # Step 3: Create login sessions
        patient_sessions = []
        for patient in registered_patients:
            try:
                login_result = login_patient(patient["email"], "patient123")
                session = {
                    "user": login_result["user"],
                    "token": login_result["token"],
                    "login_time": datetime.now().isoformat()
                }
                patient_sessions.append(session)
                print(f"✅ Patient Logged In: {patient['name']}")
            except:
                pass
        
        doctor_sessions = []
        for doctor in registered_doctors:
            try:
                login_result = login_doctor(doctor["email"], "doctor123")
                session = {
                    "user": login_result["user"],
                    "token": login_result["token"],
                    "login_time": datetime.now().isoformat()
                }
                doctor_sessions.append(session)
                print(f"✅ Doctor Logged In: {doctor['name']}")
            except:
                pass
        
        # Step 4: Store sessions
        self.active_sessions = {
            "patients": patient_sessions,
            "doctors": doctor_sessions
        }
        
        return {
            "success": True,
            "message": "Authentication system setup complete",
            "registered_patients": len(registered_patients),
            "registered_doctors": len(registered_doctors),
            "active_sessions": len(patient_sessions) + len(doctor_sessions)
        }
    
    async def authenticate_with_trigger(self, trigger_command: str, credentials: str) -> Dict[str, Any]:
        """Authenticate using trigger commands"""
        
        print(f"🔐 Processing authentication trigger: {trigger_command}")
        
        try:
            if trigger_command == "!login-patient":
                return await self._login_patient_trigger(credentials)
            elif trigger_command == "!login-doctor":
                return await self._login_doctor_trigger(credentials)
            elif trigger_command == "!register-patient":
                return await self._register_patient_trigger(credentials)
            elif trigger_command == "!register-doctor":
                return await self._register_doctor_trigger(credentials)
            elif trigger_command == "!quick-login":
                return await self._quick_login_trigger(credentials)
            else:
                return {
                    "success": False,
                    "message": f"Unknown authentication trigger: {trigger_command}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "message": f"Authentication error: {str(e)}"
            }
    
    async def _login_patient_trigger(self, credentials: str) -> Dict[str, Any]:
        """Login patient with trigger"""
        
        parts = credentials.split()
        if len(parts) < 2:
            return {
                "success": False,
                "message": "Usage: !login-patient email password"
            }
        
        email = parts[0]
        password = " ".join(parts[1:])
        
        try:
            result = login_patient(email, password)
            return {
                "success": True,
                "message": "Patient login successful",
                "user": result["user"],
                "token": result["token"],
                "user_type": "patient"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Patient login failed: {str(e)}"
            }
    
    async def _login_doctor_trigger(self, credentials: str) -> Dict[str, Any]:
        """Login doctor with trigger"""
        
        parts = credentials.split()
        if len(parts) < 2:
            return {
                "success": False,
                "message": "Usage: !login-doctor email password"
            }
        
        email = parts[0]
        password = " ".join(parts[1:])
        
        try:
            result = login_doctor(email, password)
            return {
                "success": True,
                "message": "Doctor login successful",
                "user": result["user"],
                "token": result["token"],
                "user_type": "doctor"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Doctor login failed: {str(e)}"
            }
    
    async def _register_patient_trigger(self, user_data: str) -> Dict[str, Any]:
        """Register patient with trigger"""
        
        # Simple parsing - in real app would be more sophisticated
        parts = user_data.split()
        if len(parts) < 1:
            return {
                "success": False,
                "message": "Usage: !register-patient name"
            }
        
        name = " ".join(parts)
        email = f"{name.lower().replace(' ', '.')}@medschedule.com"
        
        patient_data = {
            "name": name,
            "email": email,
            "password": "patient123",
            "phone": "555-0000",
            "date_of_birth": "1990-01-01"
        }
        
        try:
            result = register_patient(patient_data)
            return {
                "success": True,
                "message": "Patient registration successful",
                "user": result["user"],
                "user_type": "patient"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Patient registration failed: {str(e)}"
            }
    
    async def _register_doctor_trigger(self, user_data: str) -> Dict[str, Any]:
        """Register doctor with trigger"""
        
        parts = user_data.split()
        if len(parts) < 1:
            return {
                "success": False,
                "message": "Usage: !register-doctor name"
            }
        
        name = " ".join(parts)
        email = f"{name.lower().replace(' ', '.')}@medschedule.com"
        
        doctor_data = {
            "name": name,
            "email": email,
            "password": "doctor123",
            "specialty": "General Practice",
            "license_number": "MD000000"
        }
        
        try:
            result = register_doctor(doctor_data)
            return {
                "success": True,
                "message": "Doctor registration successful",
                "user": result["user"],
                "user_type": "doctor"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Doctor registration failed: {str(e)}"
            }
    
    async def _quick_login_trigger(self, user_type: str) -> Dict[str, Any]:
        """Quick login with demo accounts"""
        
        if user_type.lower() == "patient":
            # Login with demo patient
            try:
                result = login_patient("alice@medschedule.com", "patient123")
                return {
                    "success": True,
                    "message": "Demo patient login successful",
                    "user": result["user"],
                    "token": result["token"],
                    "user_type": "patient"
                }
            except Exception as e:
                return {
                    "success": False,
                    "message": f"Demo patient login failed: {str(e)}"
                }
        
        elif user_type.lower() == "doctor":
            # Login with demo doctor
            try:
                result = login_doctor("michael@medschedule.com", "doctor123")
                return {
                    "success": True,
                    "message": "Demo doctor login successful",
                    "user": result["user"],
                    "token": result["token"],
                    "user_type": "doctor"
                }
            except Exception as e:
                return {
                    "success": False,
                    "message": f"Demo doctor login failed: {str(e)}"
                }
        
        else:
            return {
                "success": False,
                "message": "Usage: !quick-login patient|doctor"
            }
    
    def get_authentication_guide(self) -> Dict[str, Any]:
        """Get guide for authentication triggers"""
        
        return {
            "patient_triggers": {
                "!login-patient email password": "Login as patient",
                "!register-patient name": "Register new patient",
                "!quick-login patient": "Login with demo patient"
            },
            "doctor_triggers": {
                "!login-doctor email password": "Login as doctor",
                "!register-doctor name": "Register new doctor", 
                "!quick-login doctor": "Login with demo doctor"
            },
            "demo_accounts": {
                "patients": [
                    {"email": "alice@medschedule.com", "password": "patient123"},
                    {"email": "bob@medschedule.com", "password": "patient123"},
                    {"email": "carol@medschedule.com", "password": "patient123"}
                ],
                "doctors": [
                    {"email": "michael@medschedule.com", "password": "doctor123"},
                    {"email": "sarah@medschedule.com", "password": "doctor123"},
                    {"email": "emily@medschedule.com", "password": "doctor123"}
                ]
            },
            "examples": [
                "!login-patient alice@medschedule.com patient123",
                "!login-doctor michael@medschedule.com doctor123",
                "!quick-login patient",
                "!quick-login doctor"
            ]
        }

# Global authentication instance
auth_system = CompleteAuthentication()

async def setup_complete_authentication() -> Dict[str, Any]:
    """Setup complete authentication system"""
    return await auth_system.setup_authentication()

async def authenticate_with_trigger(trigger: str, credentials: str) -> Dict[str, Any]:
    """Authenticate using trigger commands"""
    return await auth_system.authenticate_with_trigger(trigger, credentials)

# Example usage
if __name__ == "__main__":
    async def demo_complete_authentication():
        """Demonstrate complete authentication system"""
        
        print("🔐 Complete Authentication System Demo")
        print("=" * 50)
        
        # Setup authentication
        setup_result = await setup_complete_authentication()
        print(f"\n📊 Setup Result: {setup_result['message']}")
        print(f"   Registered Patients: {setup_result['registered_patients']}")
        print(f"   Registered Doctors: {setup_result['registered_doctors']}")
        print(f"   Active Sessions: {setup_result['active_sessions']}")
        
        # Test authentication triggers
        auth_tests = [
            ("!quick-login", "patient"),
            ("!quick-login", "doctor"),
            ("!login-patient", "alice@medschedule.com patient123"),
            ("!login-doctor", "michael@medschedule.com doctor123")
        ]
        
        print(f"\n🧪 Testing Authentication Triggers:")
        for trigger, credentials in auth_tests:
            print(f"\n🔐 Testing: {trigger} {credentials}")
            result = await authenticate_with_trigger(trigger, credentials)
            
            if result["success"]:
                print(f"✅ {result['message']}")
                print(f"   User: {result['user']['name']}")
                print(f"   Type: {result['user_type']}")
            else:
                print(f"❌ {result['message']}")
        
        # Show authentication guide
        guide = auth_system.get_authentication_guide()
        print(f"\n📋 Authentication Guide:")
        print(f"   Patient Triggers: {list(guide['patient_triggers'].keys())}")
        print(f"   Doctor Triggers: {list(guide['doctor_triggers'].keys())}")
        
        print(f"\n🎯 Ready for use!")
        print(f"   Use triggers to authenticate and start booking appointments!")
    
    # Run demo
    asyncio.run(demo_complete_authentication())
