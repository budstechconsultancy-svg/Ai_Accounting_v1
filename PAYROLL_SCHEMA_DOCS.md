# Payroll Database Schema Documentation

## Overview
This document describes the complete payroll database schema with all tables properly configured with `tenant_id` columns for multi-tenancy support.

## Table Structure

### 1. Employee Tables (New Normalized Structure)

#### `payroll_employee_basic_details`
**Purpose:** Core employee personal information
- `id` - Primary key
- `tenant_id` - Multi-tenancy identifier (REQUIRED)
- `employee_code` - Unique employee identifier
- `employee_name` - Full name
- `email` - Email address
- `phone` - Contact number
- `date_of_birth` - Birth date
- `gender` - Gender (Male/Female/Other)
- `address` - Residential address
- `status` - Active/Inactive
- Timestamps: `created_at`, `updated_at`

#### `payroll_employee_employment`
**Purpose:** Employment details
- `id` - Primary key
- `employee_basic_id` - Foreign key to basic details (ONE-TO-ONE)
- `tenant_id` - Multi-tenancy identifier (NULLABLE)
- `department` - Department name
- `designation` - Job title
- `date_of_joining` - Joining date
- `employment_type` - Full-Time/Part-Time/Contract/Intern
- Timestamps: `created_at`, `updated_at`

#### `payroll_employee_salary`
**Purpose:** Salary information
- `id` - Primary key
- `employee_basic_id` - Foreign key to basic details (ONE-TO-ONE)
- `tenant_id` - Multi-tenancy identifier (NULLABLE)
- `basic_salary` - Base salary amount
- `hra` - House Rent Allowance
- Timestamps: `created_at`, `updated_at`

#### `payroll_employee_statutory`
**Purpose:** Statutory compliance details
- `id` - Primary key
- `employee_basic_id` - Foreign key to basic details (ONE-TO-ONE)
- `tenant_id` - Multi-tenancy identifier (NULLABLE)
- `pan_number` - PAN card number
- `uan_number` - EPF UAN number
- `esi_number` - ESI number
- `aadhar_number` - Aadhar card number
- Timestamps: `created_at`, `updated_at`

#### `payroll_employee_bank_details`
**Purpose:** Bank account information
- `id` - Primary key
- `employee_basic_id` - Foreign key to basic details (ONE-TO-ONE)
- `tenant_id` - Multi-tenancy identifier (NULLABLE)
- `account_number` - Bank account number
- `ifsc_code` - IFSC code
- `bank_name` - Bank name
- `branch_name` - Branch name
- Timestamps: `created_at`, `updated_at`

### 2. Legacy Employee Table

#### `payroll_employee`
**Purpose:** Backward compatibility (DEPRECATED - use normalized tables above)
- Contains all employee fields in a single table
- Will be phased out after data migration

### 3. Salary Management Tables

#### `payroll_salary_component`
**Purpose:** Define salary components (earnings/deductions)
- `id` - Primary key
- `tenant_id` - Multi-tenancy identifier (REQUIRED)
- `component_code` - Unique code
- `component_name` - Display name
- `component_type` - Earning/Deduction
- `calculation_type` - Fixed/Percentage
- `default_value` - Default amount
- `is_statutory` - Is it statutory?
- `is_active` - Active status

#### `payroll_salary_template`
**Purpose:** Pre-defined salary structures
- `id` - Primary key
- `tenant_id` - Multi-tenancy identifier (REQUIRED)
- `template_name` - Template name
- `description` - Description
- `is_active` - Active status

#### `payroll_salary_template_component`
**Purpose:** Components in a salary template
- Links templates to components with values

### 4. Payroll Processing Tables

#### `payroll_pay_run`
**Purpose:** Monthly/periodic salary processing
- `id` - Primary key
- `tenant_id` - Multi-tenancy identifier (NULLABLE)
- `pay_run_code` - Unique run identifier
- `pay_period` - e.g., "January 2026"
- `start_date`, `end_date` - Period dates
- `payment_date` - When paid
- `total_employees` - Employee count
- `gross_pay`, `total_deductions`, `net_pay` - Totals
- `status` - Draft/Processed/Approved/Paid
- `processed_by` - Who processed it

#### `payroll_pay_run_detail`
**Purpose:** Individual employee payroll for a pay run
- Detailed breakdown of salary, deductions, attendance
- Links to `payroll_pay_run` and `payroll_employee`

### 5. Compliance Tables

#### `payroll_statutory_configuration`
**Purpose:** EPF, ESI, PT, LWF configuration
- `id` - Primary key
- `tenant_id` - Multi-tenancy identifier (REQUIRED)
- `statutory_type` - EPF/ESI/PT/LWF
- `employee_contribution_percentage` - Employee %
- `employer_contribution_percentage` - Employer %
- `salary_threshold` - Threshold amount
- `state` - For PT (state-specific)
- `pt_slab_data` - JSON data for PT slabs

### 6. Attendance & Leave Tables

#### `payroll_attendance`
**Purpose:** Daily attendance records
- `id` - Primary key
- `tenant_id` - Multi-tenancy identifier (REQUIRED)
- `employee_id` - Foreign key
- `attendance_date` - Date
- `status` - Present/Absent/Half-Day/Leave/Holiday
- `check_in_time`, `check_out_time` - Times
- `working_hours`, `overtime_hours` - Hours
- `remarks` - Notes

#### `payroll_leave_application`
**Purpose:** Leave management
- `id` - Primary key
- `tenant_id` - Multi-tenancy identifier (REQUIRED)
- `employee_id` - Foreign key
- `leave_type` - Casual/Sick/Earned/Unpaid/Maternity/Paternity
- `start_date`, `end_date`, `total_days` - Leave period
- `reason` - Reason for leave
- `status` - Pending/Approved/Rejected
- `approved_by`, `approved_date` - Approval info
- `rejection_reason` - If rejected

## Key Features

### Multi-Tenancy Support
- All tables include `tenant_id` for data isolation
- Some tables have NULLABLE `tenant_id` for flexibility
- Unique constraints include `tenant_id` where applicable

### Data Integrity
- Foreign key constraints ensure referential integrity
- Cascade deletes for related records
- Unique constraints prevent duplicates

### Indexing
- Indexes on `tenant_id` for fast filtering
- Composite indexes for common queries
- Unique indexes for business rules

### Timestamps
- All tables have `created_at` and `updated_at`
- Automatic timestamp updates on modification

## Usage

### For New Database Setup
```bash
mysql -u root -p ai_accounting < payroll_tables.sql
```

### For Existing Database
The tables use `CREATE TABLE IF NOT EXISTS`, so it's safe to run on existing databases.

## Migration Notes

1. **New Installations**: Use the normalized structure (employee_basic_details + related tables)
2. **Existing Data**: The legacy `payroll_employee` table is kept for backward compatibility
3. **Data Migration**: Plan to migrate from `payroll_employee` to normalized tables

## Important Notes

⚠️ **tenant_id Column**: All tables now have the `tenant_id` column properly included. This was the fix for the OperationalError that was occurring.

✅ **Schema Matches Django Models**: This schema is synchronized with the Django models in `backend/payroll/models.py`

📝 **Keep Updated**: When Django models change, update this schema file accordingly
