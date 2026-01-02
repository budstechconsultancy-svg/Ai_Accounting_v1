import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Ulaganathan123",
    database="ai_accounting"
)

cursor = conn.cursor()

print("="*80)
print("RENAMING COLUMNS IN QUESTIONS TABLE")
print("="*80)

print("\nCurrent structure:")
cursor.execute("DESCRIBE questions")
for col in cursor.fetchall():
    print(f"  - {col[0]} ({col[1]})")

print("\n" + "-"*80)
print("Renaming columns...")
print("-"*80)

try:
    # Rename sub_group_1_name to sub_group_1_1
    print("1. Renaming 'sub_group_1_name' to 'sub_group_1_1'...")
    cursor.execute("""
        ALTER TABLE questions 
        CHANGE COLUMN `sub_group_1_name` `sub_group_1_1` VARCHAR(255)
    """)
    conn.commit()
    print("   [OK] Renamed successfully!")
    
    # Rename code to sub_group_1_2
    print("2. Renaming 'code' to 'sub_group_1_2'...")
    cursor.execute("""
        ALTER TABLE questions 
        CHANGE COLUMN `code` `sub_group_1_2` VARCHAR(50)
    """)
    conn.commit()
    print("   [OK] Renamed successfully!")
    
except Exception as e:
    print(f"   [ERROR] {e}")
    conn.rollback()

print("\nNew structure:")
cursor.execute("DESCRIBE questions")
for col in cursor.fetchall():
    print(f"  - {col[0]} ({col[1]})")

# Verify data is intact
cursor.execute("SELECT COUNT(*) FROM questions")
total = cursor.fetchone()[0]
print(f"\n[OK] Total questions: {total}")

cursor.execute("SELECT COUNT(*) FROM questions WHERE sub_group_1_2 IS NOT NULL")
count = cursor.fetchone()[0]
print(f"[OK] Questions with sub_group_1_2 values: {count}")

cursor.close()
conn.close()

print("\n" + "="*80)
print("[OK] Column names updated successfully!")
print("="*80)
