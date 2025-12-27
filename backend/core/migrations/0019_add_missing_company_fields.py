# Migration to add ALL missing fields to company_informations table

from django.db import migrations


def add_missing_columns(apps, schema_editor):
    """Add all missing columns to company_informations table"""
    with schema_editor.connection.cursor() as cursor:
        # Complete list of all columns that should exist based on CompanyFullInfo model
        columns_to_add = [
            ("mobile", "VARCHAR(15) NULL"),
            ("business_type", "VARCHAR(50) NULL"),
            ("industry_type", "VARCHAR(100) NULL"),
            ("financial_year_start", "DATE NULL"),
            ("financial_year_end", "DATE NULL"),
            ("logo_path", "VARCHAR(500) NULL"),
            ("signature_path", "VARCHAR(500) NULL"),
            ("bank_name", "VARCHAR(255) NULL"),
            ("bank_account_no", "VARCHAR(20) NULL"),
            ("bank_ifsc", "VARCHAR(11) NULL"),
            ("bank_branch", "VARCHAR(255) NULL"),
            ("voucher_numbering", "JSON NULL"),
        ]
        
        for column_name, column_definition in columns_to_add:
            # Check if column exists
            cursor.execute("""
                SELECT COUNT(*)
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'company_informations'
                AND COLUMN_NAME = %s
            """, [column_name])
            
            if cursor.fetchone()[0] == 0:
                cursor.execute(f"ALTER TABLE company_informations ADD COLUMN {column_name} {column_definition}")
                print(f"✅ Added column: {column_name}")
            else:
                print(f"ℹ️  Column already exists: {column_name}")


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0018_merge_20251227_1705'),
    ]

    operations = [
        migrations.RunPython(add_missing_columns, reverse_code=migrations.RunPython.noop),
    ]

