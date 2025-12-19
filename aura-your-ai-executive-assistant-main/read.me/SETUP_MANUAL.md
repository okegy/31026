# Aura AI Executive Assistant - Manual Setup Guide

This guide will help you set up and run the Aura AI Executive Assistant application on your Windows system.

## Prerequisites

You need to install Node.js to run this application.

## Option 1: Automated Setup (Recommended)

### Step 1: Run the Setup Script

1. **Open PowerShell as Administrator**:
   - Press `Win + X`
   - Select "Windows PowerShell (Admin)" or "Terminal (Admin)"

2. **Navigate to the project directory**:
   ```powershell
   cd "c:\vit acks\aura-your-ai-executive-assistant-main"
   ```

3. **Run the setup script**:
   ```powershell
   .\SETUP.ps1
   ```

   This script will:
   - Install Chocolatey (package manager for Windows)
   - Install Node.js LTS
   - Install all project dependencies

### Step 2: Start the Application

After setup is complete, run:
```powershell
.\START.ps1
```

Or manually:
```powershell
npm run dev
```

The application will start and open in your browser at `http://localhost:5173`

## Option 2: Manual Setup

### Step 1: Install Node.js

1. Visit [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS (Long Term Support)** version for Windows
3. Run the installer
4. Follow the installation wizard (use default settings)
5. Restart your terminal/PowerShell after installation

### Step 2: Verify Installation

Open a new PowerShell window and run:
```powershell
node --version
npm --version
```

You should see version numbers for both commands.

### Step 3: Install Project Dependencies

Navigate to the project directory:
```powershell
cd "c:\vit acks\aura-your-ai-executive-assistant-main"
```

Install dependencies:
```powershell
npm install
```

This will install all required packages (may take a few minutes).

### Step 4: Start the Development Server

Run:
```powershell
npm run dev
```

The application will start and you'll see output like:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Open your browser and navigate to `http://localhost:5173`

## Application Features

The Aura AI Executive Assistant includes:

- **Dashboard**: Overview of your tasks, calendar, and activities
- **Tasks**: Manage your to-do list and tasks
- **Calendar**: View and manage your schedule
- **Emails**: Email management interface
- **Activity**: Track your activities and productivity

## Backend Configuration

The application uses **Supabase** as its backend service. The configuration is already set up in the `.env` file:

- **Database**: PostgreSQL hosted on Supabase
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage

The backend is fully configured and ready to use. No additional backend setup is required.

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port (5174, 5175, etc.).

### Permission Errors

If you encounter permission errors:
1. Run PowerShell as Administrator
2. Or try: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Module Not Found Errors

If you see "module not found" errors:
```powershell
rm -r node_modules
rm package-lock.json
npm install
```

### Supabase Connection Issues

If you have issues connecting to Supabase:
1. Check your internet connection
2. Verify the `.env` file contains the correct Supabase credentials
3. The application also supports a "Demo Mode" for offline testing

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Support

For issues or questions about the application, please refer to the project's GitHub repository:
https://github.com/natarajandharani13-afk/aura-your-ai-executive-assistant

---

**Note**: This application requires an active internet connection to communicate with the Supabase backend.
