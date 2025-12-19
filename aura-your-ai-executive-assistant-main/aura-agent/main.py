"""
AURA - Autonomous Unified Reminder Agent
Main orchestration system for multi-agent workflow
"""
import sys
from typing import Dict, Optional

from config.settings import settings
from llm.openai_client import OpenAIClient
from llm.ollama_client import OllamaClient
from tools.notion_tool import NotionTool
from tools.gmail_tool import GmailTool
from tools.calendar_tool import CalendarTool
from tools.voice_input import VoiceInput
from tools.autonomous_manager import AutonomousManager
from agents.intent_agent import IntentAgent
from agents.planner_agent import PlannerAgent
from agents.executor_agent import ExecutorAgent


class AURASystem:
    """
    Main AURA orchestration system
    Coordinates all agents and tools
    """
    
    def __init__(self):
        print("\n" + "="*60)
        print("🚀 INITIALIZING AURA SYSTEM")
        print("="*60 + "\n")
        
        # Validate configuration
        settings.validate()
        settings.print_config()
        
        # Initialize LLM with fallback
        self.llm = self._initialize_llm()
        
        # Initialize tools
        self.notion = NotionTool(
            api_key=settings.NOTION_API_KEY,
            database_id=settings.NOTION_DATABASE_ID
        )
        self.gmail = GmailTool()
        self.calendar = CalendarTool()
        self.voice = VoiceInput()
        self.autonomous_manager = AutonomousManager(self.notion, self.gmail, self.calendar)
        
        # Initialize agents
        self.intent_agent = IntentAgent(self.llm)
        self.planner_agent = PlannerAgent(self.llm)
        self.executor_agent = ExecutorAgent(self.notion, self.gmail, self.calendar)
        
        print("\n✅ AURA SYSTEM READY\n")
    
    def _initialize_llm(self):
        """Initialize LLM with automatic fallback"""
        print("🧠 Initializing LLM...")
        
        # Try primary provider
        if settings.LLM_PROVIDER == "openai":
            try:
                llm = OpenAIClient(
                    model_name=settings.OPENAI_MODEL,
                    api_key=settings.OPENAI_API_KEY
                )
                if llm.is_available():
                    print(f"✓ Using OpenAI: {settings.OPENAI_MODEL}\n")
                    return llm
                else:
                    print("⚠️  OpenAI not available, falling back to Ollama...")
            except Exception as e:
                print(f"⚠️  OpenAI initialization failed: {str(e)}")
                print("   Falling back to Ollama...\n")
        
        # Fallback to Ollama
        try:
            llm = OllamaClient(
                model_name=settings.OLLAMA_MODEL,
                base_url=settings.OLLAMA_BASE_URL
            )
            if llm.is_available():
                print(f"✓ Using Ollama: {settings.OLLAMA_MODEL}\n")
                return llm
            else:
                print("⚠️  Ollama not available either!")
        except Exception as e:
            print(f"⚠️  Ollama initialization failed: {str(e)}\n")
        
        # If both fail, use mock mode
        print("⚠️  No LLM available - using rule-based fallback mode\n")
        return None
    
    def process_request(self, user_input: str, user_email: Optional[str] = None) -> Dict:
        """
        Process user request through the agent pipeline
        
        Args:
            user_input: User's natural language request
            user_email: User's email for notifications
            
        Returns:
            Processing results
        """
        if not user_email:
            user_email = settings.USER_EMAIL
        
        print("\n" + "="*60)
        print(f"📥 PROCESSING REQUEST")
        print("="*60)
        print(f"User: {user_input}\n")
        
        try:
            # Step 1: Intent Analysis
            intent = self.intent_agent.analyze(user_input)
            
            # Step 2: Plan Creation
            plan = self.planner_agent.create_plan(user_input, intent)
            
            # Step 3: Execution
            results = self.executor_agent.execute_plan(plan, user_email)
            
            print("\n" + "="*60)
            print("✅ REQUEST COMPLETED")
            print("="*60)
            
            return {
                "success": results['success'],
                "intent": intent,
                "plan": plan,
                "results": results
            }
        
        except Exception as e:
            print(f"\n❌ ERROR: {str(e)}\n")
            return {
                "success": False,
                "error": str(e)
            }
    
    def check_overdue_tasks(self, user_email: Optional[str] = None):
        """Check and update overdue tasks"""
        if not user_email:
            user_email = settings.USER_EMAIL
        
        return self.executor_agent.check_and_update_overdue_tasks(user_email)
    
    def get_pending_tasks(self):
        """Get all pending tasks from Notion"""
        return self.notion.get_pending_tasks()


def main():
    """Main entry point for AURA system"""
    
    # Initialize AURA
    aura = AURASystem()
    
    # Interactive mode
    print("\n💬 AURA Interactive Mode")
    print("Commands:")
    print("  - Type your request (e.g., 'Remind me to buy groceries')")
    print("  - 'voice' - Use voice input")
    print("  - 'show tasks' - List all pending tasks")
    print("  - 'check overdue' - Check for overdue tasks")
    print("  - 'autonomous' - Run autonomous task management")
    print("  - 'start monitoring' - Start continuous autonomous monitoring")
    print("  - 'quit' - Exit\n")
    
    while True:
        try:
            user_input = input("You: ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() in ['quit', 'exit', 'bye']:
                print("\n👋 Goodbye!\n")
                break
            
            # Voice input mode
            if user_input.lower() == 'voice':
                if aura.voice.available:
                    voice_text = aura.voice.listen(timeout=10, phrase_time_limit=15)
                    if voice_text:
                        user_input = voice_text
                        print(f"🎤 Voice: {user_input}")
                    else:
                        print("❌ No voice input detected\n")
                        continue
                else:
                    print("❌ Voice input not available. Install: pip install SpeechRecognition pyaudio\n")
                    continue
            
            # Special commands
            if user_input.lower() == 'check overdue':
                aura.check_overdue_tasks()
                continue
            
            if user_input.lower() == 'show tasks':
                tasks = aura.get_pending_tasks()
                print(f"\n📋 Pending Tasks: {len(tasks)}")
                for task in tasks:
                    print(f"  - {task['task_name']} (Priority: {task['priority']})")
                print()
                continue
            
            if user_input.lower() in ['autonomous', 'auto manage', 'manage tasks']:
                print("\n🤖 Running autonomous task management...")
                actions = aura.autonomous_manager.check_and_manage_tasks(settings.USER_EMAIL)
                continue
            
            if user_input.lower() in ['start monitoring', 'auto monitor']:
                print("\n🚀 Starting continuous autonomous monitoring...")
                aura.autonomous_manager.start_autonomous_monitoring(
                    user_email=settings.USER_EMAIL,
                    check_interval=300  # 5 minutes
                )
                continue
            
            # Process normal request
            result = aura.process_request(user_input)
            
            if result['success']:
                print("\n✅ Success!")
                if 'created_items' in result['results']:
                    items = result['results']['created_items']
                    if 'notion_task' in items:
                        print(f"   Task ID: {items['notion_task']['id']}")
            else:
                print(f"\n❌ Failed: {result.get('error', 'Unknown error')}")
            
            print()
        
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!\n")
            break
        except Exception as e:
            print(f"\n❌ Error: {str(e)}\n")


if __name__ == "__main__":
    main()
