"""
Test if report endpoints are accessible
"""
import requests
import time

# Wait for server to be ready
time.sleep(2)

print("Testing Report Endpoints...")
print("=" * 60)

# Test 1: Daybook Excel
try:
    url1 = "http://localhost:8000/api/reports/daybook/excel/"
    print(f"\n1. Testing: {url1}")
    response1 = requests.get(url1, timeout=5)
    print(f"   Status: {response1.status_code}")
    if response1.status_code == 200:
        print(f"   ✅ Daybook Excel endpoint is working!")
        print(f"   Content-Type: {response1.headers.get('Content-Type')}")
    else:
        print(f"   ❌ Failed: {response1.text[:200]}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 2: Stock Summary
try:
    url2 = "http://localhost:8000/api/inventory/reports/stock-summary/?dateFrom=2025-12-31&dateTo=2026-01-05"
    print(f"\n2. Testing: {url2}")
    response2 = requests.get(url2, timeout=5)
    print(f"   Status: {response2.status_code}")
    if response2.status_code == 200:
        print(f"   ✅ Stock Summary endpoint is working!")
        data = response2.json()
        print(f"   Data keys: {list(data.keys())}")
    else:
        print(f"   ❌ Failed: {response2.text[:200]}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "=" * 60)
