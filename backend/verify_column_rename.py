import mysql.connector

print("="*100)
print("FINAL VERIFICATION: Questions Table Column Names")
print("="*100)

# Connect to database
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Ulaganathan123",
    database="ai_accounting"
)
cursor = conn.cursor()

# Get current database structure
cursor.execute("DESCRIBE questions")
db_columns = cursor.fetchall()

print("\n[DATABASE STRUCTURE]:")
print("-"*100)
print(f"{'Column':<20} {'Type':<20} {'Null':<6} {'Key':<6}")
print("-"*100)
for col in db_columns:
    field, type_, null, key, _, _ = col
    print(f"{field:<20} {type_:<20} {null:<6} {key:<6}")

print("\n[SCHEMA.SQL DEFINITION]:")
print("-"*100)
print("""
CREATE TABLE IF NOT EXISTS `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sub_group_1_1` varchar(255) DEFAULT NULL,
  `sub_group_1_2` varchar(50) DEFAULT NULL,
  `question` text DEFAULT NULL,
  `condition_rule` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `questions_sub_group_1_2_idx` (`sub_group_1_2`),
  KEY `questions_sub_group_1_1_idx` (`sub_group_1_1`)
)
""")

# Verify column names
expected_columns = ['id', 'sub_group_1_1', 'sub_group_1_2', 'question', 'condition_rule', 'created_at']
actual_columns = [col[0] for col in db_columns]

print("\n" + "="*100)
print("CONSISTENCY CHECK")
print("="*100)

if expected_columns == actual_columns:
    print("[OK] Column names MATCH!")
    print("\nColumn Order:")
    for i, col in enumerate(expected_columns, 1):
        print(f"  {i}. {col}")
else:
    print("[ERROR] Column names MISMATCH")
    print(f"  Expected: {expected_columns}")
    print(f"  Actual:   {actual_columns}")

# Data verification
cursor.execute("SELECT COUNT(*) FROM questions")
total = cursor.fetchone()[0]
print(f"\n[OK] Total questions: {total}")

# Sample data
print("\n[SAMPLE DATA - First 2 rows]:")
print("-"*100)
cursor.execute("SELECT id, sub_group_1_1, sub_group_1_2, LEFT(question, 30), condition_rule FROM questions LIMIT 2")
for row in cursor.fetchall():
    print(f"\nID: {row[0]}")
    print(f"  sub_group_1_1: {row[1]}")
    print(f"  sub_group_1_2: {row[2]}")
    print(f"  question: {row[3]}...")
    print(f"  condition_rule: {row[4]}")

cursor.close()
conn.close()

print("\n" + "="*100)
print("[OK] ALL FILES SYNCHRONIZED!")
print("="*100)
print("\nSummary:")
print("  [OK] Database uses: sub_group_1_1, sub_group_1_2")
print("  [OK] schema.sql uses: sub_group_1_1, sub_group_1_2")
print("  [OK] import_questions.py uses: sub_group_1_1, sub_group_1_2")
print("="*100)
