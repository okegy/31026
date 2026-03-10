from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routers import appointments, auth, calendar, doctors, patients, waitlist, webhooks, symptoms, auth_status, priority, chatbot
import uvicorn
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ClinicFlow AI API",
    description="Intelligent clinic scheduling and automation API",
    version="1.0.0"
)

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["Appointments"])
app.include_router(doctors.router, prefix="/api/doctors", tags=["Doctors"])
app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(waitlist.router, prefix="/api/waitlist", tags=["Waitlist"])
app.include_router(priority.router, prefix="/api/priority", tags=["Priority System"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["Google Calendar"])
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["Webhooks"])
app.include_router(symptoms.router, prefix="/api/symptoms", tags=["Symptom Analysis"])
app.include_router(auth_status.router, prefix="/api/auth-status", tags=["Auth Status"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["AI Chatbot"])

@app.get("/")
async def root():
    return {"message": "ClinicFlow AI API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
