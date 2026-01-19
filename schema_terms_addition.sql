  CONSTRAINT `vendor_banking_vendor_fk` FOREIGN KEY (`vendor_basic_detail_id`) REFERENCES `vendor_master_basicdetail` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Vendor Master Banking Information';


--
-- Table structure for table `vendor_master_terms`
--

CREATE TABLE IF NOT EXISTS `vendor_master_terms` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `vendor_basic_detail_id` bigint DEFAULT NULL COMMENT 'Foreign key to vendor_master_basicdetail',
  `credit_limit` decimal(15,2) DEFAULT NULL COMMENT 'Credit limit amount',
  `credit_period` varchar(100) DEFAULT NULL COMMENT 'Credit period (e.g., 30 days, 60 days)',
  `credit_terms` text COMMENT 'Credit terms and conditions',
  `penalty_terms` text COMMENT 'Penalty terms for late payments or breaches',
  `delivery_terms` text COMMENT 'Delivery terms, lead time, shipping conditions',
  `warranty_guarantee_details` text COMMENT 'Warranty and guarantee terms',
  `force_majeure` text COMMENT 'Force majeure clauses',
  `dispute_redressal_terms` text COMMENT 'Dispute resolution and redressal terms',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether this terms detail is active',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL COMMENT 'Created by user',
  `updated_by` varchar(100) DEFAULT NULL COMMENT 'Updated by user',
  PRIMARY KEY (`id`),
  KEY `vendor_terms_tenant_id_idx` (`tenant_id`),
  KEY `vendor_terms_vendor_basic_detail_id_idx` (`vendor_basic_detail_id`),
  CONSTRAINT `vendor_terms_vendor_fk` FOREIGN KEY (`vendor_basic_detail_id`) REFERENCES `vendor_master_basicdetail` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Vendor Master Terms and Conditions';
