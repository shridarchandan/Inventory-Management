# Database Setup Instructions

## Quick Setup

The application servers are running, but you need to set up the PostgreSQL database to use the full functionality.

### Option 1: Using PostgreSQL Command Line (if psql is in PATH)

1. Create the datab
   ```sql
   CREATE DATABASE inventory_db;
   ```

2. Run the schema:
   ```bash
   psql -U postgres -d inventory_db -f backend/database/schema.sql
   ```

3. (Optional) Load sample data:
   ```bash
   psql -U postgres -d inventory_db -f backend/database/init.sql
   ```

### Option 2: Using pgAdmin or another PostgreSQL GUI

1. Open pgAdmin or your PostgreSQL GUI tool
2. Create a new database named `inventory_db`
3. Connect to the database and run the contents of `backend/database/schema.sql`
4. (Optional) Run the contents of `backend/database/init.sql` for sample data

### Option 3: Update Database Configuration

If your PostgreSQL is running on a different host/port or with different credentials, update the `backend/.env` file:

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventory_db
DB_USER=postgres
DB_PASSWORD=your_password_here
```

After updating, restart the backend server.

## Verify Database Connection

Once the database is set up, the backend should automatically connect. You can verify by:
- Checking the backend console for "Connected to PostgreSQL database" message
- Visiting http://localhost:5000/api/products (should return empty array or data, not an error)

## Current Status

✅ Backend server: Running on http://localhost:5000
✅ Frontend server: Running on http://localhost:3000
⏳ Database: Needs to be set up (see above)


