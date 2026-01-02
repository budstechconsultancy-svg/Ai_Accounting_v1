# Implementation Plan: Sequential Ledger Code Assignment

## 📋 Overview

Implement sequential code assignment for ledgers where:
- **Hierarchy levels** (NPO Funds, Unrestricted Funds) maintain their base codes
- **Leaf ledgers** (Corpus Funds, General Funds, Pay) get sequential numbers
- **Format**: `{hierarchy_base_code}{sequential_number}`
- **Example**: `010112`, `010113`, `010114` (base: `0101`, sequences: 12, 13, 14)

---

## 🎯 Requirements

### Current State (What You Have):
```
NPO Funds (hierarchy)
  └─ Unrestricted Funds (hierarchy)
      ├─ Corpus Funds (ledger) → code: 010112
      ├─ General Funds (ledger) → code: 010113
      └─ Pay (NEW ledger) → code: ??? (should be 010114)
```

### Desired Behavior:
1. **Base code** comes from `master_hierarchy_raw` table (e.g., "0101" for Unrestricted Funds)
2. **Sequential number** is auto-incremented based on existing ledgers under same hierarchy
3. **Combined code** = base + sequence (e.g., "0101" + "14" = "010114")

---

## 📊 Implementation Phases

### Phase 1: Update Code Generation Logic ✅
**File**: `backend/accounting/utils.py`

**Changes Needed:**
1. Modify `generate_ledger_code()` to use sequential numbering
2. Create `_lookup_hierarchy_base_code()` to get base code from hierarchy
3. Create `_get_next_sequence_for_base()` to find next available sequence number
4. Update code format to `{base}{sequence:02d}`

**Estimated Time**: 2 hours

---

### Phase 2: Handle Edge Cases ✅
**Scenarios to Handle:**
1. First ledger under a hierarchy (sequence = 01)
2. Multiple ledgers under same hierarchy (auto-increment)
3. Gaps in sequence numbers (e.g., if ledger deleted)
4. Different hierarchy levels (category, group, sub-group)
5. Custom ledgers without hierarchy (fallback to 9000+ range)

**Estimated Time**: 1 hour

---

### Phase 3: Testing ✅
**Test Cases:**
1. Create first ledger under hierarchy → should get `{base}01`
2. Create second ledger under same hierarchy → should get `{base}02`
3. Create 12th ledger → should get `{base}12`
4. Create ledger after deleting one → should fill gap or continue sequence
5. Create ledger under different hierarchy → should have different base code

**Estimated Time**: 2 hours

---

### Phase 4: Database Migration (Optional) ✅
**Purpose**: Update existing ledger codes to new format

**Estimated Time**: 1 hour

---

## 🔧 Detailed Implementation

### Step 1: Update `generate_ledger_code()` Function

**File**: `backend/accounting/utils.py`

```python
def generate_ledger_code(ledger_data, tenant_id):
    """
    Generate sequential ledger code based on hierarchy.
    
    Format: {hierarchy_base_code}{sequential_number}
    Example: 010114 (base: 0101, sequence: 14)
    
    Args:
        ledger_data (dict): Ledger data with hierarchy fields
        tenant_id (int): Tenant ID for scoping
        
    Returns:
        str: Generated ledger code
        
    Examples:
        >>> # First ledger under Unrestricted Funds
        >>> generate_ledger_code({
        ...     'category': 'NPO Funds',
        ...     'group': 'Unrestricted Funds'
        ... }, 1)
        '010101'
        
        >>> # 14th ledger under same hierarchy
        >>> generate_ledger_code({
        ...     'category': 'NPO Funds',
        ...     'group': 'Unrestricted Funds'
        ... }, 1)
        '010114'
    """
    logger.info(f"🔢 Starting sequential code generation for tenant {tenant_id}")
    
    # -------------------------------------------------------------------------
    # Case 1: Nested custom ledger (unchanged)
    # -------------------------------------------------------------------------
    if ledger_data.get('parent_ledger_id'):
        logger.info(f"📂 Nested ledger detected")
        return _generate_nested_code(ledger_data, tenant_id)
    
    # -------------------------------------------------------------------------
    # Case 2: Hierarchy-based with sequential numbering
    # -------------------------------------------------------------------------
    base_code = _lookup_hierarchy_base_code(ledger_data)
    
    if base_code:
        logger.info(f"🏛️ Found hierarchy base code: {base_code}")
        
        # Get next sequential number for this hierarchy level
        next_sequence = _get_next_sequence_for_base(base_code, tenant_id)
        
        # Combine base + sequence
        final_code = f"{base_code}{next_sequence:02d}"
        logger.info(f"✅ Generated sequential code: {final_code} (base: {base_code}, seq: {next_sequence})")
        
        return final_code
    
    # -------------------------------------------------------------------------
    # Case 3: Fallback for custom ledgers
    # -------------------------------------------------------------------------
    logger.info("⚠️ No hierarchy found, using fallback range")
    return _generate_fallback_code(tenant_id)
```

---

### Step 2: Create `_lookup_hierarchy_base_code()` Function

