"""
Management command to add missing columns to company_informations table
"""
from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Add missing columns to company_informations table'

    def handle(self, *args, **options):
        columns_to_add = [
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
        
        with connection.cursor() as cursor:
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
                    self.stdout.write(self.style.SUCCESS(f'✅ Added column: {column_name}'))
                else:
                    self.stdout.write(self.style.WARNING(f'ℹ️  Column already exists: {column_name}'))
        
        self.stdout.write(self.style.SUCCESS('✅ All missing columns added successfully!'))
