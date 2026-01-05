"""
Test Questions API Endpoint
"""

import requests

try:
    # Test the questions endpoint
    url = "http://localhost:8000/api/questions/by_subgroup/"
    params = {"sub_group_1_1": "Tangible assets"}
    
    print(f"Testing: {url}")
    print(f"Params: {params}")
    print("-" * 60)
    
    response = requests.get(url, params=params)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response:")
    print(response.text[:500])  # First 500 chars
    
    if response.status_code == 200:
        data = response.json()
        print("\n✅ Success!")
        print(f"Found {data.get('count', 0)} questions")
    else:
        print("\n❌ Error!")
        
except Exception as e:
    print(f"❌ Exception: {e}")
