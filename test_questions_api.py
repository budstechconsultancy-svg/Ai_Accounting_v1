"""
Test Script for Dynamic Questions System API
=============================================

This script tests the questions system API endpoints.

Usage:
    python test_questions_api.py
"""

import requests
import json

BASE_URL = "http://localhost:8000/api/accounting"

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}\n")

def print_success(text):
    print(f"{Colors.GREEN}✅ {text}{Colors.END}")

def print_error(text):
    print(f"{Colors.RED}❌ {text}{Colors.END}")

def print_info(text):
    print(f"{Colors.YELLOW}ℹ️  {text}{Colors.END}")

def test_get_questions():
    """Test GET questions endpoint"""
    print_header("TEST 1: Get Questions for Sundry Debtors")
    
    url = f"{BASE_URL}/ledgers/questions/"
    payload = {
        "category": "Assets",
        "group": "Current Assets",
        "sub_group_1": "Sundry Debtors"
    }
    
    print_info(f"Request: POST {url}")
    print_info(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'})
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_success("Request successful!")
            
            print(f"\n{Colors.BOLD}Response:{Colors.END}")
            print(json.dumps(data, indent=2))
            
            if data.get('success'):
                questions = data.get('questions', [])
                print_success(f"Found {len(questions)} questions")
                
                print(f"\n{Colors.BOLD}Questions Summary:{Colors.END}")
                for q in questions:
                    required = "Required" if q.get('is_required') else "Optional"
                    print(f"  • {q.get('question_code')}: {q.get('question_text')} ({q.get('question_type')}) - {required}")
                
                return True
            else:
                print_error(f"API returned success=false: {data.get('error')}")
                return False
        else:
            print_error(f"Request failed with status {response.status_code}")
            print(response.text)
            return False
    
    except requests.exceptions.ConnectionError:
        print_error("Could not connect to server. Is Django running on http://localhost:8000?")
        return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_get_questions_bank():
    """Test GET questions for Bank Accounts"""
    print_header("TEST 2: Get Questions for Bank Accounts")
    
    url = f"{BASE_URL}/ledgers/questions/"
    payload = {
        "category": "Assets",
        "group": "Current Assets",
        "sub_group_1": "Bank Accounts"
    }
    
    print_info(f"Request: POST {url}")
    print_info(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'})
        
        if response.status_code == 200:
            data = response.json()
            print_success("Request successful!")
            
            if data.get('success'):
                questions = data.get('questions', [])
                print_success(f"Found {len(questions)} questions for Bank Accounts")
                
                print(f"\n{Colors.BOLD}Questions:{Colors.END}")
                for q in questions:
                    print(f"  • {q.get('question_text')} ({q.get('question_type')})")
                
                return True
            else:
                print_error(f"API returned success=false: {data.get('error')}")
                return False
        else:
            print_error(f"Request failed with status {response.status_code}")
            return False
    
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_create_ledger():
    """Test CREATE ledger with questions (requires authentication)"""
    print_header("TEST 3: Create Ledger with Questions")
    
    print_info("⚠️  This test requires authentication")
    print_info("Skipping for now - test manually with valid auth token")
    
    # Example payload for reference
    example_payload = {
        "name": "Test Customer ABC",
        "category": "Assets",
        "group": "Current Assets",
        "sub_group_1": "Sundry Debtors",
        "answers": {
            "Q_OPENING_BALANCE": "50000.00",
            "Q_CREDIT_LIMIT": "100000.00",
            "Q_GSTIN": "27AABCU9603R1ZM",
            "Q_STATE": "Maharashtra",
            "Q_EMAIL": "test@example.com",
            "Q_PHONE": "9876543210"
        }
    }
    
    print(f"\n{Colors.BOLD}Example Payload:{Colors.END}")
    print(json.dumps(example_payload, indent=2))
    
    print_info("\nTo test with authentication, use:")
    print(f"  curl -X POST {BASE_URL}/ledgers/create-with-questions/ \\")
    print(f"    -H 'Content-Type: application/json' \\")
    print(f"    -H 'Authorization: Bearer YOUR_TOKEN' \\")
    print(f"    -d '{json.dumps(example_payload)}'")
    
    return None

def test_validation():
    """Test validation errors"""
    print_header("TEST 4: Validation Test (Invalid Hierarchy)")
    
    url = f"{BASE_URL}/ledgers/questions/"
    payload = {
        "category": "InvalidCategory",
        "group": "InvalidGroup",
        "sub_group_1": "InvalidSubGroup"
    }
    
    print_info(f"Request: POST {url}")
    print_info(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'})
        
        if response.status_code == 400:
            data = response.json()
            print_success("Validation working correctly - returned 400 for invalid hierarchy")
            print(f"\n{Colors.BOLD}Error Response:{Colors.END}")
            print(json.dumps(data, indent=2))
            return True
        elif response.status_code == 200:
            data = response.json()
            if not data.get('success'):
                print_success("Validation working - API returned success=false")
                print(json.dumps(data, indent=2))
                return True
            else:
                print_error("Expected validation error but got success")
                return False
        else:
            print_error(f"Unexpected status code: {response.status_code}")
            return False
    
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def run_all_tests():
    """Run all tests"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}")
    print("╔════════════════════════════════════════════════════════════╗")
    print("║     DYNAMIC QUESTIONS SYSTEM - API TEST SUITE             ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print(f"{Colors.END}")
    
    results = []
    
    # Test 1: Get questions for Sundry Debtors
    results.append(("Get Questions - Sundry Debtors", test_get_questions()))
    
    # Test 2: Get questions for Bank Accounts
    results.append(("Get Questions - Bank Accounts", test_get_questions_bank()))
    
    # Test 3: Create ledger (manual test)
    results.append(("Create Ledger (Manual)", test_create_ledger()))
    
    # Test 4: Validation
    results.append(("Validation Test", test_validation()))
    
    # Summary
    print_header("TEST SUMMARY")
    
    passed = sum(1 for _, result in results if result is True)
    failed = sum(1 for _, result in results if result is False)
    skipped = sum(1 for _, result in results if result is None)
    total = len(results)
    
    for test_name, result in results:
        if result is True:
            print_success(f"{test_name}: PASSED")
        elif result is False:
            print_error(f"{test_name}: FAILED")
        else:
            print_info(f"{test_name}: SKIPPED")
    
    print(f"\n{Colors.BOLD}Results:{Colors.END}")
    print(f"  Total Tests: {total}")
    print(f"  {Colors.GREEN}Passed: {passed}{Colors.END}")
    print(f"  {Colors.RED}Failed: {failed}{Colors.END}")
    print(f"  {Colors.YELLOW}Skipped: {skipped}{Colors.END}")
    
    if failed == 0 and passed > 0:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED! 🎉{Colors.END}\n")
    elif failed > 0:
        print(f"\n{Colors.RED}{Colors.BOLD}⚠️  SOME TESTS FAILED{Colors.END}\n")
    
    return failed == 0

if __name__ == "__main__":
    try:
        success = run_all_tests()
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Tests interrupted by user{Colors.END}\n")
        exit(1)
