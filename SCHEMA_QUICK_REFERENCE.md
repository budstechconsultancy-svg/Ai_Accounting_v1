# 📋 Quick Schema Reference

## All Tables (30 total)

### Core (4 tables)
1. `tenants` - Companies/Organizations
2. `users` - Owner accounts
3. `tenant_users` - Staff accounts  
4. `company_full_info` - Company details

### Accounting Masters (3 tables)
5. `master_ledger_groups` - Ledger categories
6. `master_ledgers` - Chart of accounts
7. `master_voucher_config` - Numbering settings

### Vouchers (7 tables)
8. `voucher_sales` - Sales invoices
9. `voucher_purchase` - Purchase invoices
10. `voucher_payment` - Payments made
11. `voucher_receipt` - Receipts received
12. `voucher_contra` - Bank/Cash transfers
13. `voucher_journal` - Journal vouchers
14. `journal_entries` - Journal entry lines

### Inventory (4 tables)
15. `units` - Units of measurement
16. `stock_groups` - Item categories
17. `stock_items` - Inventory items
18. `stock_movements` - Stock transactions

### OTP/Auth (2 tables)
19. `otp_verification` - OTP records
20. `pending_registrations` - Pre-verification data

### Django System (6 tables)
21. `django_migrations` - Migration history
22. `django_content_type` - Content types
23. `django_session` - User sessions
24. `auth_permission` - Permissions
25. `auth_group` - Permission groups
26. `auth_group_permissions` - Group-permission mapping

### Legacy/Unused (4 tables)
27. `company_informations` - (old, use company_full_info)
28. `inventory` - (old, use stock_items)
29. `otps` - (old, use otp_verification)
30. `voucher_types` - (old, types are now table names)

---

## Common Queries

### Get all vouchers for a tenant:
```sql
SELECT 'Sales' as type, voucher_number, date, party, total as amount 
FROM voucher_sales WHERE tenant_id = 1
UNION ALL
SELECT 'Purchase', voucher_number, date, party, total 
FROM voucher_purchase WHERE tenant_id = 1
UNION ALL
SELECT 'Payment', voucher_number, date, party, amount 
FROM voucher_payment WHERE tenant_id = 1
ORDER BY date DESC;
```

### Get ledger balance:
```sql
SELECT 
  ledger,
  SUM(debit) as total_debit,
  SUM(credit) as total_credit,
  SUM(debit) - SUM(credit) as balance
FROM journal_entries
WHERE tenant_id = 1
GROUP BY ledger;
```

### Get company info:
```sql
SELECT 
  t.name as tenant_name,
  c.company_name,
  c.gstin,
  c.email,
  c.phone
FROM tenants t
LEFT JOIN company_full_info c ON t.id = c.tenant_id
WHERE t.id = 1;
```

---

## Files

- **schema.sql** - Complete schema definition
- **export_schema.bat** - Export current schema
- **SCHEMA_README.md** - Full documentation
- **SCHEMA_QUICK_REFERENCE.md** - This file
