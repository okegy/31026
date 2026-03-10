import asyncio
import json
import os

# Mock data
doctors = [
    {"id": "1", "name": "Dr. Sarah Johnson", "speciality": "General Practice", "email": "sarah.johnson@medschedule.com"},
    {"id": "2", "name": "Dr. Michael Chen", "speciality": "Cardiology", "email": "michael.chen@medschedule.com"},
    {"id": "3", "name": "Dr. Emily Davis", "speciality": "Pediatrics", "email": "emily.davis@medschedule.com"}
]

patients = [
    {"id": "patient_123", "name": "John Smith", "email": "john.smith@email.com", "distance_km": 5.2, "urgency": "medium"},
    {"id": "patient_124", "name": "Emily Johnson", "email": "emily.j@email.com", "distance_km": 12.5, "urgency": "high"},
    {"id": "patient_125", "name": "Michael Brown", "email": "michael.b@email.com", "distance_km": 8.1, "urgency": "low"}
]

async def seed():
    db_dir = os.path.join(os.path.dirname(__file__), "local_db")
    os.makedirs(db_dir, exist_ok=True)
    
    with open(os.path.join(db_dir, "doctors.json"), 'w') as f:
        json.dump(doctors, f, indent=2)
    
    with open(os.path.join(db_dir, "patients.json"), 'w') as f:
        json.dump(patients, f, indent=2)
    
    print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
