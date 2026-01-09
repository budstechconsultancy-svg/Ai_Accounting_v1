-- ============================================================================
-- Simple Direct Insert Script for Transcaction_file
-- Run this after the table is created
-- ============================================================================

-- Insert HDFC Bank with explicit ID
INSERT INTO Transcaction_file (
    id, tenant_id, financial_year_id, ledger_code, ledger_name, 
    nature, ledger_type, is_active,
    opening_balance, opening_balance_type,
    current_balance, current_balance_type,
    bank_name, branch_name, account_number, ifsc_code,
    created_at, updated_at
) VALUES (
    1, 1, 1, 'BANK001', 'HDFC Bank',
    'Asset', 'Bank Account', TRUE,
    250000.00, 'Dr',
    250000.00, 'Dr',
    'HDFC Bank', 'Main Branch', '50100123456789', 'HDFC0001234',
    NOW(), NOW()
);

-- Insert ICICI Bank
INSERT INTO Transcaction_file (
    id, tenant_id, financial_year_id, ledger_code, ledger_name,
    nature, ledger_type, is_active,
    opening_balance, opening_balance_type,
    current_balance, current_balance_type,
    bank_name, branch_name, account_number, ifsc_code,
    created_at, updated_at
) VALUES (
    2, 1, 1, 'BANK002', 'ICICI Bank',
    'Asset', 'Bank Account', TRUE,
    150000.00, 'Dr',
    150000.00, 'Dr',
    'ICICI Bank', 'Corporate Branch', '012345678901', 'ICIC0001234',
    NOW(), NOW()
);

-- Insert SBI Current Account
INSERT INTO Transcaction_file (
    id, tenant_id, financial_year_id, ledger_code, ledger_name,
    nature, ledger_type, is_active,
    opening_balance, opening_balance_type,
    current_balance, current_balance_type,
    bank_name, branch_name, account_number, ifsc_code,
    created_at, updated_at
) VALUES (
    3, 1, 1, 'BANK003', 'SBI Current Account',
    'Asset', 'Bank Account', TRUE,
    180000.00, 'Dr',
    180000.00, 'Dr',
    'State Bank of India', 'City Branch', '30123456789', 'SBIN0001234',
    NOW(), NOW()
);

-- Insert Cash in Hand
INSERT INTO Transcaction_file (
    id, tenant_id, financial_year_id, ledger_code, ledger_name,
    nature, ledger_type, is_active,
    opening_balance, opening_balance_type,
    current_balance, current_balance_type,
    created_at, updated_at
) VALUES (
    4, 1, 1, 'CASH001', 'Cash in Hand',
    'Asset', 'Cash', TRUE,
    50000.00, 'Dr',
    50000.00, 'Dr',
    NOW(), NOW()
);

-- Insert Petty Cash
INSERT INTO Transcaction_file (
    id, tenant_id, financial_year_id, ledger_code, ledger_name,
    nature, ledger_type, is_active,
    opening_balance, opening_balance_type,
    current_balance, current_balance_type,
    created_at, updated_at
) VALUES (
    5, 1, 1, 'CASH002', 'Petty Cash',
    'Asset', 'Cash', TRUE,
    10000.00, 'Dr',
    10000.00, 'Dr',
    NOW(), NOW()
);

-- Verify inserted data
SELECT 
    id, ledger_code, ledger_name, nature, 
    current_balance, current_balance_type,
    bank_name, account_number
FROM Transcaction_file
ORDER BY id;
