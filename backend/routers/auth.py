from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, Literal, Dict, Any
import os
import jwt
import datetime
import hashlib

from database import patients_collection, doctors_collection

router = APIRouter()


JWT_SECRET = os.getenv("JWT_SECRET", "medschedule_ai_secret_key_2024")
JWT_ALGORITHM = "HS256"
JWT_TTL_HOURS = 24


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def _verify_password(password: str, hashed_password: str) -> bool:
    return _hash_password(password) == hashed_password


def _generate_token(user_id: str, role: str) -> str:
    now = datetime.datetime.utcnow()
    payload = {
        "user_id": user_id,
        "role": role,
        "iat": now,
        "exp": now + datetime.timedelta(hours=JWT_TTL_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _decode_token(token: str) -> Dict[str, Any]:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


class RegisterPatientRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = ""


class RegisterDoctorRequest(BaseModel):
    name: str
    email: str
    password: str
    specialty: Optional[str] = ""
    phone: Optional[str] = ""


class LoginRequest(BaseModel):
    email: str
    password: str


@router.get("/")
async def get_auth():
    return {"message": "Auth system ready"}


@router.post("/register/patient")
async def register_patient(payload: RegisterPatientRequest):
    existing = await patients_collection.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Patient with this email already exists")

    user_id = f"PAT{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}"
    record = {
        "id": user_id,
        "name": payload.name,
        "email": payload.email,
        "phone": payload.phone or "",
        "password": _hash_password(payload.password),
        "role": "patient",
        "status": "active",
        "created_at": datetime.datetime.utcnow().isoformat(),
    }

    await patients_collection.insert_one(record)
    token = _generate_token(user_id, "patient")
    return {"success": True, "token": token, "user": {"id": user_id, "name": payload.name, "email": payload.email, "role": "patient"}}


@router.post("/register/doctor")
async def register_doctor(payload: RegisterDoctorRequest):
    existing = await doctors_collection.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Doctor with this email already exists")

    user_id = f"DOC{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}"
    record = {
        "id": user_id,
        "name": payload.name,
        "email": payload.email,
        "phone": payload.phone or "",
        "specialty": payload.specialty or "",
        "password": _hash_password(payload.password),
        "role": "doctor",
        "status": "active",
        "created_at": datetime.datetime.utcnow().isoformat(),
    }

    await doctors_collection.insert_one(record)
    token = _generate_token(user_id, "doctor")
    return {"success": True, "token": token, "user": {"id": user_id, "name": payload.name, "email": payload.email, "role": "doctor", "specialty": payload.specialty or ""}}


@router.post("/login/patient")
async def login_patient(payload: LoginRequest):
    user = await patients_collection.find_one({"email": payload.email})
    if not user or not _verify_password(payload.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.get("status") != "active":
        raise HTTPException(status_code=401, detail="Account is not active")
    token = _generate_token(user["id"], "patient")
    return {"success": True, "token": token, "user": {"id": user["id"], "name": user.get("name"), "email": user.get("email"), "role": "patient"}}


@router.post("/login/doctor")
async def login_doctor(payload: LoginRequest):
    user = await doctors_collection.find_one({"email": payload.email})
    if not user or not _verify_password(payload.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.get("status") != "active":
        raise HTTPException(status_code=401, detail="Account is not active")
    token = _generate_token(user["id"], "doctor")
    return {"success": True, "token": token, "user": {"id": user["id"], "name": user.get("name"), "email": user.get("email"), "role": "doctor", "specialty": user.get("specialty", "")}}


@router.get("/me")
async def me(authorization: Optional[str] = Header(default=None)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = _decode_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("user_id")
    role = payload.get("role")
    if role == "patient":
        user = await patients_collection.find_one({"id": user_id})
    elif role == "doctor":
        user = await doctors_collection.find_one({"id": user_id})
    else:
        user = None

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    safe = {k: v for k, v in user.items() if k != "password"}
    return {"success": True, "user": safe}
