FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN npx turbo build --filter=@moneylife/game-engine

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/services/game-engine/dist ./dist
COPY --from=builder /app/services/game-engine/node_modules ./node_modules
COPY --from=builder /app/services/game-engine/package.json ./
ENV NODE_ENV=production
EXPOSE 3002
CMD ["node", "dist/index.js"]
