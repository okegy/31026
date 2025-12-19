# 🔑 Getting Your Google API Credentials

## ⚠️ Important: API Endpoints vs API Credentials

**What you have (API Endpoints):**
```
calendar-json.googleapis.com
gmail.googleapis.com
plus.googleapis.com
```

These are **API endpoint domains** - they're the servers that handle requests. You don't need to configure these anywhere.

**What you NEED (API Credentials):**
1. **Client ID** - Looks like: `123456789-abc123.apps.googleusercontent.com`
2. **Client Secret** - Looks like: `GOCSPX-AbCdEfGhIjKlMnOp`
3. **API Key** (optional) - Looks like: `AIzaSyAbCdEfGhIjKlMnOpQrStUvWx`

---

## 📍 Where to Find Your Credentials

### **Step 1: Go to Google Cloud Console**
1. Open: https://console.cloud.google.com/
2. Make sure your project is selected (top left dropdown)

### **Step 2: Get OAuth Client ID and Client Secret**

1. In the left sidebar, click **"APIs & Services"**
2. Click **"Credentials"**
3. You should see a list of credentials

4. **Find your OAuth 2.0 Client ID:**
   - Look for type: "OAuth 2.0 Client IDs"
   - Name might be: "AURA Web Client" or "Web client 1"
   - Click on it

5. **Copy your credentials:**
   - **Client ID**: Copy the long string ending in `.apps.googleusercontent.com`
   - **Client Secret**: Click the eye icon to reveal, then copy

**Example:**
```
Client ID: 123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
Client Secret: GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz
```

### **Step 3: Get API Key (Optional but Recommended)**

1. Still in **"Credentials"** page
2. Look for **"API Keys"** section
3. If you have one, click the name to view it
4. Copy the API key

**If you don't have an API key:**
1. Click **"Create Credentials"** → **"API key"**
2. Copy the generated key
3. Click **"Restrict Key"**
4. Under **"API restrictions"**, select:
   - Google Calendar API
   - Gmail API
   - Google+ API
5. Click **"Save"**

---

## 🔧 Configure Your .env File

Once you have your credentials, update your `.env` file:

```env
# Supabase Configuration (keep existing values)
VITE_SUPABASE_PROJECT_ID=yqrorakcmemvbfrkitgt
VITE_SUPABASE_PUBLISHABLE_KEY=your_existing_key
VITE_SUPABASE_URL=https://yqrorakcmemvbfrkitgt.supabase.co

# Google OAuth 2.0 Configuration
# REPLACE THESE WITH YOUR ACTUAL VALUES:
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
VITE_GOOGLE_REDIRECT_URI=http://localhost:8080/auth/callback

# Google API Configuration
VITE_GOOGLE_API_KEY=YOUR_API_KEY_HERE

# Application Configuration
VITE_APP_URL=http://localhost:8080
```

---

## ✅ How to Verify You Have the Right Values

### **Client ID:**
- ✅ Ends with `.apps.googleusercontent.com`
- ✅ Very long string (60+ characters)
- ✅ Contains numbers and letters
- ❌ NOT a URL or domain name

### **Client Secret:**
- ✅ Starts with `GOCSPX-`
- ✅ About 30-40 characters long
- ✅ Mix of letters, numbers, and dashes
- ❌ NOT a URL or domain name

### **API Key:**
- ✅ Starts with `AIzaSy`
- ✅ About 39 characters long
- ✅ Mix of letters and numbers
- ❌ NOT a URL or domain name

---

## 🎯 Quick Visual Guide

### ❌ WRONG (These are API endpoints, not credentials):
```
calendar-json.googleapis.com
gmail.googleapis.com
plus.googleapis.com
```

### ✅ CORRECT (These are actual credentials):
```
Client ID: 123456789012-abc123def456ghi789jkl012mno345pqr.apps.googleusercontent.com
Client Secret: GOCSPX-AbCdEfGhIjKlMnOpQrStUvWx
API Key: AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz123456
```

---

## 📸 Screenshot Guide

### **Finding OAuth Credentials:**

