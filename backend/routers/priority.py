from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import datetime
import uuid
from database import appointments_collection, patients_collection, waitlist_collection

router = APIRouter()

class PriorityAppointment(BaseModel):
    patient_id: str
    doctor_id: str
    date: str
    start_time: str
    end_time: str
    type: str
    priority: str  # "urgent", "high", "medium", "low"
    urgency_score: int = 5  # 1-10
    notes: Optional[str] = None
    symptoms: Optional[str] = None

class WaitlistEntry(BaseModel):
    patient_id: str
    patient_name: str
    patient_email: str
    doctor_id: str
    doctor_name: str
    priority: str
    urgency_score: int  # 1-10, where 10 is most urgent
    symptoms: Optional[str] = None
    notes: Optional[str] = None
    preferred_dates: Optional[List[str]] = []
    created_at: str

def calculate_priority_score(priority: str, urgency_score: int, symptoms: str = "") -> int:
    """Calculate a priority score based on multiple factors"""
    priority_weights = {
        "urgent": 100,
        "high": 75,
        "medium": 50,
        "low": 25
    }
    
    base_score = priority_weights.get(priority, 25)
    urgency_bonus = urgency_score * 5
    
    # Bonus for critical symptoms
    critical_symptoms = ["chest pain", "difficulty breathing", "severe bleeding", "unconscious"]
    symptom_bonus = 50 if any(symptom in symptoms.lower() for symptom in critical_symptoms) else 0
    
    return base_score + urgency_bonus + symptom_bonus

