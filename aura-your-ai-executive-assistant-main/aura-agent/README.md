# 🤖 AURA Backend - Autonomous Unified Reminder Agent

## 🎯 Overview

AURA is a **production-ready multi-agent AI system** that autonomously manages tasks, schedules, and reminders using intelligent agents and persistent memory.

### Why This Architecture?

**Multi-Agent Design**: Real AI systems don't use a single monolithic model. AURA uses specialized agents:
- **Intent Agent**: Understands what the user wants
- **Planner Agent**: Creates detailed execution plans
- **Executor Agent**: Takes action using integrated tools

**Dual-LLM Strategy**: 
- **OpenAI (Primary)**: Production-grade intelligence with GPT models
- **Ollama (Fallback)**: Local LLM for demos without API costs
- **Automatic Switching**: Falls back gracefully if one fails

**Persistent Memory with Notion**:
- Tasks aren't just stored locally - they persist in Notion
- Judges can see the actual Notion database
- Real-world integration that startups would use

---

## 🏗️ Architecture

```
User Input → Intent Agent → Planner Agent → Executor Agent → Results
                  ↓              ↓               ↓
               [OpenAI]      [OpenAI]      [Notion API]
                  ↓              ↓          [Gmail API]
              [Ollama]       [Ollama]     [Calendar API]
             (fallback)     (fallback)
```

### Agent Responsibilities

#### 1️⃣ Intent Agent (`agents/intent_agent.py`)
- Analyzes user input using LLM
- Classifies intent: task, event, query, update
- Determines urgency level
- Extracts key entities (dates, names, times)
- **Fallback**: Rule-based classification if LLM fails

#### 2️⃣ Planner Agent (`agents/planner_agent.py`)
- Creates detailed execution plan
- Extracts structured data (title, deadline, priority)
- Plans required actions (Notion, Calendar, Email)
- **Fallback**: Template-based planning if LLM fails

#### 3️⃣ Executor Agent (`agents/executor_agent.py`)
- Executes planned actions
- Creates tasks in Notion database
- Schedules calendar events
- Sends confirmation emails
- Updates task status (Pending → Completed → Missed)

---

## 🔧 Setup Instructions

### Prerequisites
- Python 3.8+
- OpenAI API key (or Ollama installed locally)
- Notion account with API access

### Step 1: Install Dependencies

```bash
cd aura-agent
pip install -r requirements.txt
```

### Step 2: Configure Environment

Edit the `.env` file in the project root:

```env
# Choose your LLM provider
LLM_PROVIDER=openai          # or "ollama"

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...   # Your OpenAI API key
OPENAI_MODEL=gpt-3.5-turbo   # or gpt-4

# Notion Configuration
NOTION_API_KEY=ntn_...       # Your Notion integration token
NOTION_DATABASE_ID=...       # Your Notion database ID

# User Settings
USER_EMAIL=your@email.com
DEMO_MODE=true
```

### Step 3: Set Up Notion Database

1. Create a new Notion database called **"AURA Tasks"**
2. Add these properties:
   - **Task Name** (Title)
   - **Deadline** (Date)
   - **Priority** (Select: Low, Medium, High)
   - **Status** (Select: Pending, Completed, Missed)
   - **Created At** (Date)
   - **Last Updated** (Date)

3. Create a Notion integration:
   - Go to https://www.notion.so/my-integrations
   - Create new integration
   - Copy the API key
   - Share your database with the integration

4. Get your database ID:
   - Open your database in Notion
   - Copy the URL: `https://notion.so/workspace/DATABASE_ID?v=...`
   - The `DATABASE_ID` is the part between the last `/` and `?`

### Step 4: Run AURA

```bash
python main.py
```

---

## 🚀 Usage Examples

### Interactive Mode

```
You: Remind me to prepare presentation by tomorrow 3pm
```

**AURA will:**
1. ✓ Analyze intent (task creation, high urgency)
2. ✓ Create execution plan
3. ✓ Save task to Notion with deadline
4. ✓ Create calendar reminder
5. ✓ Send confirmation email

### Special Commands

```bash
# Check for overdue tasks
You: check overdue

# View all pending tasks
You: show tasks

# Exit
You: quit
```

---

## 🧪 Demo Safety Features

AURA is designed for **hackathon safety**:

### Mock Mode
If APIs fail, AURA automatically switches to mock mode:
- ✓ Tasks stored in memory (not lost)
- ✓ All operations logged
- ✓ System continues working
- ✓ No crashes or errors

