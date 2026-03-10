from fastapi import APIRouter
router = APIRouter()

@router.post("/whatsapp")
async def whatsapp_webhook(data: dict):
    return {"status": "received"}

@router.post("/n8n")
async def n8n_webhook(data: dict):
    return {"status": "received"}
