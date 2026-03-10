// EventLogger.ts
export interface SystemLog {
  id: string;
  timestamp: string;
  event_type: 'appointment_requested' | 'slot_suggested' | 'slot_cancelled' | 'slot_reassigned' | 'patient_notified' | 'appointment_confirmed';
  description: string;
  metadata?: any;
}

class EventLogger {
  private logs: SystemLog[] = [];
  
  logEvent(eventType: SystemLog['event_type'], description: string, metadata?: any) {
    const logEntry: SystemLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      event_type: eventType,
      description,
      metadata
    };
    this.logs.unshift(logEntry); // add to top
    // In production, this would save to the database
    console.log(`[EventLogger] ${eventType}: ${description}`, metadata || '');
  }

  getLogs() {
    return this.logs;
  }
}

export const appointmentEventLogger = new EventLogger();
