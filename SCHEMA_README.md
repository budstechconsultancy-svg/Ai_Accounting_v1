# 📊 Database Schema Documentation

## Files Created

1. **`schema.sql`** - Complete database schema with all tables
2. **`export_schema.bat`** - Script to export actual current schema from MySQL

---

## 📋 Database Overview

**Database Name**: `ai_accounting`  
**Character Set**: `utf8mb4`  
**Collation**: `utf8mb4_unicode_ci`  
**Total Tables**: 30+

---

## 🗂️ Table Categories

### 1. Core Tables (Multi-tenancy & Users)
- `tenants` - Tenant/Company records
- `users` - Owner users (created via signup)
- `tenant_users` - Staff users (created by owners)
- `company_full_info` - Company details

### 2. Accounting Masters
- `master_ledger_groups` - Ledger group hierarchy
- `master_ledgers` - Chart of accounts
- `master_voucher_config` - Voucher numbering settings

### 3. Voucher Tables (Split by Type)
- `voucher_sales` - Sales invoices
- `voucher_purchase` - Purchase invoices
- `voucher_payment` - Payment vouchers
- `voucher_receipt` - Receipt vouchers
- `voucher_contra` - Contra vouchers (bank/cash transfers)
- `voucher_journal` - Journal entries
- `journal_entries` - Individual journal entry lines

### 4. Inventory Tables
- `units` - Units of measurement
- `stock_groups` - Stock item categories
- `stock_items` - Inventory items
- `stock_movements` - Stock in/out transactions

### 5. OTP & Authentication
- `otp_verification` - OTP records for phone/email verification
- `pending_registrations` - Temporary registration data before OTP verification

### 6. Django System Tables
- `django_migrations` - Migration history
- `django_content_type` - Content type registry
- `django_session` - User sessions
- `auth_permission` - Permission definitions

---

## 🔑 Key Design Features

### Multi-Tenancy
- Every table has `tenant_id` foreign key
- Strict data isolation between tenants
- Cascade delete on tenant removal

### Voucher Split Architecture
- Separate table for each voucher type
- Optimized for high-volume transactions
- Easier to scale and maintain

### Indexes
- Primary keys on all tables
- Foreign key indexes
- Date indexes on vouchers
- Party/Ledger indexes for reports

---

## 📊 Table Relationships

```
tenants (1) ──┬─→ (N) users
              ├─→ (N) tenant_users
              ├─→ (1) company_full_info
              ├─→ (N) master_ledgers
              ├─→ (N) voucher_sales
              ├─→ (N) voucher_purchase
              ├─→ (N) voucher_payment
              ├─→ (N) voucher_receipt
              ├─→ (N) voucher_contra
              ├─→ (N) voucher_journal
              ├─→ (N) journal_entries
              ├─→ (N) stock_items
              └─→ (N) units
```

---

## 🚀 Usage

### Option 1: Use Provided Schema
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE ai_accounting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import schema
mysql -u root -p ai_accounting < schema.sql

# Run Django migrations to sync
cd backend
python manage.py migrate
```

### Option 2: Export Current Schema
```bash
# Run the export script
export_schema.bat

# This creates schema_export.sql with your actual current schema
```

### Option 3: Django Migrations (Recommended)
```bash
# Let Django create all tables
cd backend
python manage.py migrate

# This is the safest method as it ensures Django and DB are in sync
```

---

## 📝 Important Notes

### For Development:
- Use Django migrations (`python manage.py migrate`)
- Schema will be created automatically
- Easier to maintain and update

### For Production:
- Review `schema.sql` before deployment
- Ensure all indexes are created
- Set proper MySQL configuration (see `mysql-500k-users.cnf`)
- Configure ProxySQL for connection pooling

### For Backup:
- Use `export_schema.bat` to export current schema
- Use `mysqldump` with `--no-data` for structure only
- Use `mysqldump` without `--no-data` for full backup with data

---

## 🔧 Schema Modifications

If you need to modify the schema:

1. **Using Django** (Recommended):
   ```bash
   # Edit models in models.py
   python manage.py makemigrations
   python manage.py migrate
   ```

2. **Direct SQL**:
   ```sql
   ALTER TABLE table_name ADD COLUMN new_column VARCHAR(255);
   ```

3. **Update schema.sql**:
   - Manually update the file
   - Or re-export using `export_schema.bat`

---

## 📊 Table Sizes (Estimated for 500K users)

| Table | Estimated Rows | Size |
|-------|----------------|------|
| tenants | 100,000 | ~10 MB |
| users | 100,000 | ~50 MB |
| voucher_sales | 10,000,000 | ~5 GB |
| voucher_purchase | 5,000,000 | ~2.5 GB |
| journal_entries | 50,000,000 | ~10 GB |
| stock_items | 1,000,000 | ~500 MB |

**Total Estimated**: ~20-30 GB for 500K active users

---

## ✅ Schema Validation

To validate your schema matches Django models:

```bash
# Check for missing migrations
python manage.py makemigrations --dry-run

# Validate database
python manage.py check --database default

# Show SQL for migrations
python manage.py sqlmigrate app_name migration_number
```

---

## 🔒 Security Considerations

1. **Passwords**: All user passwords are hashed (bcrypt)
2. **Tenant Isolation**: Foreign key constraints enforce data separation
3. **Indexes**: Optimize query performance
4. **Cascade Delete**: Automatic cleanup when tenant is deleted

---

## 📞 Support

For schema-related questions:
- Check Django models in `backend/*/models.py`
- Review migration files in `backend/*/migrations/`
- See `mysql_500k_scaling_guide.md` for optimization tips

---

**Schema Version**: 1.0  
**Last Updated**: 2025-12-16  
**Compatible with**: Django 5.0.14, MySQL 8.0+
