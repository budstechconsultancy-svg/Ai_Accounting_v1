# Backend Cleanup Script
# This script organizes the backend directory by moving test/debug files to appropriate locations

# Files to DELETE (temporary/test files)
$filesToDelete = @(
    # Test output files
    "owner_test_output.txt",
    "owner_token_output.log",
    "test_daybook.xlsx",
    
    # Old environment example (we have better templates now)
    ".env.example"
)

# Files to MOVE to scripts/ directory
$filesToMoveToScripts = @(
    # Test scripts
    "test_429_reproduction.py",
    "test_admin_token.py",
    "test_ai_high_load.py",
    "test_dashboard_flow.py",
    "test_data_storage.py",
    "test_email_otp_flow.py",
    "test_excel_download.py",
    "test_jwt_auth.py",
    "test_login.py",
    "test_login_api.py",
    "test_login_debug.py",
    "test_otp_bypass.py",
    "test_otp_system.py",
    "test_phone.py",
    "test_rbac_functionality.py",
    "test_split_tables.py",
    "test_stale_cookie.py",
    "test_twilio_sms.py",
    "test_user_creation_tenant.py",
    "test_voucher_creation.py",
    
    # Debug scripts
    "debug_admin_auth.py",
    "debug_check_user.py",
    "simple_owner_test.py",
    
    # Database utility scripts
    "apply_schema.py",
    "check_owners.py",
    "check_voucher_schema.py",
    "clear_database.py",
    "create_admin_user.py",
    "create_db.py",
    "create_test_admin.py",
    "delete_all_data.py",
    "fix_voucher_schema.py",
    "reactivate_users.py",
    "reset_admin_password.py",
    "reset_password.py",
    "run_cleanup.py",
    "scan_urls.py",
    "seed_rbac.py",
    "setup_test_users.py",
    "strict_cleanup.py",
    "verify_all_data_saving.py",
    "verify_api_permissions.py",
    "verify_cleanup.py",
    "verify_login.py",
    "verify_schema_fix.py",
    
    # SQL files
    "cleanup_tables.sql",
    "correct_schema.sql",
    "test_rbac.sql"
)

# Files to KEEP in root (production files)
$productionFiles = @(
    "manage.py",
    "requirements.txt",
    "gunicorn_config.py",
    "manage_workers.py",
    "pyproject.toml",
    "pyrightconfig.json",
    "Dockerfile",
    "Dockerfile.worker",
    ".gitignore",
    ".env",
    ".env.development.template",
    ".env.production.template",
    "CONFIGURATION_SUMMARY.md",
    "PRODUCTION_SETUP.md"
)

Write-Host "🧹 Backend Directory Cleanup" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Create scripts directory if it doesn't exist
if (-Not (Test-Path "scripts")) {
    Write-Host "📁 Creating scripts/ directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "scripts" | Out-Null
}

# Delete unnecessary files
Write-Host "🗑️  Deleting temporary files..." -ForegroundColor Yellow
foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "   ✓ Deleted: $file" -ForegroundColor Green
    }
}

# Move files to scripts directory
Write-Host ""
Write-Host "📦 Moving utility scripts to scripts/..." -ForegroundColor Yellow
$movedCount = 0
foreach ($file in $filesToMoveToScripts) {
    if (Test-Path $file) {
        Move-Item $file "scripts/$file" -Force
        $movedCount++
    }
}
Write-Host "   ✓ Moved $movedCount files to scripts/" -ForegroundColor Green

Write-Host ""
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "✅ Cleanup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Directory Structure:" -ForegroundColor Cyan
Write-Host "   backend/" -ForegroundColor White
Write-Host "   ├── manage.py" -ForegroundColor White
Write-Host "   ├── requirements.txt" -ForegroundColor White
Write-Host "   ├── gunicorn_config.py" -ForegroundColor White
Write-Host "   ├── .env (protected)" -ForegroundColor Yellow
Write-Host "   ├── .env.*.template" -ForegroundColor White
Write-Host "   ├── backend/ (Django settings)" -ForegroundColor White
Write-Host "   ├── core/ (main app)" -ForegroundColor White
Write-Host "   ├── accounting/ (app)" -ForegroundColor White
Write-Host "   ├── inventory/ (app)" -ForegroundColor White
Write-Host "   ├── otp/ (app)" -ForegroundColor White
Write-Host "   ├── scripts/ (utilities & tests)" -ForegroundColor Cyan
Write-Host "   └── venv/ (virtual environment)" -ForegroundColor White
Write-Host ""
