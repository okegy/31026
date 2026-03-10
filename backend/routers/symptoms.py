from fastapi import APIRouter
from database import symptom_reports_collection
from pydantic import BaseModel
import datetime

router = APIRouter()

class SymptomAnalysis(BaseModel):
    patient_id: str
    transcript: str
    analysis: dict

@router.post("/")
async def record_symptom_analysis(payload: SymptomAnalysis):
    """Records voice/text NLP analysis of patient symptoms."""
    doc = {
        "patientId": payload.patient_id,
        "transcript": payload.transcript,
        "analysis": payload.analysis,
        "recordedAt": datetime.datetime.utcnow().isoformat()
    }
    await symptom_reports_collection.insert_one(doc)
    return {"success": True, "message": "Symptom analysis recorded successfully"}

from services.reporting_service import reporting_service

@router.get("/report/{patient_id}")
async def get_patient_full_report(patient_id: str):
    """Returns a full record of patient's medical history and appointments."""
    report = await reporting_service.get_patient_record(patient_id)
    if not report:
        raise HTTPException(status_code=404, detail="Patient not found")
    return report

@router.get("/doctor-report/{doctor_id}")
async def get_doctor_full_report(doctor_id: str):
    """Returns a full record of doctor's appointments."""
    report = await reporting_service.get_doctor_report(doctor_id)
    if not report:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return report
