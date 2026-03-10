// RequestHandler.ts
import { AppointmentIntakeParser, ParsedIntake } from './IntakeParser';
import { DoctorAvailabilityService } from './AvailabilityService';
import { PatientNotificationService } from './NotificationService';
import { appointmentEventLogger } from './EventLogger';

export class AppointmentRequestHandler {
  // processAppointmentRequest hooks into existing endpoints/UI actions
  public static async processRequest(input: string, source: 'voice' | 'chat' | 'web', createExistingTaskFn: any) {
    
    // 1. Parse patient request
    const parsed: ParsedIntake = AppointmentIntakeParser.parse(input, source);

    // 2. Check availability
    const slot = DoctorAvailabilityService.checkDoctorAvailability(parsed.doctor_speciality || 'General', parsed.preferred_date || 'next available');

    // 3 & 4. Suggest and confirm mapping to existing calendar endpoint
    if (slot) {
      // Hook into existing createTask or Google Calendar action
      try {
        await createExistingTaskFn({
          title: `Consultation with ${parsed.patient_name || 'Patient'} (${parsed.doctor_speciality})`,
          description: parsed.reason_for_visit,
          priority: 'medium',
          deadline: new Date(`${slot.date}T${slot.startTime}:00`).toISOString()
        });

        // 5. Trigger email notification simulate
        PatientNotificationService.sendPatientMessage(
          'email', 
          'temp-id', 
          parsed.patient_name || 'Patient', 
          `Your appointment is confirmed for ${slot.date} at ${slot.startTime}.`
        );
        
        appointmentEventLogger.logEvent('appointment_confirmed', `Confirmed for ${parsed.patient_name || 'Patient'}`, slot);

        return { success: true, slot, parsed };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    }

    return { success: false, error: 'No slots available' };
  }
}
