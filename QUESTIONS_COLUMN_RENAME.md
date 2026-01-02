# Questions Table - Column Rename Summary

## ✅ Column Names Updated Successfully!

### Changes Made:

Renamed columns in the `questions` table to match the new naming convention:

| Old Column Name | New Column Name | Description |
|----------------|-----------------|-------------|
| `sub_group_1_name` | `sub_group_1_1` | Sub-group 1 level 1 from hierarchy |
| `code` | `sub_group_1_2` | Sub-group 1 level 2 (question code) |

### Updated Table Structure:

```sql
CREATE TABLE IF NOT EXISTS `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sub_group_1_1` varchar(255) DEFAULT NULL COMMENT 'Sub-group 1 level 1 from hierarchy',
  `sub_group_1_2` varchar(50) DEFAULT NULL COMMENT 'Sub-group 1 level 2 (question code)',
  `question` text DEFAULT NULL COMMENT 'The question text',
  `condition_rule` varchar(255) DEFAULT NULL COMMENT 'Condition rules for displaying the question',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  
  KEY `questions_sub_group_1_2_idx` (`sub_group_1_2`),
  KEY `questions_sub_group_1_1_idx` (`sub_group_1_1`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Questions imported from CSV - maps questions to hierarchy nodes';
```

### Column Order (Final):

1. `id` - INT AUTO_INCREMENT (Primary Key)
2. **`sub_group_1_1`** - VARCHAR(255) - Sub-group level 1 ⭐
3. **`sub_group_1_2`** - VARCHAR(50) - Sub-group level 2 (code) ⭐
4. `question` - TEXT - Question text
5. `condition_rule` - VARCHAR(255) - Condition rules
6. `created_at` - TIMESTAMP - Creation timestamp

### Files Updated:

| File | Status | Changes |
|------|--------|---------|
| **Database** | ✅ Updated | Columns renamed via ALTER TABLE |
| **schema.sql** | ✅ Updated | Table definition updated |
| **import_questions.py** | ✅ Updated | CREATE TABLE and INSERT statements updated |

### CSV Mapping (Updated):

| CSV Column | Database Column | Notes |
|------------|-----------------|-------|
| `sub_group_1_name` | `sub_group_1_1` | ✅ Renamed |
| `code` | `sub_group_1_2` | ✅ Renamed (converted from float to integer) |
| `question` | `question` | ✅ No change |
| `condition_rule` | `condition_rule` | ✅ No change |

### Index Updates:

Old indexes:
- `questions_code_idx` on `code`
- `questions_sub_group_idx` on `sub_group_1_name`

New indexes:
- `questions_sub_group_1_2_idx` on `sub_group_1_2`
- `questions_sub_group_1_1_idx` on `sub_group_1_1`

### Verification:

✅ All column names match across:
- Database table structure
- schema.sql definition
- import_questions.py script

✅ Data integrity maintained (85 questions)

✅ All indexes updated

---

**Status**: ✅ COMPLETE  
**Date**: 2026-01-02  
**New Column Names**: `sub_group_1_1`, `sub_group_1_2`
