import asyncio
import json
import os
from datetime import datetime, timedelta

# Mock waitlist data with priority levels
waitlist_entries = [
    {
        "id": "W123456",
        "patient_id": "patient_124",
        "patient_name": "Emily Johnson",
        "patient_email": "emily.j@email.com",
        "doctor_id": "1",
        "doctor_name": "Dr. Sarah Johnson",
        "priority": "urgent",
        "urgency_score": 9,
        "priority_score": 145,
        "symptoms": "chest pain and shortness of breath",
        "notes": "Patient reports chest pain radiating to left arm, needs immediate attention",
        "preferred_dates": ["2026-03-11", "2026-03-12"],
        "status": "waiting",
        "created_at": (datetime.now() - timedelta(hours=2)).isoformat(),
        "rank": 1
    },
    {
        "id": "W123457",
        "patient_id": "patient_126",
        "patient_name": "Robert Williams",
        "patient_email": "robert.w@email.com",
        "doctor_id": "1",
        "doctor_name": "Dr. Sarah Johnson",
        "priority": "high",
        "urgency_score": 7,
        "priority_score": 110,
        "symptoms": "severe migraine for 3 days",
        "notes": "Patient has been experiencing severe migraines, not responding to usual medication",
        "preferred_dates": ["2026-03-12", "2026-03-13"],
        "status": "waiting",
        "created_at": (datetime.now() - timedelta(hours=4)).isoformat(),
        "rank": 2
    },
    {
        "id": "W123458",
        "patient_id": "patient_127",
        "patient_name": "Maria Garcia",
        "patient_email": "maria.g@email.com",
        "doctor_id": "2",
        "doctor_name": "Dr. Michael Chen",
        "priority": "medium",
        "urgency_score": 5,
        "priority_score": 75,
        "symptoms": "routine follow-up for diabetes",
        "notes": "3-month diabetes checkup, needs prescription renewal",
        "preferred_dates": ["2026-03-13", "2026-03-14"],
        "status": "waiting",
        "created_at": (datetime.now() - timedelta(hours=6)).isoformat(),
        "rank": 1
    },
    {
        "id": "W123459",
        "patient_id": "patient_128",
        "patient_name": "James Wilson",
        "patient_email": "james.w@email.com",
        "doctor_id": "2",
        "doctor_name": "Dr. Michael Chen",
        "priority": "high",
        "urgency_score": 8,
        "priority_score": 115,
        "symptoms": "persistent cough and fever",
        "notes": "Patient has had cough for 2 weeks, recent fever of 102°F",
        "preferred_dates": ["2026-03-11", "2026-03-12"],
        "status": "waiting",
        "created_at": (datetime.now() - timedelta(hours=3)).isoformat(),
        "rank": 1
    },
    {
        "id": "W123460",
        "patient_id": "patient_129",
        "patient_name": "Linda Thompson",
        "patient_email": "linda.t@email.com",
        "doctor_id": "3",
        "doctor_name": "Dr. Emily Davis",
        "priority": "low",
        "urgency_score": 3,
        "priority_score": 40,
        "symptoms": "annual checkup",
        "notes": "Routine annual physical examination",
        "preferred_dates": ["2026-03-15", "2026-03-16"],
        "status": "waiting",
        "created_at": (datetime.now() - timedelta(hours=8)).isoformat(),
        "rank": 1
    },
    {
        "id": "W123461",
        "patient_id": "patient_130",
        "patient_name": "David Brown",
        "patient_email": "david.b@email.com",
        "doctor_id": "3",
        "doctor_name": "Dr. Emily Davis",
        "priority": "medium",
        "urgency_score": 6,
        "priority_score": 80,
        "symptoms": "child has fever and rash",
        "notes": "5-year-old child with fever of 101°F and rash on arms and legs",
        "preferred_dates": ["2026-03-11", "2026-03-12"],
        "status": "waiting",
        "created_at": (datetime.now() - timedelta(hours=1)).isoformat(),
        "rank": 2
    }
]

async def seed_waitlist():
    db_dir = os.path.join(os.path.dirname(__file__), "local_db")
    os.makedirs(db_dir, exist_ok=True)
    
    with open(os.path.join(db_dir, "waitlist.json"), 'w') as f:
        json.dump(waitlist_entries, f, indent=2)
    
    print("Waitlist database seeded successfully!")
    print(f"Seeded {len(waitlist_entries)} waitlist entries")
    
    # Print priority breakdown
    urgent_count = len([w for w in waitlist_entries if w["priority"] == "urgent"])
    high_count = len([w for w in waitlist_entries if w["priority"] == "high"])
    medium_count = len([w for w in waitlist_entries if w["priority"] == "medium"])
    low_count = len([w for w in waitlist_entries if w["priority"] == "low"])
    
    print(f"Priority breakdown:")
    print(f"  Urgent: {urgent_count}")
    print(f"  High: {high_count}")
    print(f"  Medium: {medium_count}")
    print(f"  Low: {low_count}")

if __name__ == "__main__":
    asyncio.run(seed_waitlist())
