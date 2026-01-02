# Implementation Plan: Ledger Code Assignment Based on Hierarchy Table

## 📋 Overview
This plan outlines the implementation for automatically assigning hierarchical ledger codes to newly created ledgers based on the `master_hierarchy_raw` table in the database. The system will generate unique, meaningful codes that reflect the ledger's position in the accounting hierarchy.

---

## 🎯 Objectives

1. **Auto-assign codes** to new ledgers based on their hierarchy position
2. **Ensure uniqueness** of ledger codes within tenant scope
3. **Support nested custom ledgers** (ledgers under other custom ledgers)
4. **Maintain hierarchy integrity** by deriving codes from `master_hierarchy_raw` table
5. **Handle edge cases** gracefully with fallback mechanisms

---

## 📊 Current State Analysis

### Existing Components

#### 1. **Database Schema**
- **`master_hierarchy_raw` table**: Contains the global hierarchy with pre-defined codes
  - Fields: `major_group_1`, `group_1`, `sub_group_1_1`, `sub_group_2_1`, `sub_group_3_1`, `ledger_1`, `code`
  - Codes are hierarchical (e.g., "010101" for category, "01010101" for group, etc.)

- **`master_ledgers` table**: Tenant-specific ledgers
  - New field: `ledger_code` (VARCHAR(50), unique, nullable)
  - Hierarchy fields: `category`, `group`, `sub_group_1`, `sub_group_2`, `sub_group_3`, `ledger_type`
  - Support for nested ledgers: `parent_ledger_id`

#### 2. **Existing Code Generation Logic** (`accounting/utils.py`)
```python
def generate_ledger_code(ledger_data, tenant_id):
    # Case 1: Nested custom ledger (has parent_ledger_id)
    # Case 2: Custom ledger under Standard Hierarchy
    # Case 3: Fallback (9000+)
```

**Current Logic:**
- **Nested ledgers**: Appends `.001`, `.002` to parent code
- **Hierarchy-based**: Truncates hierarchy code to appropriate level
- **Fallback**: Uses 9000+ range for unclassified ledgers

#### 3. **API Integration**
- `MasterLedgerViewSet.create()` calls `generate_ledger_code()` before saving
- Code is auto-generated and returned in response
- Serializer marks `code` as read-only

---

## 🔧 Implementation Strategy

### Phase 1: Enhance Code Generation Algorithm ✅ (Already Implemented)

**Status**: The basic algorithm exists but needs refinement and testing.

#### 1.1 Improve Hierarchy Code Lookup
**File**: `backend/accounting/utils.py`

**Current Issues:**
- SQL injection risk with f-string formatting
- Limited error handling
- No validation of code format
- No logging for debugging

**Improvements Needed:**
```python
def generate_ledger_code(ledger_data, tenant_id):
    """
    Generate unique ledger code based on hierarchy position.
    
    Code Format:
    - Hierarchy-based: {HierarchyPrefix}.{Sequence} (e.g., "01010101.001")
    - Nested custom: {ParentCode}.{Sequence} (e.g., "9001.001.001")
    - Fallback: 9000-9999 range
    
    Args:
        ledger_data (dict): Validated ledger data with hierarchy fields
        tenant_id (int): Tenant ID for scoping
        
    Returns:
        str: Generated unique ledger code
    """
    import logging
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

#### 1.2 Add Helper Functions

**Function 1: Nested Code Generation**
```python
def _generate_nested_code(ledger_data, tenant_id, logger):
    """Generate code for ledger nested under another custom ledger."""
    try:
        parent = MasterLedger.objects.get(
            id=ledger_data['parent_ledger_id'],
            tenant_id=tenant_id
        )
        if not parent.code:
            logger.warning(f"Parent ledger {parent.id} has no code, using fallback")
            return _generate_fallback_code(tenant_id, logger)
        
        logger.info(f"Generating nested code under parent: {parent.code}")
        return _generate_next_suffix_code(parent.code, tenant_id, logger)
    except MasterLedger.DoesNotExist:
        logger.error(f"Parent ledger {ledger_data['parent_ledger_id']} not found")
        return _generate_fallback_code(tenant_id, logger)
