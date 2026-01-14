import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

cursor = connection.cursor()

try:
    # Drop the table if it exists (this will also drop foreign keys)
    cursor.execute("DROP TABLE IF EXISTS vendors_po_series")
    print("✓ Dropped existing table (if any)")
    
    # Create the table WITHOUT foreign key first
    cursor.execute("""
    CREATE TABLE vendors_po_series (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category_id INT NULL,
        prefix VARCHAR(50),
        suffix VARCHAR(50),
        auto_financial_year TINYINT(1) DEFAULT 1,
        digits INT DEFAULT 4,
        current_value INT DEFAULT 1,
        is_active TINYINT(1) DEFAULT 1,
        created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX idx_category (category_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    """)
    print("✓ Table 'vendors_po_series' created successfully!")
    
    # Now add the foreign key constraint
    try:
        cursor.execute("""
        ALTER TABLE vendors_po_series
        ADD CONSTRAINT fk_poseries_category
        FOREIGN KEY (category_id) REFERENCES inventory_categories(id) ON DELETE SET NULL
        """)
        print("✓ Foreign key constraint added successfully!")
    except Exception as fk_error:
        print(f"⚠ Warning: Could not add foreign key constraint: {fk_error}")
        print("  Table created without foreign key constraint")
    
    # Verify the table exists
    cursor.execute("SHOW TABLES LIKE 'vendors_po_series'")
    result = cursor.fetchall()
    print(f"\n✓ Verification: {result}")
    
    # Show table structure
    cursor.execute("DESCRIBE vendors_po_series")
    columns = cursor.fetchall()
    print("\n✓ Table structure:")
    for col in columns:
        print(f"  {col}")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    cursor.close()

