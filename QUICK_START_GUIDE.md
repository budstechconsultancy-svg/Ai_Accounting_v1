# ⚡ QUICK START GUIDE - Dynamic Questions System

## 🎯 Goal
Get the dynamic questions system up and running in **under 1 hour**.

---

## 📋 Prerequisites

- ✅ MySQL database running
- ✅ Python 3.8+ installed
- ✅ Django project set up
- ✅ Access to database credentials

---

## 🚀 STEP-BY-STEP IMPLEMENTATION

### **STEP 1: Apply Database Schema** (5 minutes)

```bash
# Navigate to your project directory
cd "c:\108\AI-accounting-finalist-dev (9)"

# Apply the schema
mysql -u root -p ai_accounting < schema_questions_system.sql

# Verify tables were created
mysql -u root -p ai_accounting -e "SHOW TABLES LIKE 'master_questions';"
mysql -u root -p ai_accounting -e "SHOW TABLES LIKE 'hierarchy_question_mapping';"

# Verify master_ledgers was updated
mysql -u root -p ai_accounting -e "DESCRIBE master_ledgers;"
# You should see 'code' and 'additional_data' fields
```

**✅ Checkpoint:** Tables `master_questions` and `hierarchy_question_mapping` exist, and `master_ledgers` has `code` and `additional_data` fields.

---

### **STEP 2: Install Python Dependencies** (2 minutes)

```bash
# Install required packages
pip install pandas openpyxl mysql-connector-python
```

---

### **STEP 3: Generate Excel Template** (1 minute)

```bash
# Generate sample Excel template
python scripts/import_questions.py --create-template

# This creates: questions_config_template.xlsx
```

**✅ Checkpoint:** File `questions_config_template.xlsx` exists in your project directory.

---

### **STEP 4: Customize Your Questions** (10 minutes)

Open `questions_config_template.xlsx` and customize:

#### **Sheet 1: Questions Master**

Add your questions. Example:

| question_code | question_text | question_type | is_required | validation_rules | help_text | display_order |
|---------------|---------------|---------------|-------------|------------------|-----------|---------------|
| Q_OPENING_BALANCE | Opening Balance | decimal | 1 | {"min": 0, "max": 999999999.99, "decimal_places": 2} | Enter opening balance | 1 |
| Q_GSTIN | GSTIN | gstin | 0 | {"pattern": "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"} | Enter 15-digit GSTIN | 2 |

#### **Sheet 2: Hierarchy Question Mapping**

Map questions to hierarchy nodes. Example:

| category | group | sub_group_1 | sub_group_2 | sub_group_3 | ledger_type | question_code |
|----------|-------|-------------|-------------|-------------|-------------|---------------|
| Assets | Current Assets | Sundry Debtors | | | | Q_OPENING_BALANCE |
| Assets | Current Assets | Sundry Debtors | | | | Q_GSTIN |

**💡 Tip:** Leave cells blank (not NULL) for hierarchy levels you don't want to match.

**✅ Checkpoint:** Excel file has your questions and mappings.

---

### **STEP 5: Import Questions to Database** (2 minutes)

```bash
# Import from Excel to database
python scripts/import_questions.py \
  --excel questions_config_template.xlsx \
  --host localhost \
  --user root \
  --password YOUR_PASSWORD \
  --database ai_accounting

# You should see output like:
# ✅ Connected to database successfully
# 📂 Reading Excel file: questions_config_template.xlsx
# ✅ Import completed successfully!
```

**✅ Checkpoint:** Questions are in database. Verify:

```bash
mysql -u root -p ai_accounting -e "SELECT COUNT(*) FROM master_questions;"
mysql -u root -p ai_accounting -e "SELECT COUNT(*) FROM hierarchy_question_mapping;"
```

---

### **STEP 6: Update Django Models** (5 minutes)

Edit `accounting/models.py`:

