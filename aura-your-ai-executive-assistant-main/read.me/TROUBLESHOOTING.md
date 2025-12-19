# Troubleshooting Guide

## 🔧 Common Issues and Solutions

---

## Issue 1: Event Titles Still Showing Incorrectly

### Symptoms:
- Event title shows "I have a pm" instead of "Meeting"
- Partial words in event titles
- Missing event types

### Solutions:

#### Solution 1: Hard Refresh Browser
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

#### Solution 2: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

#### Solution 3: Check File Changes
```bash
# Verify eventParser.ts was updated
cat src/lib/eventParser.ts | grep "i have"
# Should show the new regex pattern
```

#### Solution 4: Restart Dev Server
```bash
# Stop server (Ctrl + C)
# Start again
npm run dev
```

---

## Issue 2: Conflicts Not Being Detected

### Symptoms:
- Events overlap without warning
- No rescheduling happening
- Multiple events at same time

### Solutions:

#### Solution 1: Check Event Times
- Ensure events are on the same day
- Verify times actually overlap
- Check AM/PM is correct

#### Solution 2: Verify Conflict Detection Code
```typescript
// In Calendar.tsx, should have:
const conflicts = checkConflicts(parsedEvent.start_time, parsedEvent.end_time);
if (conflicts.length > 0) {
  // Rescheduling logic
}
```

#### Solution 3: Check Browser Console
```
F12 → Console tab
Look for errors in conflict detection
```

---

## Issue 3: Voice Input Not Working

### Symptoms:
- Microphone button does nothing
- No recording starts
- No text appears after speaking

### Solutions:

#### Solution 1: Check Browser Permissions
1. Click lock icon in address bar
2. Check microphone permission
3. Set to "Allow"
4. Refresh page

#### Solution 2: Use Supported Browser
- ✅ Chrome (recommended)
- ✅ Edge
- ✅ Safari (macOS)
- ❌ Firefox (limited support)

#### Solution 3: Check HTTPS/Localhost
- Voice input requires secure context
- Use `localhost` or `https://`
- `http://` won't work (except localhost)

#### Solution 4: Test Microphone
```html
<!-- Open test-voice.html in browser -->
<!-- Should show microphone test interface -->
```

---

## Issue 4: Dashboard Not Loading

### Symptoms:
- Blank white page
- Loading spinner forever
- TypeScript errors in console

### Solutions:

#### Solution 1: Check Console Errors
```
F12 → Console
Look for red error messages
```

#### Solution 2: Verify Dashboard.tsx
```bash
# Check file exists and has no syntax errors
npm run build
# Should complete without errors
```

#### Solution 3: Check Dependencies
```bash
# Reinstall dependencies
npm install
# Restart dev server
npm run dev
```

#### Solution 4: Check Auth Context
```typescript
// Ensure AuthContext is providing isDemoMode
const { isDemoMode } = useAuth();
```

---

## Issue 5: Events Not Saving

### Symptoms:
- Event created but disappears
- "Failed to create event" error
- Events don't persist after refresh

### Solutions:

#### Solution 1: Check Demo Mode
- In demo mode, events are temporary
- Sign in for persistent storage
- Check `isDemoMode` status