### Automatic Fallbacks
1. **OpenAI fails** → Switch to Ollama
2. **Ollama fails** → Use rule-based logic
3. **Notion fails** → Use in-memory storage
4. **Gmail fails** → Log email (don't crash)

This means **AURA always works**, even without internet!

---

## 📊 Task Lifecycle

```
User Request
    ↓
[PENDING] - Task created in Notion
    ↓
Calendar Event Created
    ↓
Confirmation Email Sent
    ↓
(Time passes...)
    ↓
Deadline Reached?
    ├─ Yes → [COMPLETED] (user marks done)
    └─ No → [MISSED] (auto-updated)
         ↓
    Alert Email Sent
```

---

## 🎓 Explaining to Judges

### "Why multi-agent architecture?"

> "Real AI systems like AutoGPT and LangChain use multiple specialized agents. Each agent has one job and does it well. This is how production AI systems work - not a single monolithic model."

### "Why both OpenAI and Ollama?"

> "Startups need flexibility. OpenAI gives us production-grade intelligence, but Ollama lets us demo offline and reduce API costs. The system automatically picks the best available option."

### "Why Notion as memory?"

> "Tasks need to persist beyond the session. Notion is what real teams use. Judges can actually see our database and verify tasks are being created. It's not just mock data - it's real integration."

### "What if something fails?"

> "Every component has a fallback. If OpenAI is down, we use Ollama. If Notion fails, we use memory. The system is designed to degrade gracefully, not crash. That's production-ready thinking."

---

## 🔍 Code Structure

```
aura-agent/
├── agents/
│   ├── intent_agent.py      # Intent classification
│   ├── planner_agent.py     # Execution planning
│   └── executor_agent.py    # Action execution
│
├── llm/
│   ├── base_llm.py          # LLM interface
│   ├── openai_client.py     # OpenAI integration
│   └── ollama_client.py     # Ollama integration
│
├── tools/
│   ├── notion_tool.py       # Notion database API
│   ├── gmail_tool.py        # Email automation
│   └── calendar_tool.py     # Calendar integration
│
├── config/
│   └── settings.py          # Configuration management
│
├── main.py                  # Main orchestration
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

---

## 🎯 Key Features

✅ **Intelligent Intent Detection** - Understands natural language  
✅ **Automatic Priority Assignment** - Analyzes urgency  
✅ **Persistent Task Memory** - Notion database integration  
✅ **Calendar Synchronization** - Google Calendar events  
✅ **Email Notifications** - Confirmations and reminders  
✅ **Overdue Task Detection** - Auto-updates missed deadlines  
✅ **Dual-LLM Support** - OpenAI + Ollama with fallback  
✅ **Mock Mode** - Works without APIs for demos  
✅ **Production-Ready** - Error handling and logging  

---

## 🐛 Troubleshooting

### "OpenAI API error"
- Check your API key in `.env`
- Verify you have credits in your OpenAI account
- System will auto-fallback to Ollama

### "Ollama connection failed"
- Install Ollama: https://ollama.ai
- Run: `ollama pull llama2`
- Start Ollama server: `ollama serve`

### "Notion API error"
- Verify your API key is correct
- Ensure database is shared with integration
- Check database ID is correct
- System will use mock mode if Notion fails

### "No LLM available"
- System will use rule-based fallback
- Basic functionality still works
- Consider installing Ollama for better results

---

## 📈 Future Enhancements

- [ ] Voice input support
- [ ] Multi-user support
- [ ] Advanced NLP with fine-tuned models
- [ ] Slack/Discord integration
- [ ] Mobile app
- [ ] Analytics dashboard

---

## 🏆 Hackathon Highlights

**What makes AURA special:**

1. **Real AI Architecture** - Not just API calls, but a true multi-agent system
2. **Production Thinking** - Fallbacks, error handling, graceful degradation
3. **Real Integrations** - Actual Notion database, not mock data
4. **Explainable** - Clear agent responsibilities, easy to understand
5. **Demo-Safe** - Works even if APIs fail during presentation

---

## 📝 License

MIT License - Built for hackathon demonstration

---

## 👥 Team

Built with ❤️ for demonstrating production-ready AI architecture

---

**Remember**: This isn't just a hackathon project - it's designed like a real AI startup MVP. Every design decision has a reason, and every component has a fallback. That's what makes it production-ready.
