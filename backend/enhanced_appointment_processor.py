"""
🏥 Enhanced Appointment Processor
================================

This module catches appointment booking JSON data, processes it,
sends emails, creates calendar events, and handles everything.

Features:
✅ JSON Data Capture & Processing
✅ Email Notifications  
✅ Google Calendar Events
✅ Database Storage
✅ Error Handling
✅ Refresh Token Management
"""

import json
import uuid
import datetime
import asyncio
from typing import Dict, Any, Optional
from database import appointments_collection, patients_collection, doctors_collection
from services.google_calendar import google_calendar
from services.email_service import email_service
from services.google_auth import google_auth

class AppointmentProcessor:
    """Enhanced appointment processing system"""
    
    def __init__(self):
        self.processed_appointments = []
        self.failed_appointments = []
    
    async def process_appointment_json(self, appointment_json: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process appointment from JSON data
        
        Args:
            appointment_json: Dictionary containing appointment data
            
        Returns:
            Processing result with success/failure status
        """
        
        print(f"🔍 Processing appointment JSON: {json.dumps(appointment_json, indent=2)}")
        
        try:
            # Step 1: Validate JSON data
            required_fields = ['patient_id', 'doctor_id', 'date', 'start_time', 'end_time', 'type']
            for field in required_fields:
                if field not in appointment_json:
                    raise ValueError(f"Missing required field: {field}")
            
            # Step 2: Get patient and doctor information
            doctor_data = await doctors_collection.find_one({"id": appointment_json['doctor_id']})
            patient_data = await patients_collection.find_one({"id": appointment_json['patient_id']})
            
            if not doctor_data:
                raise ValueError(f"Doctor not found: {appointment_json['doctor_id']}")
            if not patient_data:
                raise ValueError(f"Patient not found: {appointment_json['patient_id']}")
            
            print(f"✅ Found patient: {patient_data['name']}")
            print(f"✅ Found doctor: {doctor_data['name']}")
            
            # Step 3: Check Google Calendar availability
            calendar_result = await self._check_calendar_availability(appointment_json)
            if not calendar_result['available']:
                raise ValueError(f"Calendar conflict: {calendar_result['message']}")
            
            # Step 4: Create Google Calendar event
            calendar_event = await self._create_calendar_event(appointment_json, doctor_data, patient_data)
            
            # Step 5: Save to database
            appointment_record = await self._save_to_database(appointment_json, doctor_data, patient_data, calendar_event)
            
            # Step 6: Send email notifications
            email_result = await self._send_email_notifications(appointment_record, doctor_data, patient_data)
            
            # Step 7: Return success
            result = {
                "success": True,
                "appointment_id": appointment_record['id'],
                "message": "Appointment processed successfully!",
                "details": {
                    "patient": patient_data['name'],
                    "doctor": doctor_data['name'],
                    "date": appointment_json['date'],
                    "time": appointment_json['start_time'],
                    "calendar_event_created": calendar_event['success'],
                    "email_sent": email_result['success']
                }
            }
            
            self.processed_appointments.append(result)
            print(f"✅ Appointment processed successfully: {appointment_record['id']}")
            
            return result
            
        except Exception as e:
            error_result = {
                "success": False,
                "error": str(e),
                "appointment_data": appointment_json
            }
            
            self.failed_appointments.append(error_result)
            print(f"❌ Failed to process appointment: {e}")
            
            return error_result
    
    async def _check_calendar_availability(self, appointment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Check Google Calendar availability"""
        
        try:
            start_time_iso = f"{appointment_data['date']}T{appointment_data['start_time']}:00"
            
            # Check if Google auth is working
            creds = google_auth.get_credentials()
            if not creds or not creds.valid:
                print("⚠️ Google auth not available, skipping calendar check")
                return {"available": True, "message": "Calendar check skipped (no auth)"}
            
            # Check for conflicts
            has_conflict = google_calendar.check_conflicts(start_time_iso)
            
            if has_conflict:
                return {"available": False, "message": "Time slot already booked"}
            else:
                return {"available": True, "message": "Time slot available"}
                
        except Exception as e:
            print(f"⚠️ Calendar check failed: {e}")
            return {"available": True, "message": f"Calendar check failed: {e}"}
    
    async def _create_calendar_event(self, appointment_data: Dict[str, Any], doctor_data: Dict, patient_data: Dict) -> Dict[str, Any]:
        """Create Google Calendar event"""
        
        try:
            start_time_iso = f"{appointment_data['date']}T{appointment_data['start_time']}:00"
            end_time_iso = f"{appointment_data['date']}T{appointment_data['end_time']}:00"
            
            event_summary = f"Appointment: {patient_data['name']} with {doctor_data['name']}"
            event_description = f"""MedSchedule AI Appointment
Appointment ID: {uuid.uuid4().hex[:6].upper()}
Type: {appointment_data['type']}
Patient: {patient_data['name']} ({patient_data.get('email', 'N/A')})
Doctor: {doctor_data['name']} ({doctor_data.get('email', 'N/A')})
Date: {appointment_data['date']}
Time: {appointment_data['start_time']} - {appointment_data['end_time']}
Notes: {appointment_data.get('notes', 'No additional notes')}

---
Booked automatically through MedSchedule AI priority system."""
            
            event_id = google_calendar.create_event(
                summary=event_summary,
                description=event_description,
                start_time_iso=start_time_iso,
                location=f"{doctor_data.get('specialty', 'Clinic')} - Virtual Consultation"
            )
            
            if event_id:
                print(f"✅ Google Calendar event created: {event_id}")
                return {"success": True, "event_id": event_id}
            else:
                print("⚠️ Failed to create Google Calendar event")
                return {"success": False, "error": "Calendar event creation failed"}
                
        except Exception as e:
            print(f"❌ Calendar event creation error: {e}")
            return {"success": False, "error": str(e)}
    
    async def _save_to_database(self, appointment_data: Dict[str, Any], doctor_data: Dict, patient_data: Dict, calendar_event: Dict) -> Dict[str, Any]:
        """Save appointment to database"""
        
        apt_id = f"A{uuid.uuid4().hex[:6].upper()}"
        
        doc = {
            "id": apt_id,
            "patientId": appointment_data['patient_id'],
            "patientName": patient_data['name'],
            "patientEmail": patient_data.get('email', 'patient@example.com'),
            "doctorId": appointment_data['doctor_id'],
            "doctorName": doctor_data['name'],
            "doctorEmail": doctor_data.get('email', 'doctor@example.com'),
            "date": appointment_data['date'],
            "startTime": appointment_data['start_time'],
            "endTime": appointment_data['end_time'],
            "type": appointment_data['type'],
            "status": "scheduled",
            "google_event_id": calendar_event.get('event_id'),
            "notes": appointment_data.get('notes', ''),
            "priority": appointment_data.get('priority', 'medium'),
            "urgency_score": appointment_data.get('urgency_score', 5),
            "symptoms": appointment_data.get('symptoms', ''),
            "createdAt": datetime.datetime.utcnow().isoformat(),
            "processed_by": "enhanced_appointment_processor"
        }
        
        await appointments_collection.insert_one(doc)
        print(f"✅ Appointment saved to database: {apt_id}")
        
        return doc
    
    async def _send_email_notifications(self, appointment_record: Dict, doctor_data: Dict, patient_data: Dict) -> Dict[str, Any]:
        """Send email notifications"""
        
        try:
            appointment_details = {
                "id": appointment_record['id'],
                "patient_name": appointment_record['patientName'],
                "doctor_name": appointment_record['doctorName'],
                "date": appointment_record['date'],
                "time": appointment_record['startTime'],
                "type": appointment_record['type'],
                "location": f"{doctor_data.get('specialty', 'Clinic')} - Virtual Consultation",
                "patient_email": appointment_record['patientEmail'],
                "doctor_email": appointment_record['doctorEmail'],
                "notes": appointment_record.get('notes', ''),
                "priority": appointment_record.get('priority', 'medium')
            }
            
            # Send confirmation emails
            email_success = email_service.send_confirmation_email(
                patient_email=appointment_record['patientEmail'],
                doctor_email=appointment_record['doctorEmail'],
                appointment_details=appointment_details
            )
            
            if email_success:
                print(f"✅ Email notifications sent for appointment {appointment_record['id']}")
                return {"success": True, "message": "Emails sent successfully"}
            else:
                print(f"⚠️ Email notifications failed for appointment {appointment_record['id']}")
                return {"success": False, "message": "Email sending failed"}
                
        except Exception as e:
            print(f"❌ Email notification error: {e}")
            return {"success": False, "error": str(e)}
    
    def get_processing_stats(self) -> Dict[str, Any]:
        """Get processing statistics"""
        
        return {
            "total_processed": len(self.processed_appointments),
            "total_failed": len(self.failed_appointments),
            "success_rate": len(self.processed_appointments) / (len(self.processed_appointments) + len(self.failed_appointments)) * 100 if (len(self.processed_appointments) + len(self.failed_appointments)) > 0 else 0,
            "processed_appointments": self.processed_appointments,
            "failed_appointments": self.failed_appointments
        }

# Global processor instance
appointment_processor = AppointmentProcessor()

async def process_appointment_from_json(json_data: Dict[str, Any]) -> Dict[str, Any]:
    """Main function to process appointment from JSON"""
    return await appointment_processor.process_appointment_json(json_data)

# Example usage and testing
if __name__ == "__main__":
    async def test_processor():
        """Test the appointment processor"""
        
        # Test appointment data
        test_appointment = {
            "patient_id": "patient_123",
            "doctor_id": "1",
            "date": "2026-03-15",
            "start_time": "10:00",
            "end_time": "11:00",
            "type": "Urgent Consultation",
            "priority": "urgent",
            "urgency_score": 9,
            "symptoms": "chest pain and difficulty breathing",
            "notes": "Patient reports severe chest pain, needs immediate attention"
        }
        
        print("🧪 Testing Enhanced Appointment Processor")
        print("="*60)
        
        result = await process_appointment_from_json(test_appointment)
        
        print(f"\n📊 Processing Result:")
        print(json.dumps(result, indent=2))
        
        print(f"\n📈 Processing Stats:")
        stats = appointment_processor.get_processing_stats()
        print(json.dumps(stats, indent=2))
    
    # Run test
    asyncio.run(test_processor())
