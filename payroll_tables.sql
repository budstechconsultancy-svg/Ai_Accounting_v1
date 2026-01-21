-- ============================================================================
-- PAYROLL MODULE TABLES
-- Generated: 2026-01-21
-- Note: All tables include tenant_id for multi-tenancy support
-- ============================================================================

-- Employee Basic Details Table
CREATE TABLE IF NOT EXISTS `payroll_employee_basic_details` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` VARCHAR(36) NOT NULL,
    `employee_code` VARCHAR(50) NOT NULL UNIQUE,
    `employee_name` VARCHAR(200) NOT NULL,
    `email` VARCHAR(254) NOT NULL,
    `phone` VARCHAR(30) NULL,
    `date_of_birth` DATE NULL,
    `gender` VARCHAR(10) NULL,
    `address` TEXT NULL,
    `status` VARCHAR(10) NOT NULL DEFAULT 'Active',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_tenant_status` (`tenant_id`, `status`),
    INDEX `idx_employee_code` (`employee_code`),
    UNIQUE KEY `unique_tenant_employee` (`tenant_id`, `employee_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employee Employment Details Table
CREATE TABLE IF NOT EXISTS `payroll_employee_employment` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `employee_basic_id` BIGINT NOT NULL UNIQUE,
    `tenant_id` VARCHAR(36) NULL,
    `department` VARCHAR(100) NULL,
    `designation` VARCHAR(100) NULL,
    `date_of_joining` DATE NULL,
    `employment_type` VARCHAR(20) NOT NULL DEFAULT 'Full-Time',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_tenant` (`tenant_id`),
    FOREIGN KEY (`employee_basic_id`) REFERENCES `payroll_employee_basic_details`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employee Salary Details Table
CREATE TABLE IF NOT EXISTS `payroll_employee_salary` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `employee_basic_id` BIGINT NOT NULL UNIQUE,
    `tenant_id` VARCHAR(36) NULL,
    `basic_salary` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `hra` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_tenant` (`tenant_id`),
    FOREIGN KEY (`employee_basic_id`) REFERENCES `payroll_employee_basic_details`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employee Statutory Details Table
CREATE TABLE IF NOT EXISTS `payroll_employee_statutory` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `employee_basic_id` BIGINT NOT NULL UNIQUE,
    `tenant_id` VARCHAR(36) NULL,
    `pan_number` VARCHAR(10) NULL,
    `uan_number` VARCHAR(12) NULL,
    `esi_number` VARCHAR(17) NULL,
    `aadhar_number` VARCHAR(12) NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_tenant` (`tenant_id`),
    FOREIGN KEY (`employee_basic_id`) REFERENCES `payroll_employee_basic_details`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employee Bank Details Table
CREATE TABLE IF NOT EXISTS `payroll_employee_bank_details` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `employee_basic_id` BIGINT NOT NULL UNIQUE,
    `tenant_id` VARCHAR(36) NULL,
    `account_number` VARCHAR(20) NULL,
    `ifsc_code` VARCHAR(11) NULL,
    `bank_name` VARCHAR(100) NULL,
    `branch_name` VARCHAR(100) NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_tenant` (`tenant_id`),
    FOREIGN KEY (`employee_basic_id`) REFERENCES `payroll_employee_basic_details`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Legacy Employee Table (for backward compatibility)
CREATE TABLE IF NOT EXISTS `payroll_employee` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` VARCHAR(36) NOT NULL,
    `employee_code` VARCHAR(50) NOT NULL UNIQUE,
    `employee_name` VARCHAR(200) NOT NULL,
    `email` VARCHAR(254) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `date_of_birth` DATE NULL,
    `gender` VARCHAR(10) NULL,
    `address` TEXT NULL,
    `department` VARCHAR(100) NULL,
    `designation` VARCHAR(100) NULL,
    `date_of_joining` DATE NULL,
    `employment_type` VARCHAR(20) NOT NULL DEFAULT 'Full-Time',
    `basic_salary` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `hra` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `pan_number` VARCHAR(10) NULL,
    `uan_number` VARCHAR(12) NULL,
    `esi_number` VARCHAR(17) NULL,
    `aadhar_number` VARCHAR(12) NULL,
    `account_number` VARCHAR(20) NULL,
    `ifsc_code` VARCHAR(11) NULL,
    `bank_name` VARCHAR(100) NULL,
    `branch_name` VARCHAR(100) NULL,
    `status` VARCHAR(10) NOT NULL DEFAULT 'Active',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_tenant_status` (`tenant_id`, `status`),
    INDEX `idx_employee_code` (`employee_code`),
    UNIQUE KEY `unique_tenant_employee` (`tenant_id`, `employee_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Salary Component Table
CREATE TABLE IF NOT EXISTS `payroll_salary_component` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` VARCHAR(36) NOT NULL,
    `component_code` VARCHAR(50) NOT NULL,
    `component_name` VARCHAR(100) NOT NULL,
    `component_type` VARCHAR(10) NOT NULL,
    `calculation_type` VARCHAR(20) NOT NULL DEFAULT 'Fixed',
    `default_value` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `is_statutory` TINYINT(1) NOT NULL DEFAULT 0,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_tenant` (`tenant_id`),
    UNIQUE KEY `unique_tenant_component` (`tenant_id`, `component_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Salary Template Table
CREATE TABLE IF NOT EXISTS `payroll_salary_template` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` VARCHAR(36) NOT NULL,
    `template_name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_tenant` (`tenant_id`),
    UNIQUE KEY `unique_tenant_template` (`tenant_id`, `template_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Salary Template Component Table
CREATE TABLE IF NOT EXISTS `payroll_salary_template_component` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `template_id` BIGINT NOT NULL,
    `component_id` BIGINT NOT NULL,
    `value` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_template_component` (`template_id`, `component_id`),
    FOREIGN KEY (`template_id`) REFERENCES `payroll_salary_template`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`component_id`) REFERENCES `payroll_salary_component`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pay Run Table
CREATE TABLE IF NOT EXISTS `payroll_pay_run` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` VARCHAR(36) NULL,
    `pay_run_code` VARCHAR(50) NULL UNIQUE,
    `pay_period` VARCHAR(50) NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `payment_date` DATE NULL,
    `total_employees` INT NOT NULL DEFAULT 0,
    `gross_pay` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `total_deductions` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `net_pay` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `status` VARCHAR(20) NULL DEFAULT 'Draft',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `processed_by` VARCHAR(100) NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_tenant_status` (`tenant_id`, `status`),
    INDEX `idx_date_range` (`start_date`, `end_date`),
    UNIQUE KEY `unique_tenant_payrun` (`tenant_id`, `pay_run_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pay Run Detail Table
CREATE TABLE IF NOT EXISTS `payroll_pay_run_detail` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `pay_run_id` BIGINT NOT NULL,
    `employee_id` BIGINT NOT NULL,
    `basic_salary` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `hra` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `other_allowances` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `gross_salary` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `epf_employee` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `esi_employee` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `professional_tax` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `tds` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `other_deductions` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total_deductions` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `net_salary` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `days_present` INT NOT NULL DEFAULT 0,
    `days_absent` INT NOT NULL DEFAULT 0,
    `paid_leaves` INT NOT NULL DEFAULT 0,
    `is_paid` TINYINT(1) NOT NULL DEFAULT 0,
    `payment_date` DATE NULL,
    `payment_reference` VARCHAR(100) NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_payrun_employee` (`pay_run_id`, `employee_id`),
    FOREIGN KEY (`pay_run_id`) REFERENCES `payroll_pay_run`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`employee_id`) REFERENCES `payroll_employee`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Statutory Configuration Table
CREATE TABLE IF NOT EXISTS `payroll_statutory_configuration` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` VARCHAR(36) NOT NULL,
    `statutory_type` VARCHAR(10) NOT NULL,
    `employee_contribution_percentage` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `employer_contribution_percentage` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `salary_threshold` DECIMAL(12, 2) NULL DEFAULT 0.00,
    `state` VARCHAR(50) NULL,
    `pt_slab_data` JSON NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_tenant` (`tenant_id`),
    UNIQUE KEY `unique_tenant_statutory` (`tenant_id`, `statutory_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attendance Table
CREATE TABLE IF NOT EXISTS `payroll_attendance` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` VARCHAR(36) NOT NULL,
    `employee_id` BIGINT NOT NULL,
    `attendance_date` DATE NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Present',
    `check_in_time` TIME NULL,
    `check_out_time` TIME NULL,
    `working_hours` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `overtime_hours` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `remarks` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_tenant_date` (`tenant_id`, `attendance_date`),
    UNIQUE KEY `unique_employee_date` (`employee_id`, `attendance_date`),
    FOREIGN KEY (`employee_id`) REFERENCES `payroll_employee`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Leave Application Table
CREATE TABLE IF NOT EXISTS `payroll_leave_application` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` VARCHAR(36) NOT NULL,
    `employee_id` BIGINT NOT NULL,
    `leave_type` VARCHAR(20) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `total_days` INT NOT NULL DEFAULT 1,
    `reason` TEXT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Pending',
    `approved_by` VARCHAR(100) NULL,
    `approved_date` DATETIME NULL,
    `rejection_reason` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_tenant_status` (`tenant_id`, `status`),
    INDEX `idx_employee_date` (`employee_id`, `start_date`),
    FOREIGN KEY (`employee_id`) REFERENCES `payroll_employee`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- END OF PAYROLL TABLES
-- ============================================================================
