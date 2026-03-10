from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import datetime

from services.google_auth import google_auth
from services.google_calendar import google_calendar
router = APIRouter()

@router.get("/")
async def get_calendar():
    return {"message": "Calendar router ready"}


@router.get("/status")
async def calendar_status():
    creds = google_auth.get_credentials()
    token_valid = bool(creds and getattr(creds, "valid", False))
    service = None
    service_ok = False
    error: Optional[str] = None

    try:
        service = google_calendar.get_service()
        service_ok = bool(service)
    except Exception as e:
        error = str(e)

    return {
        "success": True,
        "status": "ready" if service_ok else "not_ready",
        "authenticated": token_valid,
        "calendar_service": service_ok,
        "error": error,
    }


class AvailabilityRequest(BaseModel):
    date: str  # yyyy-mm-dd
    start_time: str = "09:00"
    end_time: str = "17:00"
    slot_minutes: int = 30


@router.post("/availability")
async def get_availability(payload: AvailabilityRequest):
    """Return availability based on Google Calendar conflicts.

    If Google auth is missing, returns a mock availability response.
    """

    creds = google_auth.get_credentials()
    token_valid = bool(creds and getattr(creds, "valid", False))

    def _time_range(start: str, end: str, step_minutes: int) -> List[str]:
        sh, sm = [int(x) for x in start.split(":")]
        eh, em = [int(x) for x in end.split(":")]
        cur = datetime.datetime(2000, 1, 1, sh, sm)
        stop = datetime.datetime(2000, 1, 1, eh, em)
        out: List[str] = []
        while cur < stop:
            out.append(cur.strftime("%H:%M"))
            cur += datetime.timedelta(minutes=step_minutes)
        return out

    slots = _time_range(payload.start_time, payload.end_time, payload.slot_minutes)

    available: List[str] = []
    if not token_valid:
        # Mock availability if not authenticated
        available = slots
        return {
            "success": True,
            "authenticated": False,
            "date": payload.date,
            "available_slots": available,
            "note": "Google authentication not completed; returning mock availability",
        }

    for t in slots:
        start_time_iso = f"{payload.date}T{t}:00"
        try:
            if not google_calendar.check_conflicts(start_time_iso):
                available.append(t)
        except Exception:
            # If calendar check fails mid-way, just stop and return what we have
            break

    return {
        "success": True,
        "authenticated": True,
        "date": payload.date,
        "available_slots": available,
    }
