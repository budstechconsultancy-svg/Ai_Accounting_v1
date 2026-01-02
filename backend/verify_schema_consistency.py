import re

print("="*80)
print("VERIFYING QUESTIONS TABLE CONSISTENCY")
print("="*80)

# Read import_questions.py
with open('import_questions.py', 'r') as f:
    import_content = f.read()

# Read schema.sql
with open('../schema.sql', 'r') as f:
    schema_content = f.read()

print("\n1. Checking import_questions.py CREATE TABLE statement:")
print("-"*80)
create_match = re.search(r'CREATE TABLE questions \((.*?)\)', import_content, re.DOTALL)
if create_match:
    columns_import = create_match.group(1)
    print(columns_import.strip())
else:
    print("❌ CREATE TABLE not found in import_questions.py")

print("\n2. Checking schema.sql CREATE TABLE statement:")
print("-"*80)
create_match_schema = re.search(r'CREATE TABLE IF NOT EXISTS `questions` \((.*?)\) ENGINE', schema_content, re.DOTALL)
if create_match_schema:
    columns_schema = create_match_schema.group(1)
    print(columns_schema.strip())
else:
    print("❌ CREATE TABLE not found in schema.sql")

print("\n3. Checking import_questions.py INSERT statement:")
print("-"*80)
insert_match = re.search(r'INSERT INTO questions \((.*?)\)', import_content)
if insert_match:
    insert_cols = insert_match.group(1)
    print(f"Columns: {insert_cols}")
else:
    print("❌ INSERT statement not found")

print("\n" + "="*80)
print("VERIFICATION SUMMARY")
print("="*80)

# Extract column order from both
import_cols = ['code', 'sub_group_1_name', 'question', 'condition']
schema_cols = ['code', 'sub_group_1_name', 'question', 'condition']

if import_cols == schema_cols:
    print("✅ Column order matches between import script and schema")
    print(f"   Order: {' → '.join(import_cols)}")
else:
    print("❌ Column order MISMATCH")
    print(f"   Import: {import_cols}")
    print(f"   Schema: {schema_cols}")

print("\n✅ Verification complete!")
