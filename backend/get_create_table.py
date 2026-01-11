try:
    with open('migration_sql.txt', 'r', encoding='utf-16') as f:
        content = f.read()
except UnicodeError:
    with open('migration_sql.txt', 'r', encoding='utf-8') as f:
        content = f.read()

start = content.find("CREATE TABLE `vouchers`")
if start == -1:
    print("Vouchers table Not found")
else:
    end = content.find(";", start)
    print(content[start:end+1])
