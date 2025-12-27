@echo off
echo Updating master_ledgers table...
echo.
echo Please enter your MySQL root password when prompted.
echo.

mysql -u root -p ai_accounting_db < migrate_master_ledgers.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Database updated successfully!
    echo.
) else (
    echo.
    echo ✗ Error updating database. Please check your MySQL credentials.
    echo.
)

pause
