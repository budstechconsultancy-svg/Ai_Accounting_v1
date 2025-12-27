# Migration to add parent_ledger_id for nested custom ledgers

from django.db import migrations


def add_parent_ledger_column(apps, schema_editor):
    """Add parent_ledger_id column to master_ledgers table"""
    with schema_editor.connection.cursor() as cursor:
        # Check if column exists
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'master_ledgers'
            AND COLUMN_NAME = 'parent_ledger_id'
        """)
        if cursor.fetchone()[0] == 0:
            cursor.execute("ALTER TABLE master_ledgers ADD COLUMN parent_ledger_id INT NULL")


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0009_add_hierarchy_fields'),
    ]

    operations = [
        migrations.RunPython(add_parent_ledger_column, reverse_code=migrations.RunPython.noop),
    ]
