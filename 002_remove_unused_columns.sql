-- ============================================================================
-- Migration: Remove Unused Columns from Master Ledgers
-- Purpose: Remove columns that don't exist in the frontend UI
-- Date: 2025-12-26
-- ============================================================================

USE ai_accounting;

-- Remove unused columns
ALTER TABLE `master_ledgers` 
DROP COLUMN `master_reference_id`,
DROP COLUMN `cwip_project_name`,
DROP COLUMN `cwip_estimated_completion_date`;

-- ============================================================================
-- Migration Complete
-- Remaining columns match exactly what's in the frontend UI
-- ============================================================================