```python
def _lookup_hierarchy_base_code(ledger_data):
    """
    Look up the base code from master_hierarchy_raw table.
    
    Returns the GROUP-level code (first 4 digits) which serves as the
    base for all ledgers under that group.
    
    Args:
        ledger_data (dict): Ledger data containing hierarchy fields
        
    Returns:
        str or None: Base code (e.g., "0101") or None if not found
        
    Example:
        Input: {
            'category': 'NPO Funds',
            'group': 'Unrestricted Funds'
        }
        Output: '0101' (first 4 digits of hierarchy code)
    """
    
    # Build query based on available hierarchy fields
    conditions = []
    params = []
    
    # Map fields to database columns
    field_mapping = {
        'category': 'major_group_1',
        'group': 'group_1',
        'sub_group_1': 'sub_group_1_1',
        'sub_group_2': 'sub_group_2_1',
        'sub_group_3': 'sub_group_3_1',
    }
    
    # Collect non-empty hierarchy fields
    for field, db_column in field_mapping.items():
        value = ledger_data.get(field)
        if value and value.strip():
            conditions.append(f"{db_column} = %s")
            params.append(value.strip())
    
    if not conditions:
        logger.debug("No hierarchy fields provided")
        return None
    
    # Query to get the code
    query = f"""
        SELECT code 
        FROM master_hierarchy_raw 
        WHERE {' AND '.join(conditions)}
          AND code IS NOT NULL
          AND code != ''
        LIMIT 1
    """
    
    logger.debug(f"Base code query: {query}")
    logger.debug(f"Params: {params}")
    
    with connection.cursor() as cursor:
        cursor.execute(query, params)
        row = cursor.fetchone()
        
        if row and row[0]:
            full_code = row[0].strip()
            
            # Determine base code length based on hierarchy depth
            # - Category only: 2 digits (e.g., "01")
            # - Category + Group: 4 digits (e.g., "0101")
            # - Category + Group + SubGroup1: 6 digits (e.g., "010101")
            # etc.
            
            num_fields = len(params)
            base_length = num_fields * 2  # 2 digits per level
            
            base_code = full_code[:base_length]
            
            logger.info(f"✅ Found base code: {base_code} (from {full_code}, depth: {num_fields})")
            return base_code
    
    logger.warning("⚠️ No hierarchy code found")
    return None
```

---

### Step 3: Create `_get_next_sequence_for_base()` Function

```python
def _get_next_sequence_for_base(base_code, tenant_id):
    """
    Find the next sequential number for ledgers under this base code.
    
    Looks at all existing ledgers with codes starting with the base code
    and returns the next available sequence number.
    
    Args:
        base_code (str): Base code from hierarchy (e.g., "0101")
        tenant_id (int): Tenant ID for scoping
        
    Returns:
        int: Next sequence number (e.g., 14)
        
    Examples:
        Base: "0101"
        Existing codes: ["010112", "010113"]
        Returns: 14
        
        Base: "0101"
        Existing codes: []
        Returns: 1
    """
    logger.debug(f"🔍 Finding next sequence for base: {base_code}")
    
    # Find all ledgers with codes starting with this base
    # Pattern: base_code followed by digits only (no dots)
    pattern = f'^{base_code}\\d+$'
    
    existing_codes = MasterLedger.objects.filter(
        tenant_id=tenant_id,
        code__startswith=base_code,
        code__regex=pattern
    ).values_list('code', flat=True)
    
    logger.debug(f"Found {len(existing_codes)} existing codes with base {base_code}")
    
    max_sequence = 0
    
    for code in existing_codes:
        # Extract the numeric suffix after base code
        suffix = code[len(base_code):]
        
        if suffix.isdigit():
            sequence = int(suffix)
            max_sequence = max(max_sequence, sequence)
            logger.debug(f"  - Code: {code}, Sequence: {sequence}")
    
    next_sequence = max_sequence + 1
    
    logger.info(f"✅ Next sequence: {next_sequence} (max existing: {max_sequence})")
    
    return next_sequence
```

---

### Step 4: Keep Existing Helper Functions (Unchanged)

```python
def _generate_nested_code(ledger_data, tenant_id):
    """Keep existing implementation - unchanged"""
    # ... existing code ...

def _generate_fallback_code(tenant_id):
    """Keep existing implementation - unchanged"""
    # ... existing code ...
```

---

## 🧪 Testing Plan

### Test Case 1: First Ledger Under Hierarchy

**Input:**
```python
ledger_data = {
    'name': 'Corpus Funds',
    'category': 'NPO Funds',
    'group': 'Unrestricted Funds'
}
tenant_id = 1
```

**Expected:**
- Base code lookup: `"0101"`
- Existing ledgers: None
- Next sequence: `1`
- **Result**: `"010101"` ✅

---

### Test Case 2: Second Ledger Under Same Hierarchy

**Input:**
```python
ledger_data = {
    'name': 'General Funds',
    'category': 'NPO Funds',
    'group': 'Unrestricted Funds'
}
tenant_id = 1
```

