@echo off
echo ========================================
echo Importing Database to Railway MySQL
echo ========================================
echo.

echo Connecting to Railway MySQL...
echo.

railway connect mysql < database\schema-railway.sql

echo.
echo ========================================
echo Import Complete!
echo ========================================
echo.
echo Next: Test your Railway app
echo Visit: https://your-app.railway.app/api/health
echo Should show: users: 5
echo.
pause
