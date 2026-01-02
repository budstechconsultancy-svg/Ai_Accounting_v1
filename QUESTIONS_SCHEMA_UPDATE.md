# Questions Table - Schema Update Summary

## ✅ Schema Updated Successfully!

### Changes Made:

1. **Added `questions` table to `schema.sql`**
   - Location: Before "END OF SCHEMA" section
   - Section: QUESTIONS SYSTEM

### Table Structure:

```sql
CREATE TABLE IF NOT EXISTS `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) DEFAULT NULL COMMENT 'Question code (integer format)',
  `sub_group_1_name` varchar(255) DEFAULT NULL COMMENT 'Sub-group name from hierarchy',
  `question` text DEFAULT NULL COMMENT 'The question text',
  `condition` varchar(255) DEFAULT NULL COMMENT 'Condition rules for displaying the question',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `questions_code_idx` (`code`),
  KEY `questions_sub_group_idx` (`sub_group_1_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Questions imported from CSV - maps questions to hierarchy nodes';
```

### Column Details:

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT AUTO_INCREMENT | Primary key |
| `code` | VARCHAR(50) | Question code (stored as integer, e.g., "45", "16") |
| `sub_group_1_name` | VARCHAR(255) | Hierarchy sub-group name |
| `question` | TEXT | The question text |
| `condition` | VARCHAR(255) | Condition rules for displaying the question |
| `created_at` | TIMESTAMP | Record creation timestamp |

### Indexes:

1. **Primary Key**: `id`
2. **Index**: `questions_code_idx` on `code` column
3. **Index**: `questions_sub_group_idx` on `sub_group_1_name` column

### Consistency Verification:

✅ **Column order matches** between:
- `import_questions.py` (import script)
- `schema.sql` (schema definition)

**Column Order**: `code` → `sub_group_1_name` → `question` → `condition`

### Files Updated:

1. ✅ **`schema.sql`** - Added questions table definition
2. ✅ **`import_questions.py`** - Already updated by user
3. ✅ **`schema_questions_system.sql`** - Questions table removed (as per user changes)

### Current State:

- **Database**: `ai_accounting`
- **Table**: `questions`
- **Rows**: 85 questions (from CSV import)
- **Status**: ✅ Active and in use

---

**Status**: ✅ COMPLETE  
**Date**: 2026-01-02  
**Schema File**: schema.sql  
**Table**: questions
