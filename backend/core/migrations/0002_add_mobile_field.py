# Migration to add mobile field to company_informations table

from django.db import migrations, models


def add_mobile_column(apps, schema_editor):
    """Add mobile column to company_informations table"""
    with schema_editor.connection.cursor() as cursor:
        # Check if column exists
        cursor.execute("""
            SELECT COUNT(*)
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'company_informations'
            AND COLUMN_NAME = 'mobile'
        """)
        if cursor.fetchone()[0] == 0:
            cursor.execute("ALTER TABLE company_informations ADD COLUMN mobile VARCHAR(20) NULL")


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),  # Adjust this to your latest migration
    ]

    operations = [
        migrations.RunPython(add_mobile_column, reverse_code=migrations.RunPython.noop),
    ]
