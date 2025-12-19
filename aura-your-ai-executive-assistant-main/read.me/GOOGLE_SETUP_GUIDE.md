# Google OAuth & API Setup Guide for AURA

## 🎯 Complete Integration Setup

This guide will help you set up Google OAuth 2.0, Google Calendar API, and Gmail API for AURA.

---

## 📋 Prerequisites

- Google Account
- Google Cloud Console access
- AURA application running locally

---

## 🔧 Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"**
3. Name: `AURA-Hackathon` (or your preferred name)
4. Click **"Create"**
5. Wait for project creation to complete

---

## 🔑 Step 2: Enable Required APIs

### Enable Google Calendar API
1. In Google Cloud Console, go to **"APIs & Services" → "Library"**
2. Search for **"Google Calendar API"**
3. Click on it
4. Click **"Enable"**

### Enable Gmail API
1. In the Library, search for **"Gmail API"**
2. Click on it
3. Click **"Enable"**

### Enable Google+ API (for user info)
1. Search for **"Google+ API"** or **"People API"**
2. Click **"Enable"**

---

## 🎫 Step 3: Create OAuth 2.0 Credentials

### Configure OAuth Consent Screen
1. Go to **"APIs & Services" → "OAuth consent screen"**
2. Choose **"External"** (for testing)
3. Click **"Create"**

4. **App Information:**
   - App name: `AURA - AI Assistant`
   - User support email: Your email
   - App logo: (Optional)

5. **App Domain:**
   - Application home page: `http://localhost:8080`
   - Authorized domains: Leave empty for localhost testing

6. **Developer contact:** Your email

7. Click **"Save and Continue"**

### Add Scopes
1. Click **"Add or Remove Scopes"**
2. Add these scopes:
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.readonly`

3. Click **"Update"**
4. Click **"Save and Continue"**

### Add Test Users
1. Click **"Add Users"**
2. Add your Gmail address
3. Click **"Save and Continue"**

### Create OAuth Client ID
1. Go to **"APIs & Services" → "Credentials"**
2. Click **"Create Credentials" → "OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `AURA Web Client`

5. **Authorized JavaScript origins:**
   ```
   http://localhost:8080
   ```

6. **Authorized redirect URIs:**
   ```
   http://localhost:8080/auth/callback
   ```

7. Click **"Create"**

8. **IMPORTANT:** Copy these values:
   - **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
   - **Client Secret** (looks like: `GOCSPX-xxxxx`)

---

## 🔐 Step 4: Create API Key (Optional but Recommended)

1. Go to **"APIs & Services" → "Credentials"**
2. Click **"Create Credentials" → "API key"**
3. Copy the API key
4. Click **"Restrict Key"**
5. Under **"API restrictions"**, select:
   - Google Calendar API
   - Gmail API
6. Click **"Save"**

---

## ⚙️ Step 5: Configure AURA Application

### Update .env File

1. Open `c:\vit acks\aura-your-ai-executive-assistant-main\.env`
2. Add these lines (replace with your actual values):

```env
# Supabase Configuration (keep existing)
VITE_SUPABASE_PROJECT_ID=your_existing_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_existing_key
VITE_SUPABASE_URL=https://your-project.supabase.co

# Google OAuth 2.0 Configuration
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
VITE_GOOGLE_REDIRECT_URI=http://localhost:8080/auth/callback

# Google API Configuration
VITE_GOOGLE_API_KEY=YOUR_API_KEY

# Application Configuration
VITE_APP_URL=http://localhost:8080
```

### Example with Fake Values:
```env
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnOpQrStUvWx
VITE_GOOGLE_REDIRECT_URI=http://localhost:8080/auth/callback
VITE_GOOGLE_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz
```

---

## 🚀 Step 6: Restart Application

1. Stop the dev server (Ctrl+C)
2. Restart it:
   ```bash
   npm run dev
   ```

---

## ✅ Step 7: Test Google Integration

### Test OAuth Login
1. Open `http://localhost:8080`
2. Click **"Connect Google"** button
3. You'll be redirected to Google login
4. Sign in with your test user account
5. Grant permissions to AURA
6. You should be redirected back to dashboard

