# 🤖 AURA Autonomous Features Guide

## Overview

AURA now includes **fully autonomous task management** that automatically handles overdue tasks, sends reminder emails, and reschedules work without human intervention!

---

## 🎯 Autonomous Features

### 1. **Automatic Task Rescheduling**
When a task becomes overdue (< 24 hours), AURA automatically:
- ✅ Reschedules it to 24 hours from now
- ✅ Updates the task in Notion
- ✅ Sends notification email
- ✅ Updates calendar with new time

### 2. **Automatic Missed Task Marking**
When a task is severely overdue (> 24 hours), AURA automatically:
- ✅ Marks task as "Missed" in Notion
- ✅ Sends alert email to user
- ✅ Logs the action

### 3. **Automatic Reminder Emails**
When a task is due soon (within 1 hour), AURA automatically:
- ✅ Sends reminder email
- ✅ Includes task details and deadline
- ✅ Helps prevent tasks from being missed

### 4. **Continuous Monitoring**
AURA can run in background monitoring mode:
- ✅ Checks tasks every 5 minutes (configurable)
- ✅ Takes autonomous actions as needed
- ✅ Runs 24/7 without human intervention

---

## 🚀 How to Use

### **Option 1: Manual Autonomous Check**

Run AURA and type:
```
You: autonomous
```

Or:
```
You: auto manage
```

**What happens:**
- AURA checks all pending tasks
- Identifies overdue tasks
- Takes autonomous actions (reschedule or mark missed)
- Sends reminder emails for tasks due soon
- Shows summary of actions taken

### **Option 2: Continuous Monitoring**

Run AURA and type:
```
You: start monitoring
```

**What happens:**
- AURA enters continuous monitoring mode
- Checks tasks every 5 minutes
- Automatically manages tasks 24/7
- Press Ctrl+C to stop

---

## 📊 Autonomous Decision Logic

### **Task Status Decision Tree:**

```
Task Deadline Passed?
│
├─ NO → Check if due within 1 hour?
│       ├─ YES → Send reminder email
│       └─ NO → No action needed
│
└─ YES → How long overdue?
         ├─ < 24 hours → RESCHEDULE
         │               - New deadline: +24 hours
         │               - Send notification
         │               - Update calendar
         │
         └─ > 24 hours → MARK AS MISSED
                         - Update status to "Missed"
                         - Send alert email
                         - Log action
```

---

## 🎬 Example Scenarios

### **Scenario 1: Task Overdue by 2 Hours**

**Initial State:**
- Task: "Submit report"
- Deadline: Today 2:00 PM
- Current Time: Today 4:00 PM
- Status: Pending

**Autonomous Action:**
```
🔄 AUTONOMOUS ACTION: Rescheduling 'Submit report'
  ✓ Rescheduled to: 2025-12-20 16:00
  ✓ Notification email sent to user@example.com
  ✓ Calendar updated
```

**Result:**
- Task deadline: Tomorrow 4:00 PM
- Status: Still Pending
- User notified via email
- Calendar shows new deadline

---

### **Scenario 2: Task Overdue by 3 Days**

**Initial State:**
- Task: "Call client"
- Deadline: 3 days ago
- Status: Pending

**Autonomous Action:**
```
❌ AUTONOMOUS ACTION: Marking 'Call client' as MISSED
  ✓ Status updated to 'Missed'
  ✓ Alert email sent to user@example.com
```

**Result:**
- Status: Missed
- User alerted via email
- Task visible in "Missed" filter

---

### **Scenario 3: Task Due in 30 Minutes**

**Initial State:**
- Task: "Team meeting"
- Deadline: In 30 minutes
- Status: Pending

**Autonomous Action:**
```
⏰ AUTONOMOUS ACTION: Sending reminder for 'Team meeting'
  ✓ Reminder email sent to user@example.com
```

**Result:**
- User receives reminder email
- Task status unchanged
- Helps prevent missing the deadline

---

## 📧 Email Notifications

### **Reschedule Notification:**
```
Subject: RESCHEDULED: Submit report
Body:
  Your task "Submit report" was automatically rescheduled.
  
  Original Deadline: 2025-12-19 14:00
  New Deadline: 2025-12-20 14:00
  Priority: High
  
  This task was rescheduled because it became overdue.
  Please complete it by the new deadline.
```

### **Missed Task Alert:**
```
Subject: MISSED: Call client
Body:
  Your task "Call client" has been marked as MISSED.
  
  Deadline: 2025-12-16 10:00
  Priority: Medium
  
  This task was more than 24 hours overdue.
  Please review and create a new task if needed.
```

### **Reminder Email:**
```
Subject: REMINDER: Team meeting
Body:
  Reminder: Your task "Team meeting" is due soon!
  
  Deadline: 2025-12-19 15:00 (in 30 minutes)
  Priority: High
  
  Please complete this task on time.
```

---

## 🔧 Configuration

### **Change Monitoring Interval**

Edit `main.py`:
```python
aura.autonomous_manager.start_autonomous_monitoring(
    user_email=settings.USER_EMAIL,
    check_interval=300  # 300 seconds = 5 minutes
)
```

**Options:**
- `60` = 1 minute (frequent checks)
- `300` = 5 minutes (recommended)
- `900` = 15 minutes (less frequent)
- `3600` = 1 hour (minimal checks)

