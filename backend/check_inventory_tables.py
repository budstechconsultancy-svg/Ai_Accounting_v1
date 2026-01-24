import sqlite3
import os

try:
    # Connect to the database
    # Assuming db.sqlite3 is in the backend directory or one level up? 
    # Let's check backend/db.sqlite3 first
    db_path = 'db.sqlite3'
    if not os.path.exists(db_path):
        # Try parent directory
        if os.path.exists('../db.sqlite3'):
            db_path = '../db.sqlite3'
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check for tables
    tables_to_check = [
        'inventory_operation_jobwork',
        'inventory_operation_interunit',
        'inventory_operation_locationchange',
        'inventory_operation_production',
        'inventory_operation_consumption',
        'inventory_operation_scrap',
        'inventory_operation_outward'
    ]
    
    print(f"Checking database: {db_path}")
    for table in tables_to_check:
        cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
        result = cursor.fetchone()
        if result:
            print(f"[OK] Table {table} exists.")
        else:
            print(f"[MISSING] Table {table} does NOT exist.")
            
    conn.close()

except Exception as e:
    print(f"Error: {e}")