```

**Function 2: Hierarchy Code Lookup**
```python
def _lookup_hierarchy_code(ledger_data, logger):
    """
    Look up the hierarchy code from master_hierarchy_raw.
    
    Searches from most specific to least specific level:
    1. ledger_type (leaf level)
    2. sub_group_3
    3. sub_group_2
    4. sub_group_1
    5. group
    6. category (major_group)
    """
    hierarchy_map = [
        ('ledger_type', 'ledger_1', 16, 'Ledger Type'),
        ('sub_group_3', 'sub_group_3_1', 14, 'Sub Group 3'),
        ('sub_group_2', 'sub_group_2_1', 12, 'Sub Group 2'),
        ('sub_group_1', 'sub_group_1_1', 10, 'Sub Group 1'),
        ('group', 'group_1', 8, 'Group'),
        ('category', 'major_group_1', 6, 'Category'),
    ]
    
    for field, db_field, code_length, level_name in hierarchy_map:
        value = ledger_data.get(field)
        if value:
            logger.info(f"Looking up code for {level_name}: {value}")
            
            # Use parameterized query to prevent SQL injection
            with connection.cursor() as cursor:
                query = """
                    SELECT code 
                    FROM master_hierarchy_raw 
                    WHERE {db_field} = %s 
                      AND code IS NOT NULL 
                      AND CHAR_LENGTH(code) >= %s
                    LIMIT 1
                """.format(db_field=db_field)
                
                cursor.execute(query, [value, code_length])
                row = cursor.fetchone()
                
                if row and row[0]:
                    full_code = row[0].strip()
                    # Truncate to appropriate level
                    prefix = full_code[:code_length]
                    logger.info(f"Found hierarchy code: {prefix} (from {full_code})")
                    return prefix
                else:
                    logger.warning(f"No code found for {level_name}: {value}")
    
    logger.warning("No hierarchy code found for any level")
    return None
```

**Function 3: Next Suffix Code**
```python
def _generate_next_suffix_code(base_code, tenant_id, logger):
    """
    Generate next available code with format: {base_code}.{sequence}
    
    Examples:
    - Base: "01010101" → "01010101.001", "01010101.002", ...
    - Base: "9001" → "9001.001", "9001.002", ...
    - Base: "9001.001" → "9001.001.001", "9001.001.002", ...
    """
    query_prefix = f"{base_code}."
    
    # Find all direct children (codes starting with base_code.)
    siblings = MasterLedger.objects.filter(
        tenant_id=tenant_id,
        code__startswith=query_prefix
    ).values_list('code', flat=True)
    
    max_suffix = 0
    for code in siblings:
        if code.startswith(query_prefix):
            # Extract the immediate suffix after base_code
            remainder = code[len(query_prefix):]
            # Only consider direct children (no additional dots)
            parts = remainder.split('.')
            if parts and parts[0].isdigit():
                try:
                    suffix_num = int(parts[0])
                    max_suffix = max(max_suffix, suffix_num)
                except ValueError:
                    continue
    
    next_code = f"{base_code}.{max_suffix + 1:03d}"
    logger.info(f"Generated suffix code: {next_code} (max suffix was {max_suffix})")
    return next_code
```

**Function 4: Fallback Code**
```python
def _generate_fallback_code(tenant_id, logger):
    """
    Generate fallback code in 9000+ range for unclassified ledgers.
    """
    # Find max code in custom range (9000-9999)
    max_ledger = MasterLedger.objects.filter(
        tenant_id=tenant_id,
        code__regex=r'^9\d{3}$'  # Match 9000-9999 only
    ).aggregate(Max('code'))
    
    max_code_value = max_ledger.get('code__max')
    
    if max_code_value:
        try:
            next_code = str(int(max_code_value) + 1)
            logger.info(f"Generated fallback code: {next_code}")
            return next_code
        except ValueError:
            logger.error(f"Invalid max code value: {max_code_value}")
    
    logger.info("Using default fallback code: 9001")
    return "9001"
