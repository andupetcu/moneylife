#!/usr/bin/env bash
set -euo pipefail

# Seed development data into the local PostgreSQL instance.
# Requires: DATABASE_URL env var or defaults to local docker compose instance.

DB_URL="${DATABASE_URL:-postgres://moneylife:localdev123@localhost:5432/moneylife}"

info() { echo "▸ $1"; }
ok()   { echo "✓ $1"; }

info "Seeding development data..."

# Run SQL seed files if they exist
SEED_DIR="$(dirname "$0")/../../packages/db-migrations/seeds"

if [ -d "$SEED_DIR" ]; then
  for seed_file in "$SEED_DIR"/*.sql; do
    [ -f "$seed_file" ] || continue
    info "Applying $(basename "$seed_file")..."
    psql "$DB_URL" -f "$seed_file" 2>/dev/null || echo "  (skipped — table may not exist yet)"
  done
  ok "SQL seeds applied"
else
  info "No seed directory found at $SEED_DIR — skipping SQL seeds"
fi

# Create default dev user
psql "$DB_URL" -c "
  INSERT INTO users (id, email, password_hash, display_name, date_of_birth, timezone, locale, role, status, created_at, updated_at)
  VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'dev@moneylife.app',
    '\$2b\$12\$LJ3m4ys3Lk0TSwMBfWJ8puQODeGnMo9MdbxXs8bDOYRCRMxrNIRUm',
    'Dev User',
    '1995-06-15',
    'Europe/Bucharest',
    'en',
    'player',
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO NOTHING;
" 2>/dev/null || info "Users table not yet created — skipping dev user"

ok "Development data seeded"
echo ""
echo "  Dev user: dev@moneylife.app / password123"
echo ""
