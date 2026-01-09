-- ============================================================================
-- Update Transcaction_file ledger names to match master_ledgers
-- This updates the existing records to use the correct ledger names
-- ============================================================================

-- First, let's see what we have in master_ledgers
-- Run this query to see your actual ledger names:
-- SELECT id, name, `group`, category FROM master_ledgers WHERE `group` LIKE '%Bank%' OR `group` LIKE '%Cash%';

-- Based on the screenshot showing "ICICI Bank Savings Account" in the dropdown,
-- let's update the Transcaction_file records to match

-- Update HDFC Bank to match actual name in master_ledgers
-- Replace 'HDFC Bank Current Account' with whatever the actual name is
UPDATE Transcaction_file 
SET ledger_name = 'HDFC Bank Current Account'
WHERE id = 1;

-- Update ICICI Bank to match actual name
UPDATE Transcaction_file 
SET ledger_name = 'ICICI Bank Savings Account'
WHERE id = 2;

-- Update SBI to match actual name
UPDATE Transcaction_file 
SET ledger_name = 'SBI Current Account'
WHERE id = 3;

-- Update Cash in Hand
UPDATE Transcaction_file 
SET ledger_name = 'Cash in Hand'
WHERE id = 4;

-- Update Petty Cash
UPDATE Transcaction_file 
SET ledger_name = 'Petty Cash'
WHERE id = 5;

-- Verify the updates
SELECT id, ledger_name, current_balance, current_balance_type
FROM Transcaction_file
ORDER BY id;

-- ============================================================================
-- Alternative: If you want to see what ledgers exist in master_ledgers first
-- ============================================================================
-- Run this query in a separate tab to see all your ledgers:
-- SELECT id, name, `group`, category FROM master_ledgers ORDER BY `group`, name;
