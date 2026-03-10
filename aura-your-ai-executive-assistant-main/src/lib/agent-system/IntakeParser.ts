// IntakeParser.ts
import { appointmentEventLogger } from './EventLogger';

export interface ParsedIntake {
  patient_name: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  doctor_speciality: string | null;
  reason_for_visit: string | null;
}

export class AppointmentIntakeParser {
  // Simple heuristic/regex-based mock parser.
  // In production, this would call an LLM or NLP agent.
  public static parse(input: string, source: 'voice' | 'chat' | 'web'): ParsedIntake {
    const lowerInput = input.toLowerCase();
    
    let speciality = null;
    if (lowerInput.includes('cardiologist') || lowerInput.includes('heart')) speciality = 'Cardiology';
    else if (lowerInput.includes('neurologist') || lowerInput.includes('brain')) speciality = 'Neurology';
    else if (lowerInput.includes('ortho') || lowerInput.includes('bone')) speciality = 'Orthopedics';
    else speciality = 'General';

    let date = null;
    if (lowerInput.includes('tomorrow')) date = 'tomorrow';
    else if (lowerInput.includes('monday')) date = 'monday';
    else if (lowerInput.includes('today')) date = 'today';

    let time = null;
    if (lowerInput.includes('morning')) time = 'Morning';
    else if (lowerInput.includes('afternoon')) time = 'Afternoon';
    else if (lowerInput.match(/([0-9]+)\s*(am|pm)/i)) {
      const match = lowerInput.match(/([0-9]+)\s*(am|pm)/i);
      time = match ? match[0] : null;
    }

    // Extract potential names
    const names = ['rahul', 'sarah', 'michael', 'kumar', 'john', 'alice'];
    const patient_name = names.find(n => lowerInput.includes(n)) || 'Unknown Patient';

    const parsed: ParsedIntake = {
      patient_name,
      preferred_date: date,
      preferred_time: time,
      doctor_speciality: speciality,
      reason_for_visit: input, // raw input as reason for demo
    };

    appointmentEventLogger.logEvent('appointment_requested', `New request via ${source} from ${patient_name}`, parsed);
    
    return parsed;
  }
}
