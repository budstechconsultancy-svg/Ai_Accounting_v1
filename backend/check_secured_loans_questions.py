import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Ulaganathan123",
    database="ai_accounting"
)
cursor = conn.cursor()

# Get questions for Secured Loans
cursor.execute("""
    SELECT sub_group_1_1, sub_group_1_2, question, condition_rule 
    FROM questions 
    WHERE sub_group_1_1 LIKE '%Secured%' OR sub_group_1_1 LIKE '%Loan%'
    LIMIT 10
""")

print("Questions for Secured Loans:")
print("="*80)
for row in cursor.fetchall():
    print(f"\nSub-group: {row[0]}")
    print(f"Code: {row[1]}")
    print(f"Question: {row[2]}")
    print(f"Condition: {row[3]}")
    print("-"*80)

cursor.close()
conn.close()
