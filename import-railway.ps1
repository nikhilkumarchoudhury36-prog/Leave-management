# Import database schema to Railway MySQL
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Importing Database to Railway MySQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Reading schema file..." -ForegroundColor Yellow
$schema = Get-Content "database\schema-railway.sql" -Raw

Write-Host "Connecting to Railway MySQL..." -ForegroundColor Yellow
Write-Host ""

# Use Railway CLI to connect and import
$schema | railway connect mysql

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Import Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Visit: https://your-app.railway.app/api/health"
Write-Host "2. Should show: users: 5, leaveTypes: 4"
Write-Host "3. Test login: manager@company.com / Admin@123"
Write-Host ""
