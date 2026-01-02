import pandas as pd
import mysql.connector
import sys

# Read CSV
print("Reading CSV file...")
df = pd.read_csv("C:/108/ai/final_transformed_questions.csv")

print(f"Found {len(df)} rows in CSV")
print(f"Columns: {df.columns.tolist()}")

# Connect to MySQL
print("\nConnecting to MySQL database...")
try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Ulaganathan123",
        database="ai_accounting"
    )
    print("✓ Connected successfully")
except Exception as e:
    print(f"✗ Connection failed: {e}")
    sys.exit(1)

cursor = conn.cursor()

# Check if table exists
print("\nChecking if 'questions' table exists...")
cursor.execute("SHOW TABLES LIKE 'questions'")
result = cursor.fetchone()

if not result:
    print("✗ Table 'questions' does not exist!")
    print("\nCreating 'questions' table...")
    cursor.execute("""
        CREATE TABLE questions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sub_group_1_1 VARCHAR(255),
            sub_group_1_2 VARCHAR(50),
            question TEXT,
            condition_rule VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("✓ Table created successfully")
else:
    print("✓ Table exists")

# Clear existing data (optional - comment out if you want to keep existing data)
print("\nClearing existing data...")
cursor.execute("DELETE FROM questions")
print(f"✓ Deleted {cursor.rowcount} existing rows")

# Insert data
print("\nInserting data...")
inserted_count = 0
error_count = 0

for idx, row in df.iterrows():
    try:
        # Handle NaN values and convert code to integer (not decimal)
        if pd.isna(row.get("code")):
            sub_group_1_2 = None
        else:
            # Convert to int to remove decimal point
            sub_group_1_2 = str(int(float(row["code"])))
        
        sub_group_1_1 = None if pd.isna(row.get("sub_group_1_name")) else str(row["sub_group_1_name"])
        question = None if pd.isna(row.get("question")) else str(row["question"])
        
        # Use correct column name from CSV: 'condition_rule' not 'condition'
        condition = None if pd.isna(row.get("condition_rule")) else str(row["condition_rule"])
        
        cursor.execute(
            """
            INSERT INTO questions (sub_group_1_1, sub_group_1_2, question, condition_rule)
            VALUES (%s, %s, %s, %s)
            """,
            (sub_group_1_1, sub_group_1_2, question, condition)
        )
        inserted_count += 1
        
        if (idx + 1) % 10 == 0:
            print(f"  Inserted {idx + 1} rows...", end='\r')
            
    except Exception as e:
        error_count += 1
        print(f"\n✗ Error inserting row {idx}: {e}")
        print(f"  Row data: code={row.get('code')}, sub_group={row.get('sub_group_1_name')}, condition={row.get('condition_rule')}")

# Commit changes
conn.commit()

print(f"\n\n{'='*50}")
print(f"✓ Import completed successfully!")
print(f"{'='*50}")
print(f"Total rows processed: {len(df)}")
print(f"Successfully inserted: {inserted_count}")
print(f"Errors: {error_count}")

# Show sample data
print("\nSample data from database:")
cursor.execute("SELECT * FROM questions LIMIT 3")
for row in cursor.fetchall():
    print(f"  ID: {row[0]}, Code: {row[1]}, Group: {row[2]}")

# Close connection
cursor.close()
conn.close()
print("\n✓ Database connection closed")