```

---

### Phase 2: Add Validation and Error Handling

#### 2.1 Validate Code Uniqueness
**File**: `backend/accounting/serializers.py`

**Add validation in `MasterLedgerSerializer`:**
```python
class MasterLedgerSerializer(TenantModelSerializerMixin, serializers.ModelSerializer):
    # ... existing code ...
    
    def validate_code(self, value):
        """Validate that code is unique across all tenants."""
        if value:
            # Check if code already exists
            existing = MasterLedger.objects.filter(code=value).exclude(
                id=self.instance.id if self.instance else None
            ).exists()
            
            if existing:
                raise serializers.ValidationError(
                    f"Ledger code '{value}' already exists. Please contact support."
                )
        return value
```

#### 2.2 Handle Code Generation Failures
**File**: `backend/accounting/views.py`

**Update `MasterLedgerViewSet.create()`:**
```python
def create(self, request, *args, **kwargs):
    """Create a new ledger with auto-generated code"""
    import logging
    from .utils import generate_ledger_code
    from django.db import IntegrityError, transaction
    
    logger = logging.getLogger('accounting.views')
    
    try:
        logger.info(f"📝 Creating ledger - Data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Auto-generate ledger code based on hierarchy
        tenant_id = request.user.tenant_id
        
        # Retry logic for code generation (in case of race conditions)
        max_retries = 3
        for attempt in range(max_retries):
            try:
                with transaction.atomic():
                    ledger_code = generate_ledger_code(
                        serializer.validated_data, 
                        tenant_id
                    )
                    logger.info(f"🔢 Generated ledger code: {ledger_code} (attempt {attempt + 1})")
                    
                    # Save with generated code
                    ledger = serializer.save(code=ledger_code)
                    break
            except IntegrityError as e:
                if attempt == max_retries - 1:
                    logger.error(f"❌ Failed to generate unique code after {max_retries} attempts")
                    raise serializers.ValidationError({
                        'code': 'Failed to generate unique ledger code. Please try again.'
                    })
                logger.warning(f"⚠️ Code collision detected, retrying... (attempt {attempt + 1})")
                continue
        
        # Re-serialize to include the code in response
        response_serializer = self.get_serializer(ledger)
        
        logger.info(f"✅ Ledger created successfully: {response_serializer.data}")
        headers = self.get_success_headers(response_serializer.data)
        return Response(
            response_serializer.data, 
            status=status.HTTP_201_CREATED, 
            headers=headers
        )
    except Exception as e:
        logger.error(f"❌ Error creating ledger: {type(e).__name__}: {str(e)}", exc_info=True)
        raise
```

---

### Phase 3: Testing and Validation

#### 3.1 Create Test Cases
**File**: `backend/accounting/tests/test_ledger_code_generation.py` (NEW)

```python
import pytest
from django.test import TestCase
from accounting.models import MasterLedger, MasterHierarchyRaw
from accounting.utils import generate_ledger_code
from core.models import Tenant, User

@pytest.mark.django_db
class TestLedgerCodeGeneration(TestCase):
    """Test cases for automatic ledger code generation"""
    
    def setUp(self):
        """Set up test data"""
        # Create test tenant
        self.tenant = Tenant.objects.create(
            name="Test Company",
            domain="test.example.com"
        )
        
        # Create test hierarchy data
        MasterHierarchyRaw.objects.create(
            major_group_1="Assets",
            group_1="Current Assets",
            sub_group_1_1="Cash & Bank",
            ledger_1="Cash in Hand",
            code="010101010101"
        )
    
    def test_hierarchy_based_code_generation(self):
        """Test code generation based on hierarchy"""
        ledger_data = {
            'name': 'Petty Cash',
            'category': 'Assets',
            'group': 'Current Assets',
            'sub_group_1': 'Cash & Bank'
        }
        
        code = generate_ledger_code(ledger_data, self.tenant.id)
        
        # Should generate code like "0101010100.001"
        self.assertIsNotNone(code)
        self.assertTrue(code.startswith("01010101"))
        self.assertIn(".", code)
    
    def test_nested_ledger_code_generation(self):
        """Test code generation for nested custom ledgers"""
        # Create parent ledger
        parent = MasterLedger.objects.create(
            name="Main Account",
            code="9001",
            tenant_id=self.tenant.id
        )
        
        ledger_data = {
            'name': 'Sub Account',
            'parent_ledger_id': parent.id
        }
        
        code = generate_ledger_code(ledger_data, self.tenant.id)
        
        # Should generate code like "9001.001"
        self.assertEqual(code, "9001.001")
    
    def test_fallback_code_generation(self):
        """Test fallback code generation for unclassified ledgers"""
        ledger_data = {
            'name': 'Custom Ledger'
        }
        
        code = generate_ledger_code(ledger_data, self.tenant.id)
        
        # Should generate code in 9000+ range
        self.assertTrue(code.startswith("9"))
        self.assertTrue(int(code) >= 9000)
    
    def test_sequential_code_generation(self):
        """Test that sequential ledgers get incremental codes"""
        ledger_data = {
            'name': 'Ledger 1',
            'category': 'Assets',
            'group': 'Current Assets'
        }
        
        code1 = generate_ledger_code(ledger_data, self.tenant.id)
        MasterLedger.objects.create(
            name='Ledger 1',
            code=code1,
            tenant_id=self.tenant.id
        )
        
        code2 = generate_ledger_code(ledger_data, self.tenant.id)
        
        # Codes should be sequential
        self.assertNotEqual(code1, code2)
        # Extract suffix and verify increment
        suffix1 = int(code1.split('.')[-1])
        suffix2 = int(code2.split('.')[-1])
        self.assertEqual(suffix2, suffix1 + 1)
    
    def test_code_uniqueness_across_tenants(self):
        """Test that codes can be reused across different tenants"""
        tenant2 = Tenant.objects.create(
            name="Test Company 2",
            domain="test2.example.com"
        )
        
        ledger_data = {
            'name': 'Cash',
            'category': 'Assets'
        }
        
        code1 = generate_ledger_code(ledger_data, self.tenant.id)
        code2 = generate_ledger_code(ledger_data, tenant2.id)
        
        # Codes can be the same for different tenants
        # (uniqueness is enforced at database level with tenant_id)
        self.assertEqual(code1, code2)
```

#### 3.2 Manual Testing Checklist

**Test Scenarios:**

1. ✅ **Create ledger under standard hierarchy**
   - Select: Category → Group → Sub Group
   - Expected: Code like "01010101.001"

2. ✅ **Create nested custom ledger**
   - Select: Parent Ledger (existing custom ledger)
   - Expected: Code like "9001.001"

3. ✅ **Create ledger without hierarchy**
   - Leave hierarchy fields empty
   - Expected: Code like "9001"

4. ✅ **Create multiple ledgers in same group**
   - Create 3 ledgers under same group
   - Expected: Sequential codes (.001, .002, .003)

5. ✅ **Create deeply nested ledger**
   - Create ledger under ledger under ledger
   - Expected: Code like "9001.001.001"

6. ✅ **Handle missing hierarchy data**
   - Select hierarchy that doesn't exist in master_hierarchy_raw
   - Expected: Fallback to 9000+ range

7. ✅ **Concurrent creation**
   - Create multiple ledgers simultaneously
   - Expected: All get unique codes (no duplicates)

---

### Phase 4: Database Migration and Data Cleanup

#### 4.1 Backfill Existing Ledgers
**File**: `backend/accounting/migrations/0012_backfill_ledger_codes.py` (NEW)

```python
from django.db import migrations
from accounting.utils import generate_ledger_code

def backfill_ledger_codes(apps, schema_editor):
    """Generate codes for existing ledgers that don't have one"""
    MasterLedger = apps.get_model('accounting', 'MasterLedger')
    
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

def reverse_backfill(apps, schema_editor):
    """Reverse migration - set all codes to NULL"""
    MasterLedger = apps.get_model('accounting', 'MasterLedger')
    MasterLedger.objects.all().update(code=None)

class Migration(migrations.Migration):
    dependencies = [
        ('accounting', '0011_add_ledger_code'),
    ]
    
    operations = [
        migrations.RunPython(backfill_ledger_codes, reverse_backfill),
    ]
```

#### 4.2 Make Code Field Required (Future)
**File**: `backend/accounting/migrations/0013_make_code_required.py` (FUTURE)

```python
from django.db import migrations, models

class Migration(migrations.Migration):
    """
    Make ledger_code field required after backfilling existing data.
    Run this AFTER 0012_backfill_ledger_codes.
    """
    dependencies = [
        ('accounting', '0012_backfill_ledger_codes'),
    ]
    
    operations = [
        migrations.AlterField(
            model_name='masterledger',
            name='ledger_code',
            field=models.CharField(
                max_length=50,
                unique=True,
                help_text='Auto-generated code based on hierarchy position'
            ),
        ),
    ]
```

---

### Phase 5: Frontend Integration

#### 5.1 Display Ledger Code in UI
**File**: `frontend/components/LedgerCreationWizard.tsx`

**Add code display:**
```typescript
// After ledger is created, show the generated code
const handleSubmit = async () => {
  try {
    const response = await api.post('/api/ledgers/', ledgerData);
    
    // Show success message with generated code
    toast.success(
      `Ledger created successfully! Code: ${response.data.code}`,
      { duration: 5000 }
    );
    
    // Update UI to show the code
    setGeneratedCode(response.data.code);
  } catch (error) {
    toast.error('Failed to create ledger');
  }
};
```

#### 5.2 Show Code in Ledger List
**File**: `frontend/pages/Masters/Ledgers.tsx`

**Add code column to table:**
```typescript
const columns = [
  { header: 'Code', accessor: 'code' },
  { header: 'Name', accessor: 'name' },
  { header: 'Group', accessor: 'group' },
  // ... other columns
];
```

#### 5.3 Enable Code Search/Filter
**Add search by code:**
```typescript
const filteredLedgers = ledgers.filter(ledger => 
  ledger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  ledger.code?.toLowerCase().includes(searchTerm.toLowerCase())
);
```

---

## 📝 Implementation Checklist

### Backend Tasks

- [ ] **Phase 1: Enhance Code Generation**
  - [ ] Refactor `generate_ledger_code()` function
  - [ ] Add `_generate_nested_code()` helper
  - [ ] Add `_lookup_hierarchy_code()` helper
  - [ ] Add `_generate_next_suffix_code()` helper
  - [ ] Add `_generate_fallback_code()` helper
  - [ ] Add comprehensive logging
  - [ ] Fix SQL injection vulnerability

- [ ] **Phase 2: Validation & Error Handling**
  - [ ] Add code uniqueness validation in serializer
  - [ ] Add retry logic in view for race conditions
  - [ ] Add proper error messages
  - [ ] Add transaction handling

- [ ] **Phase 3: Testing**
  - [ ] Create test file `test_ledger_code_generation.py`
  - [ ] Write unit tests for each code generation scenario
  - [ ] Write integration tests for API endpoints
  - [ ] Perform manual testing with checklist
  - [ ] Test concurrent creation scenarios

- [ ] **Phase 4: Database Migration**
  - [ ] Create migration `0012_backfill_ledger_codes.py`
  - [ ] Test backfill migration on staging data
  - [ ] Run migration on production
  - [ ] Verify all ledgers have codes
  - [ ] (Future) Create migration to make code required

### Frontend Tasks

- [ ] **Phase 5: UI Integration**
  - [ ] Display generated code in creation success message
  - [ ] Add code column to ledger list table
  - [ ] Add code to ledger detail view
  - [ ] Enable search/filter by code
  - [ ] Add code to ledger edit form (read-only)
  - [ ] Update TypeScript interfaces to include `code` field

### Documentation Tasks

- [ ] Document code format and structure
- [ ] Create user guide for understanding ledger codes
- [ ] Add API documentation for code field
- [ ] Document troubleshooting steps for code generation issues

---

## 🔍 Code Format Reference

### Hierarchy-Based Codes

| Level | Code Length | Example | Format |
|-------|-------------|---------|--------|
| Category (Major Group) | 6 digits | `010101` | From master_hierarchy_raw |
| Group | 8 digits | `01010101` | From master_hierarchy_raw |
| Sub Group 1 | 10 digits | `0101010101` | From master_hierarchy_raw |
| Sub Group 2 | 12 digits | `010101010101` | From master_hierarchy_raw |
| Sub Group 3 | 14 digits | `01010101010101` | From master_hierarchy_raw |
| Ledger Type | 16 digits | `0101010101010101` | From master_hierarchy_raw |
| **Custom Ledger** | **Base + .XXX** | `01010101.001` | **Auto-generated** |

### Custom Ledger Codes

| Type | Code Format | Example | Description |
|------|-------------|---------|-------------|
| Root Custom | `9XXX` | `9001` | Unclassified ledgers |
| Nested Level 1 | `Base.XXX` | `9001.001` | Under custom ledger |
| Nested Level 2 | `Base.XXX.XXX` | `9001.001.001` | Under nested ledger |
| Hierarchy Custom | `HierCode.XXX` | `01010101.001` | Under standard group |

---

## 🚨 Edge Cases and Solutions

### Edge Case 1: Missing Hierarchy Data
**Problem**: Selected hierarchy doesn't exist in `master_hierarchy_raw`
**Solution**: Fall back to 9000+ range

### Edge Case 2: Code Collision (Race Condition)
**Problem**: Two ledgers created simultaneously get same code
**Solution**: Retry logic with transaction isolation

### Edge Case 3: Parent Ledger Has No Code
**Problem**: Creating nested ledger under parent without code
**Solution**: Generate code for parent first, or use fallback

### Edge Case 4: Maximum Suffix Reached
**Problem**: More than 999 ledgers under same parent
**Solution**: Use 4-digit suffix (.0001, .0002, etc.)

### Edge Case 5: Invalid Characters in Hierarchy Names
**Problem**: Special characters in hierarchy names break SQL
**Solution**: Use parameterized queries (already implemented)

---

## 📊 Success Metrics

1. **100% of new ledgers** get auto-assigned codes
2. **Zero duplicate codes** within tenant scope
3. **< 100ms** code generation time
4. **Zero SQL injection vulnerabilities**
5. **100% test coverage** for code generation logic

---

## 🔄 Rollback Plan

If issues arise:

1. **Immediate**: Revert migration 0012 (backfill)
2. **Short-term**: Make `code` field nullable again
3. **Long-term**: Fix issues and re-deploy with proper testing

---

## 📅 Timeline Estimate

| Phase | Estimated Time |
|-------|----------------|
| Phase 1: Code Generation Enhancement | 4 hours |
| Phase 2: Validation & Error Handling | 2 hours |
| Phase 3: Testing | 4 hours |
| Phase 4: Database Migration | 2 hours |
| Phase 5: Frontend Integration | 3 hours |
| **Total** | **15 hours** |

---

## 🎓 Technical Notes

### Why This Approach?

1. **Hierarchical Codes**: Makes it easy to identify ledger category at a glance
2. **Unique Suffixes**: Ensures uniqueness while maintaining hierarchy
3. **Fallback Range**: Handles edge cases gracefully
4. **Tenant Scoping**: Codes are unique within tenant, not globally
5. **Extensible**: Easy to add more levels or change format

### Alternative Approaches Considered

1. **UUID-based codes**: Rejected (not human-readable)
2. **Sequential integers**: Rejected (loses hierarchy information)
3. **Manual entry**: Rejected (error-prone, not scalable)

---

## ✅ Acceptance Criteria

- [ ] All new ledgers automatically receive a unique code
- [ ] Code reflects the ledger's position in hierarchy
- [ ] Nested custom ledgers get properly formatted codes
- [ ] No duplicate codes exist in the system
- [ ] Code generation handles all edge cases gracefully
- [ ] Frontend displays codes in all relevant views
- [ ] Users can search/filter by code
- [ ] All tests pass
- [ ] Documentation is complete

---

## 📞 Support and Troubleshooting

### Common Issues

**Issue**: Code generation fails
**Solution**: Check logs for specific error, verify hierarchy data exists

**Issue**: Duplicate code error
**Solution**: Retry creation, check for race conditions

**Issue**: Code doesn't match hierarchy
**Solution**: Verify hierarchy data in `master_hierarchy_raw` table

---

## 🔗 Related Documentation

- [Database Schema Documentation](../docs/database-schema.md)
- [API Documentation](../docs/api-reference.md)
- [Hierarchy Import Guide](../docs/hierarchy-import.md)

---

**Last Updated**: 2025-12-29
**Version**: 1.0
**Author**: Development Team
