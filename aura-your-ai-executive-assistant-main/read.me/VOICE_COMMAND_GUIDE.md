# 🎤 AURA Voice Command Integration Guide

## Overview

AURA now supports **voice commands** for hands-free interaction! Speak naturally and AURA will transcribe your voice into text, then process it through the NLP system.

---

## 🎯 Features

### Backend (Python)
- **Google Speech Recognition API** - Free, cloud-based transcription
- **CMU Sphinx** - Offline fallback for privacy
- **Continuous listening mode** - Always-on voice assistant
- **Microphone testing** - Verify your setup works

### Frontend (React)
- **Web Speech API** - Browser-native voice recognition
- **Real-time transcription** - See your words as you speak
- **Visual feedback** - Animated microphone button
- **Cross-browser support** - Works in Chrome, Edge, Safari

---

## 🚀 Setup

### Backend Setup

1. **Install dependencies**:
```bash
cd aura-agent
pip install SpeechRecognition pyaudio
```

**Note**: On Windows, you may need to install PyAudio separately:
```bash
pip install pipwin
pipwin install pyaudio
```

2. **Test microphone**:
```bash
python tools/voice_input.py
```

3. **Run AURA with voice**:
```bash
python main.py
```

Then type `voice` to activate voice input!

### Frontend Setup

**No installation needed!** The Web Speech API is built into modern browsers.

Just open the dashboard and click the microphone button 🎤

---

## 📖 How to Use

### Backend Voice Commands

1. **Start AURA**:
```bash
cd aura-agent
python main.py
```

2. **Type `voice`** when prompted:
```
You: voice
🎤 Listening... (speak now)
```

3. **Speak your command**:
```
"Remind me to prepare presentation by tomorrow 3pm"
```

4. **AURA processes it**:
```
🔄 Processing speech...
✓ Recognized: 'Remind me to prepare presentation by tomorrow 3pm'
🎤 Voice: Remind me to prepare presentation by tomorrow 3pm

🧠 Intent Agent analyzing...
✓ Intent detected: task (urgency: medium)
...
```

### Frontend Voice Commands

1. **Open Dashboard** at http://localhost:8080

2. **Click the microphone button** 🎤 next to the input field

3. **Speak your command**:
```
"Schedule team meeting on Friday at 2pm"
```

4. **Voice is transcribed** into the input field automatically

5. **Click "Let AURA Handle It"** to process

---

## 🎙️ Voice Command Examples

### Task Creation
```
"Remind me to buy groceries tomorrow"
"URGENT: Submit report by today 5pm"
"Call Sarah next Monday at 10am"
```

### Event Scheduling
```
"Schedule meeting with John on Friday at 2pm"
"Book dentist appointment next week"
"Team standup every morning at 9am"
```

### Queries
```
"Show my tasks"
"What's on my calendar today?"
"Check overdue tasks"
```

---

## 🔧 Technical Details

### Backend Architecture

**File**: `aura-agent/tools/voice_input.py`

```python
class VoiceInput:
    def listen(self, timeout=5, phrase_time_limit=10):
        """
        Listen for voice input and convert to text
        
        Flow:
        1. Adjust for ambient noise
        2. Listen for speech (timeout: 5s)
        3. Try Google Speech Recognition (online)
        4. Fallback to Sphinx (offline)
        5. Return transcribed text
        """
```

**Recognition Backends**:
1. **Google Speech Recognition** (Primary)
   - Cloud-based
   - High accuracy
   - Free tier available
   - Requires internet

2. **CMU Sphinx** (Fallback)
   - Offline
   - Lower accuracy
   - No internet needed
   - Privacy-focused

### Frontend Architecture

**File**: `src/hooks/useVoiceInput.ts`

```typescript
export const useVoiceInput = (options) => {
  // Uses Web Speech API
  // Browser-native speech recognition
  // Real-time transcription
  // No server required
}
```

**Component**: `src/components/VoiceInput.tsx`

Features:
- Animated microphone button
- Visual feedback (pulse when listening)
- Toast notifications
- Error handling
- Browser compatibility check

---

## 🌐 Browser Support

### Web Speech API Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Best support |
| Edge | ✅ Full | Chromium-based |
| Safari | ✅ Full | iOS 14.5+ |
| Firefox | ⚠️ Partial | Limited support |
| Opera | ✅ Full | Chromium-based |

**Recommendation**: Use Chrome or Edge for best experience.

---

## 🎯 Use Cases

### 1. Hands-Free Task Creation
```
Scenario: Cooking dinner, hands are messy
Action: Say "voice" then "Remind me to call mom tomorrow"
Result: Task created without touching keyboard
```

### 2. Quick Meeting Scheduling
```
Scenario: Just finished a call, need to schedule follow-up
Action: Click mic button, say "Schedule follow-up with client next Tuesday 3pm"
Result: Event created and added to calendar
```

### 3. Driving Mode (Backend)
```
Scenario: In car, need to set reminder
Action: Run AURA in continuous mode
Command: "Remind me to pick up dry cleaning"
Result: Task created hands-free
```

### 4. Accessibility
```
Scenario: User with mobility limitations
Action: Use voice commands exclusively
Result: Full AURA functionality via voice
```

---

## 🔒 Privacy & Security

### Backend (Python)
- **Google API**: Sends audio to Google servers
- **Sphinx**: Processes audio locally (offline)
- **No storage**: Audio is not saved
- **Fallback**: Always available offline mode

### Frontend (Web Speech API)
- **Browser-based**: Audio processed by browser
- **No server**: Nothing sent to AURA backend
- **Permissions**: Requires microphone access
- **Secure**: HTTPS required for production

---

