import mysql.connector
import re

# Read schema.sql
with open('../schema.sql', 'r', encoding='utf-8') as f:
    schema_content = f.read()

# Extract table names
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

# Get database tables
cursor.execute("SHOW TABLES")
db_tables = set([row[0] for row in cursor.fetchall()])

# Find differences
extra_in_db = db_tables - schema_tables

print(f"Schema.sql tables: {len(schema_tables)}")
print(f"Database tables: {len(db_tables)}")
print(f"Extra tables in DB: {len(extra_in_db)}")

if extra_in_db:
    print("\nExtra tables to remove:")
    for table in sorted(extra_in_db):
        cursor.execute(f"SELECT COUNT(*) FROM `{table}`")
        count = cursor.fetchone()[0]
        print(f"  {table} ({count} rows)")

cursor.close()
conn.close()
