FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy everything (monorepo needs full context)
COPY . .

# Install all deps
RUN pnpm install --no-frozen-lockfile

# Build the web app and its dependencies
RUN npx turbo build --filter=@moneylife/web...

# Production runner
FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy built output
COPY --from=base /app/ ./

EXPOSE 3000
WORKDIR /app/apps/web
CMD ["pnpm", "start"]
