# Backend Architecture - Aura AI Executive Assistant

## Overview

This application uses **Supabase** as its Backend-as-a-Service (BaaS) platform. Supabase provides:

- **PostgreSQL Database** - Relational database for storing all application data
- **Authentication** - User authentication and authorization
- **Real-time Subscriptions** - Live data updates
- **Row Level Security (RLS)** - Database-level security policies
- **RESTful API** - Auto-generated API from database schema

## Backend Status

✅ **Backend is FULLY CONFIGURED and READY TO USE**

The backend is already set up and hosted on Supabase's cloud infrastructure. You don't need to:
- Set up a local database
- Configure a backend server
- Deploy any backend code
- Manage database migrations manually

## Database Schema

The application uses the following database tables:

### 1. **profiles** - User Profiles
- Stores user information (name, avatar, demo mode)
- Automatically created when a user signs up
- Links to Supabase Auth users

### 2. **tasks** - Task Management
- Task title, description, deadline
- Priority levels (low, medium, high) with AI-calculated scores
- Status tracking (pending, in_progress, completed, missed)
- Required actions (email, meeting, reminder, call)
- Demo mode support for testing

### 3. **events** - Calendar Events
- Event title, description, location
- Start and end times
- Attendees list
- Demo mode support

### 4. **emails** - Email Tracking
- Email recipient, subject, body
- Status tracking (pending, sent, followed_up, failed)
- Follow-up counter
- Links to related tasks
- Demo mode support

### 5. **agent_logs** - AI Activity Logs
- Tracks all AI agent actions
- Action types: prioritized, rescheduled, email_sent, etc.
- AI reasoning explanations
- Links to related tasks, events, and emails
- Demo mode support

## Security Features

### Row Level Security (RLS)

All tables have RLS policies that ensure:
- Users can only access their own data
- No user can see another user's information
- Database-level security (not just application-level)

### Authentication

- Email/Password authentication
- Secure session management
- Automatic token refresh
- Demo mode for testing without authentication

## Environment Configuration

The `.env` file contains:

```env
VITE_SUPABASE_PROJECT_ID="yqrorakcmemvbfrkitgt"
VITE_SUPABASE_PUBLISHABLE_KEY="[public key]"
VITE_SUPABASE_URL="https://yqrorakcmemvbfrkitgt.supabase.co"
```

**Note**: These are public keys and safe to use in frontend applications.

## Database Migrations

The database schema is defined in:
```
supabase/migrations/20251218122727_db5d8809-f79d-4f9a-830a-c15fd8743d8d.sql
```

This migration has already been applied to the Supabase project. It includes:
- Table definitions
- RLS policies
- Triggers for auto-updating timestamps
- Trigger for auto-creating user profiles

## API Endpoints

Supabase automatically generates RESTful API endpoints for all tables:

- `GET /rest/v1/tasks` - List tasks
- `POST /rest/v1/tasks` - Create task
- `PATCH /rest/v1/tasks?id=eq.{id}` - Update task
- `DELETE /rest/v1/tasks?id=eq.{id}` - Delete task

Similar endpoints exist for `profiles`, `events`, `emails`, and `agent_logs`.

## Real-time Features

The application can subscribe to real-time updates:

```typescript
supabase
  .channel('tasks')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'tasks' 
  }, payload => {
    // Handle real-time updates
  })
  .subscribe()
```

## Demo Mode

The application includes a **Demo Mode** feature:
- Allows testing without authentication
- All demo data is marked with `is_demo: true`
- Demo data can be easily identified and cleaned up
- Perfect for showcasing features

## Backend Health Check

To verify the backend is working:

1. **Check Supabase Status**: Visit https://status.supabase.com/
2. **Test Connection**: The application will show connection errors if Supabase is unreachable
3. **Check Browser Console**: Look for any API errors in the developer console

## Supabase Dashboard Access

To manage the backend (optional):

1. Go to https://supabase.com/
2. Sign in with the project owner's account
3. Select project: `yqrorakcmemvbfrkitgt`
4. Access:
   - **Table Editor** - View and edit data
   - **SQL Editor** - Run custom queries
   - **Authentication** - Manage users
   - **Database** - View schema and migrations
   - **API Docs** - Auto-generated API documentation

## No Additional Backend Setup Required

The backend is production-ready and includes:
- ✅ Database tables created
- ✅ Security policies configured
- ✅ Authentication enabled
- ✅ API endpoints available
- ✅ Real-time subscriptions ready
- ✅ Triggers and functions deployed

## Technology Stack

**Backend Services:**
- **Database**: PostgreSQL 14.1
- **Authentication**: Supabase Auth (based on GoTrue)
- **API**: PostgREST (auto-generated REST API)
- **Real-time**: Supabase Realtime (WebSocket-based)
- **Storage**: Supabase Storage (for file uploads, if needed)

**Frontend Integration:**
- **Client Library**: `@supabase/supabase-js` v2.88.0
- **State Management**: React Query (`@tanstack/react-query`)
- **Type Safety**: TypeScript with auto-generated types

## Performance Considerations

- **Connection Pooling**: Handled by Supabase
- **Caching**: Implemented via React Query
- **Optimistic Updates**: Supported by React Query
- **Pagination**: Available for large datasets
- **Indexing**: Automatically applied by Supabase

## Troubleshooting Backend Issues

### Connection Errors

**Symptoms**: "Failed to fetch" or network errors

**Solutions**:
1. Check internet connection
2. Verify Supabase status: https://status.supabase.com/
3. Check `.env` file has correct credentials
4. Try demo mode for offline testing

### Authentication Errors

**Symptoms**: "Invalid JWT" or "User not found"

**Solutions**:
1. Clear browser cache and localStorage
2. Sign out and sign in again
3. Check if email is verified (if required)
4. Use demo mode for testing

### Permission Errors

**Symptoms**: "Row level security policy violation"

**Solutions**:
1. Ensure user is authenticated
2. Check if trying to access another user's data
3. Verify RLS policies in Supabase dashboard

### Data Not Appearing

**Symptoms**: Empty lists or missing data

**Solutions**:
1. Check browser console for errors
2. Verify data exists in Supabase Table Editor
3. Check if filters are applied
4. Ensure user_id matches authenticated user

## Future Backend Enhancements

Potential additions (not currently implemented):

- **File Storage**: For attachments and documents
- **Edge Functions**: For serverless backend logic
- **Webhooks**: For external integrations
- **Email Service**: For automated email sending
- **AI Integration**: For smart task prioritization

## Summary

The backend is **fully operational** and requires **no additional setup**. The Supabase infrastructure handles all backend concerns, allowing you to focus on using the application.

Simply start the frontend application, and it will automatically connect to the configured Supabase backend.

---

**Backend URL**: https://yqrorakcmemvbfrkitgt.supabase.co  
**Status**: ✅ Active and Ready  
**Setup Required**: ❌ None
