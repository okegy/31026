# Google OAuth Setup Guide for MedSchedule AI

## Problem Identified
The current Google authentication is failing because the refresh token is invalid. The error shows:
```
Error refreshing token: ('invalid_grant: Bad Request', {'error': 'invalid_grant', 'error_description': 'Bad Request'})
```

## Solution: Proper Google OAuth Setup

### Step 1: Get Valid Google Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select existing one
3. **Enable APIs**:
   - Google Calendar API
   - Gmail API
4. **Create OAuth 2.0 Credentials**:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Add redirect URI: `http://localhost:8000/auth/callback`
   - Download the JSON file

### Step 2: Generate Refresh Token

Create a temporary script to get the refresh token:

```python
# create_refresh_token.py
import os
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials

def get_refresh_token():
    flow = Flow.from_client_secrets_file(
        'client_secret.json',  # Your downloaded JSON file
        scopes=['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/gmail.send']
    )
    
    flow.redirect_uri = 'http://localhost:8000/auth/callback'
    
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'  # Important for getting refresh token
    )
    
    print(f"Go to this URL and authorize: {authorization_url}")
    print(f"After authorization, you'll be redirected to: {flow.redirect_uri}")
    print("Copy the 'code' parameter from the redirect URL")
    
    auth_code = input("Enter the authorization code: ")
    
    flow.fetch_token(code=auth_code)
    credentials = flow.credentials
    
    print(f"Refresh Token: {credentials.refresh_token}")
    print(f"Access Token: {credentials.token}")
    
    return credentials

if __name__ == "__main__":
    get_refresh_token()
```

### Step 3: Update Environment Variables

Update your `.env` file with the new credentials:

```env
GOOGLE_CLIENT_ID="your_client_id_here"
GOOGLE_CLIENT_SECRET="your_client_secret_here"
GOOGLE_REFRESH_TOKEN="your_new_refresh_token_here"
OPENAI_API_KEY="your_openai_key"
```

### Step 4: Test the Setup

Run the test script again:

```bash
python test_google_auth.py
```

You should see:
- ✓ Client ID
- ✓ Client Secret  
- ✓ Refresh Token
- ✓ Credentials: Valid
- ✓ Calendar Service: Available
- ✓ Gmail Service: Available

## Alternative: Use Service Account (Recommended for Production)

For production, consider using a Service Account instead of OAuth 2.0:

1. **Create Service Account** in Google Cloud Console
2. **Enable Domain-Wide Delegation** for Calendar and Gmail
3. **Download JSON key file**
4. **Update authentication code** to use service account

### Service Account Code Example:

```python
from google.oauth2 import service_account
from googleapiclient.discovery import build

def get_service_account_service(service_name, version):
    credentials = service_account.Credentials.from_service_account_file(
        'service_account.json',
        scopes=['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/gmail.send']
    )
    return build(service_name, version, credentials=credentials)
```

## Current Status

✅ **Priority System**: Fully implemented with scoring algorithms
✅ **Waitlist Management**: Complete with auto-assignment
✅ **Patient Portal**: Enhanced with priority assessment
✅ **Doctor Portal**: Includes waitlist management
✅ **Mock Data**: 6 realistic waitlist entries seeded

❌ **Google Integration**: Needs valid refresh token

## Next Steps

1. Follow the OAuth setup above to get valid credentials
2. Update your `.env` file with the new refresh token
3. Test the integration with `python test_google_auth.py`
4. Once working, the system will automatically:
   - Create Google Calendar events
   - Send professional email notifications
   - Sync appointments across platforms

## Testing Priority System

You can test the priority system without Google auth:

1. Go to Patient Portal → Book Appointment
2. Click "Assess" for priority evaluation
3. Select urgency level and symptoms
4. Book appointment to see priority scoring
5. Go to Doctor Portal → Waitlist Management
6. Use auto-assignment to test waitlist algorithms

The priority system works independently of Google integration!
