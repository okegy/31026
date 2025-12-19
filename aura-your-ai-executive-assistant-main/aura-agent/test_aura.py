"""
Test Script for AURA System
Demonstrates all key features
"""
from main import AURASystem


def test_basic_functionality():
    """Test basic AURA functionality"""
    print("\n" + "="*60)
    print("🧪 AURA SYSTEM TEST")
    print("="*60 + "\n")
    
    # Initialize AURA
    print("Initializing AURA...\n")
    aura = AURASystem()
    
    # Test cases
    test_cases = [
        {
            "name": "Simple Task",
            "input": "Remind me to buy groceries tomorrow",
            "expected": "task creation"
        },
        {
            "name": "Urgent Task",
            "input": "URGENT: Submit report by today 5pm",
            "expected": "high priority task"
        },
        {
            "name": "Event Scheduling",
            "input": "Schedule team meeting on Friday at 2pm",
            "expected": "event creation"
        },
        {
            "name": "Complex Task",
            "input": "Prepare presentation for client meeting next Monday at 10am",
            "expected": "task with specific deadline"
        }
    ]
    
    results = []
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n{'='*60}")
        print(f"TEST {i}/{len(test_cases)}: {test['name']}")
        print(f"{'='*60}")
        print(f"Input: {test['input']}")
        print(f"Expected: {test['expected']}\n")
        
        try:
            result = aura.process_request(test['input'])
            
            if result['success']:
                print(f"✅ TEST PASSED")
                results.append(True)
            else:
                print(f"❌ TEST FAILED: {result.get('error', 'Unknown error')}")
                results.append(False)
        
        except Exception as e:
            print(f"❌ TEST FAILED: {str(e)}")
            results.append(False)
    
    # Summary
    print(f"\n{'='*60}")
    print("📊 TEST SUMMARY")
    print(f"{'='*60}")
    passed = sum(results)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED!")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
    
    print()


def test_task_management():
    """Test task management features"""
    print("\n" + "="*60)
    print("🧪 TESTING TASK MANAGEMENT")
    print("="*60 + "\n")
    
    aura = AURASystem()
    
    # Create some tasks
    print("Creating test tasks...\n")
    aura.process_request("Task 1: Review code by tomorrow")
    aura.process_request("Task 2: Write documentation by next week")
    
    # Get pending tasks
    print("\nRetrieving pending tasks...\n")
    tasks = aura.get_pending_tasks()
    print(f"✓ Found {len(tasks)} pending tasks")
    
    for task in tasks:
        print(f"  - {task['task_name']} (Priority: {task['priority']})")
    
    # Check overdue
    print("\nChecking for overdue tasks...\n")
    overdue_count = aura.check_overdue_tasks()
    print(f"✓ {overdue_count} tasks marked as overdue")
    
    print("\n✅ Task management test complete\n")


def test_llm_fallback():
    """Test LLM fallback mechanism"""
    print("\n" + "="*60)
    print("🧪 TESTING LLM FALLBACK")
    print("="*60 + "\n")
    
    print("Testing with current LLM configuration...")
    aura = AURASystem()
    
    test_input = "Remind me to call John tomorrow at 3pm"
    result = aura.process_request(test_input)
    
    if result['success']:
        print("✅ LLM system working correctly")
        print(f"   Intent: {result['intent']['type']}")
        print(f"   Urgency: {result['intent']['urgency']}")
    else:
        print("⚠️  LLM failed, but system should have fallen back")
    
    print()


if __name__ == "__main__":
    print("\n" + "🤖 AURA AUTOMATED TEST SUITE 🤖".center(60))
    
    try:
        # Run tests
        test_basic_functionality()
        test_task_management()
        test_llm_fallback()
        
        print("\n" + "="*60)
        print("✅ ALL TEST SUITES COMPLETED")
        print("="*60 + "\n")
    
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user\n")
    except Exception as e:
        print(f"\n\n❌ Test suite failed: {str(e)}\n")
