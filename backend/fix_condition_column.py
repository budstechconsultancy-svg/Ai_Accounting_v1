import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Ulaganathan123",
    database="ai_accounting"
)

cursor = conn.cursor()

print("="*80)
print("FIXING QUESTIONS TABLE COLUMN NAME")
print("="*80)

# Check current structure
print("\nCurrent structure:")
cursor.execute("DESCRIBE questions")
for col in cursor.fetchall():
    print(f"  - {col[0]} ({col[1]})")

print("\n" + "-"*80)
print("Renaming 'condition_rule' to 'condition' to match schema.sql...")
print("-"*80)

try:
    cursor.execute("""
        ALTER TABLE questions 
        CHANGE COLUMN `condition_rule` `condition` VARCHAR(255)
    """)
    conn.commit()
    print("✅ Column renamed successfully!")
except Exception as e:
    print(f"✗ Error: {e}")
    conn.rollback()

print("\nNew structure:")
cursor.execute("DESCRIBE questions")
for col in cursor.fetchall():
    print(f"  - {col[0]} ({col[1]})")

# Verify data is intact
cursor.execute("SELECT COUNT(*) FROM questions WHERE `condition` IS NOT NULL")
count = cursor.fetchone()[0]
print(f"\n✅ Questions with condition values: {count}")

cursor.close()
conn.close()

print("\n" + "="*80)
print("✅ Column name fixed to match schema.sql!")
print("="*80)
