import { addDays, addHours, addWeeks, startOfDay, setHours, parse, addMinutes } from 'date-fns';

export interface ParsedEvent {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  attendees?: string[];
  location?: string;
}

export function parseEventFromInput(input: string): ParsedEvent {
  // Normalize whitespace and common time tokens (e.g., a.m./p.m.)
  const normalized = input
    .replace(/\b(a\.?m\.?|A\.?M\.?)\b/g, 'am')
    .replace(/\b(p\.?m\.?|P\.?M\.?)\b/g, 'pm')
    .replace(/\s+/g, ' ')
    .trim();
  const lowerInput = normalized.toLowerCase();
  
  let title = normalized;
  let startTime: Date | null = null;
  let endTime: Date | null = null;
  let attendees: string[] = [];
  let location: string | undefined;
  let duration = 60;

  const now = new Date();

  // Detect explicit date words to avoid overriding with relative expressions
  const hasExplicitDate = /\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/i.test(lowerInput);

  // Relative time: "in 45 minutes", "in 2 hours", or combo "in 1 hour 30 minutes"
  let relativeMinutes: number | null = null;
  const relCombo = lowerInput.match(/\bin\s+(\d+)\s*hours?\s*(\d+)\s*minutes?\b/);
  if (relCombo) {
    relativeMinutes = parseInt(relCombo[1]) * 60 + parseInt(relCombo[2]);
  } else {
    const relSingle = lowerInput.match(/\bin\s+(\d+)\s*(minutes?|mins?|hours?|hrs?)\b/);
    if (relSingle) {
      const qty = parseInt(relSingle[1]);
      const unit = relSingle[2];
      relativeMinutes = /hour|hr/.test(unit) ? qty * 60 : qty;
    }
  }

  // Special phrases: noon, midnight, half/quarter expressions
  let specialHour: number | null = null;
  let specialMinute: number | null = null;
  if (/\bnoon\b/i.test(lowerInput)) {
    specialHour = 12; specialMinute = 0;
  } else if (/\bmidnight\b/i.test(lowerInput)) {
    specialHour = 0; specialMinute = 0;
  } else {
    const halfPast = lowerInput.match(/\bhalf\s+past\s+(\d{1,2})\b/);
    const quarterPast = lowerInput.match(/\bquarter\s+past\s+(\d{1,2})\b/);
    const quarterTo = lowerInput.match(/\bquarter\s+to\s+(\d{1,2})\b/);
    if (halfPast) {
      specialHour = parseInt(halfPast[1]); specialMinute = 30;
    } else if (quarterPast) {
      specialHour = parseInt(quarterPast[1]); specialMinute = 15;
    } else if (quarterTo) {
      const h = parseInt(quarterTo[1]);
      // e.g., quarter to 5 -> 4:45
      specialHour = (h + 23) % 24; specialMinute = 45;
    }
  }

  // Extract attendees (with X)
  const withMatch = normalized.match(/with\s+([\w\s,]+?)(?:\s+(?:at|on|in|tomorrow|today|next|this)|\s*$)/i);
  if (withMatch) {
    const attendeeStr = withMatch[1].trim();
    attendees = attendeeStr.split(/,|\s+and\s+/).map(a => a.trim()).filter(Boolean);
  }

  // Extract location (at X or in X) - but only if it's not a time
  const locationMatch = normalized.match(/\s+(?:at|in)\s+([a-zA-Z][\w\s]+?)(?:\s+(?:with|on|tomorrow|today|at\s+\d)|\s*$)/i);
  if (locationMatch && !locationMatch[1].match(/\d{1,2}(?::\d{2})?\s*(?:am|pm)?/)) {
    location = locationMatch[1].trim();
  }

  const durationMatch = lowerInput.match(/(\d+)\s*(hour|hr|minute|min)s?/);
  if (durationMatch) {
    const value = parseInt(durationMatch[1]);
    const unit = durationMatch[2];
    duration = unit.startsWith('hour') || unit === 'hr' ? value * 60 : value;
  }

  // If only relative time is present, use it first
  if (!hasExplicitDate && relativeMinutes !== null) {
    startTime = addMinutes(now, relativeMinutes);
  }

  if (!startTime && lowerInput.includes('today')) {
    const timeMatch = lowerInput.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const meridiem = timeMatch[3];
      
      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;
      
      startTime = setHours(startOfDay(now), hours);
      startTime.setMinutes(minutes);
    } else {
      if (specialHour !== null) {
        startTime = setHours(startOfDay(now), specialHour);
        startTime.setMinutes(specialMinute || 0);
      } else if (relativeMinutes !== null) {
        startTime = addMinutes(now, relativeMinutes);
      } else {
        startTime = addHours(now, 2);
      }
    }
  }

  else if (!startTime && lowerInput.includes('tomorrow')) {
    const timeMatch = lowerInput.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const meridiem = timeMatch[3];
      
      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;
      
      startTime = addDays(setHours(startOfDay(now), hours), 1);
      startTime.setMinutes(minutes);
    } else {
      if (specialHour !== null) {
        startTime = addDays(setHours(startOfDay(now), specialHour), 1);
        startTime.setMinutes(specialMinute || 0);
      } else {
        startTime = addDays(setHours(startOfDay(now), 9), 1);
      }
    }
  }

  else if (!startTime && lowerInput.includes('next week')) {
    startTime = addWeeks(setHours(startOfDay(now), 9), 1);
  }

  const dayMatch = lowerInput.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  if (!startTime && dayMatch) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = days.indexOf(dayMatch[1]);
    const currentDay = now.getDay();
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;
    
    const timeMatch = lowerInput.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const meridiem = timeMatch[3];
      
      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;
      
      startTime = addDays(setHours(startOfDay(now), hours), daysToAdd);
      startTime.setMinutes(minutes);
    } else {
      const baseHour = specialHour !== null ? specialHour : 9;
      const baseMinute = specialMinute || 0;
      startTime = addDays(setHours(startOfDay(now), baseHour), daysToAdd);
      startTime.setMinutes(baseMinute);
    }
  }

  const dateMatch = normalized.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (!startTime && dateMatch) {
    const month = parseInt(dateMatch[1]) - 1;
    const day = parseInt(dateMatch[2]);
    const year = dateMatch[3] ? parseInt(dateMatch[3]) : now.getFullYear();
    
    const timeMatch = lowerInput.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const meridiem = timeMatch[3];
      
      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;
      
      startTime = new Date(year, month, day, hours, minutes);
    } else {
      const baseHour = specialHour !== null ? specialHour : 9;
      const baseMinute = specialMinute || 0;
      startTime = new Date(year, month, day, baseHour, baseMinute);
    }
  }

  if (!startTime) {
    startTime = addHours(now, 2);
  }

  endTime = addMinutes(startTime, duration);

  // Extract the event type/title more intelligently
  let eventType = 'Event';
  const typeMatch = input.match(/\b(meeting|event|appointment|call|interview|presentation|demo|standup|sync|review|discussion|session)\b/i);
  if (typeMatch) {
    eventType = typeMatch[1].charAt(0).toUpperCase() + typeMatch[1].slice(1);
  }

  // Clean up the title by removing temporal/action words and time tokens
  // Remove leading verbs/phrases and temporal hints
  title = normalized
    .replace(/\b(schedule|create|add|set up|setup|book|plan|organize|arrange|i have|i've got|i got|i have a|i have an)\b/gi, '')
    .replace(/\b(today|tomorrow|next week|this week|tonight|this\s+\w+|next\s+\w+)\b/gi, '')
    // Remove time expressions (supporting am/pm and a.m./p.m. variants)
    .replace(/\b(?:at\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/gi, '')
    .replace(/\b\d{1,2}:\d{2}\b/gi, '')
    // Remove special time phrases
    .replace(/\b(noon|midnight)\b/gi, '')
    .replace(/\b(half\s+past|quarter\s+(to|past))\s+\d{1,2}\b/gi, '')
    // Remove relative expressions
    .replace(/\bin\s+\d+\s*(minutes?|mins?|hours?|hrs?)\b/gi, '')
    .replace(/\bin\s+\d+\s*hours?\s*\d+\s*minutes?\b/gi, '')
    // Remove weekdays
    .replace(/\b(on\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '')
    // Remove calendar dates
    .replace(/\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g, '')
    // Remove attendees/location phrases from title
    .replace(/\bwith\s+[\w\s,]+/gi, '')
    .replace(/\b(?:at|in)\s+[a-zA-Z][\w\s]+/gi, '')
    // Remove stray commas and multiple spaces
    .replace(/[_,]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Drop leading articles and dangling am/pm remnants
  title = title
    .replace(/^\b(a|an|the)\b\s+/i, '')
    .replace(/\b(am|pm)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // If title is empty or too short, use the event type
  if (!title || title.length < 2) {
    title = eventType;
  } else if (!title.match(/\b(meeting|event|appointment|call|interview|presentation|demo|standup|sync|review|discussion|session)\b/i)) {
    // If the title doesn't contain an event type, prepend it
    title = `${eventType} - ${title}`;
  }

  return {
    title,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    attendees: attendees.length > 0 ? attendees : undefined,
    location,
  };
}
