import { addDays, addHours, addWeeks, startOfDay, setHours, parse } from 'date-fns';

export interface ParsedTask {
  title: string;
  description?: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
  priority_score: number;
  priority_reason?: string;
  required_action?: 'email' | 'meeting' | 'reminder' | 'call' | null;
  action_target?: string;
}

export function parseTaskFromInput(input: string): ParsedTask {
  const lowerInput = input.toLowerCase();
  
  let title = input;
  let deadline: Date | null = null;
  let priority: 'low' | 'medium' | 'high' = 'medium';
  let priority_score = 50;
  let priority_reason: string | undefined;
  let required_action: 'email' | 'meeting' | 'reminder' | 'call' | null = null;
  let action_target: string | undefined;

  const now = new Date();

  if (lowerInput.includes('remind me') || lowerInput.includes('reminder')) {
    required_action = 'reminder';
    title = input.replace(/remind me to /i, '').replace(/reminder to /i, '');
  }

  if (lowerInput.includes('call')) {
    required_action = 'call';
    const callMatch = input.match(/call\s+(\w+)/i);
    if (callMatch) {
      action_target = callMatch[1];
    }
  }

  if (lowerInput.includes('email') || lowerInput.includes('send')) {
    required_action = 'email';
    const emailMatch = input.match(/(?:email|send to)\s+([\w@.-]+)/i);
    if (emailMatch) {
      action_target = emailMatch[1];
    }
  }

  if (lowerInput.includes('meeting') || lowerInput.includes('schedule')) {
    required_action = 'meeting';
    const meetingMatch = input.match(/(?:meeting|schedule).*?with\s+(\w+)/i);
    if (meetingMatch) {
      action_target = meetingMatch[1];
    }
  }

  if (lowerInput.includes('today')) {
    if (lowerInput.includes('end of day') || lowerInput.includes('eod')) {
      deadline = setHours(startOfDay(now), 17);
    } else {
      const timeMatch = lowerInput.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const meridiem = timeMatch[3];
        
        if (meridiem === 'pm' && hours < 12) hours += 12;
        if (meridiem === 'am' && hours === 12) hours = 0;
        
        deadline = setHours(startOfDay(now), hours);
        deadline.setMinutes(minutes);
      } else {
        deadline = addHours(now, 4);
      }
    }
    priority = 'high';
    priority_score = 85;
    priority_reason = 'Due today';
  }

  else if (lowerInput.includes('tomorrow')) {
    const timeMatch = lowerInput.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const meridiem = timeMatch[3];
      
      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;
      
      deadline = addDays(setHours(startOfDay(now), hours), 1);
      deadline.setMinutes(minutes);
    } else {
      deadline = addDays(setHours(startOfDay(now), 9), 1);
    }
    priority = 'high';
    priority_score = 75;
    priority_reason = 'Due tomorrow';
  }

  else if (lowerInput.includes('next week')) {
    deadline = addWeeks(setHours(startOfDay(now), 9), 1);
    priority = 'medium';
    priority_score = 50;
    priority_reason = 'Due next week';
  }

  else if (lowerInput.includes('this week')) {
    deadline = addDays(setHours(startOfDay(now), 17), 5);
    priority = 'medium';
    priority_score = 60;
    priority_reason = 'Due this week';
  }

  const dayMatch = lowerInput.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  if (dayMatch) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = days.indexOf(dayMatch[1]);
    const currentDay = now.getDay();
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;
    
    deadline = addDays(setHours(startOfDay(now), 9), daysToAdd);
    priority = 'medium';
    priority_score = 60;
    priority_reason = `Due on ${dayMatch[1]}`;
  }

  const dateMatch = input.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (dateMatch) {
    const month = parseInt(dateMatch[1]) - 1;
    const day = parseInt(dateMatch[2]);
    const year = dateMatch[3] ? parseInt(dateMatch[3]) : now.getFullYear();
    
    deadline = new Date(year, month, day, 9, 0, 0);
    
    const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 1) {
      priority = 'high';
      priority_score = 90;
      priority_reason = 'Due very soon';
    } else if (daysUntil <= 3) {
      priority = 'high';
      priority_score = 75;
      priority_reason = 'Due in a few days';
    } else if (daysUntil <= 7) {
      priority = 'medium';
      priority_score = 60;
      priority_reason = 'Due this week';
    }
  }

  if (lowerInput.includes('urgent') || lowerInput.includes('asap') || lowerInput.includes('important')) {
    priority = 'high';
    priority_score = Math.max(priority_score, 90);
    priority_reason = 'Marked as urgent';
  }

  if (lowerInput.includes('by friday') || lowerInput.includes('by end of week')) {
    const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7;
    deadline = addDays(setHours(startOfDay(now), 17), daysUntilFriday);
    priority = 'medium';
    priority_score = 65;
    priority_reason = 'Due by end of week';
  }

  const byMatch = input.match(/by\s+(.+?)(?:\s+or\s+|$)/i);
  if (byMatch && !deadline) {
    title = input.replace(/by\s+.+/i, '').trim();
  }

  return {
    title: title.trim(),
    deadline: deadline?.toISOString(),
    priority,
    priority_score,
    priority_reason,
    required_action,
    action_target,
  };
}