1. **Google Cloud Console** → **APIs & Services** → **Credentials**
2. Look for this section:

```
OAuth 2.0 Client IDs
┌─────────────────────────────────────────────────┐
│ Name: AURA Web Client                           │
│ Type: Web application                           │
│ Client ID: 123...apps.googleusercontent.com     │
│ Created: Dec 18, 2025                           │
└─────────────────────────────────────────────────┘
```

3. Click on the name to see:

```
Client ID
123456789012-abc123def456ghi789jkl012mno345pqr.apps.googleusercontent.com
[Copy button]

Client Secret
GOCSPX-AbCdEfGhIjKlMnOpQrStUvWx
[Show/Hide button] [Copy button]
```

---

## 🚨 Common Mistakes

### **Mistake 1: Using API Endpoints as Credentials**
❌ WRONG:
```env
VITE_GOOGLE_CLIENT_ID=calendar-json.googleapis.com
```

✅ CORRECT:
```env
VITE_GOOGLE_CLIENT_ID=123456789012-abc123.apps.googleusercontent.com
```

### **Mistake 2: Using Project ID as Client ID**
❌ WRONG:
```env
VITE_GOOGLE_CLIENT_ID=aura-hackathon-123456
```

✅ CORRECT:
```env
VITE_GOOGLE_CLIENT_ID=123456789012-abc123.apps.googleusercontent.com
```

### **Mistake 3: Forgetting to Create OAuth Credentials**
If you only enabled the APIs but didn't create OAuth credentials:
1. Go to **Credentials** page
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Choose **"Web application"**
4. Add redirect URI: `http://localhost:8080/auth/callback`
5. Click **"Create"**
6. Copy the Client ID and Client Secret

---

## 🔍 Still Can't Find Credentials?

### **Option 1: Check if OAuth Client Exists**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Look under **"OAuth 2.0 Client IDs"**
3. If empty, you need to create one (see Step 3 in GOOGLE_SETUP_GUIDE.md)

### **Option 2: Create New OAuth Client**
1. Click **"Create Credentials"**
2. Select **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `AURA Web Client`
5. Authorized redirect URIs: `http://localhost:8080/auth/callback`
6. Click **"Create"**
7. **COPY THE CLIENT ID AND SECRET IMMEDIATELY**

### **Option 3: Download Credentials JSON**
1. In Credentials page, find your OAuth client
2. Click the download icon (⬇️) on the right
3. Open the downloaded JSON file
4. Look for:
   ```json
   {
     "web": {
       "client_id": "YOUR_CLIENT_ID_HERE",
       "client_secret": "YOUR_CLIENT_SECRET_HERE"
     }
   }
   ```

---

## ✅ Final Checklist

Before running the app, verify:

- [ ] Client ID ends with `.apps.googleusercontent.com`
- [ ] Client Secret starts with `GOCSPX-`
- [ ] API Key starts with `AIzaSy` (if using)
- [ ] All values are in `.env` file
- [ ] No quotes around values in `.env`
- [ ] Redirect URI is exactly: `http://localhost:8080/auth/callback`
- [ ] Redirect URI is added in Google Cloud Console
- [ ] Your email is added as test user
- [ ] Calendar API is enabled
- [ ] Gmail API is enabled

---

## 🚀 Next Steps

Once you have the correct credentials:

1. **Update `.env` file** with your actual Client ID and Client Secret
2. **Restart the dev server**: Stop (Ctrl+C) and run `npm run dev` again
3. **Open the app**: http://localhost:8080
4. **Click "Connect Google"** button
5. **Sign in** with your Google account
6. **Grant permissions** for Calendar and Gmail
7. **Start using AURA!**

---

## 📞 Need Help?

If you're still stuck:
1. Check the browser console (F12) for errors
2. Verify all APIs are enabled in Google Cloud Console
3. Make sure your email is added as a test user
4. Try creating a new OAuth client from scratch

---

**Remember: API endpoints (like `gmail.googleapis.com`) are NOT the same as API credentials!**

You need the **Client ID**, **Client Secret**, and **API Key** from the Google Cloud Console Credentials page.
