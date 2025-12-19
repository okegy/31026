# 🎤 Voice Input Troubleshooting Guide

## Quick Fixes for Voice Input Issues

---

## ✅ Frontend Voice Input (Web Browser)

### Issue: Voice button not working

**Solution 1: Check Browser Compatibility**
- ✅ **Chrome** - Full support
- ✅ **Edge** - Full support  
- ✅ **Safari** - Full support (iOS 14.5+)
- ❌ **Firefox** - Limited support

**Use Chrome or Edge for best results!**

### Issue: Microphone permission denied

**Solution:**
1. Click the **lock icon** in address bar
2. Find "Microphone" permission
3. Change to **"Allow"**
4. **Refresh the page**

**Chrome:**
```
Settings > Privacy and security > Site Settings > Microphone
```

**Edge:**
```
Settings > Cookies and site permissions > Microphone
```

### Issue: No speech detected

**Solution:**
1. **Check microphone is plugged in** (if external)
2. **Test microphone** in system settings
3. **Speak clearly** and close to mic
4. **Reduce background noise**
5. **Wait for "Listening..." notification**
6. **Speak within 5 seconds**

### Issue: Wrong text transcribed

**Solution:**
1. **Speak slowly and clearly**
2. **Use simple sentences**
3. **Avoid background noise**
4. **Speak in English** (default language)
5. **Try again** - click mic button again

---

## 🐍 Backend Voice Input (Python)

### Issue: "No module named 'speech_recognition'"

**Solution:**
```bash
cd aura-agent
pip install SpeechRecognition
```

### Issue: "No module named 'pyaudio'"

**Windows:**
```bash
pip install pipwin
pipwin install pyaudio
```

**Mac:**
```bash
brew install portaudio
pip install pyaudio
```

**Linux:**
```bash
sudo apt-get install python3-pyaudio
pip install pyaudio
```

### Issue: "Microphone not available"

**Solution:**
1. **Check microphone is connected**
2. **Grant microphone permission** to Terminal/Python
3. **Test microphone** in system settings

**Windows:**
```
Settings > Privacy > Microphone > Allow apps to access microphone
```

**Mac:**
```
System Preferences > Security & Privacy > Microphone > Allow Terminal
```

### Issue: "Could not understand audio"

**Solution:**
1. **Speak louder and clearer**
2. **Reduce background noise**
3. **Check microphone volume**
4. **Move closer to microphone**
5. **Try again**

---

## 🧪 Testing Voice Input

### Test Frontend (Browser)

1. **Open Dashboard**: http://localhost:8080
2. **Click microphone button** 🎤
3. **Look for notifications**:
   - "🎤 Listening..." = Working!
   - "Microphone access denied" = Fix permissions
   - "Not supported" = Use Chrome/Edge

4. **Speak**: "Remind me to test voice input"
5. **Check input field** - should show your text

### Test Backend (Python)

1. **Run test script**:
```bash
cd aura-agent
python tools/voice_input.py
```

2. **Expected output**:
```
🎤 AURA Voice Input Test
✓ Voice input initialized (Microphone detected)
Testing microphone...
🎤 Testing microphone... Say something!
✓ Microphone working! Heard: 'hello world'
```

3. **If errors**, follow solutions above

---

## 🔧 Common Issues & Solutions

### Issue: Button shows microphone with slash (🎤❌)

**Cause**: Browser doesn't support Web Speech API

**Solution**: Use **Chrome** or **Edge** browser

---

### Issue: Button pulses but no text appears

**Cause**: Speech not being recognized

**Solutions**:
1. **Speak louder**
2. **Speak more clearly**
3. **Check microphone volume**
4. **Reduce background noise**
5. **Wait for button to stop pulsing**, then check input

---

### Issue: "No speech detected" error

**Cause**: Didn't speak within timeout (5 seconds)

**Solution**:
1. Click mic button
2. **Immediately start speaking**
3. Speak within 5 seconds
4. Keep speaking until done

---

### Issue: Partial text captured

**Cause**: Stopped speaking too soon

**Solution**:
1. Speak your **complete sentence**
2. **Don't pause** in the middle
3. Wait for button to stop pulsing
4. Text will appear in input field

---

### Issue: Backend says "voice" but nothing happens

**Cause**: SpeechRecognition library not installed

**Solution**:
```bash
pip install SpeechRecognition
```

Then restart AURA:
```bash
python main.py
```

---

## 📱 Mobile Support

### iOS (Safari)
- ✅ **Supported** on iOS 14.5+
- Requires **HTTPS** in production
- Works on localhost for testing

### Android (Chrome)
- ✅ **Fully supported**
- Best mobile experience
- Requires microphone permission

---

## 🎯 Best Practices

### For Best Results:

1. **Use Chrome or Edge** browser
2. **Speak clearly** and at normal pace
3. **Reduce background noise**
4. **Use good microphone** (not laptop mic if possible)
5. **Wait for "Listening..."** notification
6. **Speak complete sentence** without long pauses
7. **Check input field** after speaking

### Example Commands:

✅ **Good**: "Remind me to buy groceries tomorrow at 5pm"
✅ **Good**: "Schedule meeting with John next Monday at 2pm"
✅ **Good**: "URGENT submit report by today"

❌ **Avoid**: "Um... remind me to... uh... buy groceries"
❌ **Avoid**: Very long sentences with multiple pauses
❌ **Avoid**: Speaking too fast or mumbling

---

## 🔍 Debug Mode

### Enable Console Logging

**Browser (F12 Console)**:
```javascript
// Watch for voice events
console.log('Voice recognition events will appear here')
```

**Python**:
```python
# Already has debug output
# Look for these messages:
# ✓ Voice input initialized
# 🎤 Listening...
# ✓ Recognized: 'your text here'
```

---

## 📞 Still Having Issues?

### Checklist:

- [ ] Using Chrome or Edge browser?
- [ ] Microphone permission granted?
- [ ] Microphone working in system settings?
- [ ] Speaking clearly and loudly?
- [ ] Background noise minimal?
- [ ] Waiting for "Listening..." notification?
- [ ] Speaking within 5 seconds?
- [ ] SpeechRecognition installed (backend)?

### If all checked and still not working:

1. **Restart browser**
2. **Clear browser cache**
3. **Try different microphone**
4. **Try different browser**
5. **Check system microphone settings**

---

## 🎉 Success Indicators

### You know it's working when:

**Frontend:**
- ✅ Microphone button appears (not crossed out)
- ✅ Button pulses when clicked
- ✅ "🎤 Listening..." toast appears
- ✅ Text appears in input field after speaking
- ✅ "✅ Voice Captured" toast appears

**Backend:**
- ✅ "✓ Voice input initialized" message
- ✅ "🎤 Listening..." appears after typing `voice`
- ✅ "✓ Recognized: 'your text'" appears
- ✅ AURA processes your command
- ✅ Task created in Notion

---

## 💡 Pro Tips

1. **Test with simple commands first**
   - "Hello world"
   - "Test voice input"

2. **Gradually try complex commands**
   - "Remind me to buy groceries"
   - "Schedule meeting tomorrow"

3. **Use voice for speed**
   - Faster than typing long commands
   - Great for hands-free operation

4. **Combine with keyboard**
   - Use voice for main command
   - Edit details with keyboard if needed

---

**Voice input should now be working! If you followed all steps and it's still not working, the issue is likely with your microphone hardware or system permissions.** 🎤✅
