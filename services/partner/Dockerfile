# ── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/simulation-engine/package.json ./packages/simulation-engine/
COPY packages/config/package.json ./packages/config/
# __SERVICE_PACKAGE_JSON__
COPY services/partner/package.json ./services/partner/

RUN pnpm install --frozen-lockfile --filter @moneylife/partner...

# ── Stage 2: Build ───────────────────────────────────────────────────────────
FROM deps AS build
WORKDIR /app

COPY packages/ ./packages/
COPY services/partner/ ./services/partner/
COPY tsconfig.base.json ./

RUN pnpm --filter @moneylife/partner... build

# ── Stage 3: Production ─────────────────────────────────────────────────────
FROM node:22-alpine AS run
RUN corepack enable && corepack prepare pnpm@9 --activate

RUN addgroup -g 1001 -S moneylife && \
    adduser -S moneylife -u 1001 -G moneylife

WORKDIR /app

COPY --from=build --chown=moneylife:moneylife /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=build --chown=moneylife:moneylife /app/packages/shared-types/package.json ./packages/shared-types/
COPY --from=build --chown=moneylife:moneylife /app/packages/simulation-engine/dist ./packages/simulation-engine/dist
COPY --from=build --chown=moneylife:moneylife /app/packages/simulation-engine/package.json ./packages/simulation-engine/
COPY --from=build --chown=moneylife:moneylife /app/packages/config/src ./packages/config/src
COPY --from=build --chown=moneylife:moneylife /app/packages/config/package.json ./packages/config/
COPY --from=build --chown=moneylife:moneylife /app/services/partner/dist ./services/partner/dist
COPY --from=build --chown=moneylife:moneylife /app/services/partner/package.json ./services/partner/
COPY --from=build --chown=moneylife:moneylife /app/node_modules ./node_modules
COPY --from=build --chown=moneylife:moneylife /app/package.json ./

USER moneylife
ENV NODE_ENV=production

EXPOSE 3006

CMD ["node", "services/partner/dist/index.js"]
