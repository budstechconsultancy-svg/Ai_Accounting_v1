# 🏗️ DYNAMIC QUESTIONS SYSTEM - COMPLETE DOCUMENTATION

## 📋 TABLE OF CONTENTS
1. [System Overview](#system-overview)
2. [Database Schema Explanation](#database-schema-explanation)
3. [Excel to Database Mapping](#excel-to-database-mapping)
4. [API Flow & Endpoints](#api-flow--endpoints)
5. [Backend Validation Logic](#backend-validation-logic)
6. [Frontend Integration](#frontend-integration)
7. [Long-term Scalability](#long-term-scalability)
8. [Migration Guide](#migration-guide)

---

## 🎯 SYSTEM OVERVIEW

### **Problem Statement**
You need a **data-driven** system where:
- Questions for ledger creation are **NOT hardcoded** in frontend
- Questions are **configurable from Excel**
- Questions appear **dynamically** based on hierarchy node selection
- Answers are **validated** and **stored** in a flexible format

### **Solution Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                     GLOBAL CONFIGURATION                        │
│  (Shared across all tenants - READ ONLY from Excel)            │
├─────────────────────────────────────────────────────────────────┤
│  1. master_hierarchy_raw                                        │
│     - Stores complete chart of accounts hierarchy               │
│     - Contains: category, group, sub-groups, ledger, code       │
│                                                                 │
│  2. master_questions                                            │
│     - Stores all possible questions                             │
│     - Contains: question_code, text, type, validation rules     │
│                                                                 │
│  3. hierarchy_question_mapping                                  │
│     - Maps questions to hierarchy nodes                         │
│     - Defines WHICH questions for WHICH hierarchy selection     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      TENANT DATA                                │
│  (Isolated per tenant - WRITE operations)                       │
├─────────────────────────────────────────────────────────────────┤
│  master_ledgers                                                 │
│     - Stores ledger instances created by tenant                 │
│     - Contains:                                                 │
│       • tenant_id (isolation)                                   │
│       • name (custom ledger name)                               │
│       • code (from master_hierarchy_raw)                        │
│       • category, group, sub_groups, ledger_type (hierarchy)    │
│       • additional_data (JSON - stores question answers)        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 DATABASE SCHEMA EXPLANATION

### **Table 1: `master_questions` (GLOBAL)**

**Purpose:** Central repository of all questions that can be asked during ledger creation.

**Key Fields:**
- `question_code`: Unique identifier (e.g., `Q_OPENING_BALANCE`, `Q_GSTIN`)
- `question_text`: The actual question to display
- `question_type`: Defines input type (text, number, decimal, dropdown, etc.)
- `is_required`: Whether answer is mandatory
- `validation_rules`: JSON object with validation constraints
- `display_order`: Order in which questions appear

**Example Row:**
```json
{
  "question_code": "Q_GSTIN",
  "question_text": "GSTIN",
  "question_type": "gstin",
  "is_required": false,
  "validation_rules": {
    "pattern": "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
  },
  "help_text": "Enter 15-digit GSTIN (e.g., 27AABCU9603R1ZM)",
  "display_order": 4
}
```

---

### **Table 2: `hierarchy_question_mapping` (GLOBAL)**

**Purpose:** Maps questions to specific hierarchy nodes. This is the **BRAIN** of the system.

**How It Works:**
- Each row defines a mapping between a hierarchy path and a question
- When user selects a hierarchy node, backend finds ALL matching mappings
- Returns the list of questions to ask

**Matching Logic:**
```
User selects: Category="Assets", Group="Current Assets", Sub-group="Sundry Debtors"

Backend searches for mappings WHERE:
  category = "Assets" 
  AND group = "Current Assets" 
  AND sub_group_1 = "Sundry Debtors"
  AND sub_group_2 IS NULL
  AND sub_group_3 IS NULL
  AND ledger_type IS NULL

Returns: All questions mapped to this path (Q_OPENING_BALANCE, Q_CREDIT_LIMIT, Q_GSTIN, etc.)
```

**Example Rows:**
```sql
-- For Sundry Debtors (Customers)
category='Assets', group='Current Assets', sub_group_1='Sundry Debtors', question_id=1 (Q_OPENING_BALANCE)
category='Assets', group='Current Assets', sub_group_1='Sundry Debtors', question_id=2 (Q_CREDIT_LIMIT)
category='Assets', group='Current Assets', sub_group_1='Sundry Debtors', question_id=4 (Q_GSTIN)

-- For Bank Accounts
category='Assets', group='Current Assets', sub_group_1='Bank Accounts', question_id=1 (Q_OPENING_BALANCE)
category='Assets', group='Current Assets', sub_group_1='Bank Accounts', question_id=12 (Q_BANK_NAME)
category='Assets', group='Current Assets', sub_group_1='Bank Accounts', question_id=13 (Q_ACCOUNT_NUMBER)
```

---

### **Table 3: `master_ledgers` (TENANT DATA)**

**Purpose:** Stores actual ledger instances created by tenants.

**CRITICAL FIX APPLIED:**
```sql
ALTER TABLE `master_ledgers` 
  ADD COLUMN `code` varchar(50) DEFAULT NULL COMMENT 'Ledger code from master_hierarchy_raw',
  ADD COLUMN `additional_data` json DEFAULT NULL COMMENT 'Stores answers to dynamic questions';
```

**Why `code` is essential:**
- Links ledger to exact hierarchy node in `master_hierarchy_raw`
- Required for financial reporting and compliance
- Ensures data integrity and traceability

**Why `additional_data` is JSON:**
- **Flexibility**: Questions can change without schema migration
- **Scalability**: Different hierarchy nodes have different questions
- **Performance**: Single column vs. 50+ nullable columns
- **Queryability**: MySQL JSON functions allow efficient queries

**Example Row:**
```json
{
  "tenant_id": "abc-123-def-456",
  "name": "HDFC Bank - Current Account",
  "code": "1010101000000001",
  "category": "Assets",
  "group": "Current Assets",
  "sub_group_1": "Bank Accounts",
  "sub_group_2": null,
  "sub_group_3": null,
  "ledger_type": "Bank Account",
  "additional_data": {
    "Q_OPENING_BALANCE": "500000.00",
    "Q_BANK_NAME": "HDFC Bank",
    "Q_ACCOUNT_NUMBER": "50100123456789",
    "Q_IFSC_CODE": "HDFC0001234"
  }
}
```

---

## 📥 EXCEL TO DATABASE MAPPING

### **Excel Structure for Questions**

**Sheet 1: Questions Master**
```
| question_code      | question_text           | question_type | is_required | validation_rules                                    | help_text                    | display_order |
|--------------------|-------------------------|---------------|-------------|-----------------------------------------------------|------------------------------|---------------|
| Q_OPENING_BALANCE  | Opening Balance         | decimal       | 1           | {"min": 0, "max": 999999999.99, "decimal_places": 2} | Enter opening balance        | 1             |
| Q_GSTIN            | GSTIN                   | gstin         | 0           | {"pattern": "^[0-9]{2}[A-Z]{5}[0-9]{4}..."}         | Enter 15-digit GSTIN         | 4             |
| Q_CREDIT_LIMIT     | Credit Limit            | decimal       | 0           | {"min": 0, "max": 999999999.99}                     | Maximum credit allowed       | 2             |
```

**Sheet 2: Hierarchy Question Mapping**
```
| category  | group            | sub_group_1      | sub_group_2 | sub_group_3 | ledger_type | question_code      |
|-----------|------------------|------------------|-------------|-------------|-------------|--------------------|
| Assets    | Current Assets   | Sundry Debtors   |             |             |             | Q_OPENING_BALANCE  |
| Assets    | Current Assets   | Sundry Debtors   |             |             |             | Q_CREDIT_LIMIT     |
| Assets    | Current Assets   | Sundry Debtors   |             |             |             | Q_GSTIN            |
| Assets    | Current Assets   | Bank Accounts    |             |             |             | Q_OPENING_BALANCE  |
| Assets    | Current Assets   | Bank Accounts    |             |             |             | Q_BANK_NAME        |
```

### **Python Import Script**

```python
import pandas as pd
import mysql.connector
import json
from datetime import datetime

def import_questions_from_excel(excel_path, db_config):
    """
    Import questions and mappings from Excel to database
    """
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    
    # Read Excel sheets
    questions_df = pd.read_excel(excel_path, sheet_name='Questions Master')
    mappings_df = pd.read_excel(excel_path, sheet_name='Hierarchy Question Mapping')
    
    # Import Questions
    for _, row in questions_df.iterrows():
        validation_rules = json.loads(row['validation_rules']) if pd.notna(row['validation_rules']) else None
        
        cursor.execute("""
            INSERT INTO master_questions 
            (question_code, question_text, question_type, is_required, 
             validation_rules, default_value, help_text, display_order, 
             created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                question_text = VALUES(question_text),
                question_type = VALUES(question_type),
                is_required = VALUES(is_required),
                validation_rules = VALUES(validation_rules),
                help_text = VALUES(help_text),
                display_order = VALUES(display_order),
                updated_at = VALUES(updated_at)
        """, (
            row['question_code'],
            row['question_text'],
            row['question_type'],
            row['is_required'],
            json.dumps(validation_rules) if validation_rules else None,
            row.get('default_value'),
            row.get('help_text'),
            row['display_order'],
            datetime.now(),
            datetime.now()
        ))
    
    # Import Mappings
    for _, row in mappings_df.iterrows():
        # Get question_id from question_code
        cursor.execute(
            "SELECT id FROM master_questions WHERE question_code = %s",
            (row['question_code'],)
        )
        question_id = cursor.fetchone()[0]
        
        cursor.execute("""
            INSERT INTO hierarchy_question_mapping 
            (category, `group`, sub_group_1, sub_group_2, sub_group_3, 
             ledger_type, question_id, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            row['category'] if pd.notna(row['category']) else None,
            row['group'] if pd.notna(row['group']) else None,
            row['sub_group_1'] if pd.notna(row['sub_group_1']) else None,
            row['sub_group_2'] if pd.notna(row['sub_group_2']) else None,
            row['sub_group_3'] if pd.notna(row['sub_group_3']) else None,
            row['ledger_type'] if pd.notna(row['ledger_type']) else None,
            question_id,
            datetime.now(),
            datetime.now()
        ))
    
    conn.commit()
    cursor.close()
    conn.close()
    print("✅ Questions imported successfully!")

# Usage
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'your_password',
    'database': 'ai_accounting'
}

import_questions_from_excel('questions_config.xlsx', db_config)
```

---

## 🔌 API FLOW & ENDPOINTS

### **Endpoint 1: Get Questions for Hierarchy Node**

**Purpose:** When user selects a hierarchy node, return the questions to ask.

**Request:**
```http
GET /api/ledgers/questions/
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "Assets",
  "group": "Current Assets",
  "sub_group_1": "Sundry Debtors",
  "sub_group_2": null,
  "sub_group_3": null,
  "ledger_type": null
}
```

**Response:**
```json
{
  "success": true,
  "hierarchy_node": {
    "category": "Assets",
    "group": "Current Assets",
    "sub_group_1": "Sundry Debtors",
    "code": "1010201000000000"
  },
  "questions": [
    {
      "question_code": "Q_OPENING_BALANCE",
      "question_text": "Opening Balance",
      "question_type": "decimal",
      "is_required": true,
      "validation_rules": {
        "min": 0,
        "max": 999999999.99,
        "decimal_places": 2
      },
      "default_value": "0.00",
      "help_text": "Enter the opening balance for this ledger",
      "display_order": 1
    },
    {
      "question_code": "Q_CREDIT_LIMIT",
      "question_text": "Credit Limit",
      "question_type": "decimal",
      "is_required": false,
      "validation_rules": {
        "min": 0,
        "max": 999999999.99,
        "decimal_places": 2
      },
      "help_text": "Maximum credit allowed for this party",
      "display_order": 2
    },
    {
      "question_code": "Q_GSTIN",
      "question_text": "GSTIN",
      "question_type": "gstin",
      "is_required": false,
      "validation_rules": {
        "pattern": "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
      },
      "help_text": "Enter 15-digit GSTIN (e.g., 27AABCU9603R1ZM)",
      "display_order": 4
    }
  ]
}
```

---

### **Endpoint 2: Create Ledger with Answers**

**Purpose:** Create a new ledger with answers to dynamic questions.

**Request:**
```http
POST /api/ledgers/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "ABC Enterprises",
  "category": "Assets",
  "group": "Current Assets",
  "sub_group_1": "Sundry Debtors",
  "sub_group_2": null,
  "sub_group_3": null,
  "ledger_type": null,
  "answers": {
    "Q_OPENING_BALANCE": "50000.00",
    "Q_CREDIT_LIMIT": "100000.00",
    "Q_CREDIT_DAYS": "30",
    "Q_GSTIN": "27AABCU9603R1ZM",
    "Q_STATE": "Maharashtra",
    "Q_PAN": "ABCDE1234F",
    "Q_EMAIL": "abc@example.com",
    "Q_PHONE": "9876543210"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ledger created successfully",
  "ledger": {
    "id": 123,
    "tenant_id": "abc-123-def-456",
    "name": "ABC Enterprises",
    "code": "1010201000000001",
    "category": "Assets",
    "group": "Current Assets",
    "sub_group_1": "Sundry Debtors",
    "sub_group_2": null,
    "sub_group_3": null,
    "ledger_type": null,
    "additional_data": {
      "Q_OPENING_BALANCE": "50000.00",
      "Q_CREDIT_LIMIT": "100000.00",
      "Q_CREDIT_DAYS": "30",
      "Q_GSTIN": "27AABCU9603R1ZM",
      "Q_STATE": "Maharashtra",
      "Q_PAN": "ABCDE1234F",
      "Q_EMAIL": "abc@example.com",
      "Q_PHONE": "9876543210"
    },
    "created_at": "2025-12-31T12:00:00Z"
  }
}
```

**Validation Errors Response:**
```json
{
  "success": false,
  "errors": {
    "Q_OPENING_BALANCE": "This field is required",
    "Q_GSTIN": "Invalid GSTIN format. Expected format: 27AABCU9603R1ZM",
    "Q_EMAIL": "Invalid email address"
  }
}
```

---

## ✅ BACKEND VALIDATION LOGIC

### **Django View Implementation**

```python
# accounting/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
import re
import json

class LedgerQuestionsView(APIView):
    """
    Get questions for a specific hierarchy node
    """
    def post(self, request):
        tenant_id = request.user.tenant_id
        
        # Extract hierarchy path from request
        category = request.data.get('category')
        group = request.data.get('group')
        sub_group_1 = request.data.get('sub_group_1')
        sub_group_2 = request.data.get('sub_group_2')
        sub_group_3 = request.data.get('sub_group_3')
        ledger_type = request.data.get('ledger_type')
        
        # Get ledger code from master_hierarchy_raw
        hierarchy_node = self.get_hierarchy_node(
            category, group, sub_group_1, sub_group_2, sub_group_3, ledger_type
        )
        
        if not hierarchy_node:
            return Response({
                'success': False,
                'error': 'Invalid hierarchy selection'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get questions mapped to this hierarchy node
        questions = self.get_questions_for_hierarchy(
            category, group, sub_group_1, sub_group_2, sub_group_3, ledger_type
        )
        
        return Response({
            'success': True,
            'hierarchy_node': {
                'category': category,
                'group': group,
                'sub_group_1': sub_group_1,
                'sub_group_2': sub_group_2,
                'sub_group_3': sub_group_3,
                'ledger_type': ledger_type,
                'code': hierarchy_node['code']
            },
            'questions': questions
        })
    
    def get_hierarchy_node(self, category, group, sub_group_1, sub_group_2, sub_group_3, ledger_type):
        """
        Get hierarchy node from master_hierarchy_raw
        """
        from django.db import connection
        
        with connection.cursor() as cursor:
            # Build dynamic WHERE clause
            where_clauses = []
            params = []
            
            if category:
                where_clauses.append("major_group_1 = %s")
                params.append(category)
            if group:
                where_clauses.append("group_1 = %s")
                params.append(group)
            if sub_group_1:
                where_clauses.append("sub_group_1_1 = %s")
                params.append(sub_group_1)
            if sub_group_2:
                where_clauses.append("sub_group_2_1 = %s")
                params.append(sub_group_2)
            if sub_group_3:
                where_clauses.append("sub_group_3_1 = %s")
                params.append(sub_group_3)
            if ledger_type:
                where_clauses.append("ledger_1 = %s")
                params.append(ledger_type)
            
            query = f"""
                SELECT code, major_group_1, group_1, sub_group_1_1, 
                       sub_group_2_1, sub_group_3_1, ledger_1
                FROM master_hierarchy_raw
                WHERE {' AND '.join(where_clauses)}
                LIMIT 1
            """
            
            cursor.execute(query, params)
            row = cursor.fetchone()
            
            if row:
                return {
                    'code': row[0],
                    'category': row[1],
                    'group': row[2],
                    'sub_group_1': row[3],
                    'sub_group_2': row[4],
                    'sub_group_3': row[5],
                    'ledger_type': row[6]
                }
        
        return None
    
    def get_questions_for_hierarchy(self, category, group, sub_group_1, sub_group_2, sub_group_3, ledger_type):
        """
        Get all questions mapped to this hierarchy path
        """
        from django.db import connection
        
        with connection.cursor() as cursor:
            # Build WHERE clause for exact match
            where_clauses = []
            params = []
            
            # Match exact hierarchy path (including NULLs)
            where_clauses.append("(category = %s OR (category IS NULL AND %s IS NULL))")
            params.extend([category, category])
            
            where_clauses.append("(`group` = %s OR (`group` IS NULL AND %s IS NULL))")
            params.extend([group, group])
            
            where_clauses.append("(sub_group_1 = %s OR (sub_group_1 IS NULL AND %s IS NULL))")
            params.extend([sub_group_1, sub_group_1])
            
            where_clauses.append("(sub_group_2 = %s OR (sub_group_2 IS NULL AND %s IS NULL))")
            params.extend([sub_group_2, sub_group_2])
            
            where_clauses.append("(sub_group_3 = %s OR (sub_group_3 IS NULL AND %s IS NULL))")
            params.extend([sub_group_3, sub_group_3])
            
            where_clauses.append("(ledger_type = %s OR (ledger_type IS NULL AND %s IS NULL))")
            params.extend([ledger_type, ledger_type])
            
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
                WHERE {' AND '.join(where_clauses)}
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


class LedgerCreateView(APIView):
    """
    Create a new ledger with dynamic question answers
    """
    def post(self, request):
        tenant_id = request.user.tenant_id
        
        # Extract ledger data
        name = request.data.get('name')
        category = request.data.get('category')
        group = request.data.get('group')
        sub_group_1 = request.data.get('sub_group_1')
        sub_group_2 = request.data.get('sub_group_2')
        sub_group_3 = request.data.get('sub_group_3')
        ledger_type = request.data.get('ledger_type')
        answers = request.data.get('answers', {})
        
        # Validate hierarchy and get code
        hierarchy_node = LedgerQuestionsView().get_hierarchy_node(
            category, group, sub_group_1, sub_group_2, sub_group_3, ledger_type
        )
        
        if not hierarchy_node:
            return Response({
                'success': False,
                'error': 'Invalid hierarchy selection'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get questions for this hierarchy
        questions = LedgerQuestionsView().get_questions_for_hierarchy(
            category, group, sub_group_1, sub_group_2, sub_group_3, ledger_type
        )
        
        # Validate answers
        validation_errors = self.validate_answers(questions, answers)
        if validation_errors:
            return Response({
                'success': False,
                'errors': validation_errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create ledger
        try:
            with transaction.atomic():
                from accounting.models import MasterLedger
                
                ledger = MasterLedger.objects.create(
                    tenant_id=tenant_id,
                    name=name,
                    code=hierarchy_node['code'],
                    category=category,
                    group=group,
                    sub_group_1=sub_group_1,
                    sub_group_2=sub_group_2,
                    sub_group_3=sub_group_3,
                    ledger_type=ledger_type,
                    additional_data=answers
                )
                
                return Response({
                    'success': True,
                    'message': 'Ledger created successfully',
                    'ledger': {
                        'id': ledger.id,
                        'tenant_id': ledger.tenant_id,
                        'name': ledger.name,
                        'code': ledger.code,
                        'category': ledger.category,
                        'group': ledger.group,
                        'sub_group_1': ledger.sub_group_1,
                        'sub_group_2': ledger.sub_group_2,
                        'sub_group_3': ledger.sub_group_3,
                        'ledger_type': ledger.ledger_type,
                        'additional_data': ledger.additional_data,
                        'created_at': ledger.created_at
                    }
                }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def validate_answers(self, questions, answers):
        """
        Validate answers against question rules
        """
        errors = {}
        
        for question in questions:
            question_code = question['question_code']
            answer = answers.get(question_code)
            
            # Check required fields
            if question['is_required'] and not answer:
                errors[question_code] = "This field is required"
                continue
            
            # Skip validation if answer is empty and not required
            if not answer:
                continue
            
            # Validate based on question type
            question_type = question['question_type']
            validation_rules = question.get('validation_rules', {})
            
            if question_type == 'decimal':
                error = self.validate_decimal(answer, validation_rules)
                if error:
                    errors[question_code] = error
            
            elif question_type == 'number':
                error = self.validate_number(answer, validation_rules)
                if error:
                    errors[question_code] = error
            
            elif question_type == 'gstin':
                error = self.validate_gstin(answer, validation_rules)
                if error:
                    errors[question_code] = error
            
            elif question_type == 'pan':
                error = self.validate_pan(answer, validation_rules)
                if error:
                    errors[question_code] = error
            
            elif question_type == 'email':
                error = self.validate_email(answer, validation_rules)
                if error:
                    errors[question_code] = error
            
            elif question_type == 'phone':
                error = self.validate_phone(answer, validation_rules)
                if error:
                    errors[question_code] = error
            
            elif question_type == 'dropdown':
                error = self.validate_dropdown(answer, validation_rules)
                if error:
                    errors[question_code] = error
        
        return errors if errors else None
    
    def validate_decimal(self, value, rules):
        try:
            decimal_value = float(value)
            if 'min' in rules and decimal_value < rules['min']:
                return f"Value must be at least {rules['min']}"
            if 'max' in rules and decimal_value > rules['max']:
                return f"Value must not exceed {rules['max']}"
            return None
        except ValueError:
            return "Invalid decimal value"
    
    def validate_number(self, value, rules):
        try:
            int_value = int(value)
            if 'min' in rules and int_value < rules['min']:
                return f"Value must be at least {rules['min']}"
            if 'max' in rules and int_value > rules['max']:
                return f"Value must not exceed {rules['max']}"
            return None
        except ValueError:
            return "Invalid number"
    
    def validate_gstin(self, value, rules):
        pattern = rules.get('pattern', r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')
        if not re.match(pattern, value):
            return "Invalid GSTIN format. Expected format: 27AABCU9603R1ZM"
        return None
    
    def validate_pan(self, value, rules):
        pattern = rules.get('pattern', r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$')
        if not re.match(pattern, value):
            return "Invalid PAN format. Expected format: ABCDE1234F"
        return None
    
    def validate_email(self, value, rules):
        pattern = rules.get('pattern', r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        if not re.match(pattern, value):
            return "Invalid email address"
        return None
    
    def validate_phone(self, value, rules):
        pattern = rules.get('pattern', r'^[6-9][0-9]{9}$')
        if not re.match(pattern, value):
            return "Invalid phone number. Must be 10 digits starting with 6-9"
        return None
    
    def validate_dropdown(self, value, rules):
        options = rules.get('options', [])
        if value not in options:
            return f"Invalid option. Must be one of: {', '.join(options)}"
        return None
```

---

## 🎨 FRONTEND INTEGRATION

### **React Component Example**

```typescript
// LedgerCreationForm.tsx

import React, { useState, useEffect } from 'react';
import { httpClient } from '@/lib/httpClient';

interface Question {
  question_code: string;
  question_text: string;
  question_type: string;
  is_required: boolean;
  validation_rules: any;
  default_value?: string;
  help_text?: string;
  display_order: number;
}

export const LedgerCreationForm: React.FC = () => {
  const [hierarchySelection, setHierarchySelection] = useState({
    category: '',
    group: '',
    sub_group_1: '',
    sub_group_2: '',
    sub_group_3: '',
    ledger_type: ''
  });
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [ledgerName, setLedgerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Fetch questions when hierarchy selection changes
  useEffect(() => {
    if (hierarchySelection.category && hierarchySelection.group) {
      fetchQuestions();
    }
  }, [hierarchySelection]);
  
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await httpClient.post('/api/ledgers/questions/', hierarchySelection);
      setQuestions(response.data.questions);
      
      // Set default values
      const defaultAnswers: Record<string, string> = {};
      response.data.questions.forEach((q: Question) => {
        if (q.default_value) {
          defaultAnswers[q.question_code] = q.default_value;
        }
      });
      setAnswers(defaultAnswers);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setErrors({});
      
      const response = await httpClient.post('/api/ledgers/', {
        name: ledgerName,
        ...hierarchySelection,
        answers
      });
      
      if (response.data.success) {
        alert('Ledger created successfully!');
        // Reset form or redirect
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const renderQuestionInput = (question: Question) => {
    const value = answers[question.question_code] || '';
    
    switch (question.question_type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'gstin':
      case 'pan':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setAnswers({ ...answers, [question.question_code]: e.target.value })}
            className="form-input"
            required={question.is_required}
          />
        );
      
      case 'number':
      case 'decimal':
        return (
          <input
            type="number"
            step={question.question_type === 'decimal' ? '0.01' : '1'}
            value={value}
            onChange={(e) => setAnswers({ ...answers, [question.question_code]: e.target.value })}
            className="form-input"
            required={question.is_required}
          />
        );
      
      case 'dropdown':
        return (
          <select
            value={value}
            onChange={(e) => setAnswers({ ...answers, [question.question_code]: e.target.value })}
            className="form-select"
            required={question.is_required}
          >
            <option value="">Select...</option>
            {question.validation_rules?.options?.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={value === 'true'}
            onChange={(e) => setAnswers({ ...answers, [question.question_code]: e.target.checked.toString() })}
            className="form-checkbox"
          />
        );
      
      default:
        return <input type="text" className="form-input" />;
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="ledger-form">
      <h2>Create New Ledger</h2>
      
      {/* Hierarchy Selection (your existing dropdown) */}
      {/* ... */}
      
      {/* Ledger Name */}
      <div className="form-group">
        <label>Ledger Name *</label>
        <input
          type="text"
          value={ledgerName}
          onChange={(e) => setLedgerName(e.target.value)}
          className="form-input"
          required
        />
      </div>
      
      {/* Dynamic Questions */}
      {loading ? (
        <p>Loading questions...</p>
      ) : (
        questions.map((question) => (
          <div key={question.question_code} className="form-group">
            <label>
              {question.question_text}
              {question.is_required && <span className="required">*</span>}
            </label>
            
            {renderQuestionInput(question)}
            
            {question.help_text && (
              <small className="help-text">{question.help_text}</small>
            )}
            
            {errors[question.question_code] && (
              <span className="error">{errors[question.question_code]}</span>
            )}
          </div>
        ))
      )}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Ledger'}
      </button>
    </form>
  );
};
```

---

## 🚀 LONG-TERM SCALABILITY

### **Why This Design is Correct for ERP**

#### **1. Separation of Concerns**
- ✅ **Global Config** (hierarchy, questions) is READ-ONLY
- ✅ **Tenant Data** (ledgers, answers) is WRITE-ISOLATED
- ✅ No tenant can corrupt global data
- ✅ Easy to update questions without affecting existing ledgers

#### **2. Data-Driven Architecture**
- ✅ Questions come from database, not hardcoded
- ✅ Excel → DB import makes configuration easy
- ✅ Business users can update questions without developer
- ✅ Frontend is generic and reusable

#### **3. Flexibility**
- ✅ JSON storage allows different questions per hierarchy
- ✅ No schema migration needed when adding new questions
- ✅ Validation rules are configurable
- ✅ Easy to add conditional logic later

#### **4. Performance**
- ✅ Indexed lookups on hierarchy fields
- ✅ Single query to fetch questions
- ✅ JSON field is efficient for read-heavy operations
- ✅ Can add caching layer easily

#### **5. Compliance & Audit**
- ✅ `code` field ensures traceability to hierarchy
- ✅ `additional_data` stores complete audit trail
- ✅ Can query JSON fields for reporting
- ✅ Tenant isolation prevents data leaks

#### **6. Future Enhancements**
- ✅ Add `condition_rules` for dynamic question visibility
- ✅ Add `question_groups` for multi-step forms
- ✅ Add `formula_fields` for calculated questions
- ✅ Add `approval_workflows` for ledger creation

---

## 📝 MIGRATION GUIDE

### **Step 1: Apply Schema Changes**

```bash
# Run the questions system schema
mysql -u root -p ai_accounting < schema_questions_system.sql
```

### **Step 2: Update Django Models**

```python
# accounting/models.py

from django.db import models
import uuid

class MasterLedger(models.Model):
    id = models.BigAutoField(primary_key=True)
    tenant_id = models.CharField(max_length=36)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, null=True, blank=True)  # NEW FIELD
    
    # Hierarchy fields
    category = models.CharField(max_length=255)
    group = models.CharField(max_length=255)
    sub_group_1 = models.CharField(max_length=255, null=True, blank=True)
    sub_group_2 = models.CharField(max_length=255, null=True, blank=True)
    sub_group_3 = models.CharField(max_length=255, null=True, blank=True)
    ledger_type = models.CharField(max_length=255, null=True, blank=True)
    
    additional_data = models.JSONField(null=True, blank=True)  # NEW FIELD
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'master_ledgers'
        unique_together = [['name', 'tenant_id']]
```

### **Step 3: Create Django Migration**

```bash
python manage.py makemigrations accounting
python manage.py migrate accounting
```

### **Step 4: Import Questions from Excel**

```bash
python scripts/import_questions.py
```

### **Step 5: Update API URLs**

```python
# accounting/urls.py

from django.urls import path
from .views import LedgerQuestionsView, LedgerCreateView

urlpatterns = [
    path('ledgers/questions/', LedgerQuestionsView.as_view(), name='ledger-questions'),
    path('ledgers/', LedgerCreateView.as_view(), name='ledger-create'),
    # ... other URLs
]
```

### **Step 6: Test the Flow**

1. Select hierarchy node in UI
2. Verify questions are fetched from backend
3. Fill in answers
4. Submit form
5. Verify ledger is created with `code` and `additional_data`

---

## 🎯 SUMMARY

### **What We Achieved**

✅ **Global Questions Library** (`master_questions`)
- Stores all possible questions
- Configurable from Excel
- Reusable across hierarchy nodes

✅ **Hierarchy-Question Mapping** (`hierarchy_question_mapping`)
- Maps questions to specific hierarchy paths
- Defines which questions for which selection
- Supports exact matching

✅ **Flexible Answer Storage** (`master_ledgers.additional_data`)
- JSON format for flexibility
- No schema migration needed
- Queryable with MySQL JSON functions

✅ **Complete API Flow**
- GET questions for hierarchy node
- POST ledger with answers
- Backend validation
- Error handling

✅ **Long-term Scalability**
- Data-driven architecture
- Tenant isolation
- Performance optimized
- Future-proof design

### **Critical Fix Applied**

⚠️ **Added `code` field to `master_ledgers`**
- Links ledger to exact hierarchy node
- Required for compliance and reporting
- Ensures data integrity

---

## 📞 NEXT STEPS

1. **Review the schema** (`schema_questions_system.sql`)
2. **Apply the ALTER statement** to add `code` and `additional_data` fields
3. **Create the new tables** (`master_questions`, `hierarchy_question_mapping`)
4. **Prepare your Excel file** with questions and mappings
5. **Run the import script** to populate the tables
6. **Update your Django models** and create migrations
7. **Implement the API views** as shown above
8. **Update the frontend** to fetch and display dynamic questions

---

**This design is production-ready, scalable, and follows ERP best practices. It will serve you well for years to come.** 🚀