#### Solution 2: Verify Supabase Connection
```typescript
// Check .env file
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

#### Solution 3: Check Network Tab
```
F12 → Network tab
Look for failed API requests
Check response errors
```

---

## Issue 6: Automatic Rescheduling Not Working

### Symptoms:
- Conflicts detected but no rescheduling
- Events created at conflicting times
- No notification about rescheduling

### Solutions:

#### Solution 1: Verify Rescheduling Logic
```typescript
// Should have while loop in handleAddEvent
while (attempts < maxAttempts) {
  const newConflicts = checkConflicts(...);
  if (newConflicts.length === 0) {
    // Reschedule
    break;
  }
  attempts++;
}
```

#### Solution 2: Check Toast Notifications
- Ensure toast is imported
- Check toast configuration
- Verify notification appears

#### Solution 3: Test with Simple Case
```
1. Create event at 2:00 PM
2. Create event at 2:30 PM
3. Should reschedule to 3:00 PM
```

---

## Issue 7: Wrong Event Times

### Symptoms:
- Event at wrong hour
- AM/PM confusion
- Wrong day

### Solutions:

#### Solution 1: Check Time Parsing
```typescript
// Verify meridiem handling
if (meridiem === 'pm' && hours < 12) hours += 12;
if (meridiem === 'am' && hours === 12) hours = 0;
```

#### Solution 2: Test Time Inputs
```
"2pm" → 14:00 ✓
"2am" → 02:00 ✓
"12pm" → 12:00 ✓
"12am" → 00:00 ✓
```

#### Solution 3: Check Timezone
- Events stored in ISO format
- Display uses local timezone
- Verify timezone settings

---

## Issue 8: Notion Integration Not Working

### Symptoms:
- Tasks not appearing in Notion
- "Notion API error" messages
- Connection failures

### Solutions:

#### Solution 1: Verify API Key
```bash
# Check .env file
NOTION_API_KEY=secret_...
# Should start with "secret_"
```

#### Solution 2: Check Database Permissions
1. Open Notion database
2. Click "Share"
3. Verify integration has access
4. Grant "Edit" permissions

#### Solution 3: Verify Database ID
```python
# In notion_config.py
NOTION_DATABASE_ID = "2ce06e11832e8091a3b7d78e39f5524e"
# Should be 32 character hex string
```

#### Solution 4: Test Connection
```bash
cd aura-agent
python -c "from tools.notion_tool import NotionTool; tool = NotionTool(); print('Connected!')"
```

---

## Issue 9: TypeScript Errors

### Symptoms:
- Red squiggly lines in editor
- Build fails
- Type mismatch errors

### Solutions:

#### Solution 1: Restart TypeScript Server
```
VS Code: Ctrl + Shift + P
Type: "TypeScript: Restart TS Server"
```

#### Solution 2: Check Type Definitions
```typescript
// Ensure interfaces match
interface Task {
  title: string;  // Not task_name
  priority: 'low' | 'medium' | 'high';  // Lowercase
}
```

#### Solution 3: Rebuild
```bash
npm run build
# Fix any errors shown
```

---

## Issue 10: Performance Issues

### Symptoms:
- Slow page loads
- Laggy interactions
- High CPU usage

### Solutions:

#### Solution 1: Check Data Size
```typescript
// Limit data fetching
.slice(0, 100)  // Don't load too many items
```

#### Solution 2: Use Memoization
```typescript
const stats = React.useMemo(() => ({
  // calculations
}), [dependencies]);
```

#### Solution 3: Optimize Re-renders
```typescript
// Use React.memo for components
export default React.memo(Component);
```

---

## 🔍 Debugging Tips

### Enable Debug Mode
```typescript
// Add to component
console.log('Event parsed:', parsedEvent);
console.log('Conflicts found:', conflicts);
console.log('Rescheduled to:', newTime);
```

### Check Network Requests
```
F12 → Network tab
Filter: XHR
Check API calls and responses
```

### Verify State Updates
```typescript
// Add state logging
useEffect(() => {
  console.log('Tasks updated:', tasks);
}, [tasks]);
```

### Test in Isolation
```typescript
// Test parser directly
const result = parseEventFromInput("meeting tomorrow at 2pm");
console.log(result);
```

---

## 📞 Getting Help

### Information to Provide:
1. **Exact input** you used
2. **Expected result** vs **actual result**
3. **Browser** and version
4. **Console errors** (screenshot)
5. **Network errors** (if any)
6. **Steps to reproduce**

### Useful Commands:
```bash
# Check versions
node --version
npm --version

# Check running processes
netstat -ano | findstr :8080

# Clear everything and restart
rm -rf node_modules
npm install
npm run dev
```

---

## ✅ Verification Checklist

Before reporting an issue, verify:

- [ ] Browser cache cleared
- [ ] Dev server restarted
- [ ] No console errors
- [ ] Correct browser (Chrome/Edge)
- [ ] Microphone permissions granted
- [ ] Environment variables set
- [ ] Latest code pulled
- [ ] Dependencies installed
- [ ] Port 8080 not in use
- [ ] Network connection stable

---

## 🎯 Quick Fixes

### Reset Everything:
```bash
# Stop server
Ctrl + C

# Clear cache
rm -rf node_modules/.vite

# Reinstall
npm install

# Restart
npm run dev

# Hard refresh browser
Ctrl + Shift + R
```

### Test Basic Functionality:
```
1. Open http://localhost:8080/calendar
2. Type: "meeting tomorrow at 2pm"
3. Click "Add Event"
4. Should see: "Meeting" at 2:00 PM
```

---

## 📚 Additional Resources

- **QUICK_TEST_GUIDE.md** - Testing instructions
- **CALENDAR_FIXES.md** - Detailed fix documentation
- **EVENT_PARSING_FLOW.md** - Visual flow diagrams
- **FINAL_SUMMARY.md** - Complete overview

---

**Still having issues?** Check the browser console (F12) for specific error messages and refer to the relevant documentation file.
