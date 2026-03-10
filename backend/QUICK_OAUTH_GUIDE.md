# 🚀 Quick Google OAuth Setup - MedSchedule AI

## ✅ Your Authorization URL is Ready!

**Click this link to authorize Google Calendar and Gmail access:**

```
https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=740499726436-buv6032jdt7vbdcirjieb87okgv99n57.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A8080&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.send&state=yOGlCsuXAUfPyuN4TBNjdfpcgome2D&code_challenge=U6F47JKjO30iu02uTGuU1fmuo_THW0jpfU-yypXaQQBQ&code_challenge_method=S256&access_type=offline&include_granted_scopes=true&prompt=consent
```

## 📋 Step-by-Step Instructions:

### 1. **Click the Link Above** 
   - Your browser should open automatically
   - If not, copy and paste the URL into your browser

### 2. **Sign in to Google**
   - Use your Google account (the one you want Calendar/Gmail access for)

### 3. **Allow Permissions**
   - Click "Allow" for both Calendar and Gmail access
   - This is required for the appointment system

### 4. **Copy the Authorization Code**
   - You'll be redirected to: `http://localhost:8080/?code=4/0AX4XfWh...`
   - Copy the code after `?code=` (up to the next `&` or end of URL)
   - Example: `4/0AX4XfWh...`

### 5. **Get Your Refresh Token**
   - Run this command with your code:
   ```bash
   cd d:\frontend\backend
   python manual_token_exchange.py "YOUR_CODE_HERE"
   ```

   Replace `YOUR_CODE_HERE` with the actual code you copied.

## 🎯 Example:
```bash
python manual_token_exchange.py "4/0AX4XfWh1234567890abcdef..."
```

## ✅ Success Indicators:
- You'll see "✅ SUCCESS! Tokens received:"
- Your .env file will be updated automatically
- Google Calendar and Gmail will work

## 🔧 If You Need Help:
- The code starts with `4/`
- It's quite long (50-100 characters)
- Don't include `&scope=` or anything after the code
- Make sure you copy the entire code

## 🎉 After Setup:
- Run `python test_google_auth.py` to verify
- Book an appointment to test Google Calendar/Email
- Your system will be 100% functional!

---

**Ready when you are! Just follow the steps above.** 🚀
