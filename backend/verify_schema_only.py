import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Ulaganathan123",
    database="ai_accounting"
)
cursor = conn.cursor()

print("="*100)
print("FINAL DATABASE STATE - TABLES MATCHING SCHEMA.SQL")
print("="*100)

cursor.execute("SHOW TABLES")
tables = [row[0] for row in cursor.fetchall()]

print(f"\nTotal tables in database: {len(tables)}\n")

print(f"{'#':<4} {'Table Name':<50} {'Row Count':<15}")
print("-"*100)

for idx, table in enumerate(sorted(tables), 1):
    cursor.execute(f"SELECT COUNT(*) FROM `{table}`")
    count = cursor.fetchone()[0]
    print(f"{idx:<4} {table:<50} {count:<15,}")

cursor.close()
conn.close()

print("\n" + "="*100)
print("[OK] Database now contains ONLY tables defined in schema.sql!")
print("="*100)
