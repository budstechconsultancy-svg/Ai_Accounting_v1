import requests
import json

BASE_URL = "http://localhost:8000/api/accounting/questions"

print("="*100)
print("TESTING QUESTIONS API")
print("="*100)

# Test 1: Get all sub-groups
print("\n1. GET /api/accounting/questions/subgroups/")
print("-"*100)
try:
    response = requests.get(f"{BASE_URL}/subgroups/")
    if response.status_code == 200:
        data = response.json()
        print(f"[OK] Found {data['count']} sub-groups")
        print("Sub-groups:")
        for sg in data['subgroups'][:10]:  # Show first 10
            print(f"  - {sg}")
    else:
        print(f"[ERROR] Status: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"[ERROR] {e}")

# Test 2: Get questions for a specific sub-group
print("\n2. GET /api/accounting/questions/by_subgroup/?sub_group_1_1=Bank")
print("-"*100)
try:
    response = requests.get(f"{BASE_URL}/by_subgroup/", params={'sub_group_1_1': 'Bank'})
    if response.status_code == 200:
        data = response.json()
        print(f"[OK] Found {data['count']} questions for 'Bank'")
        for q in data['questions']:
            print(f"\nQuestion ID: {q['id']}")
            print(f"  Text: {q['question']}")
            print(f"  Field Type: {q['field_type']}")
            print(f"  Required: {q['required']}")
            if q['options']:
                print(f"  Options: {q['options']}")
            print(f"  Condition Rule: {q['condition_rule']}")
    else:
        print(f"[ERROR] Status: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"[ERROR] {e}")

# Test 3: Search questions
print("\n3. GET /api/accounting/questions/search/?q=loan")
print("-"*100)
try:
    response = requests.get(f"{BASE_URL}/search/", params={'q': 'loan'})
    if response.status_code == 200:
        data = response.json()
        print(f"[OK] Found {data['count']} questions matching 'loan'")
        for q in data['questions'][:5]:  # Show first 5
            print(f"  - {q['question']} (Sub-group: {q['sub_group_1_1']})")
    else:
        print(f"[ERROR] Status: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"[ERROR] {e}")

# Test 4: Get all questions (paginated)
print("\n4. GET /api/accounting/questions/")
print("-"*100)
try:
    response = requests.get(f"{BASE_URL}/")
    if response.status_code == 200:
        data = response.json()
        if isinstance(data, list):
            print(f"[OK] Found {len(data)} total questions")
            print(f"\nFirst question:")
            if data:
                q = data[0]
                print(json.dumps(q, indent=2))
        else:
            print(f"[OK] Response: {data}")
    else:
        print(f"[ERROR] Status: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"[ERROR] {e}")

print("\n" + "="*100)
print("TESTING COMPLETE")
print("="*100)
