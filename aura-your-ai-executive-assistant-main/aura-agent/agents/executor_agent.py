"""
Executor Agent for AURA
Executes planned actions using integrated tools
"""
from typing import Dict, List
from datetime import datetime


class ExecutorAgent:
    """
    Executes the plan created by Planner Agent:
    - Creates tasks in Notion
    - Schedules calendar events
    - Sends emails
    - Updates task status
    """
    
    def __init__(self, notion_tool, gmail_tool, calendar_tool):
        self.notion = notion_tool
        self.gmail = gmail_tool
        self.calendar = calendar_tool
        self.execution_log = []
        print("✓ Executor Agent initialized")
    
    def execute_plan(self, plan: Dict, user_email: str = "user@example.com") -> Dict:
        """
        Execute the planned actions
        
        Args:
            plan: Execution plan from Planner Agent
            user_email: User's email for notifications
            
        Returns:
            Execution results with success status
        """
        print(f"\n⚡ Executor Agent executing {plan['type']} plan...")
        
        results = {
            "success": True,
            "executed_actions": [],
            "created_items": {},
            "errors": []
        }
        
        try:
            if plan['type'] == 'task':
                results = self._execute_task_plan(plan, user_email)
            elif plan['type'] == 'event':
                results = self._execute_event_plan(plan, user_email)
            elif plan['type'] == 'query':
                results = self._execute_query_plan(plan)
            
            print(f"✓ Execution completed successfully")
            
        except Exception as e:
            print(f"❌ Execution failed: {str(e)}")
            results['success'] = False
            results['errors'].append(str(e))
        
        return results
    
    def _execute_task_plan(self, plan: Dict, user_email: str) -> Dict:
        """Execute task creation plan"""
        task_details = plan['task_details']
        results = {
            "success": True,
            "executed_actions": [],
            "created_items": {},
            "errors": []
        }
        
        # Action 1: Create task in Notion
        try:
            notion_task = self.notion.create_task(
                task_name=task_details['title'],
                deadline=task_details.get('deadline'),
                priority=task_details.get('priority', 'Medium'),
                description=task_details.get('description', '')
            )
            results['created_items']['notion_task'] = notion_task
            results['executed_actions'].append("create_notion_task")
            print(f"  ✓ Task created in Notion: {notion_task['id']}")
        except Exception as e:
            results['errors'].append(f"Notion creation failed: {str(e)}")
        
        # Action 2: Create calendar reminder
        try:
            if task_details.get('deadline'):
                calendar_event = self.calendar.create_event(
                    title=f"⏰ {task_details['title']}",
                    start_time=task_details['deadline'],
                    end_time=task_details['deadline'],  # Point event
                    description=f"Task deadline: {task_details.get('description', '')}"
                )
                results['created_items']['calendar_event'] = calendar_event
                results['executed_actions'].append("create_calendar_reminder")
                print(f"  ✓ Calendar reminder created")
        except Exception as e:
            results['errors'].append(f"Calendar creation failed: {str(e)}")
        
        # Action 3: Send confirmation email
        try:
            email_sent = self.gmail.send_task_confirmation(
                to_email=user_email,
                task_name=task_details['title'],
                deadline=task_details.get('deadline', 'No deadline'),
                priority=task_details.get('priority', 'Medium')
            )
            results['executed_actions'].append("send_confirmation_email")
            print(f"  ✓ Confirmation email sent")
        except Exception as e:
            results['errors'].append(f"Email sending failed: {str(e)}")
        
        return results
    
    def _execute_event_plan(self, plan: Dict, user_email: str) -> Dict:
        """Execute event creation plan"""
        event_details = plan['event_details']
        results = {
            "success": True,
            "executed_actions": [],
            "created_items": {},
            "errors": []
        }
        
        # Action 1: Create calendar event
        try:
            calendar_event = self.calendar.create_event(
                title=event_details['title'],
                start_time=event_details['start_time'],
                end_time=event_details['end_time'],
                description=event_details.get('description'),
                location=event_details.get('location')
            )
            results['created_items']['calendar_event'] = calendar_event
            results['executed_actions'].append("create_calendar_event")
            print(f"  ✓ Calendar event created")
        except Exception as e:
            results['errors'].append(f"Calendar creation failed: {str(e)}")
        
        # Action 2: Create corresponding Notion task
        try:
            notion_task = self.notion.create_task(
                task_name=event_details['title'],
                deadline=event_details['start_time'],
                priority='Medium',
                description=f"Event: {event_details.get('description', '')}"
            )
            results['created_items']['notion_task'] = notion_task
            results['executed_actions'].append("create_notion_task")
            print(f"  ✓ Task created in Notion")
        except Exception as e:
            results['errors'].append(f"Notion creation failed: {str(e)}")
        
        # Action 3: Send invites (if attendees)
        if event_details.get('attendees'):
            try:
                for attendee in event_details['attendees']:
                    self.gmail.send_task_confirmation(
                        to_email=attendee,
                        task_name=f"Event: {event_details['title']}",
                        deadline=event_details['start_time'],
                        priority='Medium'
                    )
                results['executed_actions'].append("send_invites")
                print(f"  ✓ Invites sent to {len(event_details['attendees'])} attendees")
            except Exception as e:
                results['errors'].append(f"Invite sending failed: {str(e)}")
        
        return results
    
    def _execute_query_plan(self, plan: Dict) -> Dict:
        """Execute query plan"""
        results = {
            "success": True,
            "executed_actions": ["query_notion_database"],
            "data": {},
            "errors": []
        }
        
        try:
            pending_tasks = self.notion.get_pending_tasks()
            results['data']['pending_tasks'] = pending_tasks
            print(f"  ✓ Retrieved {len(pending_tasks)} pending tasks")
        except Exception as e:
            results['errors'].append(f"Query failed: {str(e)}")
        
        return results
    
    def check_and_update_overdue_tasks(self, user_email: str) -> int:
        """
        Check for overdue tasks and update their status
        
        Args:
            user_email: User's email for alerts
            
        Returns:
            Number of tasks marked as missed
        """
        print("\n🔍 Checking for overdue tasks...")
        
        try:
            marked_count = self.notion.mark_overdue_tasks()
            
            if marked_count > 0:
                print(f"⚠️  {marked_count} tasks marked as MISSED")
                
                # Send alert email
                self.gmail.send_missed_deadline_alert(
                    to_email=user_email,
                    task_name=f"{marked_count} tasks",
                    deadline="various"
                )
            else:
                print("✓ No overdue tasks found")
            
            return marked_count
        
        except Exception as e:
            print(f"❌ Error checking overdue tasks: {str(e)}")
            return 0
