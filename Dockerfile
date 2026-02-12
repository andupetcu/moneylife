FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

COPY . .
RUN pnpm install --no-frozen-lockfile

# Build all needed packages
RUN npx turbo build --filter=@moneylife/auth --filter=@moneylife/game-engine --filter=@moneylife/simulation-engine --filter=@moneylife/shared-types --filter=@moneylife/config

# Create standalone auth bundle
RUN mkdir -p /standalone/auth && \
    cd /standalone/auth && \
    node -e "const p=JSON.parse(require('fs').readFileSync('/app/services/auth/package.json','utf8')); Object.keys(p.dependencies||{}).forEach(k=>{if(k.startsWith('@moneylife/'))delete p.dependencies[k]}); delete p.devDependencies; require('fs').writeFileSync('package.json',JSON.stringify(p,null,2))" && \
    cp -r /app/services/auth/dist . && \
    npm install --omit=dev --no-package-lock

# Create standalone game-engine bundle (needs simulation-engine, shared-types, config)
RUN mkdir -p /standalone/game-engine && \
    cd /standalone/game-engine && \
    node -e "const p=JSON.parse(require('fs').readFileSync('/app/services/game-engine/package.json','utf8')); Object.keys(p.dependencies||{}).forEach(k=>{if(k.startsWith('@moneylife/'))delete p.dependencies[k]}); delete p.devDependencies; require('fs').writeFileSync('package.json',JSON.stringify(p,null,2))" && \
    cp -r /app/services/game-engine/dist . && \
    npm install --omit=dev --no-package-lock && \
    mkdir -p node_modules/@moneylife/simulation-engine node_modules/@moneylife/shared-types node_modules/@moneylife/config && \
    cp -r /app/packages/simulation-engine/dist node_modules/@moneylife/simulation-engine/ && \
    cp /app/packages/simulation-engine/package.json node_modules/@moneylife/simulation-engine/ && \
    cp -r /app/packages/shared-types/dist node_modules/@moneylife/shared-types/ && \
    cp /app/packages/shared-types/package.json node_modules/@moneylife/shared-types/ && \
    cp -r /app/packages/config/dist node_modules/@moneylife/config/ && \
    cp /app/packages/config/package.json node_modules/@moneylife/config/

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