**Expected:**
- Base code lookup: `"0101"`
- Existing ledgers: `["010101"]`
- Next sequence: `2`
- **Result**: `"010102"` ✅

---

### Test Case 3: 14th Ledger (Your Example)

**Input:**
```python
ledger_data = {
    'name': 'Pay',
    'category': 'NPO Funds',
    'group': 'Unrestricted Funds'
}
tenant_id = 1
```

**Existing Ledgers:**
```
010101, 010102, ..., 010111, 010112, 010113
```

**Expected:**
- Base code lookup: `"0101"`
- Existing ledgers: `["010101", ..., "010113"]`
- Max sequence: `13`
- Next sequence: `14`
- **Result**: `"010114"` ✅

---

### Test Case 4: Different Hierarchy Level

**Input:**
```python
ledger_data = {
    'name': 'Project Fund',
    'category': 'NPO Funds',
    'group': 'Restricted Funds'  # Different group!
}
tenant_id = 1
```

**Expected:**
- Base code lookup: `"0102"` (different from "0101")
- Next sequence: `1`
- **Result**: `"010201"` ✅

---

### Test Case 5: Custom Ledger (No Hierarchy)

**Input:**
```python
ledger_data = {
    'name': 'Custom Account'
}
tenant_id = 1
```

**Expected:**
- Base code lookup: `None`
- Fallback to 9000 range
- **Result**: `"9001"` ✅

---

## 📊 Code Format Examples

### Hierarchy Structure:
```
01 - NPO Funds (Category)
  0101 - Unrestricted Funds (Group)
    010101 - First ledger
    010102 - Second ledger
    ...
    010112 - Corpus Funds
    010113 - General Funds
    010114 - Pay (NEW)
  
  0102 - Restricted Funds (Group)
    010201 - First ledger
    010202 - Second ledger
```

### Code Breakdown:
```
Code: 010114
  ├─ 01   → Category (NPO Funds)
  ├─ 01   → Group (Unrestricted Funds)
  └─ 14   → Sequential number (14th ledger)
```

---

## 🔄 Migration Strategy (Optional)

### Option 1: Keep Existing Codes
- Don't change existing ledger codes
- New ledgers use new sequential format
- **Pros**: No disruption
- **Cons**: Mixed code formats

### Option 2: Regenerate All Codes
- Run migration to update all existing ledgers
- All codes follow new sequential format
- **Pros**: Consistent format
- **Cons**: Requires careful migration

**Recommendation**: Option 1 (keep existing codes)

---

## ✅ Implementation Checklist

### Phase 1: Code Changes
- [ ] Update `generate_ledger_code()` function
- [ ] Create `_lookup_hierarchy_base_code()` function
- [ ] Create `_get_next_sequence_for_base()` function
- [ ] Add comprehensive logging
- [ ] Update docstrings

### Phase 2: Testing
- [ ] Test first ledger creation
- [ ] Test sequential ledger creation
- [ ] Test different hierarchy levels
- [ ] Test custom ledgers (fallback)
- [ ] Test concurrent creation (race conditions)

### Phase 3: Documentation
- [ ] Update implementation docs
- [ ] Create code format guide
- [ ] Document edge cases
- [ ] Update API documentation

### Phase 4: Deployment
- [ ] Review code changes
- [ ] Run tests
- [ ] Deploy to staging
- [ ] Test with real data
- [ ] Deploy to production

---

## 📈 Expected Results

### Before Implementation:
```
Ledger: Corpus Funds
Code: 0101010101010101 (exact from hierarchy)

Ledger: General Funds
Code: 0101010101010101.001 (suffix added)
```

### After Implementation:
```
Ledger: Corpus Funds
Code: 010112 (base: 0101, sequence: 12)

Ledger: General Funds
Code: 010113 (base: 0101, sequence: 13)

Ledger: Pay
Code: 010114 (base: 0101, sequence: 14) ✅
```

---

## 🎯 Success Criteria

- ✅ New ledgers get sequential codes
- ✅ Base code matches hierarchy level
- ✅ No duplicate codes
- ✅ Automatic increment works
- ✅ Different hierarchies have different base codes
- ✅ Custom ledgers still use fallback range
- ✅ All tests pass

---

## 📞 Support & Troubleshooting

### Common Issues:

**Issue 1**: Sequence numbers have gaps
**Solution**: This is normal if ledgers are deleted. System continues from max sequence.

**Issue 2**: Wrong base code
**Solution**: Check hierarchy selection matches master_hierarchy_raw table.

**Issue 3**: Duplicate codes
**Solution**: Check for race conditions, ensure retry logic works.

---

## 📅 Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Code Changes | 2 hours | Pending |
| Phase 2: Testing | 2 hours | Pending |
| Phase 3: Documentation | 1 hour | Pending |
| Phase 4: Deployment | 1 hour | Pending |
| **Total** | **6 hours** | |

---

**Ready to implement? Let me know and I'll proceed with the code changes!** 🚀

---

**Last Updated**: 2025-12-29
**Version**: 2.0 (Sequential Numbering)
