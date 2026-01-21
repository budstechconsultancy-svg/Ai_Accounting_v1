-- ============================================================================
-- VENDOR MODULE TABLES
-- Matches Django models in backend/vendors/models.py
-- ============================================================================

--
-- Table structure for table `vendor_master_category`
--

CREATE TABLE `vendor_master_category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL,
  `category` varchar(255) NOT NULL,
  `group` varchar(255) DEFAULT NULL,
  `subgroup` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vendor_master_category_uniq` (`tenant_id`,`category`,`group`,`subgroup`),
  KEY `vendor_master_category_tenant_idx` (`tenant_id`,`is_active`),
  KEY `vendor_master_category_cat_idx` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `vendor_master_posettings`
--

CREATE TABLE `vendor_master_posettings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL,
  `name` varchar(200) NOT NULL,
  `prefix` varchar(50) DEFAULT NULL,
  `suffix` varchar(50) DEFAULT NULL,
  `digits` int NOT NULL DEFAULT '4',
  `auto_year` tinyint(1) NOT NULL DEFAULT '0',
  `current_number` int NOT NULL DEFAULT '1',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `category_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vendor_master_posettings_tenant_idx` (`tenant_id`),
  KEY `vendor_master_posettings_name_idx` (`tenant_id`,`name`),
  KEY `vendor_master_posettings_category_fk` (`category_id`),
  CONSTRAINT `vendor_master_posettings_category_fk` FOREIGN KEY (`category_id`) REFERENCES `inventory_master_category` (`id`) ON DELETE PROTECT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `vendor_master_basicdetail`
--

CREATE TABLE `vendor_master_basicdetail` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL,
  `vendor_code` varchar(50) DEFAULT NULL,
  `vendor_name` varchar(200) NOT NULL,
  `pan_no` varchar(10) DEFAULT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `contact_no` varchar(20) NOT NULL,
  `is_also_customer` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vendor_master_basicdetail_code_uniq` (`tenant_id`,`vendor_code`),
  KEY `vendor_master_basicdetail_tenant_idx` (`tenant_id`),
  KEY `vendor_master_basicdetail_name_idx` (`tenant_id`,`vendor_name`),
  KEY `vendor_master_basicdetail_email_idx` (`email`),
  KEY `vendor_master_basicdetail_pan_idx` (`pan_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `vendor_master_gstdetails`
--

CREATE TABLE `vendor_master_gstdetails` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL,
  `vendor_basic_detail_id` bigint DEFAULT NULL,
  `gstin` varchar(15) NOT NULL,
  `gst_registration_type` varchar(50) NOT NULL DEFAULT 'regular',
  `legal_name` varchar(200) NOT NULL,
  `trade_name` varchar(200) DEFAULT NULL,
  `gst_state` varchar(100) DEFAULT NULL,
  `gst_state_code` varchar(2) DEFAULT NULL,
  `pan_linked_with_gstin` varchar(10) DEFAULT NULL,
  `date_of_registration` date DEFAULT NULL,
  
  -- Place of Business (Branch) Details
  `reference_name` varchar(200) DEFAULT NULL,
  `branch_address` longtext,
  `branch_contact_person` varchar(100) DEFAULT NULL,
  `branch_email` varchar(255) DEFAULT NULL,
  `branch_contact_no` varchar(20) DEFAULT NULL,

  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vendor_master_gstdetails_gstin_uniq` (`tenant_id`,`gstin`),
  KEY `vendor_master_gstdetails_tenant_idx` (`tenant_id`),
  KEY `vendor_master_gstdetails_gstin_idx` (`gstin`),
  KEY `vendor_master_gstdetails_common_idx` (`tenant_id`,`gstin`),
  KEY `vendor_master_gstdetails_basic_fk` (`vendor_basic_detail_id`),
  CONSTRAINT `vendor_master_gstdetails_basic_fk` FOREIGN KEY (`vendor_basic_detail_id`) REFERENCES `vendor_master_basicdetail` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `vendor_master_productservices`
--

CREATE TABLE `vendor_master_productservices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL,
  `vendor_basic_detail_id` bigint DEFAULT NULL,
  `hsn_sac_code` varchar(20) DEFAULT NULL,
  `item_code` varchar(50) DEFAULT NULL,
  `item_name` varchar(200) NOT NULL,
  `supplier_item_code` varchar(50) DEFAULT NULL,
  `supplier_item_name` varchar(200) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vendor_master_productservices_tenant_idx` (`tenant_id`),
  KEY `vendor_master_productservices_item_idx` (`item_code`),
  KEY `vendor_master_productservices_basic_fk` (`vendor_basic_detail_id`),
  CONSTRAINT `vendor_master_productservices_basic_fk` FOREIGN KEY (`vendor_basic_detail_id`) REFERENCES `vendor_master_basicdetail` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `vendor_master_tds`
--

CREATE TABLE `vendor_master_tds` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL,
  `vendor_basic_detail_id` bigint DEFAULT NULL,
  `tds_section_applicable` varchar(100) DEFAULT NULL,
  `enable_automatic_tds_posting` tinyint(1) NOT NULL DEFAULT '0',
  `msme_udyam_no` varchar(50) DEFAULT NULL,
  `fssai_license_no` varchar(50) DEFAULT NULL,
  `import_export_code` varchar(50) DEFAULT NULL,
  `eou_status` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vendor_master_tds_tenant_idx` (`tenant_id`),
  KEY `vendor_master_tds_basic_fk` (`vendor_basic_detail_id`),
  CONSTRAINT `vendor_master_tds_basic_fk` FOREIGN KEY (`vendor_basic_detail_id`) REFERENCES `vendor_master_basicdetail` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `vendor_master_banking`
--

CREATE TABLE `vendor_master_banking` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL,
  `vendor_basic_detail_id` bigint DEFAULT NULL,
  `bank_account_no` varchar(50) NOT NULL,
  `bank_name` varchar(200) NOT NULL,
  `ifsc_code` varchar(11) NOT NULL,
  `branch_name` varchar(200) DEFAULT NULL,
  `swift_code` varchar(11) DEFAULT NULL,
  `vendor_branch` varchar(200) DEFAULT NULL,
  `account_type` varchar(20) NOT NULL DEFAULT 'current',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vendor_master_banking_tenant_idx` (`tenant_id`),
  KEY `vendor_master_banking_account_idx` (`bank_account_no`),
  KEY `vendor_master_banking_basic_fk` (`vendor_basic_detail_id`),
  CONSTRAINT `vendor_master_banking_basic_fk` FOREIGN KEY (`vendor_basic_detail_id`) REFERENCES `vendor_master_basicdetail` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `vendor_master_terms`
--

CREATE TABLE `vendor_master_terms` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL,
  `vendor_basic_detail_id` bigint DEFAULT NULL,
  `credit_limit` decimal(15,2) DEFAULT NULL,
  `credit_period` varchar(100) DEFAULT NULL,
  `credit_terms` longtext,
  `penalty_terms` longtext,
  `delivery_terms` longtext,
  `warranty_guarantee_details` longtext,
  `force_majeure` longtext,
  `dispute_redressal_terms` longtext,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vendor_master_terms_tenant_idx` (`tenant_id`),
  KEY `vendor_master_terms_basic_fk` (`vendor_basic_detail_id`),
  CONSTRAINT `vendor_master_terms_basic_fk` FOREIGN KEY (`vendor_basic_detail_id`) REFERENCES `vendor_master_basicdetail` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- END OF VENDOR MODULE TABLES
-- ============================================================================
