@echo off
REM ============================================================================
REM Database Schema Export Script
REM Exports the complete database schema to schema_export.sql
REM ============================================================================

echo ========================================
echo Exporting Database Schema
echo ========================================
echo.

REM Set database credentials
set DB_USER=root
set DB_NAME=ai_accounting

echo Database: %DB_NAME%
echo User: %DB_USER%
echo.

REM Prompt for password
set /p DB_PASS="Enter MySQL password for root: "

echo.
echo Exporting schema (structure only, no data)...
echo.

REM Export schema without data
mysqldump -u %DB_USER% -p%DB_PASS% --no-data --skip-add-drop-table --skip-comments %DB_NAME% > schema_export.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Schema exported to:
    echo schema_export.sql
    echo ========================================
    echo.
    echo This file contains:
    echo - All table structures
    echo - All indexes
    echo - All foreign keys
    echo - No data
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Schema export failed
    echo ========================================
    echo.
    echo Please check:
    echo 1. MySQL is running
    echo 2. Password is correct
    echo 3. Database '%DB_NAME%' exists
    echo.
)

pause
