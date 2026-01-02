# Questions Table - Final Schema Synchronization

## ✅ ALL FILES SYNCHRONIZED!

### Final Column Structure:

The `questions` table now uses **`condition_rule`** (not `condition`) across all files to match the actual database structure.

### Table Definition:

```sql
CREATE TABLE IF NOT EXISTS `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) DEFAULT NULL COMMENT 'Question code (integer format)',
  `sub_group_1_name` varchar(255) DEFAULT NULL COMMENT 'Sub-group name from hierarchy',
  `question` text DEFAULT NULL COMMENT 'The question text',
  `condition_rule` varchar(255) DEFAULT NULL COMMENT 'Condition rules for displaying the question',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  
  KEY `questions_code_idx` (`code`),
  KEY `questions_sub_group_idx` (`sub_group_1_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Questions imported from CSV - maps questions to hierarchy nodes';
```

### Column Order:

1. `id` - INT AUTO_INCREMENT (Primary Key)
2. `code` - VARCHAR(50) - Question code (integer format, e.g., "45", "16")
3. `sub_group_1_name` - VARCHAR(255) - Hierarchy sub-group name
4. `question` - TEXT - The question text
5. **`condition_rule`** - VARCHAR(255) - Condition rules for displaying the question ⭐
6. `created_at` - TIMESTAMP - Record creation timestamp

### Files Updated:

| File | Status | Column Name |
|------|--------|-------------|
| **Database Table** | ✅ Matches | `condition_rule` |
| **schema.sql** | ✅ Updated | `condition_rule` |
| **import_questions.py** | ✅ Updated | `condition_rule` |

### Changes Made:

1. ✅ **schema.sql** - Changed `condition` to `condition_rule`
2. ✅ **import_questions.py** - Changed `condition` to `condition_rule` in:
   - CREATE TABLE statement
   - INSERT statement

### CSV Mapping:

| CSV Column | Database Column | Notes |
|------------|-----------------|-------|
| `sub_group_1_name` | `sub_group_1_name` | ✅ Exact match |
| `code` | `code` | ✅ Converted from float to integer |
| `question` | `question` | ✅ Exact match |
| **`condition_rule`** | **`condition_rule`** | ✅ Exact match |

### Database Status:

- **Total Questions**: 85 rows
- **Questions with condition_rule**: 46 rows
- **Database**: `ai_accounting`
- **Table**: `questions`

### Verification:

✅ All column names match across:
- Database table structure
- schema.sql definition
- import_questions.py script

✅ Column order is consistent everywhere

✅ Data types match specifications

---

**Status**: ✅ COMPLETE  
**Date**: 2026-01-02  
**Column Name**: `condition_rule` (standardized across all files)
