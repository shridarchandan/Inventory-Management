#!/bin/bash
# Database initialization script for Kubernetes/AWS deployment
# This script is idempotent - safe to run multiple times

set -e

echo "Starting database initialization..."

# Wait for PostgreSQL to be ready
until pg_isready -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}"; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done

echo "PostgreSQL is ready!"

# Create database if it doesn't exist
psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -tc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME:-inventory_db}'" | grep -q 1 || \
psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -c "CREATE DATABASE ${DB_NAME:-inventory_db};"

echo "Database '${DB_NAME:-inventory_db}' is ready"

# Run schema
echo "Running schema..."
psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -d "${DB_NAME:-inventory_db}" -f /scripts/schema.sql

echo "Schema applied successfully"

# Optionally load sample data (only if DB_LOAD_SAMPLE_DATA is set to 'true')
if [ "${DB_LOAD_SAMPLE_DATA:-false}" = "true" ]; then
  echo "Loading sample data..."
  psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -d "${DB_NAME:-inventory_db}" -f /scripts/init.sql
  echo "Sample data loaded"
else
  echo "Skipping sample data (set DB_LOAD_SAMPLE_DATA=true to load)"
fi

echo "Database initialization complete!"


