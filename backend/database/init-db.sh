#!/bin/bash
# Database initialization script for Kubernetes/AWS deployment
# This script is idempotent - safe to run multiple times

set -e

echo "Starting database initialization..."

# Resolve connection parameters from env:
PGHOST="${DB_HOST:-localhost}"
PGPORT="${DB_PORT:-5432}"
PGUSER="${DB_USER:-${POSTGRES_USER:-postgres}}"
PGDATABASE="${DB_NAME:-${POSTGRES_DB:-inventory_db}}"

# Wait for PostgreSQL to be ready
until pg_isready -h "$PGHOST" -p "$PGPORT" -U "$PGUSER"; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done

echo "PostgreSQL is ready!"

# Create database if it doesn't exist
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -tc \
  "SELECT 1 FROM pg_database WHERE datname = '$PGDATABASE'" | grep -q 1 || \
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -c "CREATE DATABASE $PGDATABASE;"

echo "Database '$PGDATABASE' is ready"

echo "Running schema..."
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -f /schema.sql

if [ "${DB_LOAD_SAMPLE_DATA:-false}" = "true" ]; then
  echo "Loading sample data..."
  psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -f /init.sql
  echo "Sample data loaded"
else
  echo "Skipping sample data (set DB_LOAD_SAMPLE_DATA=true to load)"
fi

echo "Database initialization complete!"
