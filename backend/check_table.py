import mysql.connector

conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='Ulaganathan123',
    database='ai_accounting'
)

cursor = conn.cursor()
cursor.execute("DESCRIBE vendor_master_category")
print("Table Structure:")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]}")

cursor.close()
conn.close()
