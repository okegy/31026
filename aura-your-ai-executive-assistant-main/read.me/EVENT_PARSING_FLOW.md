# Event Parsing & Conflict Resolution Flow

## 📝 Event Parsing Flow

```
User Input: "I have a meeting tomorrow at 12 pm"
                    ↓
        ┌───────────────────────┐
        │  Event Parser Start   │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │ Extract Event Type    │
        │ Found: "meeting"      │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │ Extract Time Info     │
        │ Found: "tomorrow"     │
        │ Found: "12 pm"        │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │ Extract Attendees     │
        │ None found            │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │ Extract Location      │
        │ None found            │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │ Clean Title           │
        │ Remove: "I have"      │
        │ Remove: "tomorrow"    │
        │ Remove: "at 12 pm"    │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │ Generate Final Title  │
        │ Result: "Meeting"     │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │ Calculate Times       │
        │ Start: Tomorrow 12PM  │
        │ End: Tomorrow 1PM     │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │   Return Event        │
        │ {                     │
        │   title: "Meeting"    │
        │   start: Tomorrow 12PM│
        │   end: Tomorrow 1PM   │
        │   duration: 60 min    │
        │ }                     │
        └───────────────────────┘
```

---

## 🔄 Conflict Resolution Flow

```
Event Created: "Call with client at 2:30 pm"
                    ↓
        ┌───────────────────────┐
        │ Check for Conflicts   │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │ Found Conflict!       │
        │ Existing: 2PM-3PM     │
        │ New: 2:30PM-3:30PM    │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │ Start Rescheduling    │
        │ Try: 3:00 PM          │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │ Check 3PM-4PM         │
        │ Status: FREE ✅       │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │ Reschedule Event      │
        │ New Time: 3PM-4PM     │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │ Notify User           │
        │ "Rescheduled to 3PM"  │
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │ Create Event          │
        │ Success! ✅           │
        └───────────────────────┘
```

---

## 🔍 Before vs After Comparison

### Before Fix:

```
Input: "I have a meeting tomorrow at 12 pm"
         ↓
    [Old Parser]
         ↓
    Remove "meeting" ❌
    Remove "tomorrow" ✓
    Remove "at 12 pm" ✓
         ↓
    Title: "I have a pm" ❌
    Time: Tomorrow 12:00 PM ✓
```

### After Fix:

```
Input: "I have a meeting tomorrow at 12 pm"
         ↓
    [New Parser]
         ↓
    Detect event type: "meeting" ✓
    Remove "I have" ✓
    Remove "tomorrow" ✓
    Remove "at 12 pm" ✓
         ↓
    Title: "Meeting" ✅
    Time: Tomorrow 12:00 PM ✓
```

---

## 🎯 Event Type Detection

```
Input Analysis
      ↓
┌─────────────────────────────────────┐
│ Search for Event Type Keywords:    │
│                                     │
│ ✓ meeting                          │
│ ✓ call                             │
│ ✓ appointment                      │
│ ✓ interview                        │
│ ✓ presentation                     │
│ ✓ demo                             │
│ ✓ standup                          │
│ ✓ sync                             │
│ ✓ review                           │
│ ✓ discussion                       │
│ ✓ session                          │
└─────────────────────────────────────┘
      ↓
Found: "meeting"
      ↓
Capitalize: "Meeting"
      ↓
Use as event type
```

---

## 🕐 Time Parsing Logic

```
Input: "tomorrow at 12 pm"
         ↓
┌─────────────────────┐
│ Detect Relative Day │
│ "tomorrow" → +1 day │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Extract Time        │
│ "12 pm" → 12:00 PM │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Combine Date & Time │
│ Tomorrow + 12:00 PM │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Calculate End Time  │
│ Start + 60 minutes  │
└──────────┬──────────┘
           ↓
    Final Times:
    Start: Tomorrow 12:00 PM
    End: Tomorrow 1:00 PM
```

---

## 🔄 Conflict Detection Algorithm

