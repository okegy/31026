import { addDays, addHours, addWeeks, startOfDay, setHours, parse, addMinutes, addMonths, nextDay, Day } from 'date-fns';

export interface ParsedEvent {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  attendees?: string[];
  location?: string;
  doctor?: string;
}

export function parseEventFromInput(input: string): ParsedEvent {
  // 1. Normalize and clean input
  const normalized = input
    .replace(/\b(a\.?m\.?|A\.?M\.?)\b/g, 'am')
    .replace(/\b(p\.?m\.?|P\.?M\.?)\b/g, 'pm')
    .replace(/\b(dr\.|dr|doctor)\s+([a-zA-Z]+)\b/gi, 'Dr. $2')
    .replace(/\s+/g, ' ')
    .trim();
  
  const lowerInput = normalized.toLowerCase();
  
  // 2. Initialize variables
  let startTime: Date | null = null;
  let duration = 60; // default to 60 minutes for medical contexts
  let attendees: string[] = [];
  let location: string | undefined;
  let doctor: string | undefined;
  let patientName: string | undefined;
  let eventType = 'Consultation';
  let speciality: string | undefined;

  const now = new Date();

  // 3. Extract NLP Entities

  // A. Doctor Name Extraction
  const doctorMatch = normalized.match(/Dr\.\s*([A-Za-z]+)/i);
  if (doctorMatch) {
    doctor = `Dr. ${doctorMatch[1]}`;
  }

  // B. Speciality Extraction
  const specialities = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 
    'Pediatrics', 'General', 'Dental', 'Psychiatry', 'Surgery', 'Therapy'
  ];
  for (const spec of specialities) {
    if (lowerInput.includes(spec.toLowerCase())) {
      speciality = spec;
      break;
    }
  }

  // C. Patient / Attendee Extraction (e.g., "for Alice", "with John", "patient Bob")
  const forMatch = normalized.match(/\b(?:for|with|patient)\s+([A-Z][a-z]+)\b/);
  if (forMatch && forMatch[1].toLowerCase() !== 'dr') {
    patientName = forMatch[1];
    attendees.push(patientName);
  }

  // D. Event Type Extraction
  const types = ['Consultation', 'Checkup', 'Check-up', 'Surgery', 'Follow-up', 'Meeting', 'Appointment', 'Review', 'Session', 'Vaccine'];
  for (const t of types) {
    if (lowerInput.includes(t.toLowerCase())) {
      eventType = t;
      break;
    }
  }

  // E. Location Extraction
  const locationMatch = normalized.match(/\b(?:at|in)\s+(?:the\s+)?([A-Z][a-zA-Z\s]+?)(?:\s+(?:with|on|tomorrow|today|at\s+\d|for)|\s*$)/i);
  if (locationMatch && !locationMatch[1].match(/\d{1,2}(?::\d{2})?\s*(?:am|pm)?/)) {
    location = locationMatch[1].trim();
  }

  // F. Duration Extraction
  const durationMatch = lowerInput.match(/(\d+)\s*(hour|hr|minute|min)s?/);
  if (durationMatch) {
    const value = parseInt(durationMatch[1]);
    const unit = durationMatch[2];
    duration = unit.startsWith('hour') || unit === 'hr' ? value * 60 : value;
  }

  // 4. Advanced Temporal Extraction (Date & Time)
  let parsedHour: number | null = null;
  let parsedMinute: number = 0;
  
  const timeMatch = lowerInput.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const meridiem = timeMatch[3];
    
    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;
    
    parsedHour = hours;
    parsedMinute = minutes;
  } else if (/\bnoon\b/i.test(lowerInput)) {
    parsedHour = 12;
  } else if (/\bmidnight\b/i.test(lowerInput)) {
    parsedHour = 0;
  } else if (/\bmorning\b/i.test(lowerInput)) {
    parsedHour = 9; // Default morning
  } else if (/\bafternoon\b/i.test(lowerInput)) {
    parsedHour = 14; // Default afternoon
  } else if (/\bevening\b/i.test(lowerInput)) {
    parsedHour = 18; // Default evening
  }

  // Relative Date Logic
  let targetDate = new Date(now);
  let hasValidDate = false;

  const dayOfWeekNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  if (lowerInput.includes('tomorrow')) {
    targetDate = addDays(targetDate, 1);
    hasValidDate = true;
  } else if (lowerInput.includes('today')) {
    hasValidDate = true;
  } else if (lowerInput.includes('next week')) {
    targetDate = addWeeks(targetDate, 1);
    hasValidDate = true;
  } else if (lowerInput.includes('next month')) {
    targetDate = addMonths(targetDate, 1);
    hasValidDate = true;
  } else {
    // Match explicit dates (e.g. 10/14)
    const dateMatch = normalized.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
    if (dateMatch) {
      const month = parseInt(dateMatch[1]) - 1;
      const day = parseInt(dateMatch[2]);
      const year = dateMatch[3] ? parseInt(dateMatch[3]) : now.getFullYear();
      targetDate = new Date(year, month, day);
      hasValidDate = true;
    } else {
      // Match day of week (e.g. monday)
      const dayMatch = lowerInput.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
      if (dayMatch) {
        const targetDayIdx = dayOfWeekNames.indexOf(dayMatch[1]);
        const currentDayIdx = now.getDay();
        let addDb = targetDayIdx - currentDayIdx;
        
        // If today is Tuesday, and user says "Monday", it should mean next Monday
        if (addDb <= 0 || lowerInput.includes('next ' + dayMatch[1])) {
           addDb += 7;
        }
        targetDate = addDays(now, addDb);
        hasValidDate = true;
      }
    }
  }

  let inMinutesMatch = lowerInput.match(/\bin\s+(\d+)\s*(minute|min)s?\b/);
  let inHoursMatch = lowerInput.match(/\bin\s+(\d+)\s*(hour|hr)s?\b/);
  
  if (!hasValidDate && parsedHour === null) {
    if (inHoursMatch && inMinutesMatch) {
      startTime = addMinutes(addHours(now, parseInt(inHoursMatch[1])), parseInt(inMinutesMatch[1]));
    } else if (inHoursMatch) {
      startTime = addHours(now, parseInt(inHoursMatch[1]));
    } else if (inMinutesMatch) {
      startTime = addMinutes(now, parseInt(inMinutesMatch[1]));
    }
  }

  // Combine Date & Time if explicit
  if (!startTime) {
    if (parsedHour !== null) {
      startTime = setHours(startOfDay(targetDate), parsedHour);
      startTime.setMinutes(parsedMinute);
    } else if (hasValidDate) {
      // Default to opening time if day specified but no specific time
      startTime = setHours(startOfDay(targetDate), 9);
      startTime.setMinutes(0);
    } else {
      // Complete fallback (in 2 hours)
      startTime = addHours(now, 2);
    }
  }

  // Generate End Time
  const calculatedEndTime = addMinutes(startTime, duration);

  // 5. Build Dynamic Title
  let smartTitle = eventType;
  
  // Format the title beautifully depending on extraction
  if (speciality) {
    smartTitle = `${speciality} ${smartTitle.toLowerCase()}`;
  }
  
  if (patientName) {
    smartTitle += ` for ${patientName}`;
  }

  if (doctor) {
    smartTitle += ` \u2022 ${doctor}`;
  }

  // Fallback if everything fails
  if (smartTitle === 'Consultation' && !patientName && !doctor && !speciality) {
    // Clean original message heavily to try and find a decent title
    const cleanContext = normalized
      .replace(/\s+/g, ' ')
      .replace(/\b(schedule|book|create|set up|make|appointment|an|a|for|tomorrow|today|at|on|in|am|pm|next week)\b/gi, '')
      .replace(/\d+/g, '')
      .replace(/[^\w\s]/g, '')
      .trim();
    if (cleanContext.length > 3) {
      smartTitle = `Appt: ${cleanContext.substring(0, 30)}`;
    }
  }

  // Capitalize properly
  smartTitle = smartTitle.charAt(0).toUpperCase() + smartTitle.slice(1);

  return {
    title: smartTitle,
    start_time: startTime.toISOString(),
    end_time: calculatedEndTime.toISOString(),
    attendees: attendees.length > 0 ? attendees : undefined,
    location,
    doctor
  };
}
