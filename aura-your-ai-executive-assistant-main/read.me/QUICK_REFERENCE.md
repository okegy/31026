# AURA - Quick Reference Guide

## 🚀 Getting Started

### Start the Application
```bash
npm run dev
```
**URL**: http://localhost:8080

---

## 📍 Page Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/dashboard` | Main overview, AI input |
| Tasks | `/tasks` | Task management |
| Calendar | `/calendar` | Week/Month view, events |
| **Analytics** | `/analytics` | **Yearly insights & heatmap** |
| Emails | `/emails` | Email management |
| Activity | `/activity` | AI agent logs |

---

## 🗓️ Calendar Features

### View Modes
- **Week View**: 7 days with detailed events
- **Month View**: 35-day grid (5 weeks)

### Navigation
- **Previous/Next Month**: Arrow buttons
- **Current Month**: Displayed at top
- **Day Headers**: Sun-Sat labels

### Creating Events

#### Text Input
```
"I have a meeting tomorrow at 12 pm"
"Schedule a call with John next Monday at 2pm"
"Team standup every Monday at 9am"
```

#### Voice Input
1. Click microphone icon 🎤
2. Speak clearly
3. Click "Add Event"

### Features
- ✅ Natural language parsing
- ✅ Automatic conflict detection
- ✅ Smart rescheduling
- ✅ Visual conflict warnings
- ✅ Event details (time, location, attendees)

---

## 📊 Analytics Features

### Year Navigation
- **Previous Year**: ← button
- **Next Year**: → button (disabled for future years)
- **Current Year**: Quick jump button

### Statistics Displayed

#### Summary Cards
1. **Total Events**: Count + monthly average
2. **Total Tasks**: Count + completed count
3. **Completion Rate**: Percentage + progress bar
4. **Busiest Month**: Month name + activity count

#### Monthly Bar Chart
- Blue bars = Events
- Green bars = Tasks
- Hover for exact counts

#### Activity Heatmap
- GitHub-style visualization
- 365 days of the year
- Color intensity = activity level
- Hover shows: "Date: X activities"

#### Color Scale
- Gray = No activity
- Light Green = Low activity
- Medium Green = Moderate activity
- Dark Green = High activity
- Darkest Green = Very high activity

#### Task Distribution
- Completed tasks (green)
- Pending tasks (yellow)
- Overdue tasks (red)
- Percentages calculated

#### Productivity Insights
- Overall score
- Visual progress bar
- Motivational messages

---

## 🎤 Voice Input

### Supported Pages
- ✅ Dashboard
- ✅ Calendar
- ✅ Tasks (if implemented)

### How to Use
1. Click microphone icon
2. Allow microphone permission (first time)
3. Speak your command
4. Text appears in input field
5. Click submit or it auto-submits

### Example Commands
```
"Schedule a meeting with Sarah tomorrow at 3pm"
"Remind me to call John at 10am"
"Add a task to review the proposal by Friday"
"Team standup next Monday at 9am"
```

---

## 🔍 Quick Tips

### Calendar Tips
- **Week View**: Best for detailed daily planning
- **Month View**: Best for overview and long-term planning
- **Conflicts**: Automatically detected and resolved
- **Voice**: Faster than typing for quick events

### Analytics Tips
- **Year Selector**: Compare different years
- **Heatmap**: Identify patterns and busy periods
- **Monthly Chart**: See trends over time
- **Productivity**: Track improvement

### Event Creation Tips
- Be specific: Include time, date, attendees
- Use natural language: "tomorrow", "next Monday"
- Include event type: "meeting", "call", "interview"
- Add location: "at Conference Room A"

---

## 🎨 Visual Indicators

### Colors
- **Blue**: Events, primary actions
- **Green**: Completed, success
- **Yellow**: Pending, warnings
- **Red**: Overdue, conflicts, errors
- **Purple**: AI features

### Icons
- 📅 Calendar
- ✅ Completed
- ⚠️ Warning/Conflict
- 🎤 Voice input
- 📊 Analytics
- ⚡ AI processing

### Badges
- **Today**: Current day in calendar
- **Demo Mode**: Using demo data
- **Priority**: High/Medium/Low
- **Status**: Pending/Completed/Overdue

---

