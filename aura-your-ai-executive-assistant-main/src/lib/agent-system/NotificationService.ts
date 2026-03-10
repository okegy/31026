// NotificationService.ts
import { appointmentEventLogger } from './EventLogger';

export class PatientNotificationService {
  // Simulates sending an email/WhatsApp/SMS.
  public static sendPatientMessage(channel: 'email' | 'whatsapp' | 'sms', patientId: string, patientName: string, message: string) {
    // In production, integration with Twilio/WhatsApp API/Gmail would occur here.
    
    appointmentEventLogger.logEvent('patient_notified', `Sent via ${channel} to ${patientName}`, { patientId, message });
    console.log(`[${channel.toUpperCase()}] To ${patientName}: ${message}`);
    
    // Simulate WhatsApp sending success
    return true;
  }

  // Doctor Alert System
  public static alertDoctor(doctorName: string, message: string) {
    // In production, integrate Google Calendar update and email alert here
    
    appointmentEventLogger.logEvent('patient_notified', `Doctor Alert Sent to ${doctorName}`, { message });
    console.log(`[DOCTOR ALERT] To ${doctorName}: ${message}`);
    
    return true;
  }
}
