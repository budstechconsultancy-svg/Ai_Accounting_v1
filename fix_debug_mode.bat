@echo off
echo ========================================
echo FIXING DEBUG MODE IN .ENV
echo ========================================
echo.

cd "c:\108\django v3\backend"

echo Current .env content:
type .env | findstr "DJANGO_DEBUG"
echo.

echo Updating DJANGO_DEBUG to True...
powershell -Command "(Get-Content .env) -replace 'DJANGO_DEBUG=False', 'DJANGO_DEBUG=True' | Set-Content .env"

echo.
echo Updated .env content:
type .env | findstr "DJANGO_DEBUG"
echo.

echo ========================================
echo DONE! Now restart Django server:
echo 1. Press CTRL+C in Django terminal
echo 2. Run: python manage.py runserver
echo ========================================
pause
