# ⚡ AURA Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Python Dependencies (1 min)

```bash
cd aura-agent
pip install -r requirements.txt
```

### Step 2: Configure API Keys (2 min)

Edit `.env` file in the project root:

```env
# Set your OpenAI API key
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE

# Set your Notion API key
NOTION_API_KEY=ntn_YOUR_KEY_HERE

# Optional: Add your Notion database ID
NOTION_DATABASE_ID=your_database_id
```

**Don't have API keys?** No problem! AURA works in demo mode:
- Set `LLM_PROVIDER=ollama` (if you have Ollama installed)
- Or just run it - it will use mock mode automatically

### Step 3: Run AURA (30 seconds)

```bash
python main.py
```

### Step 4: Try It Out! (1 min)

```
You: Remind me to prepare presentation by tomorrow 3pm
You: Schedule meeting with John on Friday at 2pm
You: show tasks
You: quit
```

---

## 🎯 What You'll See

```
🚀 INITIALIZING AURA SYSTEM
============================================================

🧠 Initializing LLM...
✓ OpenAI client initialized with model: gpt-3.5-turbo
✓ Using OpenAI: gpt-3.5-turbo

✓ Notion client initialized
✓ Connected to Notion database: abc123...
✓ Gmail tool initialized (MOCK mode for demo)
✓ Calendar tool initialized (MOCK mode for demo)
✓ Intent Agent initialized
✓ Planner Agent initialized
✓ Executor Agent initialized

✅ AURA SYSTEM READY

💬 AURA Interactive Mode
Type your requests or 'quit' to exit

You: _
```

---

## 🧪 Test Examples

### Create a Task
```
You: Remind me to submit report by Friday 5pm
```

**Expected Output:**
- ✓ Intent detected: task (urgency: medium)
- ✓ Task plan created: 'submit report'
- ✓ Task created in Notion
- ✓ Calendar reminder created
- ✓ Confirmation email sent

### Schedule an Event
```
You: Schedule team meeting tomorrow at 10am for 1 hour
```

**Expected Output:**
- ✓ Intent detected: event (urgency: high)
- ✓ Event plan created: 'team meeting'
- ✓ Calendar event created
- ✓ Task created in Notion
- ✓ Success!

### Check Tasks
```
You: show tasks
```

**Expected Output:**
```
📋 Pending Tasks: 2
  - submit report (Priority: Medium)
  - team meeting (Priority: Medium)
```

---

## 🔧 Troubleshooting

### "ModuleNotFoundError: No module named 'openai'"
```bash
pip install -r requirements.txt
```

### "OpenAI API error: Invalid API key"
- Check your API key in `.env`
- Make sure it starts with `sk-proj-` or `sk-`
- System will auto-fallback to Ollama or mock mode

### "Notion API error"
- Verify your Notion API key
- Make sure you've shared the database with your integration
- System will use mock mode if Notion fails

### "No LLM available"
This is fine! AURA will use rule-based logic:
- Intent detection still works
- Task creation still works
- Just less "intelligent" parsing

---

## 🎓 Demo Tips

### For Judges:

1. **Show the multi-agent flow:**
   ```
   You: Urgent: Call client about contract by today 5pm
   ```
   Point out each agent's output in the logs

2. **Show the Notion integration:**
   - Open your Notion database
   - Create a task in AURA
   - Refresh Notion - task appears!

3. **Show the fallback system:**
   - Disconnect internet
   - AURA still works in mock mode
   - "This is production-ready thinking"

4. **Show task lifecycle:**
   ```
   You: show tasks
   You: check overdue
   ```

### For Testing:

```bash
# Test 1: Simple task
You: Buy groceries tomorrow

# Test 2: Urgent task
You: URGENT: Finish presentation by today 6pm

# Test 3: Event with attendees
You: Schedule standup with team on Monday 9am

# Test 4: Query
You: show tasks

# Test 5: Overdue check
You: check overdue
```

---

## 📊 What Gets Created

For each request, AURA creates:

1. **Notion Task** (if Notion is configured)
   - Task Name
   - Deadline
   - Priority
   - Status: Pending

2. **Calendar Event** (in mock mode for demo)
   - Event title
   - Start/end time
   - Description

3. **Email Notification** (in mock mode for demo)
   - Confirmation email
   - Task details

---

## 🎯 Next Steps

1. **Set up real Notion database** - See main README.md
2. **Configure Google Calendar** - For real calendar sync
3. **Add Gmail OAuth** - For real email sending
4. **Deploy to cloud** - Make it accessible 24/7

---

## 💡 Pro Tips

- Use natural language - AURA understands context
- Be specific about times: "tomorrow 3pm" works better than "tomorrow"
- Check tasks regularly: `show tasks`
- Test overdue detection: `check overdue`
- Use URGENT for high priority tasks

---

## 🆘 Need Help?

1. Check the main README.md for detailed docs
2. Look at the code - it's well-commented
3. Run with `DEMO_MODE=true` for safe testing
4. All tools have mock modes - nothing breaks!

---

**You're ready! Start AURA and try your first request! 🚀**
