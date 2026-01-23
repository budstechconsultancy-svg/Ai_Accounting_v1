-- ============================================================================
-- SERVICE MANAGEMENT SCHEMA
-- Database: ai_accounting
-- Table: service_list
-- Purpose: Store all service list items with complete details
-- ============================================================================

-- Create Service List Table with all fields from "Create New Service List" form
CREATE TABLE IF NOT EXISTS service_list (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique Service ID',
    tenant_id VARCHAR(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
    service_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Service Code (Required)',
    service_name VARCHAR(255) NOT NULL COMMENT 'Service Name (Required)',
    service_group VARCHAR(100) NOT NULL COMMENT 'Service Group (Required)',
    sac_code VARCHAR(20) NOT NULL COMMENT 'SAC Code (Required)',
    gst_rate DECIMAL(5, 2) NOT NULL DEFAULT 18 COMMENT 'GST Rate (Required)',
    uom VARCHAR(50) COMMENT 'Unit of Measurement (Optional)',
    description TEXT COMMENT 'Description (Optional)',
    expense_ledger VARCHAR(255) NOT NULL COMMENT 'Expense Ledger (Required)',
    is_active BOOLEAN DEFAULT 1 COMMENT 'Status: 1=Active, 0=Inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record Created Date',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record Last Updated Date',
    
    -- Indexes for better query performance
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_service_code (service_code),
    INDEX idx_service_group (service_group),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at),
    INDEX idx_tenant_service (tenant_id, service_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Service List Master Table';
