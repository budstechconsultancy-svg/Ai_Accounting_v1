# Manual migration using raw SQL to add columns if they don't exist

from django.db import migrations


def add_columns_if_not_exist(apps, schema_editor):
    """Add columns to master_ledgers table if they don't already exist"""
    with schema_editor.connection.cursor() as cursor:
        # Check and add category
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'master_ledgers'
            AND COLUMN_NAME = 'category'
        """)
        if cursor.fetchone()[0] == 0:
            cursor.execute("ALTER TABLE master_ledgers ADD COLUMN category VARCHAR(255) NULL")
        
        # Check and add sub_group_1
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'master_ledgers'
            AND COLUMN_NAME = 'sub_group_1'
        """)
        if cursor.fetchone()[0] == 0:
            cursor.execute("ALTER TABLE master_ledgers ADD COLUMN sub_group_1 VARCHAR(255) NULL")
        
        # Check and add sub_group_2
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'master_ledgers'
            AND COLUMN_NAME = 'sub_group_2'
        """)
        if cursor.fetchone()[0] == 0:
            cursor.execute("ALTER TABLE master_ledgers ADD COLUMN sub_group_2 VARCHAR(255) NULL")
        
        # Check and add sub_group_3
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'master_ledgers'
            AND COLUMN_NAME = 'sub_group_3'
        """)
        if cursor.fetchone()[0] == 0:
            cursor.execute("ALTER TABLE master_ledgers ADD COLUMN sub_group_3 VARCHAR(255) NULL")
        
        # Check and add ledger_type
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'master_ledgers'
            AND COLUMN_NAME = 'ledger_type'
        """)
        if cursor.fetchone()[0] == 0:
            cursor.execute("ALTER TABLE master_ledgers ADD COLUMN ledger_type VARCHAR(255) NULL")
        
        # Check and add extended_data
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'master_ledgers'
            AND COLUMN_NAME = 'extended_data'
        """)
        if cursor.fetchone()[0] == 0:
            cursor.execute("ALTER TABLE master_ledgers ADD COLUMN extended_data JSON NULL")


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0008_masterledger_extended_data'),
    ]

    operations = [
        migrations.RunPython(add_columns_if_not_exist, reverse_code=migrations.RunPython.noop),
    ]
