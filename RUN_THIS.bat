@echo off
cls
echo.
echo ========================================================
echo    Railway Database Import - Automatic Tool
echo ========================================================
echo.
echo This will automatically import your database to Railway.
echo.
echo You only need to provide your Railway MySQL password.
echo.
echo ========================================================
echo.
pause
echo.

node auto-import.js

echo.
pause
