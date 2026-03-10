from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uuid
import datetime
from database import appointments_collection, patients_collection, doctors_collection
from services.google_calendar import google_calendar
from services.email_service import email_service

router = APIRouter()


def _to_ics_datetime(date_str: str, time_str: str) -> str:
    # expects yyyy-mm-dd and HH:MM
    dt = datetime.datetime.fromisoformat(f"{date_str}T{time_str}:00")
    return dt.strftime("%Y%m%dT%H%M%S")


def _generate_ics(appointment_id: str, doctor_name: str, patient_name: str, date_str: str, start_time: str, end_time: str, description: str = "", location: str = "Virtual Clinic") -> str:
    uid = f"{appointment_id}@medschedule-ai"
    dtstamp = datetime.datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    dtstart = _to_ics_datetime(date_str, start_time)
    dtend = _to_ics_datetime(date_str, end_time)
    summary = f"Appointment: {patient_name} with {doctor_name}"
    safe_description = (description or "").replace("\n", "\\n")
    safe_location = (location or "").replace("\n", " ")

    return "\r\n".join(
        [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//MedSchedule AI//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            "BEGIN:VEVENT",
            f"UID:{uid}",
            f"DTSTAMP:{dtstamp}",
            f"DTSTART:{dtstart}",
            f"DTEND:{dtend}",
            f"SUMMARY:{summary}",
            f"LOCATION:{safe_location}",
            f"DESCRIPTION:{safe_description}",
            "END:VEVENT",
            "END:VCALENDAR",
            "",
        ]
    )

class AppointmentCreate(BaseModel):
    patient_id: str
    doctor_id: str
    date: str
    start_time: str
    end_time: str
    type: str
    notes: Optional[str] = None

@router.post("/")
async def create_appointment(payload: AppointmentCreate):
    try:
        # Step 1: Validate appointment details
        print(f"Creating appointment: Doctor {payload.doctor_id}, Patient {payload.patient_id}, Date {payload.date}")
        
        # Step 2: Get doctor and patient information
        doctor_data = await doctors_collection.find_one({"id": payload.doctor_id})
        patient_data = await patients_collection.find_one({"id": payload.patient_id})
        
        if not doctor_data:
            raise HTTPException(status_code=404, detail="Doctor not found")
        if not patient_data:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Step 3: Check doctor availability via Google Calendar (best-effort)
        start_time_iso = f"{payload.date}T{payload.start_time}:00"
        try:
            if google_calendar.check_conflicts(start_time_iso):
                raise HTTPException(status_code=400, detail="Booking conflict: Slot already taken on Google Calendar")
        except Exception:
            # If Google isn't authenticated, still allow local booking.
            pass
        
        # Step 4: Create Google Calendar event
        doctor_name = doctor_data["name"]
        patient_name = patient_data["name"]
        
        event_summary = f"Appointment: {patient_name} with {doctor_name}"
        event_description = f"""MedSchedule AI Appointment ID: {uuid.uuid4().hex[:6].upper()}
Type: {payload.type}
Patient: {patient_name}
Doctor: {doctor_name}
Notes: {payload.notes or 'No additional notes'}
---
This appointment was booked automatically through MedSchedule AI system."""
        
        event_id = None
        try:
            event_id = google_calendar.create_event(
                summary=event_summary,
                description=event_description,
                start_time_iso=start_time_iso,
                location="Virtual Clinic"
            )
        except Exception:
            event_id = None
        
        if not event_id:
            print("Warning: Failed to create Google Calendar event, proceeding with local booking")
        
        # Step 5: Save appointment to local database
        apt_id = f"A{uuid.uuid4().hex[:6].upper()}"
        doc = {
            "id": apt_id,
            "patientId": payload.patient_id,
            "patientName": patient_name,
            "patientEmail": patient_data.get("email", "patient@example.com"),
            "doctorId": payload.doctor_id,
            "doctorName": doctor_name,
            "doctorEmail": doctor_data.get("email", "doctor@example.com"),
            "date": payload.date,
            "startTime": payload.start_time,
            "endTime": payload.end_time,
            "type": payload.type,
            "status": "scheduled",
            "google_event_id": event_id,
            "notes": payload.notes,
            "createdAt": datetime.datetime.utcnow().isoformat()
        }
        
        await appointments_collection.insert_one(doc)

        ics = _generate_ics(
            appointment_id=apt_id,
            doctor_name=doctor_name,
            patient_name=patient_name,
            date_str=payload.date,
            start_time=payload.start_time,
            end_time=payload.end_time,
            description=event_description,
            location="Virtual Clinic",
        )
        
        # Step 6: Send email confirmations
        appointment_details = {
            "id": apt_id,
            "patient_name": patient_name,
            "doctor_name": doctor_name,
            "date": payload.date,
            "time": payload.start_time,
            "type": payload.type,
            "location": "Virtual Clinic",
            "patient_email": patient_data.get("email"),
            "notes": payload.notes
        }
        
        # Email disabled (calendar-only mode)
        email_success = False
        print("Email notifications disabled (calendar-only mode)")
        
        # Step 7: Return success response
        return {
            "success": True, 
            "message": "Appointment confirmed successfully!",
            "appointment_id": apt_id,
            "ics": ics,
            "details": {
                "doctor": doctor_name,
                "date": payload.date,
                "time": payload.start_time,
                "type": payload.type,
                "email_sent": email_success
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating appointment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to book appointment: {str(e)}")


@router.get("/{appointment_id}/invite")
async def get_invite(appointment_id: str):
    apt = await appointments_collection.find_one({"id": appointment_id})
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    ics = _generate_ics(
        appointment_id=appointment_id,
        doctor_name=apt.get("doctorName", "Doctor"),
        patient_name=apt.get("patientName", "Patient"),
        date_str=apt.get("date"),
        start_time=apt.get("startTime"),
        end_time=apt.get("endTime"),
        description=apt.get("notes", ""),
        location="Virtual Clinic",
    )

    return {
        "success": True,
        "appointment_id": appointment_id,
        "filename": f"appointment-{appointment_id}.ics",
        "ics": ics,
    }


@router.get("/doctor/{doctor_id}")
async def list_doctor_appointments(doctor_id: str):
    items = []
    async for doc in appointments_collection.find({"doctorId": doctor_id}):
        items.append(doc)
    return {"success": True, "appointments": items, "total": len(items)}


@router.get("/patient/{patient_id}")
async def list_patient_appointments(patient_id: str):
    items = []
    async for doc in appointments_collection.find({"patientId": patient_id}):
        items.append(doc)
    return {"success": True, "appointments": items, "total": len(items)}


@router.post("/{appointment_id}/cancel")
async def cancel_appointment(appointment_id: str):
    existing = await appointments_collection.find_one({"id": appointment_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Appointment not found")
    await appointments_collection.update_one({"id": appointment_id}, {"$set": {"status": "cancelled"}})
    return {"success": True, "message": "Appointment cancelled"}


@router.post("/{appointment_id}/complete")
async def complete_appointment(appointment_id: str):
    existing = await appointments_collection.find_one({"id": appointment_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Appointment not found")
    await appointments_collection.update_one({"id": appointment_id}, {"$set": {"status": "completed"}})
    return {"success": True, "message": "Appointment completed"}
