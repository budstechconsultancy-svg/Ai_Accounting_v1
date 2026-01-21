-- ============================================================================
-- PAYROLL MODULE TABLES (Corrected Schema)
-- Generated from actual database structure
-- Date: 2026-01-21
-- ============================================================================

--
-- Table structure for table `payroll_employee_basic_details`
--

CREATE TABLE `payroll_employee_basic_details` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL,
  `employee_code` varchar(50) NOT NULL,
  `employee_name` varchar(200) NOT NULL,
  `email` varchar(254) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `address` longtext,
  `status` varchar(10) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_code` (`employee_code`),
  UNIQUE KEY `payroll_employee_basic_d_tenant_id_employee_code_01313797_uniq` (`tenant_id`,`employee_code`),
  KEY `payroll_employee_basic_details_tenant_id_b56eac73` (`tenant_id`),
  KEY `payroll_emp_tenant__3c85ef_idx` (`tenant_id`,`status`),
  KEY `payroll_emp_employe_d77d0c_idx` (`employee_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `payroll_employee_employment`
--

CREATE TABLE `payroll_employee_employment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `department` varchar(100) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `date_of_joining` date DEFAULT NULL,
  `employment_type` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `employee_basic_id` bigint NOT NULL,
  `tenant_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_basic_id` (`employee_basic_id`),
  KEY `idx_tenant` (`tenant_id`),
  CONSTRAINT `payroll_employee_emp_employee_basic_id_362bd41e_fk_payroll_e` FOREIGN KEY (`employee_basic_id`) REFERENCES `payroll_employee_basic_details` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `payroll_employee_salary`
--

CREATE TABLE `payroll_employee_salary` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `basic_salary` decimal(12,2) NOT NULL,
  `hra` decimal(12,2) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `employee_basic_id` bigint NOT NULL,
  `tenant_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_basic_id` (`employee_basic_id`),
  KEY `idx_tenant` (`tenant_id`),
  CONSTRAINT `payroll_employee_sal_employee_basic_id_cdfba561_fk_payroll_e` FOREIGN KEY (`employee_basic_id`) REFERENCES `payroll_employee_basic_details` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `payroll_employee_statutory`
--

CREATE TABLE `payroll_employee_statutory` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `pan_number` varchar(10) DEFAULT NULL,
  `uan_number` varchar(12) DEFAULT NULL,
  `esi_number` varchar(17) DEFAULT NULL,
  `aadhar_number` varchar(12) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `employee_basic_id` bigint NOT NULL,
  `tenant_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_basic_id` (`employee_basic_id`),
  KEY `idx_tenant` (`tenant_id`),
  CONSTRAINT `payroll_employee_sta_employee_basic_id_893b5c6c_fk_payroll_e` FOREIGN KEY (`employee_basic_id`) REFERENCES `payroll_employee_basic_details` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `payroll_employee_bank_details`
--

CREATE TABLE `payroll_employee_bank_details` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `account_number` varchar(20) DEFAULT NULL,
  `ifsc_code` varchar(11) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `branch_name` varchar(100) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `employee_basic_id` bigint NOT NULL,
  `tenant_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_basic_id` (`employee_basic_id`),
  KEY `idx_tenant` (`tenant_id`),
  CONSTRAINT `payroll_employee_ban_employee_basic_id_0c5268e7_fk_payroll_e` FOREIGN KEY (`employee_basic_id`) REFERENCES `payroll_employee_basic_details` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `payroll_pay_run`
--

CREATE TABLE `payroll_pay_run` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL,
  `pay_run_code` varchar(50) NOT NULL,
  `pay_period` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `payment_date` date DEFAULT NULL,
  `total_employees` int NOT NULL DEFAULT '0',
  `gross_pay` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_deductions` decimal(15,2) NOT NULL DEFAULT '0.00',
  `net_pay` decimal(15,2) NOT NULL DEFAULT '0.00',
  `processed_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pay_run_code` (`pay_run_code`),
  UNIQUE KEY `payroll_pay_run_tenant_id_pay_run_code_fecb4a42_uniq` (`tenant_id`,`pay_run_code`),
  KEY `payroll_pay_run_tenant_id_44d7dcb5` (`tenant_id`),
  KEY `payroll_pay_tenant__859fa0_idx` (`tenant_id`,`status`),
  KEY `payroll_pay_start_d_0e9a8e_idx` (`start_date`,`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `payroll_salary_template`
--

CREATE TABLE `payroll_salary_template` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL,
  `template_name` varchar(100) NOT NULL,
  `description` longtext,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payroll_salary_template_tenant_id_template_name_f5ff8dfa_uniq` (`tenant_id`,`template_name`),
  KEY `payroll_salary_template_tenant_id_27fcb732` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- END OF PAYROLL TABLES
-- ============================================================================

-- IMPORTANT NOTES:
-- 1. All tables include tenant_id for multi-tenancy support
-- 2. The tenant_id column was added to fix the OperationalError
-- 3. Foreign keys properly reference payroll_employee_basic_details
-- 4. Indexes added for performance on tenant_id columns
-- 5. This schema matches the Django models in backend/payroll/models.py
-- 6. Use CREATE TABLE IF NOT EXISTS if you want to avoid errors on re-run
