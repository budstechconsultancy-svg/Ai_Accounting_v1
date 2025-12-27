import mysql.connector

# Connect to database
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='Ulaganathan123',
    database='ai_accounting'
)

cursor = conn.cursor()

# Get table structure
cursor.execute("""
    SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT, EXTRA
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA='ai_accounting' AND TABLE_NAME='master_hierarchy_raw' 
    ORDER BY ORDINAL_POSITION
""")

columns = cursor.fetchall()

print("-- Master Hierarchy Raw (Global Chart of Accounts)")
print("-- Stores the complete hierarchy: Type of Business → Financial Reporting → Major Group → Group → Sub-Group → Ledger")
print("CREATE TABLE IF NOT EXISTS `master_hierarchy_raw` (")

column_defs = []
for col in columns:
    col_name, col_type, is_nullable, col_key, col_default, extra = col
    
    # Build column definition
    col_def = f"  `{col_name}` {col_type}"
    
    # Add NOT NULL if applicable
    if is_nullable == 'NO':
        col_def += " NOT NULL"
    
    # Add AUTO_INCREMENT if applicable
    if 'auto_increment' in extra.lower():
        col_def += " AUTO_INCREMENT"
    
    # Add DEFAULT if applicable
    if col_default is not None:
        if col_default == 'CURRENT_TIMESTAMP':
            col_def += f" DEFAULT {col_default}"
        else:
            col_def += f" DEFAULT '{col_default}'"
    
    column_defs.append(col_def)

# Print column definitions
for i, col_def in enumerate(column_defs):
    if i < len(column_defs) - 1:
        print(col_def + ",")
    else:
        print(col_def)

# Get primary key
cursor.execute("""
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA='ai_accounting' AND TABLE_NAME='master_hierarchy_raw' AND CONSTRAINT_NAME='PRIMARY'
    ORDER BY ORDINAL_POSITION
""")
pk_cols = [row[0] for row in cursor.fetchall()]
if pk_cols:
    print(f"  PRIMARY KEY (`{'`, `'.join(pk_cols)}`)")

print(") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;")

cursor.close()
conn.close()
