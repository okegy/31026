// RecoveryAgent.ts
import { WaitlistRankingEngine } from './WaitlistEngine';
import { PatientNotificationService } from './NotificationService';
import { appointmentEventLogger } from './EventLogger';
import { mockCalendarEvents } from './mockWaitlist';

export class SlotRecoveryAgent {
  // Store pending slot confirmation requests
  public static pendingConfirmations: Record<string, {
    slotId: string,
    speciality: string,
    notifiedPatients: any[],
    status: 'pending' | 'filled' | 'escalation_needed',
    timestamp: number
  }> = {};

  // Runs every 2 minutes (simulated)
  public static runCancellationMonitor() {
    // 1. Fetch calendar events (mocked)
    const cancelledEvents = mockCalendarEvents.filter(e => e.status === 'cancelled');

    // 2. Trigger slot recovery for newly detected cancellations
    cancelledEvents.forEach(event => {
      // In prod, check if we've already tried to recover this event
      if (!this.pendingConfirmations[event.id]) {
        appointmentEventLogger.logEvent('slot_cancelled', `Cancellation detected for ${event.title}`, event);
        this.recoverSlot(event.id, event.doctor.includes('Sarah') || event.doctor.includes('John') ? 'Cardiology' : 'Neurology', event.start);
      }
    });

    // Handle escalation for unconfirmed slots after 30 mins
    this.checkEscalations();
  }

  private static checkEscalations() {
    const now = Date.now();
    for (const [slotId, data] of Object.entries(this.pendingConfirmations)) {
      if (data.status === 'pending') {
        // If 30 "minutes" have passed (we simulate with 30 seconds for demo purposes)
        if (now - data.timestamp > 30000) { 
          // Escalate!
          data.status = 'escalation_needed';
          appointmentEventLogger.logEvent('slot_reassigned', `Slot ${slotId} unconfirmed for 30 mins. Escalating to next waitlisted.`, { slotId });
          
          // Next 3 patients logic could be added here
        }
      }
    }
  }

  public static recoverSlot(slotId: string, speciality: string, dateStr: string) {
    // 1. Query Waitlist & Rank top 3
    const topPatients = WaitlistRankingEngine.rankPatients(speciality);
    
    if (topPatients.length === 0) {
      console.log('No waitlist patients found for slot recovery.');
      return;
    }

    this.pendingConfirmations[slotId] = {
      slotId,
      speciality,
      notifiedPatients: topPatients,
      status: 'pending',
      timestamp: Date.now()
    };

    // 4. Send Notifications
    topPatients.forEach(patient => {
      PatientNotificationService.sendPatientMessage(
        'whatsapp', 
        patient.id, 
        patient.name, 
        `Appointment slot available on ${new Date(dateStr).toLocaleString()} with ${speciality}. Reply YES to confirm.`
      );
    });
  }

  // First come First served logic (Handling fake replies)
  public static handlePatientReply(patientId: string, patientName: string, slotId: string, reply: string) {
    if (!this.pendingConfirmations[slotId]) return "Invalid Slot";
    
    const slotInfo = this.pendingConfirmations[slotId];
    
    if (reply.toUpperCase() === 'YES') {
      if (slotInfo.status === 'filled') {
        PatientNotificationService.sendPatientMessage('whatsapp', patientId, patientName, 'Sorry, the slot has already been filled.');
        return false; // Slot already taken
      }

      // First one gets it
      slotInfo.status = 'filled';
      appointmentEventLogger.logEvent('appointment_confirmed', `Patient ${patientName} claimed slot ${slotId}`, { patientId, slotId });
      
      PatientNotificationService.sendPatientMessage('whatsapp', patientId, patientName, 'Confirmed! Your appointment is successfully booked.');
      
      // Feature 6: Doctor Alert System
      PatientNotificationService.alertDoctor(
        slotInfo.speciality, 
        `New urgent appointment confirmed for ${patientName} on slot ${slotId}`
      );
      
      return true;
    }
    return false;
  }
}
