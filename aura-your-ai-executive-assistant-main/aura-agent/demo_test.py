"""Demo test with multiple tasks"""
from main import AURASystem
import time

print("\n" + "="*60)
print("🎯 AURA DEMO - Creating Multiple Tasks")
print("="*60 + "\n")

# Initialize AURA
aura = AURASystem()

# Test cases
test_cases = [
    "URGENT: Submit hackathon project by today 11:59pm",
    "Schedule team meeting on Friday at 2pm",
    "Buy groceries tomorrow",
    "Call client about contract next Monday",
]

print("\n" + "="*60)
print("📝 Creating Tasks...")
print("="*60 + "\n")

for i, task_input in enumerate(test_cases, 1):
    print(f"\n[{i}/{len(test_cases)}] Processing: '{task_input}'")
    print("-" * 60)
    
    result = aura.process_request(task_input)
    
    if result['success']:
        print(f"✅ SUCCESS")
        if 'notion_task' in result['results'].get('created_items', {}):
            task = result['results']['created_items']['notion_task']
            print(f"   Notion ID: {task['id']}")
            print(f"   Priority: {task['priority']}")
    else:
        print(f"❌ FAILED: {result.get('error', 'Unknown')}")
    
    time.sleep(1)  # Brief pause between requests

print("\n" + "="*60)
print("🎉 DEMO COMPLETE!")
print("="*60)
print("\n📊 Check your Notion database:")
print("   https://www.notion.so/2ce06e11832e8091a3b7d78e39f5524e")
print("\n   You should see all 4 tasks created!\n")
