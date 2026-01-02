import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Ulaganathan123",
    database="ai_accounting"
)

cursor = conn.cursor()

# Get total count
cursor.execute("SELECT COUNT(*) FROM questions")
total = cursor.fetchone()[0]
print(f"✓ Total questions in database: {total}")

# Get sample data with conditions
print("\nSample questions with conditions:")
print("=" * 100)
cursor.execute("""
    SELECT id, code, sub_group_1_name, 
           LEFT(question, 40) as question_preview, 
           `condition`
    FROM questions 
    WHERE `condition` IS NOT NULL 
    LIMIT 10
""")

for row in cursor.fetchall():
    print(f"\nID: {row[0]}")
    print(f"  Code: {row[1]} (type: {type(row[1]).__name__})")
    print(f"  Group: {row[2]}")
    print(f"  Question: {row[3]}...")
    print(f"  Condition: {row[4]}")

# Check for NULL conditions
cursor.execute("SELECT COUNT(*) FROM questions WHERE `condition` IS NULL")
null_count = cursor.fetchone()[0]
print(f"\n{'='*100}")
print(f"Questions with NULL conditions: {null_count}")
print(f"Questions with valid conditions: {total - null_count}")

cursor.close()
conn.close()
