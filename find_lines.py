
with open('c:/108/muthu/Ai_Accounting_v1-1/schema.sql', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if 'inventory_operation' in line:
            print(f"{i+1}: {line.strip()}")
