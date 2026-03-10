"""
🔐 Separate Authentication System for Patients and Doctors
==========================================================

Features:
✅ Separate patient authentication
✅ Separate doctor authentication  
✅ Role-based access control
✅ JWT token management
✅ Secure session handling
✅ Different dashboards for each role
"""

import os
import json
import jwt
import datetime
import hashlib
from typing import Dict, Any, Optional, List
from fastapi import HTTPException, status
from database import patients_collection, doctors_collection

class SeparateAuthSystem:
    """Separate authentication for patients and doctors"""
    
    def __init__(self):
        self.jwt_secret = os.getenv("JWT_SECRET", "medschedule_ai_secret_key_2024")
        self.jwt_algorithm = "HS256"
        self.patient_sessions = {}
        self.doctor_sessions = {}
        
    def register_patient(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register a new patient"""
        
        try:
            # Check if patient already exists
            existing_patient = patients_collection.find_one({"email": patient_data["email"]})
            if existing_patient:
                raise HTTPException(
                    status_code=400, 
                    detail="Patient with this email already exists"
                )
            
            # Hash password
            hashed_password = self._hash_password(patient_data["password"])
            
            # Create patient record
            patient_record = {
                "id": f"PAT{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}",
                "name": patient_data["name"],
                "email": patient_data["email"],
                "phone": patient_data.get("phone", ""),
                "password": hashed_password,
                "date_of_birth": patient_data.get("date_of_birth", ""),
                "medical_history": patient_data.get("medical_history", ""),
                "emergency_contact": patient_data.get("emergency_contact", ""),
                "role": "patient",
                "created_at": datetime.datetime.utcnow().isoformat(),
                "status": "active"
            }
            
            # Save to database
            patients_collection.insert_one(patient_record)
            
            # Generate JWT token
            token = self._generate_token(patient_record["id"], "patient")
            
            return {
                "success": True,
                "message": "Patient registered successfully",
                "patient_id": patient_record["id"],
                "token": token,
                "user": {
                    "id": patient_record["id"],
                    "name": patient_record["name"],
                    "email": patient_record["email"],
                    "role": "patient"
                }
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")
    
    def register_doctor(self, doctor_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register a new doctor"""
        
        try:
            # Check if doctor already exists
            existing_doctor = doctors_collection.find_one({"email": doctor_data["email"]})
            if existing_doctor:
                raise HTTPException(
                    status_code=400, 
                    detail="Doctor with this email already exists"
                )
            
            # Hash password
            hashed_password = self._hash_password(doctor_data["password"])
            
            # Create doctor record
            doctor_record = {
                "id": f"DOC{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}",
                "name": doctor_data["name"],
                "email": doctor_data["email"],
                "phone": doctor_data.get("phone", ""),
                "password": hashed_password,
                "specialty": doctor_data.get("specialty", ""),
                "license_number": doctor_data.get("license_number", ""),
                "experience_years": doctor_data.get("experience_years", 0),
                "education": doctor_data.get("education", ""),
                "department": doctor_data.get("department", ""),
                "role": "doctor",
                "created_at": datetime.datetime.utcnow().isoformat(),
                "status": "active"
            }
            
            # Save to database
            doctors_collection.insert_one(doctor_record)
            
            # Generate JWT token
            token = self._generate_token(doctor_record["id"], "doctor")
            
            return {
                "success": True,
                "message": "Doctor registered successfully",
                "doctor_id": doctor_record["id"],
                "token": token,
                "user": {
                    "id": doctor_record["id"],
                    "name": doctor_record["name"],
                    "email": doctor_record["email"],
                    "specialty": doctor_record.get("specialty", ""),
                    "role": "doctor"
                }
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")
    
    def login_patient(self, email: str, password: str) -> Dict[str, Any]:
        """Login patient"""
        
        try:
            # Find patient
            patient = patients_collection.find_one({"email": email})
            if not patient:
                raise HTTPException(status_code=401, detail="Invalid email or password")
            
            # Verify password
            if not self._verify_password(password, patient["password"]):
                raise HTTPException(status_code=401, detail="Invalid email or password")
            
            # Check if patient is active
            if patient.get("status") != "active":
                raise HTTPException(status_code=401, detail="Account is not active")
            
            # Generate JWT token
            token = self._generate_token(patient["id"], "patient")
            
            # Store session
            self.patient_sessions[patient["id"]] = {
                "login_time": datetime.datetime.utcnow().isoformat(),
                "token": token
            }
            
            return {
                "success": True,
                "message": "Patient login successful",
                "token": token,
                "user": {
                    "id": patient["id"],
                    "name": patient["name"],
                    "email": patient["email"],
                    "role": "patient"
                }
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")
    
    def login_doctor(self, email: str, password: str) -> Dict[str, Any]:
        """Login doctor"""
        
        try:
            # Find doctor
            doctor = doctors_collection.find_one({"email": email})
            if not doctor:
                raise HTTPException(status_code=401, detail="Invalid email or password")
            
            # Verify password
            if not self._verify_password(password, doctor["password"]):
                raise HTTPException(status_code=401, detail="Invalid email or password")
            
            # Check if doctor is active
            if doctor.get("status") != "active":
                raise HTTPException(status_code=401, detail="Account is not active")
            
            # Generate JWT token
            token = self._generate_token(doctor["id"], "doctor")
            
            # Store session
            self.doctor_sessions[doctor["id"]] = {
                "login_time": datetime.datetime.utcnow().isoformat(),
                "token": token
            }
            
            return {
                "success": True,
                "message": "Doctor login successful",
                "token": token,
                "user": {
                    "id": doctor["id"],
                    "name": doctor["name"],
                    "email": doctor["email"],
                    "specialty": doctor.get("specialty", ""),
                    "role": "doctor"
                }
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify JWT token and return user info"""
        
        try:
            # Decode token
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            
            user_id = payload.get("user_id")
            role = payload.get("role")
            
            if not user_id or not role:
                raise HTTPException(status_code=401, detail="Invalid token")
            
            # Get user from database
            if role == "patient":
                user = patients_collection.find_one({"id": user_id})
                if not user:
                    raise HTTPException(status_code=401, detail="Patient not found")
            elif role == "doctor":
                user = doctors_collection.find_one({"id": user_id})
                if not user:
                    raise HTTPException(status_code=401, detail="Doctor not found")
            else:
                raise HTTPException(status_code=401, detail="Invalid role")
            
            # Check if user is active
            if user.get("status") != "active":
                raise HTTPException(status_code=401, detail="Account is not active")
            
            return {
                "valid": True,
                "user_id": user_id,
                "role": role,
                "user": {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"],
                    "role": role
                }
            }
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Token verification failed: {str(e)}")
    
    def logout_user(self, token: str) -> Dict[str, Any]:
        """Logout user"""
        
        try:
            # Verify token
            token_data = self.verify_token(token)
            user_id = token_data["user_id"]
            role = token_data["role"]
            
            # Remove from sessions
            if role == "patient" and user_id in self.patient_sessions:
                del self.patient_sessions[user_id]
            elif role == "doctor" and user_id in self.doctor_sessions:
                del self.doctor_sessions[user_id]
            
            return {
                "success": True,
                "message": "Logout successful"
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Logout failed: {str(e)}")
    
    def get_user_dashboard(self, token: str) -> Dict[str, Any]:
        """Get user-specific dashboard data"""
        
        try:
            # Verify token
            token_data = self.verify_token(token)
            user_id = token_data["user_id"]
            role = token_data["role"]
            
            if role == "patient":
                return self._get_patient_dashboard(user_id)
            elif role == "doctor":
                return self._get_doctor_dashboard(user_id)
            else:
                raise HTTPException(status_code=401, detail="Invalid role")
                
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Dashboard fetch failed: {str(e)}")
    
    def _get_patient_dashboard(self, patient_id: str) -> Dict[str, Any]:
        """Get patient dashboard data"""
        
        # Get patient info
        patient = patients_collection.find_one({"id": patient_id})
        
        # Get patient appointments
        from database import appointments_collection
        appointments = list(appointments_collection.find({"patientId": patient_id}))
        
        return {
            "dashboard_type": "patient",
            "user": {
                "id": patient["id"],
                "name": patient["name"],
                "email": patient["email"]
            },
            "appointments": appointments,
            "quick_actions": [
                "Book Appointment",
                "View Appointments", 
                "Medical History",
                "Profile Settings"
            ]
        }
    
    def _get_doctor_dashboard(self, doctor_id: str) -> Dict[str, Any]:
        """Get doctor dashboard data"""
        
        # Get doctor info
        doctor = doctors_collection.find_one({"id": doctor_id})
        
        # Get doctor appointments
        from database import appointments_collection
        appointments = list(appointments_collection.find({"doctorId": doctor_id}))
        
        return {
            "dashboard_type": "doctor",
            "user": {
                "id": doctor["id"],
                "name": doctor["name"],
                "email": doctor["email"],
                "specialty": doctor.get("specialty", "")
            },
            "appointments": appointments,
            "quick_actions": [
                "Manage Schedule",
                "View Appointments",
                "Patient Waitlist",
                "Profile Settings"
            ]
        }
    
    def _hash_password(self, password: str) -> str:
        """Hash password using SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def _verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify password"""
        return self._hash_password(password) == hashed_password
    
    def _generate_token(self, user_id: str, role: str) -> str:
        """Generate JWT token"""
        payload = {
            "user_id": user_id,
            "role": role,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24),
            "iat": datetime.datetime.utcnow()
        }
        return jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)

# Global auth instance
auth_system = SeparateAuthSystem()

# Export functions for FastAPI routes
def register_patient(patient_data: Dict[str, Any]) -> Dict[str, Any]:
    return auth_system.register_patient(patient_data)

def register_doctor(doctor_data: Dict[str, Any]) -> Dict[str, Any]:
    return auth_system.register_doctor(doctor_data)

def login_patient(email: str, password: str) -> Dict[str, Any]:
    return auth_system.login_patient(email, password)

def login_doctor(email: str, password: str) -> Dict[str, Any]:
    return auth_system.login_doctor(email, password)

def verify_token(token: str) -> Dict[str, Any]:
    return auth_system.verify_token(token)

def get_user_dashboard(token: str) -> Dict[str, Any]:
    return auth_system.get_user_dashboard(token)

def logout_user(token: str) -> Dict[str, Any]:
    return auth_system.logout_user(token)

# Example usage
if __name__ == "__main__":
    # Test registration
    patient_data = {
        "name": "John Doe",
        "email": "john@example.com",
        "password": "password123",
        "phone": "123-456-7890"
    }
    
    doctor_data = {
        "name": "Dr. Smith",
        "email": "smith@example.com", 
        "password": "password123",
        "specialty": "Cardiology",
        "license_number": "MD12345"
    }
    
    print("🔐 Testing Separate Authentication System")
    print("=" * 50)
    
    try:
        # Register patient
        patient_result = register_patient(patient_data)
        print(f"✅ Patient Registered: {patient_result['user']['name']}")
        
        # Register doctor
        doctor_result = register_doctor(doctor_data)
        print(f"✅ Doctor Registered: {doctor_result['user']['name']}")
        
        # Login patient
        login_result = login_patient("john@example.com", "password123")
        print(f"✅ Patient Login: {login_result['user']['name']}")
        
        # Get patient dashboard
        dashboard = get_user_dashboard(login_result['token'])
        print(f"✅ Patient Dashboard: {dashboard['dashboard_type']}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
