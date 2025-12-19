# 🚀 Aura AI Executive Assistant - Complete Setup Guide

Welcome! This guide will help you get the Aura AI Executive Assistant up and running on your Windows system.

## 📋 What You Need

- **Windows 10/11**
- **Internet Connection**
- **Administrator Access** (for installation)

## ⚡ Quick Start (3 Easy Steps)

### Method 1: Automated Setup (Easiest)

1. **Open PowerShell as Administrator**
   - Press `Win + X` on your keyboard
   - Click "Windows PowerShell (Admin)" or "Terminal (Admin)"
   - Click "Yes" when asked for permission

2. **Navigate to the project folder**
   ```powershell
   cd "c:\vit acks\aura-your-ai-executive-assistant-main"
   ```

3. **Run the setup script**
   ```powershell
   .\SETUP.ps1
   ```
   
   This will automatically:
   - ✅ Install Node.js
   - ✅ Install all dependencies
   - ✅ Prepare the application

4. **Start the application**
   ```powershell
   .\START.ps1
   ```
   
   Or double-click `QUICKSTART.bat`

### Method 2: Manual Setup

If the automated setup doesn't work, follow these steps:

#### Step 1: Install Node.js

1. Open your web browser
2. Go to: **https://nodejs.org/**
3. Click the **LTS** (Long Term Support) download button
4. Run the downloaded installer
5. Click "Next" through the installation wizard (keep default settings)
6. Click "Finish" when done
7. **Restart your computer** (important!)

#### Step 2: Install Dependencies

1. Open **Command Prompt** or **PowerShell**
2. Navigate to the project:
   ```
   cd "c:\vit acks\aura-your-ai-executive-assistant-main"
   ```
3. Install dependencies:
   ```
   npm install
   ```
   Wait for it to complete (may take 2-5 minutes)

#### Step 3: Start the Application

Run:
```
npm run dev
```

Or simply double-click **QUICKSTART.bat**

## 🌐 Accessing the Application

Once started, open your web browser and go to:
```
http://localhost:5173
```

The application will automatically open in your default browser.

## 🎯 What This Application Does

**Aura AI Executive Assistant** is your personal productivity companion with:

- 📊 **Dashboard** - Overview of all your activities
- ✅ **Task Manager** - Organize and track your to-dos
- 📅 **Calendar** - Manage your schedule and events
- 📧 **Email Integration** - Handle your emails efficiently
- 📈 **Activity Tracker** - Monitor your productivity

## 🔧 Backend Information

The application uses **Supabase** as its backend:

- **Database**: PostgreSQL (cloud-hosted)
- **Authentication**: Secure user authentication
- **Real-time Updates**: Live data synchronization
- **Storage**: File and media storage

**Good News**: The backend is already configured! The `.env` file contains all necessary credentials. You don't need to set up any database or server.

## 📁 Project Structure

```
aura-your-ai-executive-assistant-main/
├── src/                    # Source code
│   ├── pages/             # Application pages
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts
│   └── integrations/      # Supabase integration
├── public/                # Static assets
├── .env                   # Environment variables (Supabase config)
├── package.json           # Project dependencies
├── SETUP.ps1             # Automated setup script
├── START.ps1             # Start script
├── QUICKSTART.bat        # Quick start batch file
└── README_SETUP.md       # This file
```

## 🛠️ Available Commands

Once Node.js is installed, you can use these commands:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code quality |

## ❓ Troubleshooting

### "Node.js is not installed" Error

**Solution**: 
1. Install Node.js from https://nodejs.org/
2. Restart your terminal/command prompt
3. Try again

### Port 5173 Already in Use

**Solution**: Vite will automatically use the next available port (5174, 5175, etc.)

### Permission Errors in PowerShell

**Solution**: Run PowerShell as Administrator or run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Dependencies Installation Fails

**Solution**:
```
npm cache clean --force
del package-lock.json
rmdir /s /q node_modules
npm install
```

### Application Won't Start

**Solution**:
1. Check if Node.js is installed: `node --version`
2. Check if dependencies are installed: Look for `node_modules` folder
3. Try reinstalling: `npm install`
4. Check for error messages in the terminal

### Supabase Connection Issues

**Solution**:
- Check your internet connection
- Verify `.env` file exists and contains credentials
- The app has a "Demo Mode" for offline testing

## 🔒 Security Notes

- The `.env` file contains your Supabase credentials
- These are **public API keys** (safe to use in frontend)
- Never share your Supabase service role key (not included here)
- The application uses secure authentication

## 📞 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review error messages carefully
3. Ensure Node.js is properly installed
4. Check your internet connection
5. Visit the GitHub repository for more help

## 🎉 Success!

If you see the application running in your browser, congratulations! You're all set up.

**Default Login**: The application supports:
- Email/Password authentication via Supabase
- Demo Mode for testing without login

---

## 📝 Quick Reference Card

**To Start the App:**
```
Double-click: QUICKSTART.bat
OR
Run in terminal: npm run dev
```

**To Stop the App:**
```
Press: Ctrl + C in the terminal
```

**Application URL:**
```
http://localhost:5173
```

**Need Help?**
- Check README_SETUP.md (this file)
- Check SETUP_MANUAL.md for detailed instructions
- Visit: https://github.com/natarajandharani13-afk/aura-your-ai-executive-assistant

---

Made with ❤️ for productivity enthusiasts
