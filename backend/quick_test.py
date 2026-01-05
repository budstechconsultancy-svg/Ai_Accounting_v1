import requests

# Test Django backend directly
print("Testing Django backend directly...")
try:
    r = requests.get("http://localhost:8000/api/inventory/reports/stock-summary/?dateFrom=2025-12-31&dateTo=2026-01-05")
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        print("✅ Django endpoint is working!")
        print(f"Response: {r.json()}")
    else:
        print(f"❌ Error: {r.text}")
except Exception as e:
    print(f"❌ Exception: {e}")

# Test through Vite proxy
print("\nTesting through Vite proxy...")
try:
    r2 = requests.get("http://localhost:5173/api/inventory/reports/stock-summary/?dateFrom=2025-12-31&dateTo=2026-01-05")
    print(f"Status: {r2.status_code}")
    if r2.status_code == 200:
        print("✅ Vite proxy is working!")
    else:
        print(f"❌ Vite proxy failed: {r2.text[:200]}")
except Exception as e:
    print(f"❌ Exception: {e}")
