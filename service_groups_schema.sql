-- ============================================================================
-- SERVICE GROUPS TABLE
-- Database: ai_accounting
-- Table: service_groups
-- Purpose: Store service groups with category, group name, and subgroup (under)
-- ============================================================================

USE ai_accounting;

-- Create Service Groups Table
CREATE TABLE IF NOT EXISTS service_groups (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique Service Group ID',
    tenant_id VARCHAR(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
    category VARCHAR(100) NOT NULL COMMENT 'Category (e.g., Professional Services, Technical Support)',
    group_name VARCHAR(255) NOT NULL COMMENT 'Group Name (Required)',
    under_subgroup VARCHAR(255) DEFAULT NULL COMMENT 'Subgroup Name / Under (Optional)',
    is_active BOOLEAN DEFAULT 1 COMMENT 'Status: 1=Active, 0=Inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record Created Date',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record Last Updated Date',
    
    -- Indexes for better query performance
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_category (category),
    INDEX idx_group_name (group_name),
    INDEX idx_is_active (is_active),
    INDEX idx_tenant_category (tenant_id, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Service Groups Table';
