# 🏗️ AURA Architecture Documentation

## System Overview

AURA is a **multi-agent AI system** designed with production-ready principles:
- Modular architecture
- Graceful degradation
- Automatic fallbacks
- Real-world integrations

---

## 🎯 Design Philosophy

### Why Multi-Agent?

**Problem**: Single LLM calls are unreliable and hard to debug.

**Solution**: Break the problem into specialized agents:
1. **Intent Agent** - What does the user want?
2. **Planner Agent** - How do we do it?
3. **Executor Agent** - Make it happen

**Benefits**:
- Each agent has one clear responsibility
- Easier to debug (which agent failed?)
- Can swap LLMs per agent
- Mirrors real AI systems (AutoGPT, LangChain)

### Why Dual-LLM?

**Problem**: Relying on one LLM provider is risky.

**Solution**: Support multiple providers with automatic fallback:
- **OpenAI**: Production-grade, but costs money
- **Ollama**: Free, local, works offline
- **Rule-based**: Ultimate fallback, always works

**Benefits**:
- Demo works even without API keys
- Reduces API costs in development
- Production resilience

### Why Notion?

**Problem**: In-memory storage isn't impressive to judges.

**Solution**: Real database integration:
- Tasks persist across sessions
- Judges can see actual Notion database
- Shows real-world integration skills
- Notion is what startups actually use

---

## 📊 Data Flow

```
┌─────────────┐
│ User Input  │
│ "Remind me  │
│  tomorrow"  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│     INTENT AGENT                    │
│  ┌──────────┐      ┌──────────┐   │
│  │ OpenAI   │ ───▶ │ Ollama   │   │
│  │ Analysis │      │ Fallback │   │
│  └──────────┘      └──────────┘   │
│         │                │         │
│         └────────┬───────┘         │
│                  ▼                 │
│         ┌──────────────┐          │
│         │ Rule-based   │          │
│         │ Fallback     │          │
│         └──────────────┘          │
└──────────────┬──────────────────────┘
               │
               ▼
        {type: "task",
         urgency: "medium",
         entities: [...]}
               │
               ▼
┌─────────────────────────────────────┐
│     PLANNER AGENT                   │
│  ┌──────────┐      ┌──────────┐   │
│  │ OpenAI   │ ───▶ │ Ollama   │   │
│  │ Planning │      │ Fallback │   │
│  └──────────┘      └──────────┘   │
│         │                │         │
│         └────────┬───────┘         │
│                  ▼                 │
│         ┌──────────────┐          │
│         │ Template     │          │
│         │ Fallback     │          │
│         └──────────────┘          │
└──────────────┬──────────────────────┘
               │
               ▼
        {task_details: {...},
         actions: [...],
         priority: 1}
               │
               ▼
┌─────────────────────────────────────┐
│     EXECUTOR AGENT                  │
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │ Notion   │  │ Calendar │       │
│  │ API      │  │ API      │       │
│  └────┬─────┘  └────┬─────┘       │
│       │             │              │
│       ▼             ▼              │
│  [Database]    [Events]            │
│                                     │
│  ┌──────────┐                      │
│  │ Gmail    │                      │
│  │ API      │                      │
│  └────┬─────┘                      │
│       │                            │
│       ▼                            │
│  [Emails]                          │
└─────────────────────────────────────┘
               │
               ▼
        {success: true,
         created_items: {...}}
```

---

## 🧩 Component Details

### LLM Abstraction Layer

**Purpose**: Unified interface for multiple LLM providers

**Files**:
- `llm/base_llm.py` - Abstract interface
- `llm/openai_client.py` - OpenAI implementation
- `llm/ollama_client.py` - Ollama implementation

**Key Methods**:
```python
generate(prompt, system_prompt, temperature, max_tokens) -> str
chat(messages, temperature, max_tokens) -> str
is_available() -> bool
```

**Fallback Logic**:
1. Try primary provider (from config)
2. If fails, try secondary provider
3. If both fail, return None (agents use rule-based)

