import os
from google.oauth2.credentials import Credentials
from google.oauth2 import service_account
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

class GoogleAuthService:
    def __init__(self):
        self.client_id = os.getenv("GOOGLE_CLIENT_ID")
        self.client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        self.refresh_token = os.getenv("GOOGLE_REFRESH_TOKEN")
        self.service_account_key_path = os.getenv("GOOGLE_SERVICE_ACCOUNT_KEY_PATH")
        self.impersonate_email = os.getenv("GOOGLE_IMPERSONATE_EMAIL")
        self.scopes = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/gmail.send'
        ]
        self.creds = None

    def get_credentials(self):
        """Returns valid credentials, preferring Service Account if configured, otherwise OAuth."""
        if self.service_account_key_path and self.impersonate_email:
            try:
                creds = service_account.Credentials.from_service_account_file(
                    self.service_account_key_path,
                    scopes=self.scopes
                )
                creds = creds.with_subject(self.impersonate_email)
                self.creds = creds
                return self.creds
            except Exception as e:
                print(f"Service account auth failed: {e}")
                self.creds = None
                return None

        # Fallback to OAuth refresh token
        if not self.creds or not self.creds.valid:
            if self.refresh_token:
                self.creds = Credentials(
                    token=None,
                    refresh_token=self.refresh_token,
                    client_id=self.client_id,
                    client_secret=self.client_secret,
                    token_uri="https://oauth2.googleapis.com/token",
                    scopes=self.scopes
                )
            
            if self.creds and not self.creds.valid:
                try:
                    self.creds.refresh(Request())
                except Exception as e:
                    print(f"Error refreshing token: {e}")
                    self.creds = None

        return self.creds

    def get_service(self, service_name, version):
        """Returns a built Google API service object."""
        creds = self.get_credentials()
        if not creds:
            return None
        return build(service_name, version, credentials=creds)

google_auth = GoogleAuthService()
