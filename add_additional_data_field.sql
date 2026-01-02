-- Add the missing additional_data field to master_ledgers table
ALTER TABLE master_ledgers 
ADD COLUMN additional_data JSON NULL 
COMMENT 'Stores answers to dynamic questions (e.g., opening balance, GSTIN, credit limit)';