### Intent Agent

**Purpose**: Understand user intent from natural language

**Input**: Raw user text
**Output**: Structured intent object

```python
{
    "type": "task" | "event" | "query" | "update",
    "urgency": "low" | "medium" | "high",
    "action_required": "create_task" | "create_event" | ...,
    "key_entities": ["tomorrow", "3pm", "John"],
    "confidence": "llm" | "rule_based"
}
```

**LLM Prompt Strategy**:
- System prompt defines classification rules
- Requests JSON output (no markdown)
- Temperature: 0.3 (deterministic)
- Max tokens: 200 (efficient)

**Fallback Strategy**:
- Keyword matching for intent type
- Regex for time/date extraction
- Heuristics for urgency

### Planner Agent

**Purpose**: Create detailed execution plan

**Input**: User text + Intent object
**Output**: Execution plan

```python
{
    "type": "task" | "event",
    "task_details": {
        "title": str,
        "description": str,
        "deadline": ISO datetime,
        "priority": "Low" | "Medium" | "High",
        "estimated_duration": int (minutes)
    },
    "actions": [
        {"action": "create_notion_task", "priority": 1},
        {"action": "create_calendar_reminder", "priority": 2},
        {"action": "send_confirmation_email", "priority": 3}
    ],
    "urgency": "low" | "medium" | "high"
}
```

**LLM Prompt Strategy**:
- Provides current time for context
- Requests structured JSON
- Temperature: 0.3 (consistent)
- Max tokens: 300 (detailed)

**Fallback Strategy**:
- Template-based extraction
- Default deadlines (tomorrow, next week)
- Priority mapping from urgency

### Executor Agent

**Purpose**: Execute planned actions using tools

**Input**: Execution plan
**Output**: Results object

```python
{
    "success": bool,
    "executed_actions": ["create_notion_task", ...],
    "created_items": {
        "notion_task": {...},
        "calendar_event": {...}
    },
    "errors": [...]
}
```

**Execution Flow**:
1. Create Notion task (persistent memory)
2. Create calendar event (reminder)
3. Send confirmation email (notification)
4. Log all actions
5. Return results

**Error Handling**:
- Each action wrapped in try-catch
- Failures logged but don't stop execution
- Partial success is still success

---

## 🔧 Tool Integrations

### Notion Tool

**Purpose**: Persistent task database

**Key Methods**:
```python
create_task(task_name, deadline, priority, description) -> Dict
update_task_status(task_id, status) -> bool
get_pending_tasks() -> List[Dict]
mark_overdue_tasks() -> int
```

**Mock Mode**:
- In-memory task storage
- All operations logged
- No API calls
- Perfect for demos

**Database Schema**:
```
AURA Tasks Database
├── Task Name (Title)
├── Deadline (Date)
├── Priority (Select: Low, Medium, High)
├── Status (Select: Pending, Completed, Missed)
├── Created At (Date)
└── Last Updated (Date)
```

### Gmail Tool

**Purpose**: Email notifications

**Current State**: Mock mode (for hackathon safety)

**Methods**:
```python
send_task_confirmation(to_email, task_name, deadline, priority) -> bool
send_deadline_reminder(to_email, task_name, deadline) -> bool
send_missed_deadline_alert(to_email, task_name, deadline) -> bool
```

**Future**: Real Gmail API integration

### Calendar Tool

**Purpose**: Event scheduling

**Current State**: Mock mode (for hackathon safety)

**Methods**:
```python
create_event(title, start_time, end_time, description, location) -> Dict
update_event(event_id, updates) -> bool
delete_event(event_id) -> bool
```

**Future**: Real Google Calendar API integration

---

## ⚙️ Configuration System

**Purpose**: Centralized settings management

**File**: `config/settings.py`

**Environment Variables**:
```env
# LLM Configuration
LLM_PROVIDER=openai|ollama
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo
OLLAMA_MODEL=llama2
OLLAMA_BASE_URL=http://localhost:11434

# Notion Configuration
NOTION_API_KEY=ntn_...
NOTION_DATABASE_ID=...

# Application Settings
USER_EMAIL=user@example.com
DEMO_MODE=true
```

