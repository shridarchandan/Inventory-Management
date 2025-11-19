# Database Setup Script for Inventory Management System
# This script automates the PostgreSQL database setup

Write-Host "=== Database Setup Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if psql is available
$psqlCmd = "psql"
try {
    $null = & $psqlCmd --version 2>&1
    Write-Host "✓ PostgreSQL psql found" -ForegroundColor Green
} catch {
    # Try to find PostgreSQL in common locations
    $pgPaths = @(
        "C:\Program Files\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files\PostgreSQL\15\bin\psql.exe",
        "C:\Program Files\PostgreSQL\14\bin\psql.exe",
        "C:\Program Files (x86)\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files (x86)\PostgreSQL\15\bin\psql.exe"
    )
    
    $found = $false
    foreach ($path in $pgPaths) {
        if (Test-Path $path) {
            $psqlCmd = $path
            $found = $true
            Write-Host "✓ PostgreSQL found at: $path" -ForegroundColor Green
            break
        }
    }
    
    if (-not $found) {
        Write-Host "✗ PostgreSQL not found!" -ForegroundColor Red
        Write-Host "Please install PostgreSQL or add it to your PATH." -ForegroundColor Yellow
        Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
        exit 1
    }
}

# Get database credentials
Write-Host ""
$dbUser = Read-Host "Enter PostgreSQL username (default: postgres)"
if ([string]::IsNullOrWhiteSpace($dbUser)) {
    $dbUser = "postgres"
}

$dbPassword = Read-Host "Enter PostgreSQL password" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
)

# Set password environment variable
$env:PGPASSWORD = $dbPasswordPlain

# Navigate to project directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host ""
Write-Host "Setting up database..." -ForegroundColor Cyan

# Step 1: Create database
Write-Host "1. Creating database 'inventory_db'..." -ForegroundColor Yellow
$createDb = & $psqlCmd -U $dbUser -c "SELECT 1 FROM pg_database WHERE datname = 'inventory_db'" 2>&1
if ($LASTEXITCODE -eq 0 -and $createDb -match "1") {
    Write-Host "   Database already exists. Skipping creation." -ForegroundColor Gray
} else {
    $result = & $psqlCmd -U $dbUser -c "CREATE DATABASE inventory_db;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Database created successfully" -ForegroundColor Green
    } else {
        if ($result -match "already exists") {
            Write-Host "   Database already exists. Continuing..." -ForegroundColor Gray
        } else {
            Write-Host "   ✗ Error creating database: $result" -ForegroundColor Red
            $env:PGPASSWORD = $null
            exit 1
        }
    }
}

# Step 2: Run schema
Write-Host "2. Creating tables (running schema.sql)..." -ForegroundColor Yellow
$schemaFile = Join-Path $scriptDir "backend\database\schema.sql"
if (Test-Path $schemaFile) {
    $result = & $psqlCmd -U $dbUser -d inventory_db -f $schemaFile 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Tables created successfully" -ForegroundColor Green
    } else {
        if ($result -match "already exists") {
            Write-Host "   Tables already exist. Continuing..." -ForegroundColor Gray
        } else {
            Write-Host "   ✗ Error creating tables: $result" -ForegroundColor Red
            $env:PGPASSWORD = $null
            exit 1
        }
    }
} else {
    Write-Host "   ✗ Schema file not found: $schemaFile" -ForegroundColor Red
    $env:PGPASSWORD = $null
    exit 1
}

# Step 3: Load sample data (optional)
Write-Host ""
$loadData = Read-Host "Load sample data? (y/n, default: y)"
if ([string]::IsNullOrWhiteSpace($loadData) -or $loadData -eq "y" -or $loadData -eq "Y") {
    Write-Host "3. Loading sample data (running init.sql)..." -ForegroundColor Yellow
    $initFile = Join-Path $scriptDir "backend\database\init.sql"
    if (Test-Path $initFile) {
        $result = & $psqlCmd -U $dbUser -d inventory_db -f $initFile 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✓ Sample data loaded successfully" -ForegroundColor Green
        } else {
            Write-Host "   ⚠ Warning loading data: $result" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚠ Init file not found: $initFile" -ForegroundColor Yellow
    }
} else {
    Write-Host "3. Skipping sample data load" -ForegroundColor Gray
}

# Step 4: Verify setup
Write-Host ""
Write-Host "4. Verifying setup..." -ForegroundColor Yellow
$verify = & $psqlCmd -U $dbUser -d inventory_db -c "SELECT COUNT(*) FROM products;" -t 2>&1
if ($LASTEXITCODE -eq 0) {
    $productCount = ($verify -replace '\s', '').Trim()
    Write-Host "   ✓ Database setup complete!" -ForegroundColor Green
    Write-Host "   Products in database: $productCount" -ForegroundColor Cyan
} else {
    Write-Host "   ⚠ Could not verify setup: $verify" -ForegroundColor Yellow
}

# Clear password
$env:PGPASSWORD = $null

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure your backend .env file has the correct database credentials" -ForegroundColor White
Write-Host "2. Restart your backend server: cd backend && npm start" -ForegroundColor White
Write-Host ""


