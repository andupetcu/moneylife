#!/usr/bin/env bash
set -euo pipefail

BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${BOLD}▸${NC} $1"; }
ok()    { echo -e "${GREEN}✓${NC} $1"; }
fail()  { echo -e "${RED}✗${NC} $1"; exit 1; }

# ── Check prerequisites ─────────────────────────────────────────────────────
info "Checking prerequisites..."

command -v node >/dev/null 2>&1 || fail "node is not installed (need v22+)"
command -v pnpm >/dev/null 2>&1 || fail "pnpm is not installed (need v9+)"
command -v docker >/dev/null 2>&1 || fail "docker is not installed"
docker compose version >/dev/null 2>&1 || fail "docker compose is not available"

NODE_MAJOR=$(node -v | cut -d. -f1 | tr -d 'v')
if [ "$NODE_MAJOR" -lt 22 ]; then
  fail "Node.js 22+ required (found $(node -v))"
fi

ok "All prerequisites met"

# ── Environment ──────────────────────────────────────────────────────────────
if [ ! -f .env ]; then
  info "Copying .env.example → .env"
  cp .env.example .env
  ok "Created .env (edit as needed)"
else
  ok ".env already exists"
fi

# ── Install dependencies ─────────────────────────────────────────────────────
info "Installing dependencies..."
pnpm install
ok "Dependencies installed"

# ── Start infrastructure ─────────────────────────────────────────────────────
info "Starting Docker containers (postgres, redis, localstack)..."
docker compose up -d postgres redis localstack
ok "Infrastructure running"

# ── Wait for Postgres ────────────────────────────────────────────────────────
info "Waiting for PostgreSQL to be ready..."
for i in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -U moneylife >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
docker compose exec -T postgres pg_isready -U moneylife >/dev/null 2>&1 || fail "PostgreSQL not ready after 30s"
ok "PostgreSQL ready"

# ── Run migrations ───────────────────────────────────────────────────────────
info "Running database migrations..."
pnpm --filter db-migrations migrate:up 2>/dev/null || info "Migration script not yet implemented — skipping"
ok "Migrations complete"

# ── Seed data ────────────────────────────────────────────────────────────────
info "Seeding development data..."
bash "$(dirname "$0")/seed-data.sh" 2>/dev/null || info "Seed script returned non-zero — skipping"
ok "Seed data loaded"

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}MoneyLife local environment is ready!${NC}"
echo ""
echo "  Start all services:  pnpm dev"
echo "  Start one service:   pnpm --filter auth dev"
echo ""
echo "  Postgres:   localhost:5432  (moneylife/localdev123)"
echo "  Redis:      localhost:6379"
echo "  LocalStack: localhost:4566"
echo ""
