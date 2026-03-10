from .google_auth import google_auth
from datetime import datetime, timedelta

class GoogleCalendarService:
    def __init__(self):
        self.calendar_id = 'primary'

    def get_service(self):
        return google_auth.get_service('calendar', 'v3')

    def check_conflicts(self, start_time_iso, duration_minutes=30):
        """Checks if there's any event overlapping with the requested time."""
        service = self.get_service()
        if not service:
            return True # Assume conflict if service is unavailable

        start_dt = datetime.fromisoformat(start_time_iso)
        end_dt = start_dt + timedelta(minutes=duration_minutes)

        time_min = start_dt.isoformat() + 'Z'
        time_max = end_dt.isoformat() + 'Z'

        try:
            events_result = service.events().list(
                calendarId=self.calendar_id,
                timeMin=time_min,
                timeMax=time_max,
                singleEvents=True
            ).execute()
            events = events_result.get('items', [])
            return len(events) > 0
        except Exception as e:
            print(f"Error checking conflicts: {e}")
            return True

    def create_event(self, summary, description, start_time_iso, duration_minutes=30, location=None):
        """Creates a Google Calendar event."""
        service = self.get_service()
        if not service:
            return None

        start_dt = datetime.fromisoformat(start_time_iso)
        end_dt = start_dt + timedelta(minutes=duration_minutes)

        event = {
            'summary': summary,
            'description': description,
            'start': {
                'dateTime': start_dt.isoformat(),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': end_dt.isoformat(),
                'timeZone': 'UTC',
            },
            'location': location,
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},
                    {'method': 'popup', 'minutes': 10},
                ],
            },
        }

        try:
            event = service.events().insert(calendarId=self.calendar_id, body=event).execute()
            return event.get('id')
        except Exception as e:
            print(f"Error creating event: {e}")
            return None

google_calendar = GoogleCalendarService()
