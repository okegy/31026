"""
Planner Agent for AURA
Creates execution plans based on intent analysis
"""
from typing import Dict, List
import json
import re
from datetime import datetime, timedelta


class PlannerAgent:
    """
    Creates detailed execution plans:
    - Extracts task/event details
    - Determines priority and deadline
    - Plans required actions (email, calendar, etc.)
    """
    
    def __init__(self, llm_client):
        self.llm = llm_client
        print("✓ Planner Agent initialized")
    
    def create_plan(self, user_input: str, intent: Dict) -> Dict:
        """
        Create execution plan based on intent
        
        Args:
            user_input: Original user request
            intent: Intent analysis from Intent Agent
            
        Returns:
            Execution plan with all details
        """
        print(f"\n📋 Planner Agent creating plan for: {intent['type']}")
        
        if intent['type'] == 'task':
            return self._plan_task(user_input, intent)
        elif intent['type'] == 'event':
            return self._plan_event(user_input, intent)
        elif intent['type'] == 'query':
            return self._plan_query(user_input, intent)
        else:
            return self._plan_task(user_input, intent)  # Default to task
    
    def _plan_task(self, user_input: str, intent: Dict) -> Dict:
        """Plan task creation"""
        
        # Use LLM to extract task details
        system_prompt = """You are a task planning AI. Extract task details from user input.
Respond ONLY with JSON (no markdown, no extra text).

Extract:
- title: Clear task title
- description: Brief description
- deadline: ISO format datetime (estimate if not specified)
- priority: "Low", "Medium", or "High"
- estimated_duration: minutes (estimate)

Example:
{"title": "Prepare presentation", "description": "Create slides for client meeting", "deadline": "2024-12-20T15:00:00", "priority": "High", "estimated_duration": 120}"""
        
        try:
            response = self.llm.generate(
                prompt=f"User request: {user_input}\nCurrent time: {datetime.now().isoformat()}",
                system_prompt=system_prompt,
                temperature=0.3,
                max_tokens=300
            )
            
            task_details = self._parse_json_response(response)
            
            if not task_details:
                task_details = self._extract_task_fallback(user_input, intent)
        
        except Exception as e:
            print(f"⚠️  LLM planning failed: {str(e)}. Using fallback.")
            task_details = self._extract_task_fallback(user_input, intent)
        
        # Build execution plan
        plan = {
            "type": "task",
            "task_details": task_details,
            "actions": [
                {"action": "create_notion_task", "priority": 1},
                {"action": "create_calendar_reminder", "priority": 2},
                {"action": "send_confirmation_email", "priority": 3}
            ],
            "urgency": intent.get('urgency', 'medium'),
            "estimated_time": task_details.get('estimated_duration', 60)
        }
        
        print(f"✓ Task plan created: '{task_details.get('title', 'Untitled')}'")
        return plan
    
    def _plan_event(self, user_input: str, intent: Dict) -> Dict:
        """Plan event creation"""
        
        system_prompt = """You are an event planning AI. Extract event details from user input.
Respond ONLY with JSON (no markdown).

Extract:
- title: Event title
- description: Event description
- start_time: ISO format datetime
- end_time: ISO format datetime (estimate 1 hour if not specified)
- location: Location if mentioned
- attendees: List of attendee names/emails

Example:
{"title": "Team standup", "description": "Daily sync", "start_time": "2024-12-20T09:00:00", "end_time": "2024-12-20T09:30:00", "location": "Conference Room A", "attendees": ["john@example.com"]}"""
        
        try:
            response = self.llm.generate(
                prompt=f"User request: {user_input}\nCurrent time: {datetime.now().isoformat()}",
                system_prompt=system_prompt,
                temperature=0.3,
                max_tokens=300
            )
            
            event_details = self._parse_json_response(response)
            
            if not event_details:
                event_details = self._extract_event_fallback(user_input, intent)
        
        except Exception as e:
            print(f"⚠️  LLM planning failed: {str(e)}. Using fallback.")
            event_details = self._extract_event_fallback(user_input, intent)
        
        plan = {
            "type": "event",
            "event_details": event_details,
            "actions": [
                {"action": "create_calendar_event", "priority": 1},
                {"action": "create_notion_task", "priority": 2},
                {"action": "send_invites", "priority": 3}
            ],
            "urgency": intent.get('urgency', 'medium')
        }
        
        print(f"✓ Event plan created: '{event_details.get('title', 'Untitled')}'")
        return plan
    
    def _plan_query(self, user_input: str, intent: Dict) -> Dict:
        """Plan query response"""
        return {
            "type": "query",
            "query": user_input,
            "actions": [
                {"action": "query_notion_database", "priority": 1},
                {"action": "format_response", "priority": 2}
            ]
        }
    
    def _parse_json_response(self, response: str) -> Dict:
        """Parse JSON from LLM response"""
        try:
            response = response.strip()
            if response.startswith("```"):
                response = re.sub(r'```json\s*|\s*```', '', response)
            return json.loads(response)
        except:
            return {}
    
    def _extract_task_fallback(self, user_input: str, intent: Dict) -> Dict:
        """Fallback task extraction using rules"""
        lower_input = user_input.lower()
        
        # Extract title (remove common prefixes)
        title = user_input
        for prefix in ['remind me to', 'create task', 'add task', 'todo:', 'task:']:
            title = re.sub(f'^{prefix}\\s*', '', title, flags=re.IGNORECASE)
        title = title.strip()
        
        # Estimate deadline
        deadline = datetime.now() + timedelta(days=1)  # Default tomorrow
        if 'today' in lower_input:
            deadline = datetime.now() + timedelta(hours=4)
        elif 'tomorrow' in lower_input:
            deadline = datetime.now() + timedelta(days=1)
        elif 'next week' in lower_input:
            deadline = datetime.now() + timedelta(weeks=1)
        
        # Priority based on urgency
        priority_map = {'low': 'Low', 'medium': 'Medium', 'high': 'High'}
        priority = priority_map.get(intent.get('urgency', 'medium'), 'Medium')
        
        return {
            "title": title[:100],  # Limit length
            "description": user_input,
            "deadline": deadline.isoformat(),
            "priority": priority,
            "estimated_duration": 60
        }
    
    def _extract_event_fallback(self, user_input: str, intent: Dict) -> Dict:
        """Fallback event extraction using rules"""
        title = user_input
        for prefix in ['schedule', 'create event', 'meeting with']:
            title = re.sub(f'^{prefix}\\s*', '', title, flags=re.IGNORECASE)
        
        # Default to tomorrow 9 AM
        start_time = datetime.now() + timedelta(days=1)
        start_time = start_time.replace(hour=9, minute=0, second=0, microsecond=0)
        end_time = start_time + timedelta(hours=1)
        
        return {
            "title": title[:100],
            "description": user_input,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "location": None,
            "attendees": []
        }