@router.post("/priority-appointment")
async def create_priority_appointment(payload: PriorityAppointment):
    """Create an appointment with priority consideration"""
    try:
        # Check if slot is available
        from services.google_calendar import google_calendar
        start_time_iso = f"{payload.date}T{payload.start_time}:00"
        
        # For now, skip Google Calendar check since auth is not working
        # if google_calendar.check_conflicts(start_time_iso):
        #     raise HTTPException(status_code=400, detail="Booking conflict: Slot already taken")
        
        # Get patient and doctor info
        doctor_data = await doctors_collection.find_one({"id": payload.doctor_id})
        patient_data = await patients_collection.find_one({"id": payload.patient_id})
        
        if not doctor_data or not patient_data:
            raise HTTPException(status_code=404, detail="Doctor or patient not found")
        
        # Calculate priority score
        priority_score = calculate_priority_score(
            payload.priority, 
            payload.urgency_score,
            payload.symptoms or ""
        )
        
        # Create appointment
        apt_id = f"A{uuid.uuid4().hex[:6].upper()}"
        doc = {
            "id": apt_id,
            "patientId": payload.patient_id,
            "patientName": patient_data["name"],
            "patientEmail": patient_data.get("email", "patient@example.com"),
            "doctorId": payload.doctor_id,
            "doctorName": doctor_data["name"],
            "doctorEmail": doctor_data.get("email", "doctor@example.com"),
            "date": payload.date,
            "startTime": payload.start_time,
            "endTime": payload.end_time,
            "type": payload.type,
            "priority": payload.priority,
            "priority_score": priority_score,
            "symptoms": payload.symptoms,
            "status": "scheduled",
            "google_event_id": None,  # Will be added when Google auth is fixed
            "notes": payload.notes,
            "createdAt": datetime.datetime.utcnow().isoformat()
        }
        
        await appointments_collection.insert_one(doc)
        
        return {
            "success": True,
            "message": f"Priority appointment created with priority: {payload.priority}",
            "appointment_id": apt_id,
            "priority_score": priority_score,
            "details": {
                "doctor": doctor_data["name"],
                "date": payload.date,
                "time": payload.start_time,
                "priority": payload.priority,
                "type": payload.type
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create priority appointment: {str(e)}")

@router.post("/waitlist")
async def add_to_waitlist(payload: WaitlistEntry):
    """Add patient to waitlist with priority ranking"""
    try:
        # Calculate priority score
        priority_score = calculate_priority_score(
            payload.priority,
            payload.urgency_score,
            payload.symptoms or ""
        )
        
        # Create waitlist entry
        waitlist_id = f"W{uuid.uuid4().hex[:6].upper()}"
        entry = {
            "id": waitlist_id,
            "patient_id": payload.patient_id,
            "patient_name": payload.patient_name,
            "patient_email": payload.patient_email,
            "doctor_id": payload.doctor_id,
            "doctor_name": payload.doctor_name,
            "priority": payload.priority,
            "urgency_score": payload.urgency_score,
            "priority_score": priority_score,
            "symptoms": payload.symptoms,
            "notes": payload.notes,
            "preferred_dates": payload.preferred_dates,
            "status": "waiting",
            "created_at": payload.created_at,
            "rank": 0  # Will be calculated based on priority
        }
        
        await waitlist_collection.insert_one(entry)
        
        # Update ranking for all waitlist entries
        await update_waitlist_rankings(payload.doctor_id)
        
        return {
            "success": True,
            "message": "Added to waitlist successfully",
            "waitlist_id": waitlist_id,
            "priority_score": priority_score
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add to waitlist: {str(e)}")

async def update_waitlist_rankings(doctor_id: str):
    """Update waitlist rankings based on priority scores"""
    try:
        # Get all waitlist entries for this doctor
        waitlist_data = waitlist_collection.find({"doctor_id": doctor_id})
        
        # Sort by priority score (descending) and creation time (ascending)
        sorted_entries = sorted(
            waitlist_data,
            key=lambda x: (-x.get("priority_score", 0), x.get("created_at", ""))
        )
        
        # Update rankings
        for rank, entry in enumerate(sorted_entries, 1):
            await waitlist_collection.update_one(
                {"id": entry["id"]},
                {"$set": {"rank": rank}}
            )
            
    except Exception as e:
        print(f"Error updating waitlist rankings: {e}")

@router.get("/waitlist/{doctor_id}")
async def get_waitlist(doctor_id: str):
    """Get ranked waitlist for a specific doctor"""
    try:
        waitlist_data = waitlist_collection.find({"doctor_id": doctor_id})
        sorted_entries = sorted(
            waitlist_data,
            key=lambda x: (-x.get("priority_score", 0), x.get("created_at", ""))
        )
        
        return {
            "success": True,
            "waitlist": sorted_entries,
            "total_count": len(sorted_entries)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get waitlist: {str(e)}")

class AutoAssignRequest(BaseModel):
    date: str
    time: str


@router.post("/auto-assign/{doctor_id}")
async def auto_assign_from_waitlist(
    doctor_id: str,
    payload: Optional[AutoAssignRequest] = None,
    available_date: Optional[str] = None,
    available_time: Optional[str] = None,
):
    """Automatically assign highest priority waitlist patient to available slot"""
    try:
        # Support both body payload (frontend) and query params (legacy)
        if payload is not None:
            available_date = payload.date
            available_time = payload.time

        if not available_date or not available_time:
            raise HTTPException(status_code=400, detail="available_date and available_time are required")

        # Get top-ranked waitlist patient
        waitlist_data = waitlist_collection.find({"doctor_id": doctor_id})
        sorted_entries = sorted(
            waitlist_data,
            key=lambda x: (-x.get("priority_score", 0), x.get("created_at", ""))
        )
        
        if not sorted_entries:
            return {
                "success": False,
                "message": "No patients in waitlist"
            }
        
        top_patient = sorted_entries[0]
        
        # Create appointment for top patient
        appointment_data = PriorityAppointment(
            patient_id=top_patient["patient_id"],
            doctor_id=doctor_id,
            date=available_date,
            start_time=available_time,
            end_time="15:00",  # Default 1-hour appointment
            type="Auto-assigned from Waitlist",
            priority=top_patient["priority"],
            notes=top_patient.get("notes", ""),
            symptoms=top_patient.get("symptoms", "")
        )
        
        # Create appointment
        result = await create_priority_appointment(appointment_data)
        
        # Remove from waitlist
        await waitlist_collection.delete_one({"id": top_patient["id"]})
        
        # Update rankings
        await update_waitlist_rankings(doctor_id)
        
        return {
            "success": True,
            "message": f"Auto-assigned {top_patient['patient_name']} to available slot",
            "appointment": result,
            "removed_from_waitlist": top_patient["id"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to auto-assign: {str(e)}")

# Import doctors_collection for use in functions
from database import doctors_collection
