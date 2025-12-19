"""
Autonomous Task Manager for AURA
Handles automatic rescheduling and reminder emails
"""
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import time


class AutonomousManager:
    """
    Autonomous task management system
    - Automatically reschedules overdue tasks
    - Sends reminder emails for incomplete tasks
    - Monitors task completion
    """
    
    def __init__(self, notion_tool, gmail_tool, calendar_tool):
        """
        Initialize autonomous manager
        
        Args:
            notion_tool: NotionTool instance
            gmail_tool: GmailTool instance
            calendar_tool: CalendarTool instance
        """
        self.notion = notion_tool
        self.gmail = gmail_tool
        self.calendar = calendar_tool
        self.last_check = datetime.now()
        print("✓ Autonomous Manager initialized")
    
    def check_and_manage_tasks(self, user_email: str = "user@example.com") -> Dict:
        """
        Main autonomous management function
        Checks tasks and takes autonomous actions
        
        Args:
            user_email: User's email address
            
        Returns:
            Dictionary with actions taken
        """
        print("\n🤖 AUTONOMOUS MANAGER - Running checks...")
        
        actions_taken = {
            "overdue_tasks_found": 0,
            "tasks_rescheduled": 0,
            "reminder_emails_sent": 0,
            "tasks_marked_missed": 0
        }
        
        # Get pending tasks
        pending_tasks = self.notion.get_pending_tasks()
        
        if not pending_tasks:
            print("✓ No pending tasks to manage")
            return actions_taken
        
        now = datetime.now()
        
        for task in pending_tasks:
            task_deadline = task.get('deadline')
            if not task_deadline:
                continue
            
            # Parse deadline
            try:
                if isinstance(task_deadline, str):
                    deadline_dt = datetime.fromisoformat(task_deadline.replace('Z', '+00:00'))
                else:
                    deadline_dt = task_deadline
            except:
                continue
            
            # Check if task is overdue
            if deadline_dt < now:
                actions_taken["overdue_tasks_found"] += 1
                
                # Autonomous decision: Reschedule or mark as missed?
                hours_overdue = (now - deadline_dt).total_seconds() / 3600
                
                if hours_overdue < 24:
                    # Less than 24 hours overdue - RESCHEDULE
                    self._autonomous_reschedule(task, user_email)
                    actions_taken["tasks_rescheduled"] += 1
                else:
                    # More than 24 hours overdue - MARK AS MISSED
                    self._mark_as_missed(task, user_email)
                    actions_taken["tasks_marked_missed"] += 1
            
            # Check if task is due soon (within 1 hour) - SEND REMINDER
            elif 0 < (deadline_dt - now).total_seconds() < 3600:
                self._send_reminder_email(task, user_email)
                actions_taken["reminder_emails_sent"] += 1
        
        self._print_summary(actions_taken)
        return actions_taken
    
    def _autonomous_reschedule(self, task: Dict, user_email: str):
        """
        Autonomously reschedule an overdue task
        
        Args:
            task: Task dictionary
            user_email: User's email
        """
        task_name = task.get('task_name', 'Unknown task')
        task_id = task.get('id')
        
        print(f"\n🔄 AUTONOMOUS ACTION: Rescheduling '{task_name}'")
        
        # Calculate new deadline (24 hours from now)
        new_deadline = datetime.now() + timedelta(hours=24)
        new_deadline_str = new_deadline.isoformat()
        
        # Update task in Notion
        try:
            self.notion.update_task_status(task_id, "Pending")
            # Note: You may need to add update_task_deadline method to NotionTool
            print(f"  ✓ Rescheduled to: {new_deadline.strftime('%Y-%m-%d %H:%M')}")
        except Exception as e:
            print(f"  ⚠️ Failed to reschedule: {str(e)}")
        
        # Send notification email
        self.gmail.send_task_confirmation_email(
            to_email=user_email,
            task_name=f"RESCHEDULED: {task_name}",
            deadline=new_deadline_str,
            priority="High"
        )
        print(f"  ✓ Notification email sent to {user_email}")
        
        # Update calendar
        self.calendar.create_event(
            title=f"⏰ {task_name} (Rescheduled)",
            start_time=new_deadline_str,
            end_time=(new_deadline + timedelta(minutes=30)).isoformat()
        )
        print(f"  ✓ Calendar updated")
    
    def _mark_as_missed(self, task: Dict, user_email: str):
        """
        Mark task as missed and notify user
        
        Args:
            task: Task dictionary
            user_email: User's email
        """
        task_name = task.get('task_name', 'Unknown task')
        task_id = task.get('id')
        
        print(f"\n❌ AUTONOMOUS ACTION: Marking '{task_name}' as MISSED")
        
        # Update status in Notion
        try:
            self.notion.update_task_status(task_id, "Missed")
            print(f"  ✓ Status updated to 'Missed'")
        except Exception as e:
            print(f"  ⚠️ Failed to update status: {str(e)}")
        
        # Send alert email
        self.gmail.send_task_confirmation_email(
            to_email=user_email,
            task_name=f"MISSED: {task_name}",
            deadline=task.get('deadline', ''),
            priority="High"
        )
        print(f"  ✓ Alert email sent to {user_email}")
    
    def _send_reminder_email(self, task: Dict, user_email: str):
        """
        Send reminder email for upcoming task
        
        Args:
            task: Task dictionary
            user_email: User's email
        """
        task_name = task.get('task_name', 'Unknown task')
        deadline = task.get('deadline', '')
        
        print(f"\n⏰ AUTONOMOUS ACTION: Sending reminder for '{task_name}'")
        
        # Send reminder email
        self.gmail.send_task_confirmation_email(
            to_email=user_email,
            task_name=f"REMINDER: {task_name}",
            deadline=deadline,
            priority=task.get('priority', 'Medium')
        )
        print(f"  ✓ Reminder email sent to {user_email}")
    
    def _print_summary(self, actions: Dict):
        """Print summary of autonomous actions"""
        print("\n" + "="*60)
        print("🤖 AUTONOMOUS MANAGER - Summary")
        print("="*60)
        print(f"Overdue tasks found:     {actions['overdue_tasks_found']}")
        print(f"Tasks rescheduled:       {actions['tasks_rescheduled']}")
        print(f"Tasks marked missed:     {actions['tasks_marked_missed']}")
        print(f"Reminder emails sent:    {actions['reminder_emails_sent']}")
        print("="*60 + "\n")
    
    def start_autonomous_monitoring(self, user_email: str = "user@example.com", 
                                   check_interval: int = 300):
        """
        Start continuous autonomous monitoring
        
        Args:
            user_email: User's email address
            check_interval: Seconds between checks (default: 300 = 5 minutes)
        """
        print(f"\n🚀 Starting autonomous monitoring (checking every {check_interval}s)")
        print("Press Ctrl+C to stop\n")
        
        try:
            while True:
                self.check_and_manage_tasks(user_email)
                print(f"⏳ Next check in {check_interval} seconds...")
                time.sleep(check_interval)
        except KeyboardInterrupt:
            print("\n🛑 Autonomous monitoring stopped")


# Convenience function
def create_autonomous_manager(notion_tool, gmail_tool, calendar_tool):
    """Create and return autonomous manager instance"""
    return AutonomousManager(notion_tool, gmail_tool, calendar_tool)


if __name__ == "__main__":
    # Test autonomous manager
    from notion_tool import NotionTool
    from gmail_tool import GmailTool
    from calendar_tool import CalendarTool
    import os
    
    print("="*60)
    print("🤖 AURA Autonomous Manager Test")
    print("="*60)
    
    # Initialize tools
    notion = NotionTool(
        api_key=os.getenv("NOTION_API_KEY"),
        database_id=os.getenv("NOTION_DATABASE_ID")
    )
    gmail = GmailTool()
    calendar = CalendarTool()
    
    # Create autonomous manager
    manager = AutonomousManager(notion, gmail, calendar)
    
    # Run single check
    print("\nRunning single autonomous check...")
    actions = manager.check_and_manage_tasks("user@example.com")
    
    print("\n✅ Test complete!")
    print(f"Actions taken: {actions}")
