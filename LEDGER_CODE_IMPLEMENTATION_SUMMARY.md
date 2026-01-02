# Ledger Code Assignment - Quick Summary

## 🎯 What We're Building

An automatic ledger code assignment system that generates unique, hierarchical codes for new ledgers based on their position in the accounting hierarchy.

## 📊 How It Works

### Code Format Examples

```
Standard Hierarchy Ledger:
Category: Assets (010101)
  └─ Group: Current Assets (01010101)
      └─ Custom Ledger: "Petty Cash" → Code: 01010101.001

Nested Custom Ledger:
Custom Ledger: "Main Account" (9001)
  └─ Sub Ledger: "Branch A" → Code: 9001.001
      └─ Sub-Sub Ledger: "Cash" → Code: 9001.001.001

Unclassified Ledger:
No hierarchy selected → Code: 9001, 9002, 9003...
```

## 🔧 Implementation Overview

### 1. **Code Generation Logic** (`backend/accounting/utils.py`)

```python
def generate_ledger_code(ledger_data, tenant_id):
    # Priority 1: Nested under custom ledger?
    if has parent_ledger_id:
        return parent_code + ".001"
    
    # Priority 2: Under standard hierarchy?
    if has hierarchy_fields:
        hierarchy_code = lookup_from_master_hierarchy_raw()
        return hierarchy_code + ".001"
    
    # Priority 3: Fallback
    return "9001"  # Next available in 9000+ range
```

### 2. **Database Structure**

```sql
-- master_hierarchy_raw (global reference data)
major_group_1  | group_1         | sub_group_1_1 | code
---------------|-----------------|---------------|----------------
Assets         | Current Assets  | Cash & Bank   | 010101010101

-- master_ledgers (tenant-specific)
id | name       | category | group          | code
---|------------|----------|----------------|-------------
1  | Petty Cash | Assets   | Current Assets | 01010101.001
2  | Main Cash  | Assets   | Current Assets | 01010101.002
```

### 3. **API Flow**

```
POST /api/ledgers/
{
  "name": "Petty Cash",
  "category": "Assets",
  "group": "Current Assets"
}

↓ Backend processes ↓

1. Validate input
2. Look up hierarchy code from master_hierarchy_raw
3. Generate unique suffix (.001, .002, etc.)
4. Save ledger with code
5. Return response

↓ Response ↓

{
  "id": 1,
  "name": "Petty Cash",
  "code": "01010101.001",  ← Auto-generated!
  "category": "Assets",
  "group": "Current Assets"
}
```

## 📋 Implementation Phases

### ✅ Phase 1: Code Generation (4 hours)
- Refactor `generate_ledger_code()` function
- Add helper functions for each code type
- Add comprehensive logging
- Fix SQL injection issues

### ✅ Phase 2: Validation (2 hours)
- Add uniqueness validation
- Add retry logic for race conditions
- Add error handling

### ✅ Phase 3: Testing (4 hours)
- Unit tests for code generation
- Integration tests for API
- Manual testing scenarios

### ✅ Phase 4: Migration (2 hours)
- Backfill existing ledgers with codes
- Verify data integrity

### ✅ Phase 5: Frontend (3 hours)
- Display codes in UI
- Add code column to tables
- Enable search by code

**Total Estimate: 15 hours**

## 🎨 Code Format Reference

| Scenario | Code Format | Example |
|----------|-------------|---------|
| Hierarchy-based | `{HierarchyCode}.{Seq}` | `01010101.001` |
| Nested custom | `{ParentCode}.{Seq}` | `9001.001` |
| Deeply nested | `{ParentCode}.{Seq}.{Seq}` | `9001.001.001` |
| Unclassified | `9XXX` | `9001` |

## 🚀 Quick Start

### For Developers

1. **Review the full plan**: `.agent/implementation_plans/ledger_code_assignment.md`
2. **Start with Phase 1**: Enhance `backend/accounting/utils.py`
3. **Run tests**: Create `test_ledger_code_generation.py`
4. **Deploy migration**: Backfill existing data
5. **Update frontend**: Display codes in UI

### For Testing

```bash
# Create a test ledger
curl -X POST http://localhost:8000/api/ledgers/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Ledger",
    "category": "Assets",
    "group": "Current Assets"
  }'

# Response should include auto-generated code
{
  "id": 123,
  "name": "Test Ledger",
  "code": "01010101.001",  ← Check this!
  ...
}
```

## 🔍 Key Files to Modify

```
backend/
├── accounting/
│   ├── utils.py                    ← Main code generation logic
│   ├── views.py                    ← API endpoint with retry logic
│   ├── serializers.py              ← Validation
│   ├── models.py                   ← Already has code field ✓
│   ├── migrations/
│   │   └── 0012_backfill_codes.py  ← New migration
│   └── tests/
│       └── test_ledger_code_generation.py  ← New tests

frontend/
├── components/
│   └── LedgerCreationWizard.tsx    ← Show generated code
└── pages/
    └── Masters/
        └── Ledgers.tsx             ← Display code in table
```

## ✅ Success Criteria

- [x] Code field exists in database (migration 0011)
- [ ] All new ledgers get auto-assigned codes
- [ ] Codes are unique within tenant
- [ ] Codes reflect hierarchy position
- [ ] Frontend displays codes
- [ ] All tests pass
- [ ] Documentation complete

## 🆘 Troubleshooting

**Q: Code generation fails?**
A: Check if hierarchy data exists in `master_hierarchy_raw` table

**Q: Duplicate code error?**
A: Retry the request (race condition handling will fix it)

**Q: Code doesn't match hierarchy?**
A: Verify the hierarchy fields match exactly with `master_hierarchy_raw`

## 📚 Additional Resources

- Full Implementation Plan: `.agent/implementation_plans/ledger_code_assignment.md`
- Database Schema: Check `accounting/models.py`
- Current Utils: `accounting/utils.py` (has basic implementation)
- Migration: `accounting/migrations/0011_add_ledger_code.py`

---

**Ready to implement?** Start with Phase 1 in the full implementation plan!
