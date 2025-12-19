"""Quick test of AURA system"""
from main import AURASystem

print("\n" + "="*60)
print("🧪 TESTING AURA SYSTEM")
print("="*60 + "\n")

# Initialize AURA
aura = AURASystem()

# Test request
test_input = "Remind me to prepare presentation by tomorrow 3pm"
print(f"\n📥 Testing with: '{test_input}'\n")

# Process request
result = aura.process_request(test_input)

# Show results
print("\n" + "="*60)
print("📊 RESULTS")
print("="*60)
print(f"✅ Success: {result['success']}")
print(f"🎯 Intent Type: {result['intent']['type']}")
print(f"⚡ Urgency: {result['intent']['urgency']}")
print(f"📋 Actions Executed: {', '.join(result['results']['executed_actions'])}")

if 'notion_task' in result['results'].get('created_items', {}):
    task = result['results']['created_items']['notion_task']
    print(f"\n✅ Task Created in Notion:")
    print(f"   ID: {task['id']}")
    print(f"   Name: {task['task_name']}")
    print(f"   Priority: {task['priority']}")
    print(f"   Status: {task['status']}")

print("\n" + "="*60)
print("🎉 TEST COMPLETE - Check your Notion database!")
print("="*60 + "\n")
