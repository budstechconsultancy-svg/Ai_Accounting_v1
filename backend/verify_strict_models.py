
import os
import django
import sys
from datetime import date

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import AmountTransaction, MasterLedger
from django.core.exceptions import ValidationError

def test_ledger_save(category, group, sg1, expect_success):
    # Mock ledger object creation (in memory mostly, or simplistic DB mock)
    # We create a dummy ledger in DB to test AmountTransaction ForeingKey
    try:
        ledger = MasterLedger.objects.create(
            name=f"Test_{category}_{sg1}", 
            tenant_id=1,
            category=category,
            group=group,
            sub_group_1=sg1
        )
        
        try:
            AmountTransaction.objects.create(
                tenant_id=1,
                ledger=ledger,
                ledger_name=ledger.name,
                transaction_date=date.today()
            )
            created = True
        except ValidationError as e:
            created = False
            # print(f"Caught expected validation error: {e}")
        except Exception as e:
            created = False
            # print(f"Caught other error: {e}")
            
        status = "PASS" if created == expect_success else "FAIL"
        print(f"[{status}] {category}->{group}->{sg1} | Saved: {created} | Expected: {expect_success}")
        
        # Cleanup
        ledger.delete()
        if created:
            # Cleanup transaction if created
            AmountTransaction.objects.filter(ledger_name=f"Test_{category}_{sg1}").delete()
            
    except Exception as e:
        print(f"Setup Error: {e}")

if __name__ == "__main__":
    print("Testing Model-Level Strict Rules...")
    
    # Valid
    test_ledger_save("Asset", "Cash and Bank Balances", "Cash", True)
    test_ledger_save("Assets", "Cash and Bank Balances", "Bank", True)
    
    # Invalid
    test_ledger_save("Liability", "Cash and Bank Balances", "Cash", False)
    test_ledger_save("Asset", "Current Assets", "Cash", False)
    test_ledger_save("Asset", "Cash and Bank Balances", "Bank Accounts", False)
    
    print("Done.")
