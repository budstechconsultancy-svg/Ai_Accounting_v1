
import os
import django
import sys
from django.core.exceptions import ValidationError

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import AmountTransaction, MasterLedger

def test_clean(category, group, sg1, should_pass):
    # Create unsaved MasterLedger
    ledger = MasterLedger()
    ledger.name = "TestLedger"
    ledger.category = category
    ledger.group = group
    ledger.sub_group_1 = sg1
    
    # Create unsaved AmountTransaction
    txn = AmountTransaction()
    txn.ledger = ledger
    
    try:
        txn.clean()
        result = True
    except ValidationError as e:
        result = False
        # print(f"Validation Error: {e}")
    except Exception as e:
        result = False
        print(f"Unexpected Error: {e}")
        
    status = "PASS" if result == should_pass else "FAIL"
    print(f"[{status}] {category}->{group}->{sg1} | Passed Clean: {result} | Expected: {should_pass}")

if __name__ == "__main__":
    print("Testing AmountTransaction.clean() logic...")
    
    # Valid
    test_clean("Asset", "Cash and Bank Balances", "Cash", True)
    test_clean("Assets", "Cash and Bank Balances", "Bank", True)
    
    # Invalid
    test_clean("Liability", "Cash and Bank Balances", "Cash", False)
    test_clean("Asset", "Current Assets", "Cash", False)
    test_clean("Asset", "Cash and Bank Balances", "Bank Accounts", False)
    test_clean(None, "Cash and Bank Balances", "Cash", False)
    
    print("Done.")
