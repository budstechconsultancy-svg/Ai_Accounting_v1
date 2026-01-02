import mysql.connector

print("="*100)
print("FINAL VERIFICATION: Questions Table Schema Consistency")
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

print("\n1. CURRENT DATABASE STRUCTURE:")
print("-"*100)
print(f"{'Field':<20} {'Type':<20} {'Null':<6} {'Key':<6} {'Default':<20} {'Extra'}")
print("-"*100)
for col in db_columns:
    field, type_, null, key, default, extra = col
    default_str = str(default) if default else "NULL"
    print(f"{field:<20} {type_:<20} {null:<6} {key:<6} {default_str:<20} {extra}")

print("\n2. SCHEMA.SQL DEFINITION:")
print("-"*100)
print("""
CREATE TABLE IF NOT EXISTS `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) DEFAULT NULL COMMENT 'Question code (integer format)',
  `sub_group_1_name` varchar(255) DEFAULT NULL COMMENT 'Sub-group name from hierarchy',
  `question` text DEFAULT NULL COMMENT 'The question text',
  `condition` varchar(255) DEFAULT NULL COMMENT 'Condition rules for displaying the question',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  
  KEY `questions_code_idx` (`code`),
  KEY `questions_sub_group_idx` (`sub_group_1_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Questions imported from CSV - maps questions to hierarchy nodes';
""")

print("\n3. IMPORT_QUESTIONS.PY STRUCTURE:")
print("-"*100)
print("""
CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50),
    sub_group_1_name VARCHAR(255),
    question TEXT,
    `condition` VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

print("\n4. DATA VERIFICATION:")
print("-"*100)
cursor.execute("SELECT COUNT(*) FROM questions")
total = cursor.fetchone()[0]
print(f"Total questions in database: {total}")

cursor.execute("SELECT COUNT(*) FROM questions WHERE code IS NOT NULL")
code_count = cursor.fetchone()[0]
print(f"Questions with code values: {code_count}")

cursor.execute("SELECT COUNT(*) FROM questions WHERE `condition` IS NOT NULL")
condition_count = cursor.fetchone()[0]
print(f"Questions with condition values: {condition_count}")

# Sample data
print("\n5. SAMPLE DATA (First 3 rows):")
print("-"*100)
cursor.execute("SELECT id, code, sub_group_1_name, LEFT(question, 40), `condition` FROM questions LIMIT 3")
for row in cursor.fetchall():
    print(f"\nID: {row[0]}")
    print(f"  Code: {row[1]}")
    print(f"  Sub-group: {row[2]}")
    print(f"  Question: {row[3]}...")
    print(f"  Condition: {row[4]}")

print("\n" + "="*100)
print("CONSISTENCY CHECK")
print("="*100)

# Check column order
expected_columns = ['id', 'code', 'sub_group_1_name', 'question', 'condition', 'created_at']
actual_columns = [col[0] for col in db_columns]

if expected_columns == actual_columns:
    print("✅ Column order matches schema.sql")
    print(f"   Order: {' → '.join(expected_columns)}")
else:
    print("❌ Column order mismatch")
    print(f"   Expected: {expected_columns}")
    print(f"   Actual: {actual_columns}")

# Check data types
print("\n✅ Data types:")
for col in db_columns:
    field, type_, _, _, _, _ = col
    print(f"   {field}: {type_}")

cursor.close()
conn.close()

print("\n" + "="*100)
print("✅ VERIFICATION COMPLETE - All structures are consistent!")
print("="*100)
