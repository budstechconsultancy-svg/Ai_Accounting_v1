"""
Utility functions for auto-generating ledger codes based on hierarchy
"""
from accounting.models import MasterLedger, MasterHierarchyRaw
from django.db.models import Max
from django.db import connection

def generate_ledger_code(ledger_data, tenant_id):
    """
    Generate unique ledger code based on hierarchy position.
    
    Generates a hierarchical code:
    1. If nested under another custom ledger: ParentCode.001
    2. If under standard hierarchy: HierarchyPrefix.001
       - HierarchyPrefix is derived from the MasterHierarchyRaw codes,
         truncated to the level of the selected parent.
    3. Fallback: 9000 range.
    """
    
    # -------------------------------------------------------------------------
    # Case 1: Nested custom ledger (has parent_ledger_id)
    # -------------------------------------------------------------------------
    if ledger_data.get('parent_ledger_id'):
        try:
            parent = MasterLedger.objects.get(
                id=ledger_data['parent_ledger_id'],
                tenant_id=tenant_id
            )
            parent_code = parent.code or "9000"
            return _generate_next_suffix_code(parent_code, tenant_id)
        except MasterLedger.DoesNotExist:
            pass # Fallback

    # -------------------------------------------------------------------------
    # Case 2: Custom ledger under Standard Hierarchy
    # -------------------------------------------------------------------------
    # Determine the deepest hierarchy level specified
    hierarchy_map = [
        ('ledger_type', 'ledger_1', 16),      # Sub-ledger of a leaf?
        ('sub_group_3', 'sub_group_3_1', 14),
        ('sub_group_2', 'sub_group_2_1', 12),
        ('sub_group_1', 'sub_group_1_1', 10),
        ('group', 'group_1', 8),
        ('category', 'major_group_1', 6),
    ]

    prefix = None
    
    for field, db_field, length in hierarchy_map:
        value = ledger_data.get(field)
        if value:
            # Find a representative code from the hierarchy
            with connection.cursor() as cursor:
                cursor.execute(f"""
                    SELECT code 
                    FROM master_hierarchy_raw 
                    WHERE {db_field} = %s AND code IS NOT NULL AND length(code) >= %s
                    LIMIT 1
                """, [value, length])
                row = cursor.fetchone()
                
                if row and row[0]:
                    full_code = row[0]
                    # Truncate to the level's length
                    # This gives us the code of the Container (Group/Category/etc)
                    prefix = full_code[:length]
                    break
    
    if prefix:
        return _generate_next_suffix_code(prefix, tenant_id)

    # -------------------------------------------------------------------------
    # Case 3: Fallback (9000+)
    # -------------------------------------------------------------------------
    # Find max code in tenant's custom range (flat codes starting with 9)
    # We ignore dot-separated codes here to find the next "root" custom code if needed
    max_ledger = MasterLedger.objects.filter(
        tenant_id=tenant_id,
        code__regex=r'^9\d+$' # Only flat numbers 9xxx
    ).aggregate(Max('code'))
    
    max_code_value = max_ledger.get('code__max')
    
    if max_code_value:
        try:
            return str(int(max_code_value) + 1)
        except ValueError:
            pass
            
    return "9001"


def _generate_next_suffix_code(base_code, tenant_id):
    """
    Finds the next available code like {base_code}.001, {base_code}.002, etc.
    """
    # Find all siblings: ledgers that start with base_code + "."
    # We fetch them effectively to determine the max suffix.
    # Note: We filter by length to likely avoid grabbing grandchildren if strictly .001 format,
    # but strictly checking prefix is safer.
    
    query = f"{base_code}."
    siblings = MasterLedger.objects.filter(
        tenant_id=tenant_id,
        code__startswith=query
    ).values_list('code', flat=True)
    
    max_suffix = 0
    for code in siblings:
        # Extract the part after the base_code
        if code.startswith(query):
            remainder = code[len(query):]
            # We expect just "001" or "002". If it has more dots "001.001", it's a grandchild.
            # We only care about direct children for this bucket?
            # Actually, we just want a unique code.
            # Let's check the first segment of the remainder.
            parts = remainder.split('.')
            if parts:
                try:
                    num = int(parts[0])
                    max_suffix = max(max_suffix, num)
                except ValueError:
                    continue
    
    return f"{base_code}.{max_suffix + 1:03d}"