**Validation**:
- Checks for required keys
- Warns about missing configs
- Non-blocking (allows demo mode)

---

## 🛡️ Error Handling Strategy

### Levels of Fallback

**Level 1: Primary LLM (OpenAI)**
- Best intelligence
- Costs money
- Requires API key

**Level 2: Secondary LLM (Ollama)**
- Good intelligence
- Free
- Requires local installation

**Level 3: Rule-Based Logic**
- Basic intelligence
- Always available
- No dependencies

**Level 4: Mock Mode**
- No external dependencies
- Logs everything
- Perfect for demos

### Error Propagation

```python
try:
    # Try OpenAI
    result = openai_client.generate(...)
except:
    try:
        # Try Ollama
        result = ollama_client.generate(...)
    except:
        # Use rules
        result = rule_based_fallback(...)
```

**Key Principle**: Never crash, always degrade gracefully

---

## 🚀 Deployment Considerations

### Current State: Hackathon Demo
- Mock mode for Gmail/Calendar
- Notion integration (real)
- OpenAI/Ollama (real)
- Local execution

### Production Roadmap

**Phase 1: MVP**
- [ ] Real Gmail OAuth
- [ ] Real Calendar OAuth
- [ ] User authentication
- [ ] Web API (FastAPI)

**Phase 2: Scale**
- [ ] Database (PostgreSQL)
- [ ] Redis caching
- [ ] Background jobs (Celery)
- [ ] Docker deployment

**Phase 3: Enterprise**
- [ ] Multi-tenant
- [ ] Analytics
- [ ] Custom integrations
- [ ] Mobile apps

---

## 📈 Performance Considerations

### LLM Latency
- OpenAI: ~1-3 seconds
- Ollama: ~2-5 seconds (depends on hardware)
- Rule-based: <100ms

### Optimization Strategies
1. **Caching**: Cache common intents
2. **Parallel**: Run agents in parallel where possible
3. **Streaming**: Stream LLM responses
4. **Batching**: Batch Notion API calls

### Current Performance
- Intent analysis: ~1-2s
- Planning: ~1-2s
- Execution: ~1-3s
- **Total**: ~3-7s per request

**Acceptable for hackathon demo**

---

## 🧪 Testing Strategy

### Unit Tests
- Each agent independently
- Mock LLM responses
- Test fallback logic

### Integration Tests
- Full pipeline
- Real API calls (optional)
- Mock mode verification

### Demo Tests
- Common use cases
- Error scenarios
- Fallback demonstrations

**Test File**: `test_aura.py`

---

## 🎓 Educational Value

### What Judges Learn

1. **Multi-Agent Architecture**
   - Real AI systems use specialized agents
   - Not just "call GPT and hope"

2. **Production Thinking**
   - Fallbacks at every level
   - Graceful degradation
   - Error handling

3. **Real Integrations**
   - Notion API (persistent memory)
   - OpenAI API (intelligence)
   - Proper API design

4. **Hackathon Safety**
   - Mock modes for demos
   - Works offline
   - No crashes

---

## 🔮 Future Enhancements

### Short Term
- [ ] Voice input (Whisper API)
- [ ] Better NLP (fine-tuned models)
- [ ] More integrations (Slack, Discord)

### Long Term
- [ ] Learning from user behavior
- [ ] Predictive task suggestions
- [ ] Multi-user collaboration
- [ ] Mobile apps

---

## 📚 References

**Inspiration**:
- AutoGPT: Multi-agent autonomous AI
- LangChain: LLM application framework
- Notion API: Modern productivity tools

**Technologies**:
- OpenAI GPT models
- Ollama (local LLMs)
- Notion API
- Python 3.8+

---

**This architecture is designed to impress judges while being genuinely useful. It's not just a hackathon project - it's a blueprint for a real AI startup.**
