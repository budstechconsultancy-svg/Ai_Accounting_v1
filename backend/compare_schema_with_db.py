import mysql.connector
import re

# Read schema.sql and extract table names
print("="*100)
print("COMPARING DATABASE TABLES WITH SCHEMA.SQL")
print("="*100)

with open('../schema.sql', 'r', encoding='utf-8') as f:
    schema_content = f.read()

# Extract table names from CREATE TABLE statements
schema_tables = set()
pattern = r'CREATE TABLE IF NOT EXISTS `?(\w+)`?'
matches = re.findall(pattern, schema_content, re.IGNORECASE)
schema_tables = set(matches)

print(f"\n[OK] Tables defined in schema.sql ({len(schema_tables)} tables):")
print("-"*100)
for table in sorted(schema_tables):
    print(f"  - {table}")

# Connect to database
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Ulaganathan123",
    database="ai_accounting"
)
cursor = conn.cursor()

# Get all tables in database
cursor.execute("SHOW TABLES")
db_tables = set([row[0] for row in cursor.fetchall()])

print(f"\n[OK] Tables in database ({len(db_tables)} tables):")
print("-"*100)
for table in sorted(db_tables):
    print(f"  - {table}")

# Find differences
extra_in_db = db_tables - schema_tables
missing_in_db = schema_tables - db_tables

print(f"\n{'='*100}")
print("ANALYSIS")
print("="*100)

if extra_in_db:
    print(f"\n[WARNING] EXTRA tables in database (NOT in schema.sql) - {len(extra_in_db)} tables:")
    print("-"*100)
    for table in sorted(extra_in_db):
        cursor.execute(f"SELECT COUNT(*) FROM `{table}`")
        count = cursor.fetchone()[0]
        print(f"  - {table:<50} ({count} rows)")
else:
    print("\n[OK] No extra tables in database")

if missing_in_db:
    print(f"\n[WARNING] MISSING tables (in schema.sql but NOT in database) - {len(missing_in_db)} tables:")
    print("-"*100)
    for table in sorted(missing_in_db):
        print(f"  - {table}")
else:
    print("\n[OK] All schema.sql tables exist in database")

cursor.close()
conn.close()

print(f"\n{'='*100}")
print("SUMMARY")
print("="*100)
print(f"Schema.sql tables: {len(schema_tables)}")
print(f"Database tables: {len(db_tables)}")
print(f"Extra in database: {len(extra_in_db)}")
print(f"Missing in database: {len(missing_in_db)}")

if extra_in_db:
    print(f"\n[ACTION NEEDED] To keep only schema.sql tables, we need to remove {len(extra_in_db)} extra tables.")
else:
    print("\n[OK] Database matches schema.sql perfectly!")

print("="*100)
