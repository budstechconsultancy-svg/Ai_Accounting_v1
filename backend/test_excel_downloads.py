import requests

print("Testing Excel Download Endpoints...")
print("=" * 60)

# Test Daybook Excel
try:
    url1 = "http://localhost:8000/api/reports/daybook/excel/"
    print(f"\n1. Testing Daybook Excel: {url1}")
    response1 = requests.get(url1, timeout=5)
    print(f"   Status: {response1.status_code}")
    if response1.status_code == 200:
        content_type = response1.headers.get('Content-Type')
        content_disp = response1.headers.get('Content-Disposition')
        print(f"   ✅ Working! Content-Type: {content_type}")
        print(f"   ✅ Filename: {content_disp}")
        print(f"   ✅ File size: {len(response1.content)} bytes")
    else:
        print(f"   ❌ Failed: {response1.text[:200]}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test Trial Balance Excel
try:
    url2 = "http://localhost:8000/api/reports/trialbalance/excel/"
    print(f"\n2. Testing Trial Balance Excel: {url2}")
    response2 = requests.get(url2, timeout=5)
    print(f"   Status: {response2.status_code}")
    if response2.status_code == 200:
        content_type = response2.headers.get('Content-Type')
        content_disp = response2.headers.get('Content-Disposition')
        print(f"   ✅ Working! Content-Type: {content_type}")
        print(f"   ✅ Filename: {content_disp}")
        print(f"   ✅ File size: {len(response2.content)} bytes")
    else:
        print(f"   ❌ Failed: {response2.text[:200]}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "=" * 60)
print("\nIf both show Status: 200, the endpoints are working!")
print("You just need to hard refresh your browser (Ctrl+Shift+R)")
