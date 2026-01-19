-- ============================================================================
-- Vendor Master Category Table
-- ============================================================================

-- Table: vendor_master_category
--------------------------------------------------------------------------------
CREATE TABLE `vendor_master_category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `category` varchar(255) NOT NULL COMMENT 'Top-level category (e.g., RAW MATERIAL, Stores and Spares)',
  `group` varchar(255) DEFAULT NULL COMMENT 'Group under category (optional)',
  `subgroup` varchar(255) DEFAULT NULL COMMENT 'Subgroup under group (optional)',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether this category is active',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL COMMENT 'Created by user',
  `updated_by` varchar(100) DEFAULT NULL COMMENT 'Updated by user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `vendor_category_unique` (`tenant_id`,`category`,`group`,`subgroup`),
  KEY `vendor_category_tenant_id_idx` (`tenant_id`,`is_active`),
  KEY `vendor_category_category_idx` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Vendor Master Category for vendor classification';
