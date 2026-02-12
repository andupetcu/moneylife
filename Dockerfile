FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

COPY . .
RUN pnpm install --no-frozen-lockfile

# Build auth + game-engine
RUN npx turbo build --filter=@moneylife/auth --filter=@moneylife/game-engine

# Create standalone bundles with all deps resolved
RUN mkdir -p /standalone/auth /standalone/game-engine

# Auth: copy dist + install production deps standalone
RUN cd /standalone/auth && \
    cp /app/services/auth/package.json . && \
    cp -r /app/services/auth/dist . && \
    npm install --omit=dev --no-package-lock 2>/dev/null || true

# Game engine: same
RUN cd /standalone/game-engine && \
    cp /app/services/game-engine/package.json . && \
    cp -r /app/services/game-engine/dist . && \
    npm install --omit=dev --no-package-lock 2>/dev/null || true

FROM node:22-alpine
RUN apk add --no-cache nginx postgresql-client
WORKDIR /app

COPY --from=builder /standalone/auth /app/auth
COPY --from=builder /standalone/game-engine /app/game-engine
COPY --from=builder /app/packages/db-migrations/migrations /app/migrations

COPY infra/docker/api-gateway.conf /etc/nginx/http.d/default.conf
COPY infra/docker/start-api.sh /app/start-api.sh
RUN chmod +x /app/start-api.sh

ENV NODE_ENV=production
EXPOSE 3000

CMD ["/app/start-api.sh"]
