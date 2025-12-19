"""
Intent Agent for AURA
Analyzes user input and determines intent/action type
"""
from typing import Dict, Optional
import json
import re


class IntentAgent:
    """
    Analyzes user requests to determine:
    - Intent type (task, event, reminder, query)
    - Urgency level
    - Required actions
    """
    
    def __init__(self, llm_client):
        self.llm = llm_client
        print("✓ Intent Agent initialized")
    
    def analyze(self, user_input: str) -> Dict:
        """
        Analyze user input to extract intent
        
        Args:
            user_input: Raw user request
            
        Returns:
            Intent analysis with type, urgency, and extracted info
        """
        print(f"\n🧠 Intent Agent analyzing: '{user_input}'")
        
        # Use LLM for intent classification
        system_prompt = """You are an intent classification AI for a task management system.
Analyze the user's request and respond ONLY with a JSON object (no markdown, no extra text).

Classify into one of these types:
- "task": User wants to create a task/reminder
- "event": User wants to schedule a meeting/event
- "query": User is asking a question
- "update": User wants to update existing item

Extract:
- urgency: "low", "medium", "high"
- action_required: "create_task", "create_event", "send_email", "schedule_meeting", etc.
- key_entities: list of important entities (names, dates, times)

Example response:
{"type": "task", "urgency": "high", "action_required": "create_task", "key_entities": ["tomorrow", "3pm", "client meeting"]}"""
        
        try:
            response = self.llm.generate(
                prompt=f"User request: {user_input}",
                system_prompt=system_prompt,
                temperature=0.3,
                max_tokens=200
            )
            
            # Parse LLM response
            intent = self._parse_llm_response(response)
            
            # Fallback to rule-based if LLM fails
            if not intent or "type" not in intent:
                intent = self._rule_based_intent(user_input)
            
        except Exception as e:
            print(f"⚠️  LLM intent analysis failed: {str(e)}. Using rule-based fallback.")
            intent = self._rule_based_intent(user_input)
        
        print(f"✓ Intent detected: {intent['type']} (urgency: {intent['urgency']})")
        return intent
    
    def _parse_llm_response(self, response: str) -> Optional[Dict]:
        """Parse LLM JSON response"""
        try:
            # Remove markdown code blocks if present
            response = response.strip()
            if response.startswith("```"):
                response = re.sub(r'```json\s*|\s*```', '', response)
            
            intent = json.loads(response)
            return intent
        except json.JSONDecodeError:
            return None
    
    def _rule_based_intent(self, user_input: str) -> Dict:
        """Fallback rule-based intent detection"""
        lower_input = user_input.lower()
        
        # Determine type
        if any(word in lower_input for word in ['meeting', 'schedule', 'event', 'appointment']):
            intent_type = "event"
            action = "create_event"
        elif any(word in lower_input for word in ['remind', 'task', 'todo', 'deadline']):
            intent_type = "task"
            action = "create_task"
        elif any(word in lower_input for word in ['what', 'when', 'how', 'why', 'show', 'list']):
            intent_type = "query"
            action = "query_info"
        else:
            intent_type = "task"  # Default to task
            action = "create_task"
        
        # Determine urgency
        if any(word in lower_input for word in ['urgent', 'asap', 'immediately', 'now', 'today']):
            urgency = "high"
        elif any(word in lower_input for word in ['tomorrow', 'soon', 'this week']):
            urgency = "medium"
        else:
            urgency = "low"
        
        # Extract key entities (simple regex-based)
        entities = []
        
        # Time patterns
        time_patterns = [
            r'\d{1,2}:\d{2}\s*(?:am|pm)?',
            r'\d{1,2}\s*(?:am|pm)',
            r'today|tomorrow|tonight',
            r'monday|tuesday|wednesday|thursday|friday|saturday|sunday',
            r'next week|this week',
            r'\d{1,2}/\d{1,2}(?:/\d{2,4})?'
        ]
        
        for pattern in time_patterns:
            matches = re.findall(pattern, lower_input)
            entities.extend(matches)
        
        # Names (capitalized words)
        name_matches = re.findall(r'\b[A-Z][a-z]+\b', user_input)
        entities.extend(name_matches[:3])  # Limit to 3 names
        
        return {
            "type": intent_type,
            "urgency": urgency,
            "action_required": action,
            "key_entities": list(set(entities)),  # Remove duplicates
            "confidence": "rule_based"
        }
