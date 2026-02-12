#!/bin/sh
set -e

echo "=== MoneyLife API Gateway ==="

# Run migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  for f in /app/migrations/*.sql; do
    if [ -f "$f" ]; then
      echo "  Applying $(basename $f)..."
      # Only run the UP section (everything before "-- Down")
      sed '/^-- Down/,$d' "$f" | psql "$DATABASE_URL" 2>/dev/null || echo "  (already applied or skipped)"
    fi
  done
  echo "Migrations complete."

  # Seed decision cards
  if [ -f /app/seeds/all_scenarios.sql ]; then
    echo "Seeding decision cards..."
    psql "$DATABASE_URL" < /app/seeds/all_scenarios.sql 2>/dev/null || echo "  (seed skipped)"
    echo "Seeding complete."
  fi
fi

# Start services with explicit ports (override Coolify's PORT=3000)
echo "Starting auth service on :3001..."
cd /app/auth && PORT=3001 node dist/index.js &
AUTH_PID=$!

echo "Starting game-engine on :3002..."
cd /app/game-engine && PORT=3002 node dist/index.js &
GAME_PID=$!

# Wait for services to be ready
sleep 3

# Start nginx
echo "Starting API gateway on :3000..."
nginx -g 'daemon off;' &
NGINX_PID=$!

# Trap signals
trap "kill $AUTH_PID $GAME_PID $NGINX_PID 2>/dev/null; exit 0" SIGTERM SIGINT

# Wait for any process to exit
wait -n $AUTH_PID $GAME_PID $NGINX_PID
EXIT_CODE=$?
echo "A process exited with code $EXIT_CODE"
kill $AUTH_PID $GAME_PID $NGINX_PID 2>/dev/null
exit $EXIT_CODE
