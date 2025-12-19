# Quick Test Guide - Calendar Fixes

## 🎯 Test the Calendar Event Parser Fix

### Open the Calendar
1. Navigate to http://localhost:8080/calendar
2. You should see the Calendar page

### Test 1: Basic Meeting Input
**Input**: `I have a meeting tomorrow at 12 pm`

**Expected Result**:
- ✅ Event title: "Meeting"
- ✅ Time: Tomorrow at 12:00 PM
- ✅ Duration: 1 hour (12:00 PM - 1:00 PM)

**Before the fix**: Event would be titled "I have a pm" ❌

### Test 2: Meeting with Attendee
**Input**: `Schedule a call with John tomorrow at 3pm`

**Expected Result**:
- ✅ Event title: "Call"
- ✅ Attendee: John
- ✅ Time: Tomorrow at 3:00 PM

### Test 3: Conflict Detection & Auto-Rescheduling

**Step 1**: Create first event
- Input: `Team meeting tomorrow at 2pm`
- Should create: "Meeting - Team" at 2:00 PM - 3:00 PM

**Step 2**: Create conflicting event
- Input: `Call with client tomorrow at 2:30pm`
- Should automatically reschedule to: 3:00 PM - 4:00 PM
- You should see a notification: "Conflict detected! Automatically rescheduled to [time]"

### Test 4: Voice Input
1. Click the microphone icon 🎤
2. Say: "Meeting with Sarah tomorrow at 10am"
3. Click "Add Event"

**Expected Result**:
- ✅ Event title: "Meeting"
- ✅ Time: Tomorrow at 10:00 AM
- ✅ Voice input correctly captured

### Test 5: Different Event Types

Try these inputs to see smart title extraction:

| Input | Expected Title |
|-------|---------------|
| `I have a standup tomorrow at 9am` | "Standup" |
| `Interview with candidate at 11am` | "Interview - candidate" |
| `Project review next Monday at 2pm` | "Review - Project" |
| `Demo for client on Friday at 3pm` | "Demo - client" |

## 🐛 What Was Fixed

### Before:
- ❌ "I have a meeting tomorrow at 12 pm" → Event: "I have a pm"
- ❌ No conflict detection
- ❌ Events could overlap

### After:
- ✅ "I have a meeting tomorrow at 12 pm" → Event: "Meeting" at 12:00 PM
- ✅ Automatic conflict detection
- ✅ Smart rescheduling to avoid overlaps
- ✅ Better natural language understanding

## 📱 Visual Confirmation

After creating an event, you should see:
1. ✅ Success toast notification with event details
2. ✅ Event appears in the calendar grid
3. ✅ Correct title displayed
4. ✅ Correct time shown
5. ✅ If rescheduled, notification explains why

## 🔧 Troubleshooting

### If events still show wrong titles:
1. Hard refresh the browser (Ctrl + Shift + R)
2. Clear browser cache
3. Check browser console for errors

### If voice input doesn't work:
1. Check microphone permissions
2. Use Chrome or Edge browser
3. Ensure HTTPS or localhost

### If conflicts aren't detected:
1. Make sure events overlap in time
2. Check that both events are on the same day
3. Verify events are actually created in the system

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ Event titles make sense
- ✅ Times are parsed correctly
- ✅ Conflicts trigger rescheduling
- ✅ Notifications are clear and helpful
- ✅ Voice input works smoothly

## 📝 Report Issues

If you find any issues:
1. Note the exact input you used
2. Screenshot the result
3. Check browser console for errors
4. Note the expected vs actual behavior

---

**Happy Testing! 🚀**

The calendar should now work much better with natural language input and automatically handle scheduling conflicts!
