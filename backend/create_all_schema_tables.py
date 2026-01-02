import mysql.connector

print("="*100)
print("CREATING ALL TABLES FROM SCHEMA.SQL")
print("="*100)

# Read schema.sql
with open('../schema.sql', 'r', encoding='utf-8') as f:
    schema_content = f.read()

# Connect to database
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Ulaganathan123",
    database="ai_accounting"
)
cursor = conn.cursor()

print("\nCurrent tables in database:")
cursor.execute("SHOW TABLES")
current_tables = [row[0] for row in cursor.fetchall()]
print(f"  Total: {len(current_tables)} tables")
for table in sorted(current_tables):
    print(f"    - {table}")

print("\n" + "="*100)
print("EXECUTING SCHEMA.SQL...")
print("="*100)

# Split the schema into individual statements
statements = []
current_statement = []

for line in schema_content.split('\n'):
    # Skip comments and empty lines
    stripped = line.strip()
    if stripped.startswith('--') or not stripped:
        continue
    
    current_statement.append(line)
    
    # Check if statement is complete (ends with semicolon)
    if stripped.endswith(';'):
        statement = '\n'.join(current_statement)
        if 'CREATE TABLE' in statement.upper():
            statements.append(statement)
        current_statement = []

print(f"\nFound {len(statements)} CREATE TABLE statements in schema.sql")

# Execute each CREATE TABLE statement
created_count = 0
skipped_count = 0
error_count = 0

for statement in statements:
    try:
        # Extract table name
        import re
        match = re.search(r'CREATE TABLE IF NOT EXISTS `?(\w+)`?', statement, re.IGNORECASE)
        if match:
            table_name = match.group(1)
            
            cursor.execute(statement)
            conn.commit()
            
            if table_name in current_tables:
                print(f"  [SKIP] Table already exists: {table_name}")
                skipped_count += 1
            else:
                print(f"  [CREATE] Created table: {table_name}")
                created_count += 1
    except Exception as e:
        error_count += 1
        print(f"  [ERROR] Failed to create table: {e}")
        conn.rollback()

print("\n" + "="*100)
print("VERIFICATION")
print("="*100)

cursor.execute("SHOW TABLES")
final_tables = [row[0] for row in cursor.fetchall()]

print(f"\nTables in database after execution: {len(final_tables)}")
for table in sorted(final_tables):
    cursor.execute(f"SELECT COUNT(*) FROM `{table}`")
    count = cursor.fetchone()[0]
    status = "[NEW]" if table not in current_tables else "[EXISTING]"
    print(f"  {status} {table:<50} ({count} rows)")

cursor.close()
conn.close()

print("\n" + "="*100)
print("SUMMARY")
print("="*100)
print(f"  Tables created: {created_count}")
print(f"  Tables skipped (already exist): {skipped_count}")
print(f"  Errors: {error_count}")
print(f"  Total tables in database: {len(final_tables)}")
print("="*100)
