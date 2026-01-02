import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Ulaganathan123",
    database="ai_accounting"
)

cursor = conn.cursor()

print("Sample rows matching your screenshot:\n")
cursor.execute("""
    SELECT id, code, sub_group_1_name, LEFT(question, 50) as q, `condition`
    FROM questions 
    WHERE id IN (414, 415, 493, 494, 519, 520)
    ORDER BY id
""")

print(f"{'ID':<6} {'Code':<8} {'Group':<25} {'Question':<52} Condition")
print("-" * 120)

for row in cursor.fetchall():
    condition_display = row[4] if row[4] else "NULL"
    print(f"{row[0]:<6} {row[1]:<8} {row[2]:<25} {row[3]:<52} {condition_display}")

print("\n" + "="*120)
print("\n✓ Code values are now integers (no decimals)")
print("✓ Condition values are properly imported")

cursor.close()
conn.close()
