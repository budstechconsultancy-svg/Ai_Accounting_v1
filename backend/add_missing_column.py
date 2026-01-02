#!/usr/bin/env python
"""
Script to add the missing additional_data column to master_ledgers table
"""
import os
import sys
import django
from pathlib import Path

# Setup Django
sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

def add_additional_data_column():
    """Add the additional_data column to master_ledgers table"""
    with connection.cursor() as cursor:
        try:
            # Check if column exists
            cursor.execute("""
                SELECT COUNT(*) 
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = 'ai_accounting' 
                AND TABLE_NAME = 'master_ledgers' 
                AND COLUMN_NAME = 'additional_data'
            """)
            exists = cursor.fetchone()[0]
            
            if exists:
                print("✅ Column 'additional_data' already exists in master_ledgers table")
                return
            
            # Add the column
            cursor.execute("""
                ALTER TABLE master_ledgers 
                ADD COLUMN additional_data JSON NULL 
                COMMENT 'Stores answers to dynamic questions (e.g., opening balance, GSTIN, credit limit)'
            """)
            print("✅ Successfully added 'additional_data' column to master_ledgers table")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            sys.exit(1)

if __name__ == '__main__':
    add_additional_data_column()
