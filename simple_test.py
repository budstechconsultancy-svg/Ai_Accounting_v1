import requests
import json

print("Testing Questions API...")
print("="*60)

url = "http://localhost:8000/api/accounting/ledgers/questions/"
payload = {
    "category": "Assets",
    "group": "Current Assets",
    "sub_group_1": "Sundry Debtors"
}

print(f"\nURL: {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")

try:
    print("\nSending request...")
    response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'}, timeout=5)
    
    print(f"Status Code: {response.status_code}")
    print(f"\nResponse:")
    print(json.dumps(response.json(), indent=2))
    
except requests.exceptions.ConnectionError as e:
    print(f"\n❌ Connection Error: {e}")
    print("Make sure Django server is running on http://localhost:8000")
except Exception as e:
    print(f"\n❌ Error: {e}")
