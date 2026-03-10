from fastapi import APIRouter
from database import doctors_collection
router = APIRouter()

@router.get("/")
async def list_doctors():
    doctors = []
    async for doc in doctors_collection.find():
        doctors.append(doc)

    return {
        "success": True,
        "doctors": doctors,
        "total": len(doctors),
    }


@router.get("/{doctor_id}/stats")
async def doctor_stats(doctor_id: str):
    """Basic stats for doctor portal (appointments + waitlist counts)."""
    from database import appointments_collection, waitlist_collection

    appointments = []
    async for a in appointments_collection.find({"doctorId": doctor_id}):
        appointments.append(a)

    waitlist = []
    async for w in waitlist_collection.find({"doctor_id": doctor_id}):
        waitlist.append(w)

    scheduled = [a for a in appointments if a.get("status") == "scheduled"]
    completed = [a for a in appointments if a.get("status") == "completed"]
    cancelled = [a for a in appointments if a.get("status") == "cancelled"]

    return {
        "success": True,
        "doctor_id": doctor_id,
        "appointments": {
            "total": len(appointments),
            "scheduled": len(scheduled),
            "completed": len(completed),
            "cancelled": len(cancelled),
        },
        "waitlist": {
            "total": len(waitlist),
            "urgent": len([w for w in waitlist if w.get("priority") == "urgent"]),
            "high": len([w for w in waitlist if w.get("priority") == "high"]),
        },
    }
