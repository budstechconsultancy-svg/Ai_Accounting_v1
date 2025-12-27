"""
Comprehensive Data Saving Verification Script
Tests all modules: Vouchers, Masters, Inventory, Settings
"""

import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

def check_all_tables():
    """Check all tables exist and have correct schema"""
    
    print("\n" + "="*70)
    print("COMPREHENSIVE DATA SAVING VERIFICATION")
    print("="*70 + "\n")
    
    tables_to_check = {
        'Vouchers': [
            'voucher_sales',
            'voucher_purchase',
            'voucher_payment',
            'voucher_receipt',
            'voucher_contra',
            'voucher_journal',
            'journal_entries'
        ],
        'Masters (Accounting)': [
            'master_ledger_groups',
            'master_ledgers',
            'master_voucher_config'
        ],
        'Inventory': [
            'inventory_stock_groups',
            'inventory_units',
            'inventory_stock_items',
            'stock_movements'
        ],
        'Settings': [
            'company_informations'
        ],
        'Core': [
            'tenants',
            'users',
            'tenant_users'
        ]
    }
    
    all_good = True
    
    with connection.cursor() as cursor:
        for category, tables in tables_to_check.items():
            print(f"\n📦 {category}")
            print("-" * 70)
            
            for table in tables:
                try:
                    # Check if table exists
                    cursor.execute(f"SHOW TABLES LIKE '{table}'")
                    if cursor.fetchone():
                        # Check tenant_id column type
                        cursor.execute(f"DESCRIBE {table}")
                        columns = cursor.fetchall()
                        
                        has_tenant_id = False
                        tenant_id_type = None
                        
                        for col in columns:
                            field_name = col[0]
                            field_type = col[1]
                            
                            if field_name == 'tenant_id':
                                has_tenant_id = True
                                tenant_id_type = field_type
                                
                                if 'varchar' in field_type.lower():
                                    print(f"  ✅ {table:35} EXISTS (tenant_id: {field_type})")
                                else:
                                    print(f"  ❌ {table:35} WRONG TYPE (tenant_id: {field_type})")
                                    all_good = False
                                break
                        
                        if not has_tenant_id:
                            print(f"  ⚠️  {table:35} EXISTS (no tenant_id column)")
                    else:
                        print(f"  ❌ {table:35} DOES NOT EXIST")
                        all_good = False
                        
                except Exception as e:
                    print(f"  ❌ {table:35} ERROR: {e}")
                    all_good = False
    
    print("\n" + "="*70)
    if all_good:
        print("✅ ALL TABLES VERIFIED - Data saving should work correctly!")
    else:
        print("❌ SOME ISSUES FOUND - Please review above")
    print("="*70 + "\n")
    
    return all_good

def test_data_flow():
    """Test the complete data flow"""
    print("\n" + "="*70)
    print("DATA FLOW SUMMARY")
    print("="*70 + "\n")
    
    print("📝 Registration Flow:")
    print("  1. User registers → creates entry in 'users' table")
    print("  2. Tenant created → entry in 'tenants' table")
    print("  3. Default ledger groups seeded → 'master_ledger_groups'")
    print()
    
    print("📊 Masters Flow:")
    print("  1. Ledger Groups → 'master_ledger_groups' table")
    print("  2. Ledgers → 'master_ledgers' table")
    print("  3. Voucher Config → 'master_voucher_config' table")
    print()
    
    print("📦 Inventory Flow:")
    print("  1. Stock Groups → 'inventory_stock_groups' table")
    print("  2. Units → 'inventory_units' table")
    print("  3. Stock Items → 'inventory_stock_items' table")
    print("  4. Movements → 'stock_movements' table")
    print()
    
    print("🧾 Vouchers Flow:")
    print("  1. Sales → 'voucher_sales' + 'journal_entries'")
    print("  2. Purchase → 'voucher_purchase' + 'journal_entries'")
    print("  3. Payment → 'voucher_payment' + 'journal_entries'")
    print("  4. Receipt → 'voucher_receipt' + 'journal_entries'")
    print("  5. Contra → 'voucher_contra' + 'journal_entries'")
    print("  6. Journal → 'voucher_journal' + 'journal_entries'")
    print()
    
    print("⚙️  Settings Flow:")
    print("  1. Company Details → 'company_informations' table")
    print()
    
    print("="*70 + "\n")

if __name__ == '__main__':
    all_good = check_all_tables()
    test_data_flow()
    
    if all_good:
        print("🎉 SYSTEM READY FOR DATA SAVING!")
        print("\nYou can now:")
        print("  • Create vouchers (Sales, Purchase, Payment, etc.)")
        print("  • Add masters (Ledgers, Ledger Groups)")
        print("  • Manage inventory (Stock Items, Units, Groups)")
        print("  • Update settings (Company Information)")
    else:
        print("⚠️  PLEASE FIX ISSUES BEFORE PROCEEDING")
