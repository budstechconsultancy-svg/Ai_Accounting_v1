import mysql.connector
import re

# Read schema.sql
with open('../schema.sql', 'r', encoding='utf-8') as f:
    schema_content = f.read()

# Extract table names from schema.sql
pattern = r'CREATE TABLE IF NOT EXISTS `?(\w+)`?'
schema_tables = set(re.findall(pattern, schema_content, re.IGNORECASE))

# Connect to database
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Ulaganathan123",
    database="ai_accounting"
)
cursor = conn.cursor()

# Get all database tables
cursor.execute("SHOW TABLES")
db_tables = set([row[0] for row in cursor.fetchall()])

# Find extra tables
extra_tables = db_tables - schema_tables

print("="*80)
print("REMOVING EXTRA TABLES FROM DATABASE")
print("="*80)

print(f"\nSchema.sql defines: {len(schema_tables)} tables")
print(f"Database has: {len(db_tables)} tables")
print(f"Extra tables to remove: {len(extra_tables)}")

if not extra_tables:
    print("\n[OK] No extra tables to remove!")
    cursor.close()
    conn.close()
    exit(0)

print("\nExtra tables (NOT in schema.sql):")
print("-"*80)
for table in sorted(extra_tables):
    cursor.execute(f"SELECT COUNT(*) FROM `{table}`")
    count = cursor.fetchone()[0]
    print(f"  - {table:<50} ({count} rows)")

print("\n" + "="*80)
print("REMOVING TABLES...")
print("="*80)

removed_count = 0
failed_count = 0

for table in sorted(extra_tables):
    try:
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        cursor.execute(f"DROP TABLE IF EXISTS `{table}`")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
        conn.commit()
        print(f"  [OK] Dropped: {table}")
        removed_count += 1
    except Exception as e:
        print(f"  [ERROR] Failed to drop {table}: {e}")
        failed_count += 1
        conn.rollback()

print("\n" + "="*80)
print("SUMMARY")
print("="*80)
print(f"Successfully removed: {removed_count} tables")
print(f"Failed: {failed_count} tables")

# Show remaining tables
cursor.execute("SHOW TABLES")
remaining = cursor.fetchall()
print(f"\nRemaining tables in database: {len(remaining)}")

cursor.close()
conn.close()

print("\n[OK] Cleanup complete!")
print("="*80)