```
New Event: 2:30 PM - 3:30 PM
         ↓
┌────────────────────────────┐
│ Get All Existing Events    │
└─────────────┬──────────────┘
              ↓
┌────────────────────────────┐
│ For Each Existing Event:   │
│                            │
│ Event 1: 2:00 PM - 3:00 PM│
│                            │
│ Check Overlap:             │
│ New Start (2:30) < Exist End (3:00) ✓
│ New End (3:30) > Exist Start (2:00) ✓
│                            │
│ CONFLICT DETECTED! ⚠️      │
└─────────────┬──────────────┘
              ↓
┌────────────────────────────┐
│ Find Next Available Slot   │
│                            │
│ Try 3:00 PM - 4:00 PM     │
│ Check conflicts... NONE ✓  │
│                            │
│ SLOT FOUND! ✅            │
└─────────────┬──────────────┘
              ↓
    Reschedule to 3:00 PM
```

---

## 📊 Title Generation Logic

```
Input: "I have a meeting with John tomorrow at 2pm"
         ↓
┌─────────────────────────────────┐
│ Step 1: Extract Components      │
│                                  │
│ Event Type: "meeting"           │
│ Attendees: "John"               │
│ Time: "tomorrow at 2pm"         │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ Step 2: Remove Noise Words      │
│                                  │
│ Remove: "I have"                │
│ Remove: "tomorrow"              │
│ Remove: "at 2pm"                │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ Step 3: Build Title             │
│                                  │
│ Has event type? YES             │
│ Has attendee? YES               │
│                                  │
│ Format: "Meeting - John"        │
└──────────────┬──────────────────┘
               ↓
    Final Title: "Meeting - John"
```

---

## 🎨 Examples with Flow

### Example 1: Simple Meeting

```
"I have a meeting tomorrow at 12 pm"
    ↓
[Parse] → Type: meeting, Time: tomorrow 12pm
    ↓
[Clean] → Remove "I have", "tomorrow", "at 12 pm"
    ↓
[Title] → "Meeting"
    ↓
[Times] → Start: Tomorrow 12:00 PM, End: Tomorrow 1:00 PM
    ↓
[Check] → No conflicts ✓
    ↓
[Create] → Event created successfully! ✅
```

### Example 2: Meeting with Conflict

```
"Call with client at 2:30 pm"
    ↓
[Parse] → Type: call, Attendee: client, Time: 2:30pm
    ↓
[Clean] → Remove "at 2:30 pm"
    ↓
[Title] → "Call - client"
    ↓
[Times] → Start: Today 2:30 PM, End: Today 3:30 PM
    ↓
[Check] → CONFLICT with 2:00-3:00 PM meeting! ⚠️
    ↓
[Reschedule] → Try 3:00 PM... FREE ✓
    ↓
[Update] → New time: 3:00 PM - 4:00 PM
    ↓
[Notify] → "Rescheduled to 3:00 PM to avoid conflict"
    ↓
[Create] → Event created at new time! ✅
```

### Example 3: Complex Event

```
"Schedule interview with Sarah next Monday at 11am in Conference Room A"
    ↓
[Parse] → Type: interview, Attendee: Sarah, Day: Monday, Time: 11am, Location: Conference Room A
    ↓
[Clean] → Remove "Schedule", "next Monday", "at 11am", "in Conference Room A"
    ↓
[Title] → "Interview - Sarah"
    ↓
[Times] → Start: Next Monday 11:00 AM, End: Next Monday 12:00 PM
    ↓
[Location] → "Conference Room A"
    ↓
[Check] → No conflicts ✓
    ↓
[Create] → Event created with all details! ✅
```

---

## 🚀 Performance Optimization

```
Event Creation Request
         ↓
┌──────────────────────┐
│ Parse Input (5ms)    │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Check Conflicts      │
│ O(n) where n=events  │
│ Typical: <10ms       │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Find Free Slot       │
│ Max 24 iterations    │
│ Typical: <50ms       │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Create Event         │
│ Database write       │
│ Typical: 100-200ms   │
└──────────┬───────────┘
           ↓
    Total: ~200-300ms
    User Experience: Instant! ⚡
```

---

## 💡 Key Improvements

1. **Smart Title Extraction**
   - Preserves event types
   - Removes only noise words
   - Generates meaningful titles

2. **Automatic Conflict Resolution**
   - Detects overlapping events
   - Finds next available slot
   - Maintains event duration

3. **Natural Language Support**
   - Understands "I have", "I've got"
   - Recognizes various event types
   - Parses relative dates

4. **User-Friendly Feedback**
   - Clear success messages
   - Conflict warnings
   - Rescheduling notifications

---

**Result**: A calendar that understands natural language and automatically manages your schedule! 🎉