```python
# accounting/models.py

from django.db import models

class MasterLedger(models.Model):
    id = models.BigAutoField(primary_key=True)
    tenant_id = models.CharField(max_length=36)
    name = models.CharField(max_length=255)
    
    # ✅ NEW FIELDS
    code = models.CharField(max_length=50, null=True, blank=True)
    
    # Hierarchy fields
    category = models.CharField(max_length=255)
    group = models.CharField(max_length=255)
    sub_group_1 = models.CharField(max_length=255, null=True, blank=True)
    sub_group_2 = models.CharField(max_length=255, null=True, blank=True)
    sub_group_3 = models.CharField(max_length=255, null=True, blank=True)
    ledger_type = models.CharField(max_length=255, null=True, blank=True)
    
    # ✅ NEW FIELD
    additional_data = models.JSONField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'master_ledgers'
        unique_together = [['name', 'tenant_id']]
```

**✅ Checkpoint:** Model updated with `code` and `additional_data` fields.

---

### **STEP 7: Create Django Migration** (3 minutes)

```bash
# Create migration (Django will detect the new fields)
python manage.py makemigrations accounting

# Apply migration
python manage.py migrate accounting
```

**✅ Checkpoint:** Migration applied successfully.

---

### **STEP 8: Create API Views** (10 minutes)

Create `accounting/views_questions.py`:

```python
# accounting/views_questions.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
import json

class LedgerQuestionsView(APIView):
    """Get questions for a hierarchy node"""
    
    def post(self, request):
        category = request.data.get('category')
        group = request.data.get('group')
        sub_group_1 = request.data.get('sub_group_1')
        sub_group_2 = request.data.get('sub_group_2')
        sub_group_3 = request.data.get('sub_group_3')
        ledger_type = request.data.get('ledger_type')
        
        # Get questions
        questions = self.get_questions(
            category, group, sub_group_1, sub_group_2, sub_group_3, ledger_type
        )
        
        # Get code from hierarchy
        code = self.get_hierarchy_code(
            category, group, sub_group_1, sub_group_2, sub_group_3, ledger_type
        )
        
        return Response({
            'success': True,
            'hierarchy_node': {
                'category': category,
                'group': group,
                'sub_group_1': sub_group_1,
                'code': code
            },
            'questions': questions
        })
    
    def get_questions(self, category, group, sub_group_1, sub_group_2, sub_group_3, ledger_type):
        """Fetch questions from database"""
        with connection.cursor() as cursor:
            # Build WHERE clause
            where_parts = []
            params = []
            
            for field, value in [
                ('category', category),
                ('`group`', group),
                ('sub_group_1', sub_group_1),
                ('sub_group_2', sub_group_2),
                ('sub_group_3', sub_group_3),
                ('ledger_type', ledger_type)
            ]:
                if value:
                    where_parts.append(f"{field} = %s")
                    params.append(value)
                else:
                    where_parts.append(f"{field} IS NULL")
            
            query = f"""
                SELECT 
                    q.question_code,
                    q.question_text,
                    q.question_type,
                    q.is_required,
                    q.validation_rules,
                    q.default_value,
                    q.help_text,
                    q.display_order
                FROM hierarchy_question_mapping hqm
                JOIN master_questions q ON hqm.question_id = q.id
                WHERE {' AND '.join(where_parts)}
                ORDER BY q.display_order
            """
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            questions = []
            for row in rows:
                questions.append({
                    'question_code': row[0],
                    'question_text': row[1],
                    'question_type': row[2],
                    'is_required': bool(row[3]),
                    'validation_rules': json.loads(row[4]) if row[4] else None,
                    'default_value': row[5],
                    'help_text': row[6],
                    'display_order': row[7]
                })
            
            return questions
    
    def get_hierarchy_code(self, category, group, sub_group_1, sub_group_2, sub_group_3, ledger_type):
        """Get code from master_hierarchy_raw"""
        with connection.cursor() as cursor:
            where_parts = []
            params = []
            
            if category:
                where_parts.append("major_group_1 = %s")
                params.append(category)
            if group:
                where_parts.append("group_1 = %s")
                params.append(group)
            if sub_group_1:
                where_parts.append("sub_group_1_1 = %s")
                params.append(sub_group_1)
            
            query = f"""
                SELECT code FROM master_hierarchy_raw
                WHERE {' AND '.join(where_parts)}
                LIMIT 1
            """
            
            cursor.execute(query, params)
            row = cursor.fetchone()
            return row[0] if row else None
```

