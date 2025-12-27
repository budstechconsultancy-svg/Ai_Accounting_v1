import requests

try:
    print("Testing /api/hierarchy/ endpoint...")
    response = requests.get('http://localhost:8000/api/hierarchy/')
    print(f"Status Code: {response.status_code}")
    print(f"Content-Type: {response.headers.get('Content-Type')}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            print(f"✅ Success! Got {len(data)} records")
            if len(data) > 0:
                print(f"\nFirst record:")
                print(f"  {data[0]}")
        except Exception as e:
            print(f"❌ Failed to parse JSON: {e}")
            print(f"\nResponse text (first 500 chars):")
            print(response.text[:500])
    else:
        print(f"❌ Error response:")
        print(response.text[:1000])
except Exception as e:
    print(f"❌ Exception: {e}")
