-- ============================================================================
-- Fix Transcaction_file Table Schema
-- This script drops and recreates the table with correct schema
-- ============================================================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS Transcaction_file;

-- Create Transcaction_file table with correct schema
CREATE TABLE Transcaction_file (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    financial_year_id BIGINT NOT NULL,
    
    -- Core Fields
    ledger_code VARCHAR(50) UNIQUE,
    ledger_name VARCHAR(255) NOT NULL,
    alias_name VARCHAR(255),
    group_id BIGINT,
    nature VARCHAR(20),
    ledger_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Balance Fields
    opening_balance DECIMAL(18,2) DEFAULT 0,
    opening_balance_type VARCHAR(10),
    current_balance DECIMAL(18,2) DEFAULT 0,
    current_balance_type VARCHAR(10),
    closing_balance DECIMAL(18,2) DEFAULT 0,
    closing_balance_type VARCHAR(10),
    
    -- Bank Details
    bank_name VARCHAR(255),
    branch_name VARCHAR(255),
    account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    micr_code VARCHAR(20),
    upi_id VARCHAR(100),
    
    -- GST Details
    gst_applicable BOOLEAN DEFAULT FALSE,
    gst_registration_type VARCHAR(50),
    gstin VARCHAR(20),
    hsn_sac_code VARCHAR(20),
    gst_rate DECIMAL(5,2),
    cgst_rate DECIMAL(5,2),
    sgst_rate DECIMAL(5,2),
    igst_rate DECIMAL(5,2),
    
    -- TDS Details
    is_tds_applicable BOOLEAN DEFAULT FALSE,
    tds_section VARCHAR(20),
    tds_rate DECIMAL(5,2),
    
    -- Contact Details
    contact_person VARCHAR(255),
    mobile VARCHAR(20),
    email VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    country VARCHAR(100),
    
    -- Business Rules
    allow_bill_wise BOOLEAN DEFAULT FALSE,
    credit_limit DECIMAL(18,2),
    credit_days INT,
    is_cost_center_required BOOLEAN DEFAULT FALSE,
    is_inventory_linked BOOLEAN DEFAULT FALSE,
    is_system_ledger BOOLEAN DEFAULT FALSE,
    lock_editing BOOLEAN DEFAULT FALSE,
    
    -- Audit Fields
    created_by BIGINT,
    updated_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_tenant_ledger (tenant_id, ledger_name),
    INDEX idx_tenant_active (tenant_id, is_active),
    INDEX idx_ledger_code (ledger_code),
    INDEX idx_nature (nature)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- Insert Sample Data
-- ============================================================================

-- Insert HDFC Bank with balance
INSERT INTO Transcaction_file (
    tenant_id, financial_year_id, ledger_code, ledger_name, 
    nature, ledger_type, is_active,
    opening_balance, opening_balance_type,
    current_balance, current_balance_type,
    bank_name, branch_name, account_number, ifsc_code
) VALUES (
    1, 1, 'BANK001', 'HDFC Bank',
    'Asset', 'Bank Account', TRUE,
    250000.00, 'Dr',
    250000.00, 'Dr',
    'HDFC Bank', 'Main Branch', '50100123456789', 'HDFC0001234'
) ON DUPLICATE KEY UPDATE
    current_balance = 250000.00,
    current_balance_type = 'Dr';

-- Insert ICICI Bank
INSERT INTO Transcaction_file (
    tenant_id, financial_year_id, ledger_code, ledger_name,
    nature, ledger_type, is_active,
    opening_balance, opening_balance_type,
    current_balance, current_balance_type,
    bank_name, branch_name, account_number, ifsc_code
) VALUES (
    1, 1, 'BANK002', 'ICICI Bank',
    'Asset', 'Bank Account', TRUE,
    150000.00, 'Dr',
    150000.00, 'Dr',
    'ICICI Bank', 'Corporate Branch', '012345678901', 'ICIC0001234'
) ON DUPLICATE KEY UPDATE
    current_balance = 150000.00,
    current_balance_type = 'Dr';

-- Insert SBI Current Account
INSERT INTO Transcaction_file (
    tenant_id, financial_year_id, ledger_code, ledger_name,
    nature, ledger_type, is_active,
    opening_balance, opening_balance_type,
    current_balance, current_balance_type,
    bank_name, branch_name, account_number, ifsc_code
) VALUES (
    1, 1, 'BANK003', 'SBI Current Account',
    'Asset', 'Bank Account', TRUE,
    180000.00, 'Dr',
    180000.00, 'Dr',
    'State Bank of India', 'City Branch', '30123456789', 'SBIN0001234'
) ON DUPLICATE KEY UPDATE
    current_balance = 180000.00,
    current_balance_type = 'Dr';

-- Insert Cash in Hand
INSERT INTO Transcaction_file (
    tenant_id, financial_year_id, ledger_code, ledger_name,
    nature, ledger_type, is_active,
    opening_balance, opening_balance_type,
    current_balance, current_balance_type
) VALUES (
    1, 1, 'CASH001', 'Cash in Hand',
    'Asset', 'Cash', TRUE,
    50000.00, 'Dr',
    50000.00, 'Dr'
) ON DUPLICATE KEY UPDATE
    current_balance = 50000.00,
    current_balance_type = 'Dr';

-- Insert Petty Cash
INSERT INTO Transcaction_file (
    tenant_id, financial_year_id, ledger_code, ledger_name,
    nature, ledger_type, is_active,
    opening_balance, opening_balance_type,
    current_balance, current_balance_type
) VALUES (
    1, 1, 'CASH002', 'Petty Cash',
    'Asset', 'Cash', TRUE,
    10000.00, 'Dr',
    10000.00, 'Dr'
) ON DUPLICATE KEY UPDATE
    current_balance = 10000.00,
    current_balance_type = 'Dr';

-- Insert Sample Suppliers
INSERT INTO Transcaction_file (
    tenant_id, financial_year_id, ledger_code, ledger_name,
    nature, ledger_type, is_active,
    opening_balance, opening_balance_type,
    current_balance, current_balance_type,
    gstin, gst_applicable, state, credit_days
) VALUES (
    1, 1, 'SUPP001', 'ABC Suppliers Pvt Ltd',
    'Liability', 'Sundry Creditor', TRUE,
    0.00, 'Cr',
    0.00, 'Cr',
    '29ABCDE1234F1Z5', TRUE, 'Karnataka', 30
) ON DUPLICATE KEY UPDATE
    current_balance = 0.00,
    current_balance_type = 'Cr';

-- Insert Sample Customers
INSERT INTO Transcaction_file (
    tenant_id, financial_year_id, ledger_code, ledger_name,
    nature, ledger_type, is_active,
    opening_balance, opening_balance_type,
    current_balance, current_balance_type,
    gstin, gst_applicable, state, credit_days
) VALUES (
    1, 1, 'CUST001', 'XYZ Customers Ltd',
    'Asset', 'Sundry Debtor', TRUE,
    0.00, 'Dr',
    0.00, 'Dr',
    '27XYZAB5678G2Z1', TRUE, 'Maharashtra', 45
) ON DUPLICATE KEY UPDATE
    current_balance = 0.00,
    current_balance_type = 'Dr';

-- ============================================================================
-- Verification Query
-- ============================================================================

-- View all inserted records
SELECT 
    id, ledger_code, ledger_name, nature, 
    current_balance, current_balance_type,
    bank_name, account_number
FROM Transcaction_file
ORDER BY id;
