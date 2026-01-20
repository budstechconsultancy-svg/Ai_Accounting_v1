-- ============================================================================
-- CUSTOMER ONBOARDING DATA VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify that customer data is being saved correctly
-- to all 6 tables after onboarding a customer
-- ============================================================================

-- Query 1: Get the most recent customer with all related data
-- ============================================================================
SELECT 
    cbd.id AS customer_id,
    cbd.customer_code,
    cbd.customer_name,
    cbd.pan_number,
    cbd.contact_person,
    cbd.email_address,
    cbd.contact_number,
    cbd.is_also_vendor,
    cbd.created_at AS customer_created_at,
    
    -- Terms & Conditions (OneToOne relationship)
    tc.id AS terms_id,
    tc.credit_period,
    tc.credit_terms,
    tc.penalty_terms,
    tc.delivery_terms,
    tc.warranty_details,
    tc.force_majeure,
    tc.dispute_terms,
    tc.created_at AS terms_created_at,
    
    -- TDS Details (OneToOne relationship)
    tds.id AS tds_id,
    tds.msme_no,
    tds.fssai_no,
    tds.iec_code,
    tds.eou_status,
    tds.tcs_section,
    tds.tcs_enabled,
    tds.tds_section,
    tds.tds_enabled
    
FROM customer_master_customer_basicdetails cbd
LEFT JOIN customer_master_customer_termscondition tc 
    ON tc.customer_basic_detail_id = cbd.id
LEFT JOIN customer_master_customer_tds tds 
    ON tds.customer_basic_detail_id = cbd.id
WHERE cbd.is_deleted = 0
ORDER BY cbd.created_at DESC
LIMIT 5;


-- Query 2: Check Terms & Conditions specifically
-- ============================================================================
SELECT 
    cbd.customer_code,
    cbd.customer_name,
    tc.credit_period,
    tc.credit_terms,
    tc.penalty_terms,
    tc.delivery_terms,
    tc.warranty_details,
    tc.force_majeure,
    tc.dispute_terms,
    tc.created_at,
    tc.updated_at
FROM customer_master_customer_basicdetails cbd
INNER JOIN customer_master_customer_termscondition tc 
    ON tc.customer_basic_detail_id = cbd.id
WHERE cbd.is_deleted = 0
ORDER BY tc.created_at DESC
LIMIT 10;


-- Query 3: Check GST Details
-- ============================================================================
SELECT 
    cbd.customer_code,
    cbd.customer_name,
    gst.gstin,
    gst.is_unregistered,
    gst.branch_reference_name,
    gst.branch_address,
    gst.branch_contact_person,
    gst.branch_email,
    gst.branch_contact_number
FROM customer_master_customer_basicdetails cbd
INNER JOIN customer_master_customer_gstdetails gst 
    ON gst.customer_basic_detail_id = cbd.id
WHERE cbd.is_deleted = 0
ORDER BY gst.created_at DESC
LIMIT 10;


-- Query 4: Check Product/Service Mappings
-- ============================================================================
SELECT 
    cbd.customer_code,
    cbd.customer_name,
    ps.item_code,
    ps.item_name,
    ps.customer_item_code,
    ps.customer_item_name,
    ps.uom,
    ps.customer_uom
FROM customer_master_customer_basicdetails cbd
INNER JOIN customer_master_customer_productservice ps 
    ON ps.customer_basic_detail_id = cbd.id
WHERE cbd.is_deleted = 0
ORDER BY ps.created_at DESC
LIMIT 10;


-- Query 5: Check Banking Details
-- ============================================================================
SELECT 
    cbd.customer_code,
    cbd.customer_name,
    bank.account_number,
    bank.bank_name,
    bank.ifsc_code,
    bank.branch_name,
    bank.swift_code,
    bank.associated_branches
FROM customer_master_customer_basicdetails cbd
INNER JOIN customer_master_customer_banking bank 
    ON bank.customer_basic_detail_id = cbd.id
WHERE cbd.is_deleted = 0
ORDER BY bank.created_at DESC
LIMIT 10;


-- Query 6: Count records in each table for a specific customer
-- ============================================================================
-- Replace 'CUST-XXXXXX' with your actual customer code
SET @customer_code = 'CUST-XXXXXX';

SELECT 
    'Basic Details' AS table_name,
    COUNT(*) AS record_count
FROM customer_master_customer_basicdetails
WHERE customer_code = @customer_code AND is_deleted = 0

UNION ALL

SELECT 
    'GST Details',
    COUNT(*)
FROM customer_master_customer_gstdetails gst
INNER JOIN customer_master_customer_basicdetails cbd 
    ON gst.customer_basic_detail_id = cbd.id
WHERE cbd.customer_code = @customer_code AND cbd.is_deleted = 0