### Test Calendar Integration
1. Go to Dashboard
2. Type: `"Meeting with John tomorrow at 2pm"`
3. Click **"Let AURA Handle It"**
4. Check your Google Calendar - event should appear!

### Test Gmail Integration
1. After creating a task/event
2. Check your Gmail inbox
3. You should receive a confirmation email from AURA

---

## 🔍 Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution:** 
- Verify redirect URI in Google Console matches exactly: `http://localhost:8080/auth/callback`
- No trailing slash
- Check for typos

### Error: "Access blocked: This app's request is invalid"
**Solution:**
- Make sure you added your email as a test user
- Verify OAuth consent screen is configured
- Check that all required scopes are added

### Error: "Invalid client"
**Solution:**
- Double-check Client ID and Client Secret in `.env`
- Make sure there are no extra spaces
- Restart dev server after changing `.env`

### Calendar events not appearing
**Solution:**
- Check Google Calendar API is enabled
- Verify API key restrictions allow Calendar API
- Check browser console for errors

### Emails not sending
**Solution:**
- Check Gmail API is enabled
- Verify you granted Gmail permissions during OAuth
- Check that email address is valid

---

## 📊 Testing Checklist

- [ ] Google Cloud project created
- [ ] Calendar API enabled
- [ ] Gmail API enabled
- [ ] OAuth consent screen configured
- [ ] Test user added
- [ ] OAuth credentials created
- [ ] Redirect URI configured correctly
- [ ] `.env` file updated with credentials
- [ ] Application restarted
- [ ] Google login works
- [ ] Calendar events created successfully
- [ ] Confirmation emails received
- [ ] Task reminders working

---

## 🎉 Success Indicators

When everything is working:
1. ✅ "Connect Google" button appears on dashboard
2. ✅ Clicking it redirects to Google login
3. ✅ After login, shows "Connected to Google" with your profile picture
4. ✅ Creating tasks adds events to Google Calendar
5. ✅ Confirmation emails arrive in Gmail
6. ✅ No errors in browser console

---

## 🔒 Security Notes

### For Development:
- Use "External" OAuth consent screen
- Add yourself as test user
- Keep Client Secret secure
- Don't commit `.env` to git

### For Production:
- Submit app for verification
- Use "Internal" for organization
- Implement proper token refresh
- Use environment variables
- Enable API key restrictions

---

## 📱 Demo Mode vs Production

### Demo Mode (No Google Auth):
- Tasks stored locally
- No calendar sync
- No email notifications
- Perfect for UI testing

### Production Mode (With Google Auth):
- Full Google Calendar integration
- Gmail notifications
- Cross-device sync
- Real-time updates

---

## 🎯 Quick Start Commands

```bash
# Install dependencies (if not done)
npm install

# Start development server
npm run dev

# Open application
# Navigate to: http://localhost:8080
```

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors (F12)
2. Verify all steps completed
3. Check Google Cloud Console for API quotas
4. Review OAuth consent screen status

---

## 🎨 Features Enabled After Setup

✅ **Google OAuth Login**
- Secure authentication
- Profile information
- Access token management

✅ **Google Calendar Integration**
- Create events automatically
- Update existing events
- Delete events
- Conflict detection
- Multiple reminders

✅ **Gmail Integration**
- Send confirmation emails
- Task reminder emails
- Event notifications
- Beautiful HTML emails
- Status updates

✅ **AI Agent Features**
- Natural language processing
- Automatic task creation
- Smart scheduling
- Priority analysis
- Proactive follow-ups

---

**Your AURA AI Assistant is now fully integrated with Google services!** 🚀
