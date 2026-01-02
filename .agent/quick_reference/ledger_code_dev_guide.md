# Ledger Code Assignment - Developer Quick Reference

## 🚀 Quick Implementation Guide

### Step 1: Update `backend/accounting/utils.py`

Replace the existing `generate_ledger_code()` function with the enhanced version:

```python
import logging
from django.db import connection
from django.db.models import Max
from accounting.models import MasterLedger

def generate_ledger_code(ledger_data, tenant_id):
    """
    Generate unique ledger code based on hierarchy position.
    
    Returns:
        str: Generated unique ledger code
    """
    logger = logging.getLogger('accounting.utils')
    
    # Case 1: Nested under another custom ledger
    if ledger_data.get('parent_ledger_id'):
        return _generate_nested_code(ledger_data, tenant_id, logger)
    
    # Case 2: Under standard hierarchy
    hierarchy_code = _lookup_hierarchy_code(ledger_data, logger)
    if hierarchy_code:
        return _generate_next_suffix_code(hierarchy_code, tenant_id, logger)
    
    # Case 3: Fallback to custom range
    return _generate_fallback_code(tenant_id, logger)
```

### Step 2: Add Helper Functions

Copy these helper functions to `backend/accounting/utils.py`:

```python
def _generate_nested_code(ledger_data, tenant_id, logger):
    """Generate code for ledger nested under another custom ledger."""
    try:
        parent = MasterLedger.objects.get(
            id=ledger_data['parent_ledger_id'],
            tenant_id=tenant_id
        )
        if not parent.code:
            logger.warning(f"Parent ledger {parent.id} has no code")
            return _generate_fallback_code(tenant_id, logger)
        
        return _generate_next_suffix_code(parent.code, tenant_id, logger)
    except MasterLedger.DoesNotExist:
        logger.error(f"Parent ledger not found: {ledger_data['parent_ledger_id']}")
        return _generate_fallback_code(tenant_id, logger)


def _lookup_hierarchy_code(ledger_data, logger):
    """Look up hierarchy code from master_hierarchy_raw."""
    hierarchy_map = [
        ('ledger_type', 'ledger_1', 16),
        ('sub_group_3', 'sub_group_3_1', 14),
        ('sub_group_2', 'sub_group_2_1', 12),
        ('sub_group_1', 'sub_group_1_1', 10),
        ('group', 'group_1', 8),
        ('category', 'major_group_1', 6),
    ]
    
    for field, db_field, code_length in hierarchy_map:
        value = ledger_data.get(field)
        if value:
            with connection.cursor() as cursor:
                cursor.execute(f"""
                    SELECT code 
                    FROM master_hierarchy_raw 
                    WHERE {db_field} = %s 
                      AND code IS NOT NULL 
                      AND CHAR_LENGTH(code) >= %s
                    LIMIT 1
                """, [value, code_length])
                
                row = cursor.fetchone()
                if row and row[0]:
                    prefix = row[0].strip()[:code_length]
                    logger.info(f"Found hierarchy code: {prefix}")
                    return prefix
    
    return None


def _generate_next_suffix_code(base_code, tenant_id, logger):
    """Generate next available code: {base_code}.XXX"""
    query_prefix = f"{base_code}."
    
    siblings = MasterLedger.objects.filter(
        tenant_id=tenant_id,
        code__startswith=query_prefix
    ).values_list('code', flat=True)
    
    max_suffix = 0
    for code in siblings:
        if code.startswith(query_prefix):
            remainder = code[len(query_prefix):]
            parts = remainder.split('.')
            if parts and parts[0].isdigit():
                try:
                    max_suffix = max(max_suffix, int(parts[0]))
                except ValueError:
                    continue
    
    next_code = f"{base_code}.{max_suffix + 1:03d}"
    logger.info(f"Generated code: {next_code}")
    return next_code


def _generate_fallback_code(tenant_id, logger):
    """Generate fallback code in 9000+ range."""
    max_ledger = MasterLedger.objects.filter(
        tenant_id=tenant_id,
        code__regex=r'^9\d{3}$'
    ).aggregate(Max('code'))
    
    max_code_value = max_ledger.get('code__max')
    
    if max_code_value:
        try:
            return str(int(max_code_value) + 1)
        except ValueError:
            pass
    
    return "9001"
```

### Step 3: Update `backend/accounting/views.py`

Add retry logic to `MasterLedgerViewSet.create()`:

```python
from django.db import IntegrityError, transaction
from rest_framework import serializers

def create(self, request, *args, **kwargs):
    """Create a new ledger with auto-generated code"""
    import logging
    from .utils import generate_ledger_code
    
    logger = logging.getLogger('accounting.views')
    
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    tenant_id = request.user.tenant_id
    
    # Retry logic for race conditions
    max_retries = 3
    for attempt in range(max_retries):
        try:
            with transaction.atomic():
                ledger_code = generate_ledger_code(
                    serializer.validated_data, 
                    tenant_id
                )
                logger.info(f"Generated code: {ledger_code} (attempt {attempt + 1})")
                
                ledger = serializer.save(code=ledger_code)
                break
        except IntegrityError:
            if attempt == max_retries - 1:
                raise serializers.ValidationError({
                    'code': 'Failed to generate unique code. Please try again.'
                })
            continue
    
    response_serializer = self.get_serializer(ledger)
    headers = self.get_success_headers(response_serializer.data)
    return Response(
        response_serializer.data, 
        status=status.HTTP_201_CREATED, 
        headers=headers
    )
```

### Step 4: Create Migration for Backfilling

Create `backend/accounting/migrations/0012_backfill_ledger_codes.py`:

