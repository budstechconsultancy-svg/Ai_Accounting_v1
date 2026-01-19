"""
Quick test to verify PO creation SQL
"""
# Count placeholders
po_query = """
    INSERT INTO vendor_transaction_po (
        tenant_id,
        po_number,
        po_series_id,
        vendor_basic_detail_id,
        vendor_name,
        branch,
        address_line1,
        address_line2,
        address_line3,
        city,
        state,
        country,
        pincode,
        email_address,
        contract_no,
        receive_by,
        receive_at,
        delivery_terms,
        total_taxable_value,
        total_tax,
        total_value,
        status,
        is_active,
        created_by
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

columns = po_query.split('(')[1].split(')')[0].split(',')
placeholders = po_query.count('%s')

print(f"Columns: {len([c for c in columns if c.strip()])}")
print(f"Placeholders: {placeholders}")
print(f"Match: {len([c for c in columns if c.strip()]) == placeholders}")
