FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

COPY . .
RUN pnpm install --no-frozen-lockfile

# Build auth + game-engine
RUN npx turbo build --filter=@moneylife/auth --filter=@moneylife/game-engine

# Create standalone bundles - strip workspace deps from package.json before npm install
RUN mkdir -p /standalone/auth /standalone/game-engine

RUN cd /standalone/auth && \
    cat /app/services/auth/package.json | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8'); const p=JSON.parse(d); Object.keys(p.dependencies||{}).forEach(k=>{if(k.startsWith('@moneylife/'))delete p.dependencies[k]}); console.log(JSON.stringify(p,null,2))" > package.json && \
    cp -r /app/services/auth/dist . && \
    npm install --omit=dev --no-package-lock

RUN cd /standalone/game-engine && \
    cat /app/services/game-engine/package.json | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8'); const p=JSON.parse(d); Object.keys(p.dependencies||{}).forEach(k=>{if(k.startsWith('@moneylife/'))delete p.dependencies[k]}); console.log(JSON.stringify(p,null,2))" > package.json && \
    cp -r /app/services/game-engine/dist . && \
    npm install --omit=dev --no-package-lock

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
