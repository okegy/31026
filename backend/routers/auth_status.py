from fastapi import APIRouter
from services.google_auth import google_auth
from services.google_calendar import google_calendar
from services.email_service import email_service

router = APIRouter()

@router.get("/google-status")
async def check_google_auth_status():
    """Check Google authentication status and token validity"""
    status = {
        "google_auth": False,
        "calendar_service": False,
        "gmail_service": False,
        "token_valid": False,
        "error": None
    }
    
    try:
        # Check if we can get credentials
        creds = google_auth.get_credentials()
        if creds and creds.valid:
            status["token_valid"] = True
            status["google_auth"] = True
        
        # Check Calendar service
        calendar_service = google_calendar.get_service()
        if calendar_service:
            status["calendar_service"] = True
            
            # Try to list a calendar event to test access
            try:
                events_result = calendar_service.events().list(
                    calendarId='primary',
                    timeMin='2026-01-01T00:00:00Z',
                    maxResults=1
                ).execute()
                status["calendar_service"] = True
            except Exception as e:
                status["calendar_service"] = False
                status["error"] = f"Calendar API error: {str(e)}"
        
        # Check Gmail service
        gmail_service = email_service.get_service()
        if gmail_service:
            try:
                # Try to list a draft to test access
                gmail_service.users().drafts().list(userId='me').execute()
                status["gmail_service"] = True
            except Exception as e:
                status["gmail_service"] = False
                status["error"] = f"Gmail API error: {str(e)}"
        
        return {
            "success": True,
            "status": status,
            "message": "Google authentication status checked"
        }
        
    except Exception as e:
        return {
            "success": False,
            "status": status,
            "error": f"Authentication check failed: {str(e)}"
        }

@router.post("/test-email")
async def test_email_sending():
    """Test email sending functionality"""
    try:
        gmail_service = email_service.get_service()
        if not gmail_service:
            return {
                "success": False,
                "error": "Gmail service not available"
            }
        
        # Send a test email
        test_email = "test@example.com"  # You can change this
        subject = "Test Email from MedSchedule AI"
        body = """
This is a test email from MedSchedule AI system.

If you receive this email, the Gmail integration is working correctly.

Best regards,
MedSchedule AI Team
        """
        
        success = email_service._send_raw_email(test_email, subject, body)
        
        return {
            "success": success,
            "message": "Test email sent successfully" if success else "Failed to send test email"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Test email failed: {str(e)}"
        }

@router.post("/test-calendar")
async def test_calendar_event():
    """Test Google Calendar event creation"""
    try:
        calendar_service = google_calendar.get_service()
        if not calendar_service:
            return {
                "success": False,
                "error": "Calendar service not available"
            }
        
        # Create a test event
        from datetime import datetime, timedelta
        import uuid
        
        start_time = datetime.now() + timedelta(hours=1)
        end_time = start_time + timedelta(minutes=30)
        
        event = {
            'summary': 'Test Event - MedSchedule AI',
            'description': 'This is a test event to verify Google Calendar integration.',
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': 'UTC',
            },
        }
        
        event_result = calendar_service.events().insert(
            calendarId='primary', 
            body=event
        ).execute()
        
        return {
            "success": True,
            "event_id": event_result.get('id'),
            "message": "Test calendar event created successfully"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Test calendar event failed: {str(e)}"
        }
