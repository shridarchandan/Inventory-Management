# Database Setup via Terminal (Windows PowerShell)

## Step 1: Check if PostgreSQL is Installed

Run this command to check if `psql` is available:

```powershell
psql --version
```

If you get an error, PostgreSQL might not be installed or not in your PATH.

### Option A: If PostgreSQL is Installed but not in PATH

Find your PostgreSQL installation (usually in `C:\Program Files\PostgreSQL\<version>\bin\`) and add it to PATH, or use the full path:

```powershell
# Example: Replace <version> with your PostgreSQL version (e.g., 15, 16)
& "C:\Program Files\PostgreSQL\<version>\bin\psql.exe" --version
```

### Option B: Install PostgreSQL

If PostgreSQL is not installed:
1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set for the `postgres` user
4. Make sure to add PostgreSQL to PATH during installation

## Step 2: Create the Database

Connect to PostgreSQL and create the database:

```powershell
# Connect to PostgreSQL (default user is 'postgres')
# You'll be prompted for the password
psql -U postgres

# Or if psql is not in PATH, use full path:
# & "C:\Program Files\PostgreSQL\<version>\bin\psql.exe" -U postgres
```

Once connected, run these SQL commands:

```sql
-- Create the database
CREATE DATABASE inventory_db;

-- Connect to the new database
\c inventory_db

-- Exit psql
\q
```

**OR** create the database directly from command line:

```powershell
# Create database (you'll be prompted for password)
psql -U postgres -c "CREATE DATABASE inventory_db;"
```

## Step 3: Run the Schema (Create Tables)

Execute the schema file to create all tables:

```powershell
# Navigate to project root if not already there
cd "D:\chandan\devops\dock+kub+jenk"

# Run the schema file (you'll be prompted for password)
psql -U postgres -d inventory_db -f backend\database\schema.sql
```

**OR** if psql is not in PATH:

```powershell
& "C:\Program Files\PostgreSQL\<version>\bin\psql.exe" -U postgres -d inventory_db -f backend\database\schema.sql
```

## Step 4: (Optional) Load Sample Data

Load sample data for testing:

```powershell
psql -U postgres -d inventory_db -f backend\database\init.sql
```

## Step 5: Verify Database Setup

Verify the tables were created:

```powershell
# Connect to the database
psql -U postgres -d inventory_db

# List all tables
\dt

# Check if data was loaded (if you ran init.sql)
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM suppliers;

# Exit
\q
```

## Alternative: Using Environment Variables for Password

If you want to avoid entering the password each time, you can set the `PGPASSWORD` environment variable:

```powershell
# Set password for current session (replace 'your_password' with your actual password)
$env:PGPASSWORD = "your_password"

# Now you can run commands without password prompt
psql -U postgres -d inventory_db -f backend\database\schema.sql
```

**Note:** This is less secure. Clear it after use:
```powershell
$env:PGPASSWORD = $null
```

## Quick Setup Script

Here's a complete script you can run (modify the password and PostgreSQL path as needed):

```powershell
# Set your PostgreSQL password (modify this)
$env:PGPASSWORD = "postgres"

# Set PostgreSQL bin path if not in PATH (modify version number)
$psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
# Or use 'psql' if it's in PATH:
# $psqlPath = "psql"

# Navigate to project directory
cd "D:\chandan\devops\dock+kub+jenk"

# Create database
Write-Host "Creating database..."
& $psqlPath -U postgres -c "CREATE DATABASE inventory_db;" 2>&1

# Run schema
Write-Host "Creating tables..."
& $psqlPath -U postgres -d inventory_db -f backend\database\schema.sql 2>&1

# Load sample data
Write-Host "Loading sample data..."
& $psqlPath -U postgres -d inventory_db -f backend\database\init.sql 2>&1

Write-Host "Database setup complete!"

# Clear password
$env:PGPASSWORD = $null
```

## Troubleshooting

### Error: "psql: command not found"
- PostgreSQL is not installed or not in PATH
- Add PostgreSQL bin directory to your system PATH
- Or use the full path to psql.exe

### Error: "password authentication failed"
- Check your PostgreSQL password
- Default user is `postgres` unless you created a different user

### Error: "database already exists"
- The database already exists, you can skip creation or drop it first:
  ```sql
  DROP DATABASE inventory_db;
  CREATE DATABASE inventory_db;
  ```

### Error: "relation already exists"
- Tables already exist, you can drop them or modify the schema to use `DROP TABLE IF EXISTS` before `CREATE TABLE`

## After Setup

Once the database is set up, restart your backend server:

```powershell
cd backend
npm start
```

The backend should now connect to the database successfully!