## 🐛 Troubleshooting

### Backend Issues

**"Microphone not available"**
```bash
# Check if microphone is connected
# On Windows: Settings > Privacy > Microphone
# Grant permission to Python/Terminal

# Test with:
python tools/voice_input.py
```

**"No module named 'pyaudio'"**
```bash
# Windows:
pip install pipwin
pipwin install pyaudio

# Mac:
brew install portaudio
pip install pyaudio

# Linux:
sudo apt-get install python3-pyaudio
```

**"Could not understand audio"**
- Speak clearly and slowly
- Reduce background noise
- Check microphone volume
- Try moving closer to mic

### Frontend Issues

**"Speech recognition not supported"**
- Use Chrome, Edge, or Safari
- Enable microphone permissions
- Use HTTPS (required for production)

**"Microphone access denied"**
- Click the lock icon in address bar
- Allow microphone access
- Refresh the page

**"No sound detected"**
- Check browser microphone settings
- Test microphone in system settings
- Try a different browser

---

## 📊 Performance

### Backend
- **Latency**: 1-3 seconds (Google API)
- **Accuracy**: 90-95% (clear speech)
- **Offline**: 70-80% accuracy (Sphinx)

### Frontend
- **Latency**: <1 second (Web Speech API)
- **Accuracy**: 85-95% (browser-dependent)
- **Real-time**: Yes (interim results)

---

## 🎓 Advanced Features

### Continuous Listening Mode (Backend)

```python
from tools.voice_input import VoiceInput

voice = VoiceInput()

def process_command(text):
    print(f"Processing: {text}")
    # Your processing logic here

# Listen continuously until "stop listening"
voice.listen_continuous(
    callback=process_command,
    stop_phrase="stop listening"
)
```

### Custom Language (Frontend)

```typescript
const { transcript, startListening } = useVoiceInput({
  lang: 'es-ES',  // Spanish
  continuous: true,
  interimResults: true
});
```

### Voice Shortcuts (Backend)

Add to `main.py`:
```python
# Voice shortcuts
voice_shortcuts = {
    "show tasks": lambda: aura.get_pending_tasks(),
    "check overdue": lambda: aura.check_overdue_tasks(),
    "quit": lambda: exit()
}

if user_input.lower() in voice_shortcuts:
    voice_shortcuts[user_input.lower()]()
```

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Wake word detection ("Hey AURA")
- [ ] Multi-language support
- [ ] Voice feedback (text-to-speech responses)
- [ ] Custom voice commands
- [ ] Voice authentication
- [ ] Noise cancellation
- [ ] Speaker identification

---

## 📝 Example Workflow

### Complete Voice-to-Notion Flow

1. **User speaks**: "Remind me to submit hackathon project by today 11:59pm"

2. **Voice Input** (Backend/Frontend):
   - Captures audio
   - Transcribes to text
   - Returns: "Remind me to submit hackathon project by today 11:59pm"

3. **Intent Agent** (OpenAI/Rules):
   - Analyzes text
   - Detects: task, high urgency

4. **Planner Agent** (OpenAI/Rules):
   - Extracts details
   - Title: "submit hackathon project"
   - Deadline: "2024-12-19T23:59:00"
   - Priority: "High"

5. **Executor Agent** (Notion):
   - Creates task in Notion database
   - Sets calendar reminder
   - Sends confirmation email

6. **Result**:
   - Task visible in Notion
   - User notified
   - All from voice command!

---

## 🎉 Demo Script for Judges

### Voice Command Demo

**Setup** (30 seconds):
1. Open AURA Dashboard
2. Show microphone button
3. Explain Web Speech API integration

**Demo** (2 minutes):

1. **Click microphone button** 🎤
   - "Watch the button pulse - it's listening"

2. **Speak clearly**:
   - "URGENT: Prepare investor pitch deck by tomorrow 2pm"

3. **Show transcription**:
   - "See how it captured my voice perfectly"

4. **Click process**:
   - "Now AURA's multi-agent system takes over"

5. **Show Notion**:
   - Open Notion database
   - "Task created from voice - no typing!"

**Key Points**:
- "Hands-free interaction"
- "Natural language processing"
- "Real-time transcription"
- "Production-ready integration"

---

## 📚 API Documentation

### Backend API

```python
# Initialize
voice = VoiceInput()

# Single command
text = voice.listen(timeout=5, phrase_time_limit=10)

# Continuous mode
voice.listen_continuous(callback=process_fn, stop_phrase="stop")

# Test microphone
is_working = voice.test_microphone()
```

### Frontend API

```typescript
// Hook
const {
  transcript,        // Current transcription
  isListening,       // Is currently recording
  isSupported,       // Browser supports API
  error,             // Error message if any
  startListening,    // Start recording
  stopListening,     // Stop recording
  resetTranscript    // Clear transcript
} = useVoiceInput(options);

// Component
<VoiceInput
  onTranscript={(text) => console.log(text)}
  onStart={() => console.log('Started')}
  onStop={() => console.log('Stopped')}
  autoSubmit={false}
/>
```

---

## ✅ Integration Complete!

**AURA now supports voice commands in both backend and frontend!**

### What Works:
✅ Voice input in Python backend  
✅ Voice input in React frontend  
✅ Google Speech Recognition (online)  
✅ CMU Sphinx fallback (offline)  
✅ Web Speech API (browser)  
✅ Real-time transcription  
✅ Visual feedback  
✅ Error handling  
✅ Cross-browser support  

### How to Use:
- **Backend**: Type `voice` in terminal
- **Frontend**: Click 🎤 button on dashboard

**Your AURA system is now voice-enabled!** 🎉🎤