UNION ALL

SELECT 
    'Products/Services',
    COUNT(*)
FROM customer_master_customer_productservice ps
INNER JOIN customer_master_customer_basicdetails cbd 
    ON ps.customer_basic_detail_id = cbd.id
WHERE cbd.customer_code = @customer_code AND cbd.is_deleted = 0

UNION ALL

SELECT 
    'TDS Details',
    COUNT(*)
FROM customer_master_customer_tds tds
INNER JOIN customer_master_customer_basicdetails cbd 
    ON tds.customer_basic_detail_id = cbd.id
WHERE cbd.customer_code = @customer_code AND cbd.is_deleted = 0

UNION ALL

SELECT 
    'Banking Info',
    COUNT(*)
FROM customer_master_customer_banking bank
INNER JOIN customer_master_customer_basicdetails cbd 
    ON bank.customer_basic_detail_id = cbd.id
WHERE cbd.customer_code = @customer_code AND cbd.is_deleted = 0

UNION ALL

SELECT 
    'Terms & Conditions',
    COUNT(*)
FROM customer_master_customer_termscondition tc
INNER JOIN customer_master_customer_basicdetails cbd 
    ON tc.customer_basic_detail_id = cbd.id
WHERE cbd.customer_code = @customer_code AND cbd.is_deleted = 0;


-- Query 7: Full customer data dump (for debugging)
-- ============================================================================
-- Replace 'CUST-XXXXXX' with your actual customer code
SET @customer_code = 'CUST-XXXXXX';

-- Basic Details
SELECT 'BASIC DETAILS' AS section, cbd.*
FROM customer_master_customer_basicdetails cbd
WHERE cbd.customer_code = @customer_code AND cbd.is_deleted = 0;

-- GST Details
SELECT 'GST DETAILS' AS section, gst.*
FROM customer_master_customer_gstdetails gst
INNER JOIN customer_master_customer_basicdetails cbd 
    ON gst.customer_basic_detail_id = cbd.id
WHERE cbd.customer_code = @customer_code AND cbd.is_deleted = 0;

-- Products/Services
SELECT 'PRODUCTS/SERVICES' AS section, ps.*
FROM customer_master_customer_productservice ps
INNER JOIN customer_master_customer_basicdetails cbd 
    ON ps.customer_basic_detail_id = cbd.id
WHERE cbd.customer_code = @customer_code AND cbd.is_deleted = 0;

-- TDS Details
SELECT 'TDS DETAILS' AS section, tds.*
FROM customer_master_customer_tds tds
INNER JOIN customer_master_customer_basicdetails cbd 
    ON tds.customer_basic_detail_id = cbd.id
WHERE cbd.customer_code = @customer_code AND cbd.is_deleted = 0;

-- Banking Info
SELECT 'BANKING INFO' AS section, bank.*
FROM customer_master_customer_banking bank
INNER JOIN customer_master_customer_basicdetails cbd 
    ON bank.customer_basic_detail_id = cbd.id
WHERE cbd.customer_code = @customer_code AND cbd.is_deleted = 0;

-- Terms & Conditions
SELECT 'TERMS & CONDITIONS' AS section, tc.*
FROM customer_master_customer_termscondition tc
INNER JOIN customer_master_customer_basicdetails cbd 
    ON tc.customer_basic_detail_id = cbd.id
WHERE cbd.customer_code = @customer_code AND cbd.is_deleted = 0;


-- Query 8: Check for customers with missing Terms & Conditions
-- ============================================================================
SELECT 
    cbd.customer_code,
    cbd.customer_name,
    cbd.created_at,
    CASE 
        WHEN tc.id IS NULL THEN 'Missing'
        ELSE 'Present'
    END AS terms_status
FROM customer_master_customer_basicdetails cbd
LEFT JOIN customer_master_customer_termscondition tc 
    ON tc.customer_basic_detail_id = cbd.id
WHERE cbd.is_deleted = 0
ORDER BY cbd.created_at DESC
LIMIT 20;


-- Query 9: Statistics - How many customers have Terms & Conditions filled
-- ============================================================================
SELECT 
    COUNT(DISTINCT cbd.id) AS total_customers,
    COUNT(DISTINCT tc.id) AS customers_with_terms,
    COUNT(DISTINCT cbd.id) - COUNT(DISTINCT tc.id) AS customers_without_terms,
    ROUND(COUNT(DISTINCT tc.id) * 100.0 / COUNT(DISTINCT cbd.id), 2) AS percentage_with_terms
FROM customer_master_customer_basicdetails cbd
LEFT JOIN customer_master_customer_termscondition tc 
    ON tc.customer_basic_detail_id = cbd.id
WHERE cbd.is_deleted = 0;
