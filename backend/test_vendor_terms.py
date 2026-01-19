"""
Test script for Vendor Master Terms API
Run this after completing the vendor onboarding flow
"""
import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api/vendors/terms/"

# You'll need to get a valid token first by logging in
# For now, this is a template for testing

def test_create_terms():
    """
    Test creating vendor terms
    """
    # Sample payload
    payload = {
        "vendor_basic_detail": 1,  # Replace with actual vendor ID
        "credit_limit": 50000.00,
        "credit_period": "30 days",
        "credit_terms": "Payment within 30 days of invoice date",
        "penalty_terms": "2% penalty per month on late payments",
        "delivery_terms": "FOB, 15 days lead time from order confirmation",
        "warranty_guarantee_details": "1 year warranty on all products",
        "force_majeure": "Standard force majeure clauses apply as per contract law",
        "dispute_redressal_terms": "Disputes resolved through arbitration in Mumbai"
    }
    
    # Headers (you'll need to add authentication token)
    headers = {
        "Content-Type": "application/json",
        # "Authorization": "Bearer YOUR_TOKEN_HERE"
    }
    
    try:
        response = requests.post(API_URL, json=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201:
            print("\n✅ Terms created successfully!")
            return response.json()
        else:
            print(f"\n❌ Error creating terms: {response.json()}")
            return None
            
    except Exception as e:
        print(f"\n❌ Exception occurred: {str(e)}")
        return None


def test_get_terms_by_vendor(vendor_id):
    """
    Test getting terms for a specific vendor
    """
    url = f"{API_URL}by_vendor/{vendor_id}/"
    
    headers = {
        "Content-Type": "application/json",
        # "Authorization": "Bearer YOUR_TOKEN_HERE"
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print(f"\n✅ Retrieved {len(response.json().get('data', []))} terms records")
            return response.json()
        else:
            print(f"\n❌ Error retrieving terms: {response.json()}")
            return None
            
    except Exception as e:
        print(f"\n❌ Exception occurred: {str(e)}")
        return None


def test_list_all_terms():
    """
    Test listing all terms
    """
    headers = {
        "Content-Type": "application/json",
        # "Authorization": "Bearer YOUR_TOKEN_HERE"
    }
    
    try:
        response = requests.get(API_URL, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print(f"\n✅ Retrieved {response.json().get('count', 0)} terms records")
            return response.json()
        else:
            print(f"\n❌ Error listing terms: {response.json()}")
            return None
            
    except Exception as e:
        print(f"\n❌ Exception occurred: {str(e)}")
        return None


if __name__ == "__main__":
    print("=" * 60)
    print("Vendor Master Terms API Test")
    print("=" * 60)
    
    print("\n1. Testing Create Terms...")
    print("-" * 60)
    # Uncomment to test:
    # test_create_terms()
    
    print("\n2. Testing Get Terms by Vendor...")
    print("-" * 60)
    # Uncomment to test (replace 1 with actual vendor ID):
    # test_get_terms_by_vendor(1)
    
    print("\n3. Testing List All Terms...")
    print("-" * 60)
    # Uncomment to test:
    # test_list_all_terms()
    
    print("\n" + "=" * 60)
    print("Note: Uncomment the test functions and add authentication")
    print("token to run actual tests")
    print("=" * 60)
