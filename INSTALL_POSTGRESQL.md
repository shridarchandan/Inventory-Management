# Installing PostgreSQL on Windows

## Quick Installation Guide

### Option 1: Using PostgreSQL Installer (Recommended)

1. **Download PostgreSQL:**
   - Visit: https://www.postgresql.org/download/windows/
   - Click "Download the installer" 
   - Download the latest version (e.g., PostgreSQL 16.x)

2. **Run the Installer:**
   - Run the downloaded `.exe` file
   - Follow the installation wizard
   - **Important:** Remember the password you set for the `postgres` user
   - **Important:** Check "Add PostgreSQL bin directory to PATH" during installation

3. **Verify Installation:**
   ```powershell
   psql --version
   ```

4. **Start PostgreSQL Service:**
   ```powershell
   # PostgreSQL service should start automatically, but if not:
   Start-Service postgresql-x64-16  # Replace with your version
   ```

### Option 2: Using Chocolatey (If you have Chocolatey installed)

```powershell
choco install postgresql
```

### Option 3: Using Docker (For Development)

If you prefer using Docker for local development:

```powershell
# Run PostgreSQL in Docker
docker run --name postgres-inventory `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=inventory_db `
  -p 5432:5432 `
  -d postgres:16

# Then use docker exec to run psql commands
docker exec -it postgres-inventory psql -U postgres -d inventory_db
```

## After Installation

Once PostgreSQL is installed, you can:

1. **Find the installation path:**
   ```powershell
   Get-ChildItem "C:\Program Files\PostgreSQL" | Select-Object Name
   ```

2. **Use psql directly** (if added to PATH):
   ```powershell
   psql -U postgres
   ```

3. **Or use the full path:**
   ```powershell
   & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
   ```
   (Replace `16` with your actual version number)

## Default Connection Details

- **Host:** localhost
- **Port:** 5432
- **Default User:** postgres
- **Password:** (the one you set during installation)

## Next Steps

After installing PostgreSQL, you can:
1. Run the database setup script: `.\setup-database.ps1`
2. Or follow the manual setup in `DATABASE_SETUP_TERMINAL.md`