### **Change Reschedule Duration**

Edit `tools/autonomous_manager.py`:
```python
# Current: 24 hours
new_deadline = datetime.now() + timedelta(hours=24)

# Options:
new_deadline = datetime.now() + timedelta(hours=12)  # 12 hours
new_deadline = datetime.now() + timedelta(days=2)    # 2 days
new_deadline = datetime.now() + timedelta(hours=48)  # 48 hours
```

### **Change Overdue Threshold**

Edit `tools/autonomous_manager.py`:
```python
# Current: 24 hours
if hours_overdue < 24:
    # Reschedule
else:
    # Mark as missed

# Options:
if hours_overdue < 12:  # More aggressive
if hours_overdue < 48:  # More lenient
```

---

## 🎯 Use Cases

### **1. Busy Professional**
**Problem**: Constantly missing deadlines due to workload

**Solution**: Enable continuous monitoring
```
You: start monitoring
```

**Result**: AURA automatically reschedules overdue tasks and sends reminders

---

### **2. Student with Multiple Assignments**
**Problem**: Forgetting about assignments until too late

**Solution**: Run autonomous check daily
```
You: autonomous
```

**Result**: Get reminded of upcoming deadlines, overdue tasks rescheduled

---

### **3. Team Manager**
**Problem**: Need to track team tasks and deadlines

**Solution**: Continuous monitoring + email notifications

**Result**: Automatic alerts for missed deadlines, tasks rescheduled automatically

---

### **4. Hackathon Demo**
**Problem**: Need to show autonomous AI capabilities

**Solution**: Create tasks with past deadlines, run autonomous check

**Result**: Live demonstration of AI taking autonomous actions

---

## 📊 Monitoring Output

### **Example Output:**

```
🤖 AUTONOMOUS MANAGER - Running checks...

🔄 AUTONOMOUS ACTION: Rescheduling 'Submit report'
  ✓ Rescheduled to: 2025-12-20 14:00
  ✓ Notification email sent to user@example.com
  ✓ Calendar updated

⏰ AUTONOMOUS ACTION: Sending reminder for 'Team meeting'
  ✓ Reminder email sent to user@example.com

❌ AUTONOMOUS ACTION: Marking 'Old task' as MISSED
  ✓ Status updated to 'Missed'
  ✓ Alert email sent to user@example.com

============================================================
🤖 AUTONOMOUS MANAGER - Summary
============================================================
Overdue tasks found:     3
Tasks rescheduled:       1
Tasks marked missed:     1
Reminder emails sent:    1
============================================================
```

---

## 🎓 Demo Script for Judges

### **Setup** (1 minute):
1. Create 3 test tasks with different deadlines:
   - Task 1: Overdue by 2 hours
   - Task 2: Overdue by 3 days
   - Task 3: Due in 30 minutes

2. Show tasks in Notion database

### **Demo** (2 minutes):

1. **Run autonomous check**:
```
You: autonomous
```

2. **Point out actions**:
   - "Watch AURA analyze each task"
   - "Task 1: Automatically rescheduled"
   - "Task 2: Marked as missed"
   - "Task 3: Reminder email sent"

3. **Show Notion database**:
   - Refresh page
   - "Task 1 still pending, new deadline"
   - "Task 2 marked as missed"
   - "All automated - no human intervention"

4. **Show email notifications** (if possible):
   - Reschedule notification
   - Missed task alert
   - Reminder email

### **Key Points**:
- "Fully autonomous - no human needed"
- "Makes intelligent decisions based on time"
- "Integrates with Notion and email"
- "Production-ready AI system"

---

## 🔍 Technical Details

### **Architecture:**

```
┌─────────────────────────────────────┐
│     Autonomous Manager              │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Task Monitor                │  │
│  │  - Check pending tasks       │  │
│  │  - Calculate time differences│  │
│  │  - Make decisions            │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Action Executor             │  │
│  │  - Reschedule tasks          │  │
│  │  - Mark as missed            │  │
│  │  - Send emails               │  │
│  │  - Update calendar           │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Integrations                │  │
│  │  - Notion API                │  │
│  │  - Gmail API (mock)          │  │
│  │  - Calendar API (mock)       │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

### **File Structure:**

```
aura-agent/
├── tools/
│   └── autonomous_manager.py    ← Autonomous logic
├── main.py                      ← Integration
└── config/
    └── settings.py              ← Configuration
```

---

## ✅ Features Summary

**What AURA Does Autonomously:**

✅ **Monitors** all pending tasks continuously  
✅ **Detects** overdue and upcoming deadlines  
✅ **Reschedules** tasks that are slightly overdue  
✅ **Marks** severely overdue tasks as missed  
✅ **Sends** reminder emails for upcoming tasks  
✅ **Updates** Notion database automatically  
✅ **Syncs** calendar with new deadlines  
✅ **Logs** all actions taken  
✅ **Reports** summary of autonomous actions  

---

## 🎉 Ready to Use!

Your AURA system now has **full autonomous capabilities**!

**Try it now:**
```bash
cd aura-agent
python main.py
```

Then type:
```
You: autonomous
```

Watch AURA take autonomous actions! 🤖✨