```python
from django.db import migrations

def backfill_ledger_codes(apps, schema_editor):
    """Generate codes for existing ledgers"""
    MasterLedger = apps.get_model('accounting', 'MasterLedger')
    
    # Import the function (note: in real migration, copy the logic inline)
    from accounting.utils import generate_ledger_code
    
    ledgers_without_code = MasterLedger.objects.filter(code__isnull=True)
    
    for ledger in ledgers_without_code:
        ledger_data = {
            'name': ledger.name,
            'category': ledger.category,
            'group': ledger.group,
            'sub_group_1': ledger.sub_group_1,
            'sub_group_2': ledger.sub_group_2,
            'sub_group_3': ledger.sub_group_3,
            'ledger_type': ledger.ledger_type,
            'parent_ledger_id': ledger.parent_ledger_id,
        }
        
        code = generate_ledger_code(ledger_data, ledger.tenant_id)
        ledger.code = code
        ledger.save(update_fields=['code'])

class Migration(migrations.Migration):
    dependencies = [
        ('accounting', '0011_add_ledger_code'),
    ]
    
    operations = [
        migrations.RunPython(backfill_ledger_codes),
    ]
```

### Step 5: Run Migration

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

---

## 🧪 Testing Commands

### Test Code Generation Manually

```python
# In Django shell
python manage.py shell

from accounting.utils import generate_ledger_code

# Test hierarchy-based
ledger_data = {
    'name': 'Test Ledger',
    'category': 'Assets',
    'group': 'Current Assets'
}
code = generate_ledger_code(ledger_data, tenant_id=1)
print(f"Generated code: {code}")

# Test nested
ledger_data = {
    'name': 'Sub Ledger',
    'parent_ledger_id': 123  # existing ledger ID
}
code = generate_ledger_code(ledger_data, tenant_id=1)
print(f"Generated code: {code}")

# Test fallback
ledger_data = {
    'name': 'Random Ledger'
}
code = generate_ledger_code(ledger_data, tenant_id=1)
print(f"Generated code: {code}")
```

### Test via API

```bash
# Create a ledger
curl -X POST http://localhost:8000/api/ledgers/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Petty Cash",
    "category": "Assets",
    "group": "Current Assets"
  }'

# Response should include:
# {
#   "id": 123,
#   "name": "Petty Cash",
#   "code": "01010101.001",  ← Auto-generated!
#   ...
# }
```

---

## 🐛 Debugging Tips

### Enable Logging

Add to `backend/backend/settings.py`:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'accounting.utils': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
        'accounting.views': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

### Check Logs

```bash
# Watch logs in real-time
tail -f backend/logs/django.log

# Or check console output when running dev server
python manage.py runserver
```

### Common Issues

**Issue**: Code generation returns "9001" for all ledgers
**Fix**: Check if `master_hierarchy_raw` table has data

```sql
SELECT COUNT(*) FROM master_hierarchy_raw;
SELECT * FROM master_hierarchy_raw LIMIT 5;
```

**Issue**: Duplicate code error
**Fix**: Check for race conditions, ensure retry logic is working

**Issue**: Code doesn't match hierarchy
**Fix**: Verify hierarchy field names match exactly

```python
# Check what's in the database
from accounting.models import MasterHierarchyRaw
MasterHierarchyRaw.objects.filter(group_1='Current Assets').values('code')
```

---

## 📊 Code Format Cheat Sheet

```
┌─────────────────────────────────────────────────────────┐
│ Hierarchy Level    │ Code Length │ Example              │
├────────────────────┼─────────────┼──────────────────────┤
│ Category           │ 6 digits    │ 010101               │
│ Group              │ 8 digits    │ 01010101             │
│ Sub Group 1        │ 10 digits   │ 0101010101           │
│ Sub Group 2        │ 12 digits   │ 010101010101         │
│ Sub Group 3        │ 14 digits   │ 01010101010101       │
│ Ledger Type        │ 16 digits   │ 0101010101010101     │
│ Custom Suffix      │ +4 chars    │ .001, .002, .003     │
│ Fallback Range     │ 4 digits    │ 9001, 9002, 9003     │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Pre-Deployment Checklist

- [ ] Updated `utils.py` with new code generation logic
- [ ] Updated `views.py` with retry logic
- [ ] Created migration `0012_backfill_ledger_codes.py`
- [ ] Tested code generation in Django shell
- [ ] Tested API endpoint with Postman/curl
- [ ] Verified logs show correct code generation
- [ ] Checked for duplicate codes in database
- [ ] Tested concurrent creation (multiple requests)
- [ ] Verified all existing ledgers have codes after migration
- [ ] Updated frontend to display codes
- [ ] Updated documentation

---

## 🔗 Related Files

```
backend/
├── accounting/
│   ├── utils.py                    ← Main implementation
│   ├── views.py                    ← API endpoint
│   ├── models.py                   ← Database models
│   ├── serializers.py              ← Validation
│   └── migrations/
│       ├── 0011_add_ledger_code.py
│       └── 0012_backfill_codes.py  ← New migration

.agent/
├── implementation_plans/
│   └── ledger_code_assignment.md   ← Full plan
└── diagrams/
    └── ledger_code_flow.md         ← Visual flow

LEDGER_CODE_IMPLEMENTATION_SUMMARY.md  ← Quick summary
```

---

## 📞 Need Help?

1. **Check the full plan**: `.agent/implementation_plans/ledger_code_assignment.md`
2. **Check the flow diagram**: `.agent/diagrams/ledger_code_flow.md`
3. **Check the summary**: `LEDGER_CODE_IMPLEMENTATION_SUMMARY.md`
4. **Check logs**: Look for `accounting.utils` and `accounting.views` logs
5. **Check database**: Query `master_hierarchy_raw` and `master_ledgers` tables

---

**Last Updated**: 2025-12-29
**Version**: 1.0
