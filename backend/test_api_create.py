"""
Test creating transaction via API endpoint
"""
import requests
import json

# API endpoint
url = "http://localhost:8000/api/masters/amount-transactions/"

# Get a ledger ID first
ledgers_url = "http://localhost:8000/api/masters/ledgers/"
try:
    ledgers_response = requests.get(ledgers_url)
    if ledgers_response.status_code == 200:
        ledgers = ledgers_response.json()
        # Find a Cash/Bank ledger
        cash_bank_ledger = None
        for ledger in ledgers:
            if ledger.get('category') == 'Asset' and ledger.get('sub_group_2'):
                if 'cash' in ledger['sub_group_2'].lower() or 'bank' in ledger['sub_group_2'].lower():
                    cash_bank_ledger = ledger
                    break
        
        if not cash_bank_ledger:
            print("ERROR: No Cash/Bank ledger found")
            exit(1)
        
        print("=" * 80)
        print("Selected Ledger:")
        print("=" * 80)
        print("ID: {}".format(cash_bank_ledger['id']))
        print("Name: {}".format(cash_bank_ledger['name']))
        print("Category: {}".format(cash_bank_ledger['category']))
        print("Sub Group 2: {}".format(cash_bank_ledger.get('sub_group_2')))
        
        # Create transaction data
        transaction_data = {
            "ledger": cash_bank_ledger['id'],
            "transaction_date": "2026-01-09",
            "transaction_type": "transaction",
            "debit": 1000.00,
            "credit": 0.00,
            "narration": "Test transaction via API"
        }
        
        print("\n" + "=" * 80)
        print("Creating Transaction via API")
        print("=" * 80)
        print("URL: {}".format(url))
        print("Data: {}".format(json.dumps(transaction_data, indent=2)))
        
        # Create transaction
        response = requests.post(url, json=transaction_data)
        
        print("\n" + "=" * 80)
        print("Response")
        print("=" * 80)
        print("Status Code: {}".format(response.status_code))
        print("Response Body:")
        print(json.dumps(response.json(), indent=2))
        
        if response.status_code == 201:
            print("\nSUCCESS! Transaction created via API")
            created_txn = response.json()
            print("\nCreated Transaction:")
            print("  ID: {}".format(created_txn.get('id')))
            print("  Ledger Name: {}".format(created_txn.get('ledger_name')))
            print("  Sub Group 1: {}".format(created_txn.get('sub_group_1')))
            print("  Code: {}".format(created_txn.get('code')))
            print("  Debit: {}".format(created_txn.get('debit')))
            print("  Balance: {}".format(created_txn.get('balance')))
        else:
            print("\nERROR! Failed to create transaction")
            
    else:
        print("ERROR: Failed to fetch ledgers. Status: {}".format(ledgers_response.status_code))
        
except Exception as e:
    print("ERROR: {}".format(str(e)))
    import traceback
    traceback.print_exc()
