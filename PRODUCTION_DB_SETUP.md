# Production Database Setup - Automated Initialization

## Overview

For production deployments (Docker Compose, Kubernetes, AWS), the database should be **automatically initialized** when the database container/service starts. You should **never** need to manually run database setup commands in production.

## How It Works

### 1. Idempotent SQL Scripts

The SQL files (`schema.sql` and `init.sql`) are already **idempotent** - meaning they can be run multiple times safely:

- `CREATE TABLE IF NOT EXISTS` - won't fail if table exists
- `CREATE INDEX IF NOT EXISTS` - won't fail if index exists  
- `ON CONFLICT DO NOTHING` - won't fail if data exists

This means the scripts are safe to run every time the container starts.

### 2. Database Initialization Script

The `backend/database/init-db.sh` script handles:
- Waiting for PostgreSQL to be ready
- Creating the database if it doesn't exist
- Running the schema to create tables
- Optionally loading sample data

### 3. When You Create Docker Compose

When you write your `docker-compose.yml`, you can automate database initialization using one of these approaches:

#### Option A: Using PostgreSQL Init Scripts
PostgreSQL Docker image automatically runs `.sql` and `.sh` files from `/docker-entrypoint-initdb.d/` directory when the database is first created.

#### Option B: Using Init Containers (Kubernetes)
A separate init container runs before your application starts to set up the database.

#### Option C: Using Entrypoint Scripts
Your database container can have a custom entrypoint that runs the initialization script.

## Key Points

✅ **Database setup is automated** - No manual commands needed  
✅ **Idempotent scripts** - Safe to run multiple times  
✅ **Environment-based** - Uses environment variables for configuration  
✅ **Production-ready** - Works with Docker Compose, Kubernetes, AWS RDS, etc.

## For Your Docker Compose Practice

When you create your `docker-compose.yml`, you'll want to:

1. Mount the SQL scripts into the PostgreSQL container's `/docker-entrypoint-initdb.d/` directory
2. Or use the `init-db.sh` script as an entrypoint
3. Ensure the backend waits for the database to be ready before starting

The database will be automatically initialized when the container first starts, and the scripts are safe to run again if needed.

## Current SQL Files Status

- ✅ `schema.sql` - Already idempotent (uses `IF NOT EXISTS`)
- ✅ `init.sql` - Already idempotent (uses `ON CONFLICT DO NOTHING`)
- ✅ `init-db.sh` - Automated initialization script ready to use

You're all set! The database will initialize automatically when you deploy with Docker Compose or Kubernetes.


