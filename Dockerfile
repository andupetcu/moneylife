FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# Copy everything needed for build
COPY . .
RUN pnpm install --no-frozen-lockfile

# Build only auth + game-engine and their deps
RUN npx turbo build --filter=@moneylife/auth --filter=@moneylife/game-engine

FROM node:22-alpine
RUN apk add --no-cache nginx postgresql-client
WORKDIR /app

# Copy built services with their node_modules
COPY --from=builder /app/services/auth/dist /app/auth/dist
COPY --from=builder /app/services/auth/node_modules /app/auth/node_modules
COPY --from=builder /app/services/auth/package.json /app/auth/

COPY --from=builder /app/services/game-engine/dist /app/game-engine/dist
COPY --from=builder /app/services/game-engine/node_modules /app/game-engine/node_modules
COPY --from=builder /app/services/game-engine/package.json /app/game-engine/

# Copy migrations
COPY --from=builder /app/packages/db-migrations/migrations /app/migrations

# Nginx + startup
COPY infra/docker/api-gateway.conf /etc/nginx/http.d/default.conf
COPY infra/docker/start-api.sh /app/start-api.sh
RUN chmod +x /app/start-api.sh

ENV NODE_ENV=production
EXPOSE 3000

CMD ["/app/start-api.sh"]