**✅ Checkpoint:** API view created.

---

### **STEP 9: Add URL Route** (2 minutes)

Edit `accounting/urls.py`:

```python
# accounting/urls.py

from django.urls import path
from .views_questions import LedgerQuestionsView

urlpatterns = [
    # ... existing URLs
    path('ledgers/questions/', LedgerQuestionsView.as_view(), name='ledger-questions'),
]
```

**✅ Checkpoint:** URL route added.

---

### **STEP 10: Test the API** (5 minutes)

```bash
# Start Django server
python manage.py runserver

# In another terminal, test the API
curl -X POST http://localhost:8000/api/ledgers/questions/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "category": "Assets",
    "group": "Current Assets",
    "sub_group_1": "Sundry Debtors"
  }'

# Expected response:
# {
#   "success": true,
#   "hierarchy_node": {
#     "category": "Assets",
#     "group": "Current Assets",
#     "sub_group_1": "Sundry Debtors",
#     "code": "1010201000000000"
#   },
#   "questions": [
#     {
#       "question_code": "Q_OPENING_BALANCE",
#       "question_text": "Opening Balance",
#       "question_type": "decimal",
#       "is_required": true,
#       ...
#     }
#   ]
# }
```

**✅ Checkpoint:** API returns questions successfully!

---

## 🎉 SUCCESS!

You now have a working dynamic questions system!

---

## 🔧 TROUBLESHOOTING

### **Issue: Tables not created**
```bash
# Check if SQL file was applied
mysql -u root -p ai_accounting -e "SHOW TABLES;"

# If not, run again:
mysql -u root -p ai_accounting < schema_questions_system.sql
```

### **Issue: Import script fails**
```bash
# Check Python dependencies
pip list | grep pandas
pip list | grep openpyxl
pip list | grep mysql-connector

# Reinstall if missing
pip install pandas openpyxl mysql-connector-python
```

### **Issue: No questions returned from API**
```bash
# Check if questions were imported
mysql -u root -p ai_accounting -e "SELECT * FROM master_questions LIMIT 5;"
mysql -u root -p ai_accounting -e "SELECT * FROM hierarchy_question_mapping LIMIT 5;"

# If empty, re-run import:
python scripts/import_questions.py --excel questions_config_template.xlsx --password YOUR_PASSWORD
```

### **Issue: Code field is NULL**
```bash
# Check if master_hierarchy_raw has data
mysql -u root -p ai_accounting -e "SELECT * FROM master_hierarchy_raw LIMIT 5;"

# If empty, you need to import your hierarchy data first
```

---

## 📚 NEXT STEPS

1. **Add more questions** to your Excel file
2. **Map questions to more hierarchy nodes**
3. **Implement ledger creation API** (see `QUESTIONS_SYSTEM_DOCUMENTATION.md`)
4. **Update frontend** to use dynamic questions
5. **Add validation** on backend (see documentation)

---

## 📖 FULL DOCUMENTATION

For complete implementation details, see:
- `EXECUTIVE_SUMMARY.md` - High-level overview
- `QUESTIONS_SYSTEM_DOCUMENTATION.md` - Complete technical documentation
- `schema_questions_system.sql` - Database schema with comments

---

## 🆘 NEED HELP?

If you encounter any issues:

1. Check the **Troubleshooting** section above
2. Review the **Full Documentation**
3. Verify each **Checkpoint** was successful
4. Check Django logs for errors

---

**You're all set! 🚀**
