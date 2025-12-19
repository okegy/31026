# Calendar Event Parser & Conflict Resolution Fixes

## Date: December 19, 2024

## Issues Fixed

### 1. Event Title Parsing Issue

**Problem**: When entering "I have a meeting tomorrow at 12 pm", the system was saving "I have a pm" as the event title.

**Root Cause**: The event parser was removing too much text from the input, including the word "meeting" and other important context.

**Solution**: 
- Improved the title extraction logic to preserve event types (meeting, call, appointment, etc.)
- Better handling of natural language input patterns like "I have a meeting"
- Smarter removal of temporal words (today, tomorrow) and time expressions
- If no clear title remains, the event type is used as the title
- If a title exists but doesn't contain an event type, it's prepended (e.g., "Meeting - John")

### 2. Automatic Conflict Detection & Rescheduling

**New Feature**: The calendar now automatically detects scheduling conflicts and reschedules events to the next available time slot.

**How it works**:
1. When you create an event, the system checks for conflicts with existing events
2. If a conflict is detected, it automatically searches for the next available time slot
3. It tries to find a free slot within 24 hours, checking hourly intervals
4. If a free slot is found, the event is automatically rescheduled and you're notified
5. If no free slot is found, the event is created anyway with a warning

**Benefits**:
- No more double-booked meetings
- Automatic optimization of your schedule
- Clear notifications about rescheduling
- Maintains the same event duration

## Examples

### Before Fix:
**Input**: "I have a meeting tomorrow at 12 pm"
**Result**: Event titled "I have a pm" at 12:00 PM ❌

### After Fix:
**Input**: "I have a meeting tomorrow at 12 pm"
**Result**: Event titled "Meeting" at 12:00 PM ✅

### More Examples:

| Input | Event Title | Time |
|-------|-------------|------|
| "I have a meeting tomorrow at 12 pm" | "Meeting" | Tomorrow 12:00 PM |
| "Schedule a call with John at 3pm" | "Call - John" | Today 3:00 PM |
| "Team standup tomorrow at 9am" | "Standup - Team" | Tomorrow 9:00 AM |
| "Interview with Sarah on Monday at 2pm" | "Interview - Sarah" | Next Monday 2:00 PM |
| "Project review meeting next week" | "Meeting - Project review" | Next Week 9:00 AM |

## Conflict Resolution Examples

### Example 1: Simple Conflict
**Existing Event**: "Team Meeting" at 2:00 PM - 3:00 PM
**New Input**: "Call with client at 2:30 pm"
**Result**: Automatically rescheduled to 3:00 PM - 4:00 PM
**Notification**: "Conflict detected! Automatically rescheduled to Dec 19, 3:00 PM to avoid conflicts"

### Example 2: Multiple Conflicts
**Existing Events**: 
- 2:00 PM - 3:00 PM: Team Meeting
- 3:00 PM - 4:00 PM: Client Call
- 4:00 PM - 5:00 PM: Project Review

**New Input**: "1-hour meeting at 2pm"
**Result**: Automatically rescheduled to 5:00 PM - 6:00 PM
**Notification**: "Conflict detected! Automatically rescheduled to Dec 19, 5:00 PM to avoid conflicts"

## Technical Implementation

### Event Parser Improvements (`src/lib/eventParser.ts`)

```typescript
// Extract event type intelligently
const typeMatch = input.match(/\b(meeting|event|appointment|call|interview|presentation|demo|standup|sync|review|discussion|session)\b/i);

// Clean title while preserving important context
title = input
  .replace(/\b(schedule|create|add|set up|book|i have|i've got|i got)\b/gi, '')
  .replace(/\b(today|tomorrow|next week|this week)\b/gi, '')
  .replace(/\bat\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b/gi, '')
  // ... more cleaning

// Smart title generation
if (!title || title.length < 2) {
  title = eventType; // e.g., "Meeting"
} else if (!title.match(/event type pattern/)) {
  title = `${eventType} - ${title}`; // e.g., "Meeting - John"
}
```

### Conflict Resolution (`src/pages/Calendar.tsx`)

```typescript
// Check for conflicts
let conflicts = checkConflicts(parsedEvent.start_time, parsedEvent.end_time);

// If conflicts exist, find next available slot
if (conflicts.length > 0) {
  let newStartTime = new Date(endTime);
  let attempts = 0;
  
  while (attempts < 24) {
    const newEndTime = new Date(newStartTime.getTime() + duration);
    const newConflicts = checkConflicts(newStartTime.toISOString(), newEndTime.toISOString());
    
    if (newConflicts.length === 0) {
      // Found free slot - reschedule
      parsedEvent = {
        ...parsedEvent,
        start_time: newStartTime.toISOString(),
        end_time: newEndTime.toISOString(),
      };
      break;
    }
    
    // Try next hour
    newStartTime = new Date(newStartTime.getTime() + 60 * 60 * 1000);
    attempts++;
  }
}
```

## Testing the Fixes

### Test Case 1: Basic Event Creation
1. Go to Calendar page
2. Type: "I have a meeting tomorrow at 12 pm"
3. Click "Add Event"
4. **Expected**: Event titled "Meeting" created at tomorrow 12:00 PM

### Test Case 2: Event with Attendees
1. Type: "Schedule a call with John tomorrow at 3pm"
2. Click "Add Event"
3. **Expected**: Event titled "Call" with attendee "John" at tomorrow 3:00 PM

### Test Case 3: Conflict Resolution
1. Create an event at 2:00 PM
2. Try to create another event at 2:30 PM
3. **Expected**: Second event automatically rescheduled to 3:00 PM with notification

### Test Case 4: Voice Input
1. Click the microphone button
2. Say: "Meeting with Sarah tomorrow at 10am"
3. **Expected**: Event titled "Meeting - Sarah" created at tomorrow 10:00 AM

## Additional Improvements

### 1. Better Natural Language Understanding
- Handles phrases like "I have", "I've got", "I got"
- Recognizes various event types
- Preserves attendee names and locations

### 2. Smarter Time Parsing
- Correctly handles AM/PM
- Supports various date formats
- Handles relative dates (today, tomorrow, next week)

### 3. Enhanced User Feedback
- Clear success messages with event details
- Conflict warnings with rescheduling information
- Error messages with helpful suggestions

## Known Limitations

1. **24-Hour Search Window**: Conflict resolution only searches for 24 hours
2. **Hourly Intervals**: Checks for free slots every hour (not every minute)
3. **Same Duration**: Rescheduled events maintain the same duration
4. **No Priority**: All events are treated equally (no VIP rescheduling)

## Future Enhancements

1. **Smart Rescheduling**: Consider event priority and attendee availability
2. **Flexible Duration**: Suggest shorter durations if no full slot available
3. **Multi-Day Search**: Extend search window beyond 24 hours
4. **Attendee Conflicts**: Check attendee calendars for conflicts
5. **Location-Based**: Consider travel time between locations
6. **AI Suggestions**: Use AI to suggest optimal meeting times

## Summary

✅ **Event title parsing fixed** - Now correctly extracts event titles from natural language
✅ **Automatic conflict detection** - Detects scheduling conflicts automatically
✅ **Smart rescheduling** - Finds next available time slot
✅ **Better user feedback** - Clear notifications about changes
✅ **Voice input support** - Works with voice commands
✅ **Natural language** - Understands various input patterns

The calendar is now much smarter and user-friendly!
