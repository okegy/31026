from fastapi import APIRouter
from database import patients_collection
router = APIRouter()

@router.get("/")
async def list_patients():
    patients = []
    async for pat in patients_collection.find():
        patients.append(pat)
    return patients
