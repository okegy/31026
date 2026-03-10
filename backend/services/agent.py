import datetime
from services.google_calendar import google_calendar
from services.email_service import email_service
from database import appointments_collection, patients_collection, doctors_collection, logs_collection
import uuid

class AppointmentAgent:
    @staticmethod
    async def process_booking(patient_id: str, doctor_id: str, preferred_date: str, preferred_time: str, appointment_type: str, notes: str = ""):
        """The full workflow for an AI-powered appointment booking."""
        
        # 1. AI Analysis (Mocked or calling actual NLP service)
        print(f"Agent analyzing booking for patient {patient_id}")
        
        # 2. Check doctor availability via Google Calendar
        start_time_iso = f"{preferred_date}T{preferred_time}:00"
        if google_calendar.check_conflicts(start_time_iso):
            return {"success": False, "error": "Conflict detected on doctor's calendar."}
        
        # 3. Fetch doctor and patient data
        doctor = await doctors_collection.find_one({"id": doctor_id})
        patient = await patients_collection.find_one({"id": patient_id})
        
        if not doctor or not patient:
            return {"success": False, "error": "Doctor or Patient not found in system."}

        # 4. Create Google Calendar event
        summary = f"ClinicFlow AI: {patient['name']} with {doctor['name']}"
        description = f"Type: {appointment_type}\nNotes: {notes}"
        event_id = google_calendar.create_event(
            summary=summary,
            description=description,
            start_time_iso=start_time_iso,
            location="MedFlow Clinic"
        )
        
        if not event_id:
            return {"success": False, "error": "Google Calendar service failure."}

        # 5. Save to MongoDB (Local JSON)
        apt_id = f"A{uuid.uuid4().hex[:6].upper()}"
        appointment_doc = {
            "id": apt_id,
            "patientId": patient_id,
            "patientName": patient["name"],
            "doctorId": doctor_id,
            "doctorName": doctor["name"],
            "date": preferred_date,
            "startTime": preferred_time,
            "status": "confirmed",
            "googleEventId": event_id,
            "type": appointment_type,
            "createdAt": datetime.datetime.utcnow().isoformat()
        }
        await appointments_collection.insert_one(appointment_doc)
        
        # 6. Send Gmail notifications
        email_service.send_confirmation_email(
            patient_email=patient["email"],
            doctor_email=doctor["email"],
            appointment_details={
                "id": apt_id,
                "patient_name": patient["name"],
                "doctor_name": doctor["name"],
                "date": preferred_date,
                "time": preferred_time,
                "location": "MedFlow Clinic"
            }
        )
        
        # 7. Log event
        await logs_collection.insert_one({
            "action": "appointment_confirmed",
            "details": appointment_doc,
            "timestamp": datetime.datetime.utcnow().isoformat()
        })
        
        return {"success": True, "appointment_id": apt_id, "google_event_id": event_id}

appointment_agent = AppointmentAgent()
