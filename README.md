# MoneyLife — Learn Money by Living It

> A gamified financial education platform that teaches personal finance through life simulation.

[![CI](https://github.com/andupetcu/moneylife/actions/workflows/ci.yml/badge.svg)](https://github.com/andupetcu/moneylife/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## What is MoneyLife?

MoneyLife drops you into a simulated financial life. Pick a persona — teen, student, young adult, or parent — and navigate real-world money decisions: budgeting, saving, investing, dealing with emergencies, and building credit. Every choice has consequences. Learn by doing, not by reading.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js 22 · TypeScript · Express |
| **Database** | PostgreSQL 16 · Redis 7 |
| **Messaging** | Amazon SQS / SNS (LocalStack for dev) |
| **Mobile** | React Native (Expo) · Expo Router |
| **Web** | Next.js · React Native Web |
| **Shared UI** | Custom component library (ui-kit) |
| **Monorepo** | Turborepo · pnpm workspaces |
| **CI/CD** | GitHub Actions · Docker · ECS Fargate |
| **Infra** | Terraform · AWS |

## Quick Start

```bash
# Clone
git clone https://github.com/andupetcu/moneylife.git
cd moneylife

# Install dependencies
corepack enable
pnpm install

# Copy environment config
cp .env.example .env

# Start infrastructure (Postgres, Redis, LocalStack)
docker compose up -d postgres redis localstack

# Run database migrations
pnpm --filter db-migrations migrate:up

# Start all services in dev mode
pnpm dev
```

Or use the setup script:

```bash
./infra/scripts/setup-local.sh
```

## Project Structure

```
moneylife/
├── packages/                   # Shared packages
│   ├── shared-types/           # TypeScript types
│   ├── simulation-engine/      # Core game simulation logic
│   ├── ui-kit/                 # Shared React Native components
│   ├── config/                 # Region configs, personas, levels
│   └── db-migrations/          # Database migrations & seeds
├── services/                   # Backend microservices
│   ├── auth/                   # Authentication & authorization (port 3001)
│   ├── game-engine/            # Core game logic (port 3002)
│   ├── rewards/                # XP, coins, badges (port 3003)
│   ├── social/                 # Friends, leaderboards (port 3004)
│   ├── notification/           # Push, email, in-app (port 3005)
│   ├── partner/                # White-label & partner mgmt (port 3006)
│   ├── banking/                # Plaid/TrueLayer integration (port 3007)
│   └── admin/                  # Admin dashboard API (port 3008)
├── apps/
│   ├── mobile/                 # React Native (Expo)
│   └── web/                    # Next.js web app
├── admin-web/                  # Admin dashboard (React + Vite)
├── infra/                      # Terraform, K8s, scripts
└── docs/                       # Documentation
```

## Development

```bash
# Run all services
pnpm dev

# Run specific service
pnpm --filter auth dev

# Run tests
pnpm turbo test:unit
pnpm turbo test:integ

# Lint
pnpm turbo lint

# Build all
pnpm turbo build
```

## Contributing

1. Create a branch: `feat/ML-123-description` or `fix/ML-456-description`
2. Follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`
3. Keep PRs under 400 lines (excluding tests and generated code)
4. Ensure `pnpm turbo lint test:unit build` passes
5. Request review — 1 reviewer for services, 2 for `simulation-engine` or `shared-types`
6. Squash merge to `main`

## Architecture

See [docs/architecture.md](docs/architecture.md) for the full system design including data models, API contracts, and infrastructure details.

## License

[MIT](LICENSE)
