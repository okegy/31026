import base64
from email.message import EmailMessage
from .google_auth import google_auth

class EmailService:
    def __init__(self):
        pass

    def get_service(self):
        return google_auth.get_service('gmail', 'v1')

    def send_confirmation_email(self, patient_email, doctor_email, appointment_details):
        """Sends confirmation emails using Gmail API."""
        service = self.get_service()
        if not service:
            print("Email service unavailable - no valid credentials")
            return False

        # Patient email
        patient_subject = f"Appointment Confirmed: {appointment_details['doctor_name']} - {appointment_details['date']}"
        patient_body = self._get_patient_email_template(appointment_details)
        
        # Doctor email
        doctor_subject = f"New Appointment: {appointment_details['patient_name']} - {appointment_details['date']}"
        doctor_body = self._get_doctor_email_template(appointment_details)

        patient_success = self._send_raw_email(patient_email, patient_subject, patient_body)
        doctor_success = self._send_raw_email(doctor_email, doctor_subject, doctor_body)

        if patient_success:
            print(f"✓ Confirmation email sent to patient: {patient_email}")
        if doctor_success:
            print(f"✓ Notification email sent to doctor: {doctor_email}")
        
        return patient_success and doctor_success

    def _get_patient_email_template(self, appointment_details):
        """Generate patient confirmation email template."""
        return f"""
Dear {appointment_details.get('patient_name', 'Patient')},

Your appointment has been successfully confirmed!

📅 APPOINTMENT DETAILS:
• Appointment ID: {appointment_details['id']}
• Doctor: {appointment_details['doctor_name']}
• Date: {appointment_details['date']}
• Time: {appointment_details['time']}
• Type: {appointment_details.get('type', 'General Consultation')}
• Location: {appointment_details.get('location', 'Virtual Clinic')}

📋 WHAT TO EXPECT:
• Please arrive 10 minutes before your scheduled time
• Bring your ID and any relevant medical documents
• If this is a virtual consultation, you'll receive a separate link 30 minutes before

🔔 REMINDERS:
• You'll receive an email reminder 24 hours before your appointment
• Another reminder will be sent 2 hours before the appointment

❓ NEED TO MAKE CHANGES?
• Reply to this email if you need to reschedule or cancel
• Call us at +1-800-MEDSCHEDULE for immediate assistance

Thank you for choosing our healthcare services!

Best regards,
{appointment_details['doctor_name']}
MedSchedule AI Team

---
This is an automated message. Please do not reply to this email for medical emergencies.
For medical emergencies, please call 911 or visit your nearest emergency room.
        """

    def _get_doctor_email_template(self, appointment_details):
        """Generate doctor notification email template."""
        return f"""
Dr. {appointment_details['doctor_name']},

You have a new appointment scheduled!

📅 NEW APPOINTMENT:
• Patient: {appointment_details['patient_name']}
• Appointment ID: {appointment_details['id']}
• Date: {appointment_details['date']}
• Time: {appointment_details['time']}
• Type: {appointment_details.get('type', 'General Consultation')}
• Location: {appointment_details.get('location', 'Virtual Clinic')}

📋 PATIENT NOTES:
{appointment_details.get('notes', 'No additional notes provided')}

🔔 REMINDERS:
• This appointment has been automatically added to your Google Calendar
• Patient will receive automated reminders
• Please review patient information before the consultation

📞 CONTACT INFORMATION:
• Patient Email: {appointment_details.get('patient_email', 'Not provided')}
• Appointment ID for reference: {appointment_details['id']}

Best regards,
MedSchedule AI System

---
This is an automated notification from the MedSchedule AI booking system.
        """

    def _send_raw_email(self, to_email, subject, body):
        service = self.get_service()
        if not service:
            return False

        message = EmailMessage()
        message.set_content(body)
        message['To'] = to_email
        message['From'] = 'me' # me refers to the authenticated user
        message['Subject'] = subject

        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

        create_message = {
            'raw': encoded_message
        }

        try:
            service.users().messages().send(userId='me', body=create_message).execute()
            return True
        except Exception as e:
            print(f"Error sending email: {e}")
            return False

email_service = EmailService()
