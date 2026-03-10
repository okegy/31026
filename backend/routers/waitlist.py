from fastapi import APIRouter
from database import waitlist_collection
router = APIRouter()

@router.get("/")
async def list_waitlist():
    waitlist = []
    async for item in waitlist_collection.find():
        waitlist.append(item)
    return waitlist