## 🔧 Keyboard Shortcuts

### General
- `Enter`: Submit form
- `Esc`: Close dialog
- `Ctrl + Shift + R`: Hard refresh

### Calendar
- `←/→`: Navigate months
- `Click day`: Create event for that day
- `Click event`: View/edit event

---

## 📈 Data Insights

### What Analytics Shows

#### Daily Level
- Activity count per day
- Heatmap visualization
- Hover for details

#### Monthly Level
- Events per month
- Tasks per month
- Completion rates

#### Yearly Level
- Total events
- Total tasks
- Busiest month
- Overall completion rate
- Productivity score

---

## 🎯 Common Tasks

### Create an Event
1. Go to Calendar
2. Type or speak event details
3. Click "Add Event"
4. Event appears in calendar

### View Analytics
1. Click "Analytics" in sidebar
2. Select year (if needed)
3. Scroll to view:
   - Summary stats
   - Monthly chart
   - Activity heatmap
   - Task distribution

### Switch Calendar View
1. Click "Week" or "Month" button
2. Use ←/→ to navigate
3. Click days to add events

### Check Productivity
1. Go to Analytics
2. Look at "Completion Rate" card
3. View "Productivity Insights" section
4. Check heatmap for patterns

---

## 🐛 Troubleshooting

### Calendar Not Loading
- Hard refresh (Ctrl + Shift + R)
- Check console for errors
- Verify server is running

### Events Not Saving
- Check demo mode status
- Verify Supabase connection
- Check network tab for errors

### Voice Not Working
- Check microphone permissions
- Use Chrome or Edge browser
- Ensure HTTPS or localhost

### Analytics Not Showing Data
- Ensure events/tasks exist
- Check selected year
- Verify data loaded

---

## 📱 Mobile Usage

### Responsive Design
- ✅ Works on mobile devices
- ✅ Touch-friendly buttons
- ✅ Swipe navigation
- ✅ Optimized layouts

### Best Practices
- Use landscape for calendar
- Use portrait for analytics
- Voice input works great on mobile
- Tap to interact with heatmap

---

## 🎊 Feature Highlights

### What Makes AURA Special

1. **Natural Language**: Speak or type naturally
2. **Auto-Conflict Resolution**: No double-booking
3. **Yearly Insights**: GitHub-style heatmap
4. **Voice Integration**: Hands-free operation
5. **Real-time Updates**: Live synchronization
6. **Beautiful UI**: Modern, clean design
7. **Smart Scheduling**: AI-powered
8. **Comprehensive Analytics**: Full year overview

---

## 📚 Need More Help?

### Documentation Files
- **FINAL_PRODUCT_SUMMARY.md** - Complete overview
- **QUICK_TEST_GUIDE.md** - Testing instructions
- **CALENDAR_FIXES.md** - Calendar details
- **TROUBLESHOOTING.md** - Problem solving
- **EVENT_PARSING_FLOW.md** - How parsing works

### Support
- Check browser console (F12)
- Review error messages
- Verify environment variables
- Restart dev server

---

## ⚡ Quick Commands

### Calendar
```
Week View → Month View → Navigate → Add Event
```

### Analytics
```
Select Year → View Stats → Check Heatmap → Review Insights
```

### Voice Input
```
Click Mic → Speak → Auto-submit → Event Created
```

---

## 🎯 Success Metrics

### You're Using AURA Well If:
- ✅ Events created with natural language
- ✅ No scheduling conflicts
- ✅ Completion rate > 70%
- ✅ Regular activity on heatmap
- ✅ Productive patterns visible
- ✅ Voice input used frequently

---

## 🚀 Pro Tips

1. **Use Voice**: Faster for quick events
2. **Check Analytics Weekly**: Track progress
3. **Review Heatmap**: Identify patterns
4. **Let AI Reschedule**: Trust the automation
5. **Be Specific**: Better event details = better results
6. **Use Month View**: For long-term planning
7. **Check Conflicts**: Before important meetings
8. **Track Completion**: Aim for 70%+ rate

---

**Quick Start**: Dashboard → Add Event → Check Analytics → Stay Productive! 🎉

---

**Last Updated**: December 19, 2024  
**Version**: 2.0 Final  
**Status**: ✅ Ready to Use
