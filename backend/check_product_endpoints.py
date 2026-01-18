
import os
import django
import requests

# Setup Django (not needed for requests, but good for context if we import models)
# But we are testing the running server
API_URL = "http://127.0.0.1:8000/api/vendors/product-services/"

def test_api_options():
    try:
        # We need a token? We enabled IsAuthenticated.
        # So we expect 401 or 403 if no token.
        response = requests.options(API_URL)
        print(f"OPTIONS Response: {response.status_code}")
        # If 401, it means endpoint exists and auth is working.
        # If 404, endpoint is missing.
        if response.status_code in [200, 401, 403]:
            print("✅ Endpoint /api/vendors/product-services/ exists.")
        else:
            print(f"❌ Endpoint possibly missing. Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    test_api_options()
