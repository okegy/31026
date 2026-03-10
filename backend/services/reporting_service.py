from database import appointments_collection, patients_collection, doctors_collection, symptom_reports_collection
import datetime

class ReportingService:
    @staticmethod
    async def get_patient_record(patient_id: str):
        """Compiles a full record of patient's appointments and symptom reports."""
        patient = await patients_collection.find_one({"id": patient_id})
        if not patient:
            return None
            
        appointments = []
        async for apt in appointments_collection.find({"patientId": patient_id}):
            appointments.append(apt)
            
        symptoms = []
        async for sym in symptom_reports_collection.find({"patientId": patient_id}):
            symptoms.append(sym)
            
        return {
            "patient_info": patient,
            "appointment_history": appointments,
            "symptom_analysis_history": symptoms
        }

    @staticmethod
    async def get_doctor_report(doctor_id: str):
        """Compiles a report for the doctor's upcoming and past appointments."""
        doctor = await doctors_collection.find_one({"id": doctor_id})
        if not doctor:
            return None
            
        appointments = []
        async for apt in appointments_collection.find({"doctorId": doctor_id}):
            appointments.append(apt)
            
        return {
            "doctor_info": doctor,
            "appointments": appointments,
            "total_count": len(appointments)
        }

reporting_service = ReportingService()
