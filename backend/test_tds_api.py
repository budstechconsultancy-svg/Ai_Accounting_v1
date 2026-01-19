"""
Quick API test for vendor TDS endpoints.
This script tests the API endpoints without authentication for basic connectivity.
"""

import requests
import json

BASE_URL = "http://localhost:8000"
TDS_ENDPOINT = f"{BASE_URL}/api/vendors/tds-details/"

def test_endpoint_exists():
    """Test if the TDS endpoint exists (should return 401 or 403 without auth)"""
    print("=" * 60)
    print("Testing TDS API Endpoint Availability")
    print("=" * 60)
    
    try:
        response = requests.get(TDS_ENDPOINT)
        print(f"\nEndpoint: {TDS_ENDPOINT}")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code in [401, 403]:
            print("✓ Endpoint exists! (Authentication required)")
            return True
        elif response.status_code == 404:
            print("✗ Endpoint not found!")
            return False
        elif response.status_code == 200:
            print("✓ Endpoint exists and accessible!")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"⚠ Unexpected status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to server. Is it running?")
        return False
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False

def test_options():
    """Test OPTIONS request to see available methods"""
    print("\n" + "=" * 60)
    print("Testing Available HTTP Methods")
    print("=" * 60)
    
    try:
        response = requests.options(TDS_ENDPOINT)
        print(f"\nStatus Code: {response.status_code}")
        
        if 'Allow' in response.headers:
            methods = response.headers['Allow']
            print(f"Allowed Methods: {methods}")
            return True
        else:
            print("No Allow header found")
            return False
            
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("VENDOR TDS API - ENDPOINT VERIFICATION")
    print("=" * 60 + "\n")
    
    results = []
    
    # Test 1: Endpoint exists
    results.append(("Endpoint Exists", test_endpoint_exists()))
    
    # Test 2: OPTIONS request
    results.append(("OPTIONS Request", test_options()))
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"  {test_name:<30} {status}")
    
    all_passed = all(result for _, result in results)
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✓ API ENDPOINTS ARE AVAILABLE!")
    else:
        print("✗ SOME TESTS FAILED!")
    print("=" * 60 + "\n")
    
    return all_passed

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
