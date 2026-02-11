# MoneyLife — AI Agent Implementation Guide

> Version 1.1 · February 2026
> This document provides everything an AI coding agent needs to build MoneyLife from scratch.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Module Dependency Graph](#2-module-dependency-graph)
3. [Implementation Order](#3-implementation-order)
4. [Interface Contracts](#4-interface-contracts)
5. [Test Strategy](#5-test-strategy)
6. [Environment Setup](#6-environment-setup)
7. [Code Style & Conventions](#7-code-style--conventions)
8. [Database Migration Strategy](#8-database-migration-strategy)
9. [Feature Flag Catalog](#9-feature-flag-catalog)
10. [Localization](#10-localization)
11. [Common Pitfalls](#11-common-pitfalls)
12. [PR Review Checklist](#12-pr-review-checklist)

---

## 1. Project Structure

```
moneylife/
├── README.md
├── package.json                    # Root workspace config
├── turbo.json                      # Turborepo pipeline config
├── docker-compose.yml              # Local dev environment
├── docker-compose.prod.yml         # Production compose
├── .env.example                    # Template for env vars
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                  # Lint + test + build
│   │   ├── deploy-staging.yml      # Deploy to staging
│   │   └── deploy-prod.yml         # Deploy to production
│   └── CODEOWNERS
│
├── packages/                       # Shared packages
│   ├── shared-types/               # TypeScript types shared across services
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── game.ts             # Game state, actions, events
│   │   │   ├── accounts.ts         # Account types, transactions
│   │   │   ├── rewards.ts          # XP, coins, badges
│   │   │   ├── user.ts             # User profiles, auth
│   │   │   ├── banking.ts          # Banking integration types
│   │   │   ├── analytics.ts        # Event schemas
│   │   │   └── errors.ts           # Error codes and types
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── simulation-engine/          # Core deterministic simulation (shared logic)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── ledger.ts           # Double-entry ledger
│   │   │   ├── interest.ts         # Interest calculations
│   │   │   ├── credit-health.ts    # Credit Health Index
│   │   │   ├── inflation.ts        # Inflation engine
│   │   │   ├── scenarios.ts        # Scenario generator
│   │   │   ├── decision-cards.ts   # Decision card logic
│   │   │   ├── time-engine.ts      # Game clock + month-end
│   │   │   ├── budget-scorer.ts    # Budget scoring algorithm
│   │   │   ├── investment-sim.ts   # Investment simulation
│   │   │   ├── insurance-sim.ts    # Insurance simulation
│   │   │   └── validators.ts       # Anti-cheat validation
│   │   ├── __tests__/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui-kit/                     # Shared React Native components (RNW-compatible)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── components/
│   │   │   │   ├── MLButton.tsx
│   │   │   │   ├── MLCard.tsx
│   │   │   │   ├── MLDialog.tsx
│   │   │   │   ├── MLLoading.tsx
│   │   │   │   ├── BalanceCard.tsx
│   │   │   │   ├── TransactionList.tsx
│   │   │   │   ├── CreditHealthGauge.tsx
│   │   │   │   ├── BudgetRing.tsx
│   │   │   │   └── DecisionCardView.tsx
│   │   │   ├── theme/
│   │   │   │   ├── colors.ts
│   │   │   │   ├── typography.ts
│   │   │   │   ├── spacing.ts
│   │   │   │   └── TenantTheme.ts  # White-label theming
│   │   │   └── utils/
│   │   │       ├── currency-formatter.ts
│   │   │       └── date-formatter.ts
│   │   ├── __tests__/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── config/                     # Shared configuration
│   │   ├── src/
│   │   │   ├── regions/            # Per-region config files
│   │   │   │   ├── ro.json         # Romania: RON, prices, tax
│   │   │   │   ├── pl.json         # Poland
│   │   │   │   ├── gb.json         # UK
│   │   │   │   ├── de.json         # Germany
│   │   │   │   └── us.json         # USA
│   │   │   ├── personas.json       # Persona starting conditions
│   │   │   ├── levels.json         # Level definitions
│   │   │   ├── scenarios.json      # Scenario catalog
│   │   │   ├── badges.json         # Badge definitions
│   │   │   └── difficulty.json     # Difficulty mode parameters
│   │   └── package.json
│   │
│   └── db-migrations/              # Database migrations
│       ├── migrations/
│       │   ├── 001_initial_schema.sql
│       │   ├── 002_game_tables.sql
│       │   ├── 003_rewards_tables.sql
│       │   ├── 004_social_tables.sql
│       │   ├── 005_banking_tables.sql
│       │   ├── 006_partner_tables.sql
│       │   └── 007_analytics_tables.sql
│       ├── seeds/
│       │   ├── dev_users.sql
│       │   ├── dev_scenarios.sql
│       │   └── dev_badges.sql
│       └── package.json
│
├── services/                       # Backend microservices
│   ├── auth/
│   │   ├── src/
│   │   │   ├── index.ts            # Service entry point
│   │   │   ├── routes.ts           # Express routes
│   │   │   ├── controllers/
│   │   │   │   ├── register.ts
│   │   │   │   ├── login.ts
│   │   │   │   ├── refresh.ts
│   │   │   │   ├── social-auth.ts
│   │   │   │   └── sso.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts         # JWT validation
│   │   │   │   ├── rate-limit.ts
│   │   │   │   └── partner-context.ts
│   │   │   ├── services/
│   │   │   │   ├── jwt.ts
│   │   │   │   ├── password.ts
│   │   │   │   └── device.ts
│   │   │   └── models/
│   │   │       └── user.ts
│   │   ├── __tests__/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── game-engine/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes.ts
│   │   │   ├── controllers/
│   │   │   │   ├── game.ts         # Create, get, advance day
│   │   │   │   ├── accounts.ts     # Account operations
│   │   │   │   ├── cards.ts        # Decision card handling
│   │   │   │   ├── budget.ts       # Budget management
│   │   │   │   └── month-end.ts    # Month-end processing
│   │   │   ├── services/
│   │   │   │   ├── game-state.ts   # State management
│   │   │   │   ├── action-processor.ts # Validate + apply actions
│   │   │   │   └── scenario-runner.ts  # Execute scenarios
│   │   │   └── models/
│   │   │       ├── game.ts
│   │   │       ├── account.ts
│   │   │       └── transaction.ts
│   │   ├── __tests__/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── rewards/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes.ts
│   │   │   ├── controllers/
│   │   │   │   ├── xp.ts
│   │   │   │   ├── coins.ts
│   │   │   │   ├── badges.ts
│   │   │   │   ├── streaks.ts
│   │   │   │   └── redemptions.ts
│   │   │   ├── services/
│   │   │   │   ├── economy.ts      # Earn/spend calculations
│   │   │   │   ├── badge-engine.ts # Badge evaluation
│   │   │   │   └── fulfillment.ts  # Reward delivery
│   │   │   └── models/
│   │   ├── __tests__/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── social/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   ├── friends.ts
│   │   │   │   ├── leaderboards.ts
│   │   │   │   └── classrooms.ts
│   │   │   └── ...
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── banking/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   ├── plaid.ts
│   │   │   │   ├── truelayer.ts
│   │   │   │   ├── salt-edge.ts
│   │   │   │   └── mirror-mode.ts
│   │   │   └── ...
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── partner/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   ├── onboarding.ts
│   │   │   │   ├── theming.ts
│   │   │   │   ├── analytics.ts
│   │   │   │   └── rewards.ts
│   │   │   └── ...
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── notification/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   ├── push.ts
│   │   │   │   ├── email.ts
│   │   │   │   └── in-app.ts
│   │   │   └── ...
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── admin/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   ├── users.ts
│   │   │   │   ├── games.ts
│   │   │   │   ├── scenarios.ts
│   │   │   │   ├── partners.ts
│   │   │   │   └── anti-cheat.ts
│   │   │   └── ...
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── api-gateway/
│       ├── kong.yml                # Kong declarative config
│       ├── plugins/
│       └── Dockerfile
│
├── apps/                           # Client applications
│   ├── mobile/                     # React Native (Expo) — iOS & Android
│   │   ├── app/                    # Expo Router (file-based routing)
│   │   │   ├── (auth)/
│   │   │   │   ├── login.tsx
│   │   │   │   ├── register.tsx
│   │   │   │   └── social-auth.tsx
│   │   │   ├── (tabs)/
│   │   │   │   ├── index.tsx       # Home / Game Dashboard
│   │   │   │   ├── rewards.tsx     # Rewards & Badges
│   │   │   │   ├── social.tsx      # Friends & Leaderboards
│   │   │   │   └── profile.tsx     # Profile & Settings
│   │   │   ├── game/
│   │   │   │   ├── [gameId]/
│   │   │   │   │   ├── daily.tsx
│   │   │   │   │   ├── card/[cardId].tsx
│   │   │   │   │   ├── monthly-review.tsx
│   │   │   │   │   ├── account/[accountId].tsx
│   │   │   │   │   └── budget.tsx
│   │   │   ├── banking/
│   │   │   │   ├── connect.tsx
│   │   │   │   └── mirror.tsx
│   │   │   └── _layout.tsx
│   │   ├── src/
│   │   │   ├── stores/             # Zustand stores
│   │   │   │   ├── useGameStore.ts
│   │   │   │   ├── useAuthStore.ts
│   │   │   │   ├── useRewardsStore.ts
│   │   │   │   └── useSettingsStore.ts
│   │   │   ├── hooks/              # React Query hooks
│   │   │   │   ├── useGameQuery.ts
│   │   │   │   ├── useRewardsQuery.ts
│   │   │   │   └── useSyncMutation.ts
│   │   │   ├── services/
│   │   │   │   ├── api-client.ts
│   │   │   │   ├── sync-engine.ts
│   │   │   │   └── notification-handler.ts
│   │   │   ├── db/                 # WatermelonDB models & schema
│   │   │   │   ├── schema.ts
│   │   │   │   └── models/
│   │   │   │       ├── GameState.ts
│   │   │   │       ├── ActionQueue.ts
│   │   │   │       └── CachedCard.ts
│   │   │   └── providers/
│   │   │       ├── AuthProvider.tsx
│   │   │       ├── ThemeProvider.tsx
│   │   │       └── SyncProvider.tsx
│   │   ├── app.json                # Expo config
│   │   ├── eas.json                # EAS Build config
│   │   ├── metro.config.js         # Metro bundler (monorepo support)
│   │   ├── babel.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                        # Next.js — Web app
│       ├── app/                    # Next.js App Router
│       │   ├── layout.tsx
│       │   ├── page.tsx            # Landing page (SSR, SEO)
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx
│       │   │   └── register/page.tsx
│       │   ├── (app)/
│       │   │   ├── dashboard/page.tsx
│       │   │   ├── game/[gameId]/
│       │   │   │   ├── page.tsx
│       │   │   │   └── card/[cardId]/page.tsx
│       │   │   ├── rewards/page.tsx
│       │   │   └── social/page.tsx
│       │   └── api/                # Next.js API routes (BFF, optional)
│       ├── src/
│       │   ├── stores/             # Same Zustand stores (shared logic)
│       │   ├── hooks/              # Same React Query hooks
│       │   └── services/
│       ├── next.config.js          # react-native-web transpilation
│       ├── package.json
│       └── tsconfig.json
│
├── admin-web/                      # Admin dashboard (React)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── api/
│   ├── package.json
│   └── vite.config.ts
│
├── infra/                          # Infrastructure as code
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── modules/
│   ├── k8s/
│   │   ├── base/
│   │   └── overlays/
│   └── scripts/
│       ├── setup-local.sh
│       └── seed-data.sh
│
└── docs/                           # This documentation
    ├── gameplay-and-rules.md
    ├── edge-cases.md
    ├── rewards-system.md
    ├── architecture.md
    ├── banking-integrations.md
    ├── product-strategy.md
    └── ai-agent-implementation-guide.md
```

---

## 2. Module Dependency Graph

```
                    ┌─────────────────────┐
                    │    API Gateway       │
                    │      (Kong)          │
                    └──────────┬──────────┘
                               │
         ┌───────────┬────────┼────────┬───────────┬──────────┐
         │           │        │        │           │          │
    ┌────▼───┐  ┌───▼────┐ ┌─▼──────┐ │     ┌────▼───┐ ┌───▼────┐
    │  Auth  │  │ Game   │ │Rewards │ │     │Banking │ │ Admin  │
    │Service │  │Engine  │ │Service │ │     │Service │ │Service │
    └────┬───┘  └───┬────┘ └───┬────┘ │     └───┬────┘ └───┬────┘
         │          │          │      │         │          │
         │          │          │  ┌───▼────┐    │          │
         │          │          │  │Social  │    │          │
         │          │          │  │Service │    │          │
         │          │          │  └───┬────┘    │          │
         │          │          │      │         │          │
    ─────┴──────────┴──────────┴──────┴─────────┴──────────┘
         │                     │                │
    ┌────▼────┐          ┌────▼────┐      ┌────▼────┐
    │Postgres │          │  Redis  │      │  SQS/   │
    │ (main)  │          │ (cache) │      │  SNS    │
    └─────────┘          └─────────┘      └─────────┘

    Client apps (consume API, share packages):
    
    ┌─────────────────────────────────────────────────┐
    │              packages/ui-kit                     │
    │   (shared React Native components via RNW)       │
    │                                                  │
    │   Consumed by:                                   │
    │   ├── apps/mobile (Expo / React Native)          │
    │   └── apps/web (Next.js via react-native-web)    │
    └─────────────────────────────────────────────────┘

    Dependencies (→ means "depends on"):
    
    All Services → shared-types
    All Services → config
    game-engine → simulation-engine
    rewards → simulation-engine (badge evaluation needs game state formulas)
    game-engine → rewards (XP/coin grants after actions)
    social → game-engine (leaderboard data)
    social → rewards (badge display)
    banking → game-engine (Mirror Mode comparison)
    partner → auth (SSO)
    partner → rewards (custom catalogs)
    admin → all services (read/write access)
    notification → auth (user preferences)
    notification → game-engine (bill reminders)
    notification → rewards (streak reminders)

    apps/mobile → packages/ui-kit, shared-types, config
    apps/web → packages/ui-kit (via RNW), shared-types, config
```

### Circular Dependency Resolution

`game-engine` → `rewards` and `rewards` → `simulation-engine` create a potential cycle. Resolve by:
- `game-engine` emits events to SQS/SNS (`GAME_ACTION_COMPLETED`, `MONTH_END_PROCESSED`)
- `rewards` consumes these events asynchronously
- No direct HTTP calls from game-engine to rewards during game actions
- Rewards grants are returned in the next `GET /game/{id}` call (eventual consistency, ~100ms delay)

---

## 3. Implementation Order (20-Week Sprint Plan)

### Phase 1 — Foundation (Weeks 1-4)

**Week 1: Project Setup + Auth**
- Initialize monorepo (Turborepo + pnpm workspaces)
- Set up CI pipeline (GitHub Actions: lint + test)
- `shared-types`: Define all TypeScript interfaces
- `auth` service: Register, login, JWT, refresh tokens
- Database: migrations 001 (users, sessions, devices)
- Docker Compose: Postgres + Redis + auth service
- Tests: Auth unit tests (15+ tests)

**Week 2: Simulation Engine Core**
- `simulation-engine`: Ledger (double-entry), time engine, interest calculations
- `config`: Region files (ro.json, us.json), personas, difficulty modes
- Tests: Ledger correctness (30+ tests), interest formulas (20+ tests)
- No HTTP layer yet — pure library with 100% test coverage target

**Week 3: Game Engine Service**
- `game-engine`: Create game, advance day, get state
- Wire simulation-engine into game-engine
- Database: migration 002 (games, game_accounts, transactions)
- Decision card system: card generation, choice processing, consequence application
- Tests: Game flow integration tests (create → play 30 days → month-end)

**Week 4: Month-End Processing + Budget**
- Month-end atomic processing (salary, bills, interest, credit card statement)
- Budget scoring algorithm
- Credit Health Index calculation
- Level-up detection
- Tests: Full month-end test with all account types active

### Phase 2 — Rewards & Mobile Shell (Weeks 5-8)

**Week 5: Rewards Service**
- XP granting engine (subscribe to game events)
- Coin granting engine
- Badge evaluation engine (check unlock conditions)
- Streak tracking
- Database: migration 003 (xp_ledger, coin_ledger, badges, streaks)
- SQS/SNS: Set up event pipeline (game-engine → rewards)

**Week 6: React Native App Shell (Expo)**
- Expo project setup (Expo Router, Zustand stores, WatermelonDB, React Query)
- `packages/ui-kit`: shared component library with react-native-web support
- Auth screens: register, login, social auth
- Home screen: game summary, level display, quick actions
- API client (Axios) with auth interceptor + offline queue
- White-label theming system (tenant theme from server config)

**Week 7: Game Screens**
- Daily view: balance summary, upcoming bills, alerts
- Decision card UI: swipe/tap interface with Reanimated 3 animations, consequence preview
- Account detail screen: transaction list, balance chart
- Budget setup/edit screen

**Week 8: Monthly Review + Rewards Screens**
- Monthly review screen: animated summary, charts, XP/coin tally
- Credit Health gauge component (packages/ui-kit)
- Badge collection screen
- Streak display + recovery UI
- Level-up celebration animation (Lottie via lottie-react-native)

### Phase 3 — Social & Polish (Weeks 9-12)

**Week 9: Social Service**
- Friends system (add by code/link)
- Leaderboards (global, friends, classroom)
- Database: migration 004
- API: friend requests, leaderboard queries

**Week 10: Classroom Mode**
- Teacher registration flow
- Classroom creation, student invitation (code-based)
- Teacher dashboard: student progress, aggregate stats
- Assignment system: "complete Level 2 by Friday"

**Week 11: Notification Service**
- Push notifications (Expo Notifications + FCM/APNS)
- In-app notification center
- Email service (transactional: welcome, password reset, weekly digest)
- Notification preferences per user
- Scheduled notifications: bill reminders, streak warnings, challenge deadlines

**Week 12: Polish & QA**
- Onboarding/tutorial flow implementation
- Offline mode testing + conflict resolution
- Performance profiling (API latency, app startup via Expo Dev Tools, scroll perf with Flashlight)
- Accessibility audit (screen reader, contrast, dynamic text)
- Fix all P0/P1 bugs from internal testing

### Phase 4 — White-Label & Banking (Weeks 13-16)

**Week 13: Partner Service**
- Partner onboarding API
- Theming engine: logo, colors, fonts, custom strings
- Feature flag system per partner
- Partner analytics dashboard (admin-web)
- Database: migration 006

**Week 14: Admin Dashboard + Next.js Web App**
- React admin app (Vite + React + TanStack Query)
- User management: search, view, suspend
- Game management: view state, reset, debug
- Partner management: create, configure, monitor
- Anti-cheat: flagged accounts, review queue
- Next.js web app shell: landing page (SSR), auth pages, basic game UI sharing ui-kit via RNW

**Week 15: Banking Integration — Plaid**
- Plaid Link integration (react-native-plaid-link-sdk)
- Account linking flow
- Transaction sync + webhook handler
- Mirror Mode: compare simulated vs real spending
- Database: migration 005

**Week 16: Banking Integration — TrueLayer + Salt Edge**
- TrueLayer auth redirect flow
- Salt Edge connection lifecycle
- Transaction categorization (rule-based V1)
- Provider fallback system

### Phase 5 — Launch Prep (Weeks 17-20)

**Week 17: Economy Tuning + Content**
- Play-test all 8 levels with all 4 personas
- Tune XP/coin earn rates, difficulty curves
- Write all 200+ scenario descriptions
- Localize: Romanian (full), Polish (partial)
- Seasonal event system (framework)

**Week 18: Security Hardening**
- Penetration testing (OWASP Top 10 + Mobile Top 10)
- Rate limiting tuning per endpoint
- Anti-cheat rules finalization
- GDPR: data export, data deletion, consent management
- SOC 2 preparation checklist

**Week 19: Infrastructure & Deployment**
- Terraform: AWS setup (ECS Fargate, RDS, ElastiCache, SQS/SNS)
- CI/CD: staging + production pipelines, EAS Build profiles
- Monitoring: Grafana dashboards, PagerDuty alerts
- Load testing: 10K concurrent users target
- Database backup + disaster recovery plan

**Week 20: App Store Submission + Soft Launch**
- App Store assets: screenshots, description, keywords
- Google Play assets
- App review compliance (age rating, privacy policy, data safety)
- EAS Submit for both platforms
- Soft launch: Romania (100% rollout), 10% other markets
- War room: monitor crash rates, API errors, user feedback

---

## 4. Interface Contracts

### 4.1 Backend TypeScript Interfaces

```typescript
// packages/shared-types/src/game.ts

export interface GameState {
  id: string;
  userId: string;
  partnerId: string | null;
  persona: PersonaType;
  region: RegionCode;
  currency: CurrencyCode;
  difficulty: DifficultyMode;
  currentDate: GameDate;        // YYYY-MM-DD in game world
  currentLevel: number;         // 1-8
  totalXp: number;
  totalCoins: number;
  status: 'active' | 'paused' | 'bankrupt' | 'completed';
  accounts: GameAccount[];
  pendingCards: DecisionCard[];
  activeGoals: SavingsGoal[];
  householdMembers: HouseholdMember[];
  monthlyIncome: number;
  monthlyExpenses: number;      // sum of recurring
  netWorth: number;
  creditHealthIndex: CreditHealthIndex;
  budgetScore: number;          // 0-100
  streakDays: number;
  rngSeed: string;              // deterministic seed
  createdAt: string;            // ISO 8601
  updatedAt: string;
}

export type PersonaType = 'teen' | 'student' | 'young_adult' | 'parent';
export type RegionCode = 'ro' | 'pl' | 'hu' | 'cz' | 'gb' | 'de' | 'fr' | 'us';
export type CurrencyCode = 'RON' | 'PLN' | 'HUF' | 'CZK' | 'GBP' | 'EUR' | 'USD';
export type DifficultyMode = 'easy' | 'normal' | 'hard';

export interface GameDate {
  year: number;
  month: number;    // 1-12
  day: number;      // 1-31
}

export interface GameAccount {
  id: string;
  type: AccountType;
  name: string;
  balance: number;          // cents/smallest unit
  interestRate: number;     // annual, as decimal (0.025 = 2.5%)
  creditLimit?: number;     // for credit cards
  minimumPayment?: number;  // for credit cards/loans
  monthlyPayment?: number;  // for loans
  remainingBalance?: number;// for loans
  isActive: boolean;
}

export type AccountType = 
  | 'checking' | 'savings' | 'credit_card' 
  | 'personal_loan' | 'auto_loan' | 'student_loan' | 'mortgage'
  | 'bnpl' | 'investment' | 'insurance' | 'prepaid';

export interface DecisionCard {
  id: string;
  category: CardCategory;
  title: string;
  description: string;
  options: CardOption[];
  expiresOnDay: GameDate;   // must decide before this day
  isBonus: boolean;         // weekly bonus card
  stakeLevel: 'low' | 'medium' | 'high' | 'critical';
}

export type CardCategory = 
  | 'groceries' | 'shopping' | 'housing' | 'transport'
  | 'health' | 'entertainment' | 'education' | 'career'
  | 'emergency' | 'investment' | 'insurance' | 'social'
  | 'subscription' | 'debt' | 'savings' | 'tax';

export interface CardOption {
  id: string;
  label: string;
  description: string;
  consequences: Consequence[];
  xpReward: number;
  coinReward: number;
}

export interface Consequence {
  type: ConsequenceType;
  accountType?: AccountType;
  amount: number;           // positive = credit, negative = debit
  recurring?: boolean;
  recurringMonths?: number;
  creditHealthImpact?: Partial<CreditHealthFactors>;
  narrative: string;        // shown to user
}

export type ConsequenceType = 
  | 'balance_change' | 'new_account' | 'close_account'
  | 'rate_change' | 'fee' | 'income_change'
  | 'bill_add' | 'bill_remove' | 'credit_health_change'
  | 'household_change' | 'unlock_feature';

export interface CreditHealthIndex {
  overall: number;          // 300-850
  factors: CreditHealthFactors;
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: GameDate;
}

export interface CreditHealthFactors {
  paymentHistory: number;   // 0-100, weight: 35%
  utilization: number;      // 0-100, weight: 30%
  accountAge: number;       // 0-100, weight: 15%
  creditMix: number;        // 0-100, weight: 10%
  newCredit: number;        // 0-100, weight: 10%
}

// Action submitted by client
export interface GameAction {
  type: GameActionType;
  payload: Record<string, unknown>;
  clientTimestamp: string;  // ISO 8601 — for offline ordering
  idempotencyKey: string;  // UUID — prevent double-submission
}

export type GameActionType =
  | 'advance_day'
  | 'decide_card'
  | 'transfer'
  | 'set_budget'
  | 'set_autopay'
  | 'open_account'
  | 'close_account'
  | 'set_goal'
  | 'buy_insurance'
  | 'file_claim'
  | 'invest'
  | 'sell_investment';

// Server response after action
export interface GameActionResult {
  success: boolean;
  newState: Partial<GameState>;
  events: GameEvent[];
  rewards: RewardGrant[];
  errors?: GameError[];
}

export interface GameEvent {
  type: string;
  description: string;
  timestamp: GameDate;
  data: Record<string, unknown>;
}

export interface RewardGrant {
  type: 'xp' | 'coins' | 'badge';
  amount?: number;
  badgeId?: string;
  reason: string;
}

export interface GameError {
  code: string;
  message: string;
  field?: string;
}
```

```typescript
// packages/shared-types/src/accounts.ts

export interface Transaction {
  id: string;
  gameId: string;
  date: GameDate;
  type: TransactionType;
  category: string;
  description: string;
  entries: LedgerEntry[];   // double-entry: always 2+ entries summing to 0
  metadata?: Record<string, unknown>;
}

export type TransactionType = 
  | 'income' | 'expense' | 'transfer' | 'interest_credit'
  | 'interest_debit' | 'fee' | 'loan_payment' | 'loan_disbursement'
  | 'investment_buy' | 'investment_sell' | 'dividend'
  | 'insurance_premium' | 'insurance_claim' | 'tax_payment'
  | 'bnpl_purchase' | 'bnpl_installment';

export interface LedgerEntry {
  accountId: string;
  amount: number;           // positive = debit, negative = credit (accounting convention)
  balanceAfter: number;
}

export interface MonthlyReport {
  gameId: string;
  month: number;
  year: number;
  income: number;
  expenses: number;
  savings: number;
  debtPayments: number;
  investmentChange: number;
  netWorthChange: number;
  netWorth: number;
  budgetScore: number;
  creditHealthIndex: number;
  xpEarned: number;
  coinsEarned: number;
  badgesEarned: string[];
  highlights: string[];     // "You paid all bills on time!", "Emergency fund reached 1 month"
  warnings: string[];       // "Credit utilization above 50%", "No emergency savings"
}
```

```typescript
// packages/shared-types/src/rewards.ts

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;             // asset path
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: BadgeCategory;
  condition: BadgeCondition;
  xpReward: number;
  coinReward: number;
  isHidden: boolean;        // not shown until earned
}

export type BadgeCategory = 
  | 'savings' | 'credit' | 'budget' | 'investment'
  | 'life_event' | 'engagement' | 'progression';

export interface BadgeCondition {
  type: 'threshold' | 'streak' | 'event' | 'compound';
  metric?: string;
  value?: number;
  duration?: number;        // game months
  conditions?: BadgeCondition[]; // for compound
  operator?: 'and' | 'or';
}

export interface RewardCatalogItem {
  id: string;
  partnerId: string | null; // null = default catalog
  name: string;
  description: string;
  image: string;
  coinCost: number;
  category: string;
  provider: string;         // "Tremendous", "Giftbit", etc.
  fulfillmentType: 'digital' | 'physical' | 'experience';
  availability: 'in_stock' | 'limited' | 'out_of_stock';
  expiresAt?: string;
  regions: RegionCode[];
}
```

### 4.2 React Native / TypeScript Client Contracts

```typescript
// apps/mobile/src/services/api-client.ts

export interface ApiClient {
  createGame(request: CreateGameRequest): Promise<GameState>;
  getGame(gameId: string): Promise<GameState>;
  submitAction(gameId: string, action: GameAction): Promise<GameActionResult>;
  getPendingCards(gameId: string): Promise<DecisionCard[]>;
  getMonthlyReport(gameId: string, year: number, month: number): Promise<MonthlyReport>;
  getTransactions(gameId: string, options?: { limit?: number; cursor?: string }): Promise<Transaction[]>;
  getBadges(gameId: string): Promise<Badge[]>;
  getRewardCatalog(): Promise<RewardCatalogItem[]>;
  redeemReward(itemId: string): Promise<RedemptionResult>;
  getLeaderboard(type: string, options?: { classroomId?: string }): Promise<LeaderboardEntry[]>;
}

// apps/mobile/src/stores/useGameStore.ts

export interface GameStore {
  // State
  currentGame: GameState | null;
  pendingCards: DecisionCard[];
  isOffline: boolean;
  isLoading: boolean;

  // Actions
  setGame: (game: GameState) => void;
  setPendingCards: (cards: DecisionCard[]) => void;
  setOffline: (offline: boolean) => void;
  clearGame: () => void;
}

// packages/ui-kit/src/components/DecisionCardView.tsx

export interface DecisionCardViewProps {
  card: DecisionCard;
  onSelectOption: (optionId: string) => void;
  isProcessing: boolean;
  currencyCode: CurrencyCode;
}
```

---

## 5. Test Strategy

### 5.1 Coverage Targets

| Module | Unit | Integration | E2E | Min Coverage |
|---|---|---|---|---|
| simulation-engine | 200+ | N/A | N/A | 95% |
| auth service | 30+ | 15+ | N/A | 85% |
| game-engine | 50+ | 30+ | N/A | 85% |
| rewards service | 40+ | 20+ | N/A | 85% |
| social service | 20+ | 10+ | N/A | 80% |
| React Native app | 60+ component | 20+ | 10+ flows | 70% |
| Next.js web app | 30+ component | 10+ | 5+ flows | 70% |
| ui-kit | 40+ component | N/A | N/A | 90% |

### 5.2 Critical Test Scenarios

```
Simulation Engine Tests:
├── Ledger
│   ├── Double-entry always balances (property test)
│   ├── Cannot create unbalanced transactions
│   ├── Overdraft correctly tracked
│   └── Transaction rollback on failure
├── Interest
│   ├── Savings: APY 2.5% on 10,000 for 1 month = 20.60
│   ├── Credit card: 19.99% APR on 5,000 daily = 2.74/day
│   ├── Loan: amortization schedule matches formula
│   ├── Compound vs simple interest difference
│   └── Zero balance = zero interest
├── Credit Health
│   ├── Perfect behavior = 850
│   ├── Missed payment = -50 to -100 points
│   ├── High utilization (>90%) = score < 600
│   ├── New account opening = temporary -20
│   └── Recovery: 6 months perfect → full recovery
├── Month-End
│   ├── All bills deducted atomically
│   ├── Salary credited before bills (order matters)
│   ├── Insufficient funds → overdraft → fee
│   ├── Credit card minimum payment auto-deducted if autopay on
│   ├── Inflation applied to next month's prices
│   └── Level-up triggered when XP threshold met
└── Scenarios
    ├── Emergency with no emergency fund → debt spiral
    ├── Smart budgeting → positive net worth growth
    ├── Maximum debt → bankruptcy trigger
    └── All personas complete Level 1 successfully (regression)

E2E Flows (Detox):
├── Full onboarding: persona → region → currency → tutorial → first day
├── Play 7 days → weekly summary displayed
├── Complete Level 1 → level-up animation → Level 2 unlock
├── Go bankrupt → recovery flow → restart
├── Earn badge → notification → badge collection updated
├── Redeem reward → confirmation → fulfillment status
├── Offline play → reconnect → state synced correctly
├── Classroom join → assignment visible → complete → teacher sees result
├── White-label: custom theme loads from partner config
└── Mirror Mode: link Plaid account → comparison displayed
```

### 5.3 Test Fixtures

```typescript
// packages/simulation-engine/__tests__/fixtures.ts

export const FIXTURES = {
  // Standard game state for testing
  baseGame: {
    persona: 'young_adult',
    region: 'ro',
    currency: 'RON',
    difficulty: 'normal',
    currentDate: { year: 2026, month: 1, day: 1 },
    currentLevel: 1,
    accounts: [
      { type: 'checking', balance: 500000 },   // 5,000.00 RON (cents)
      { type: 'savings', balance: 200000, interestRate: 0.025 },
    ],
    monthlyIncome: 350000,  // 3,500.00 RON
    rngSeed: 'test-seed-001',
  },

  // Game in debt for bankruptcy testing
  debtGame: {
    ...this.baseGame,
    accounts: [
      { type: 'checking', balance: -10000 },    // -100.00 (overdraft)
      { type: 'credit_card', balance: -490000, creditLimit: 500000 }, // 98% utilization
      { type: 'personal_loan', remainingBalance: 2000000 },
    ],
  },

  // Level 5+ game for advanced feature testing
  advancedGame: {
    ...this.baseGame,
    currentLevel: 5,
    accounts: [
      { type: 'checking', balance: 1500000 },
      { type: 'savings', balance: 3000000 },
      { type: 'credit_card', balance: -50000, creditLimit: 1000000 },
      { type: 'investment', balance: 500000 },
      { type: 'insurance', monthlyPremium: 15000 },
    ],
  },
};
```

### 5.4 Testing Tools

| Layer | Tool | Purpose |
|---|---|---|
| Unit (backend) | Jest | Service logic, simulation engine |
| Integration (backend) | Jest + Supertest | API endpoint testing |
| Unit (RN components) | Jest + React Native Testing Library | Component rendering & interaction |
| Unit (web components) | Jest + React Testing Library | Next.js page/component testing |
| Unit (ui-kit) | Jest + React Native Testing Library | Shared component testing |
| E2E (mobile) | Detox | Full iOS/Android device testing |
| E2E (web) | Playwright | Full browser testing for Next.js |
| Snapshot | Jest snapshots | UI regression for ui-kit components |

---

## 6. Environment Setup

### 6.1 Docker Compose (Local Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: moneylife
      POSTGRES_USER: moneylife
      POSTGRES_PASSWORD: localdev123
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  localstack:
    image: localstack/localstack:3.0
    environment:
      SERVICES: sqs,sns,s3
      DEFAULT_REGION: us-east-1
    ports:
      - "4566:4566"

  auth:
    build: ./services/auth
    environment:
      DATABASE_URL: postgres://moneylife:localdev123@postgres:5432/moneylife
      REDIS_URL: redis://redis:6379
      JWT_SECRET: local-dev-secret-do-not-use-in-prod
      JWT_EXPIRY: 15m
      JWT_REFRESH_EXPIRY: 7d
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis

  game-engine:
    build: ./services/game-engine
    environment:
      DATABASE_URL: postgres://moneylife:localdev123@postgres:5432/moneylife
      REDIS_URL: redis://redis:6379
      SQS_ENDPOINT: http://localstack:4566
      SNS_ENDPOINT: http://localstack:4566
      AUTH_SERVICE_URL: http://auth:3001
    ports:
      - "3002:3002"
    depends_on:
      - postgres
      - redis
      - localstack

  rewards:
    build: ./services/rewards
    environment:
      DATABASE_URL: postgres://moneylife:localdev123@postgres:5432/moneylife
      REDIS_URL: redis://redis:6379
      SQS_ENDPOINT: http://localstack:4566
      SNS_ENDPOINT: http://localstack:4566
    ports:
      - "3003:3003"
    depends_on:
      - postgres
      - redis
      - localstack

  social:
    build: ./services/social
    environment:
      DATABASE_URL: postgres://moneylife:localdev123@postgres:5432/moneylife
      REDIS_URL: redis://redis:6379
    ports:
      - "3004:3004"
    depends_on:
      - postgres
      - redis

  admin:
    build: ./services/admin
    environment:
      DATABASE_URL: postgres://moneylife:localdev123@postgres:5432/moneylife
      REDIS_URL: redis://redis:6379
    ports:
      - "3005:3005"
    depends_on:
      - postgres
      - redis

volumes:
  pgdata:
```

### 6.2 Complete Environment Variables Catalog

| Variable | Service | Required | Default | Description |
|---|---|---|---|---|
| `DATABASE_URL` | All | Yes | — | PostgreSQL connection string |
| `REDIS_URL` | All | Yes | — | Redis connection string |
| `SQS_ENDPOINT` | game-engine, rewards | No | AWS default | SQS endpoint (localstack in dev) |
| `SNS_ENDPOINT` | game-engine, rewards | No | AWS default | SNS endpoint (localstack in dev) |
| `JWT_SECRET` | auth | Yes | — | HMAC secret for JWT signing (256-bit min) |
| `JWT_EXPIRY` | auth | No | `15m` | Access token expiry |
| `JWT_REFRESH_EXPIRY` | auth | No | `7d` | Refresh token expiry |
| `BCRYPT_ROUNDS` | auth | No | `12` | Password hashing rounds |
| `GOOGLE_CLIENT_ID` | auth | No | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | auth | No | — | Google OAuth secret |
| `APPLE_CLIENT_ID` | auth | No | — | Apple Sign In client ID |
| `APPLE_TEAM_ID` | auth | No | — | Apple developer team ID |
| `APPLE_KEY_ID` | auth | No | — | Apple Sign In key ID |
| `APPLE_PRIVATE_KEY` | auth | No | — | Apple Sign In private key (PEM) |
| `PLAID_CLIENT_ID` | banking | No | — | Plaid API client ID |
| `PLAID_SECRET` | banking | No | — | Plaid API secret |
| `PLAID_ENV` | banking | No | `sandbox` | `sandbox` / `development` / `production` |
| `TRUELAYER_CLIENT_ID` | banking | No | — | TrueLayer client ID |
| `TRUELAYER_CLIENT_SECRET` | banking | No | — | TrueLayer secret |
| `TRUELAYER_ENV` | banking | No | `sandbox` | `sandbox` / `live` |
| `SALT_EDGE_APP_ID` | banking | No | — | Salt Edge application ID |
| `SALT_EDGE_SECRET` | banking | No | — | Salt Edge secret |
| `FCM_SERVICE_ACCOUNT` | notification | No | — | Firebase Cloud Messaging service account JSON |
| `SENDGRID_API_KEY` | notification | No | — | SendGrid API key for email |
| `TREMENDOUS_API_KEY` | rewards | No | — | Tremendous reward fulfillment key |
| `TREMENDOUS_ENV` | rewards | No | `sandbox` | `sandbox` / `production` |
| `SENTRY_DSN` | All | No | — | Sentry error tracking DSN |
| `LOG_LEVEL` | All | No | `info` | `debug` / `info` / `warn` / `error` |
| `CORS_ORIGINS` | All | No | `*` | Comma-separated allowed origins |
| `RATE_LIMIT_WINDOW_MS` | All | No | `60000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX` | All | No | `100` | Max requests per window |
| `ENCRYPTION_KEY` | All | Yes | — | AES-256 key for encrypting sensitive data at rest |
| `PARTNER_WEBHOOK_SECRET` | partner | No | — | HMAC secret for partner webhook signatures |

---

## 7. Code Style & Conventions

### 7.1 TypeScript (Backend + Frontend — Unified)

```json
// .eslintrc.json (root — applies to backend, mobile, web, ui-kit)
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "import"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "import/order": ["error", { "groups": ["builtin", "external", "internal"] }],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error"
  }
}

// .eslintrc.mobile.json (extends root, adds React Native rules)
{
  "extends": ["./.eslintrc.json", "plugin:react/recommended", "plugin:react-hooks/recommended"],
  "plugins": ["react", "react-hooks", "react-native"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react-native/no-unused-styles": "warn",
    "react-native/no-inline-styles": "warn",
    "react-native/no-raw-text": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  },
  "settings": {
    "react": { "version": "detect" }
  }
}

// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

### 7.2 Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Files (TS/TSX) | kebab-case | `game-engine.ts`, `balance-card.tsx` |
| Component files | PascalCase | `BalanceCard.tsx`, `DecisionCardView.tsx` |
| Classes | PascalCase | `GameEngine`, `CreditHealthCalculator` |
| Interfaces | PascalCase (no I prefix) | `GameState`, `Transaction` |
| React components | PascalCase | `BalanceCard`, `CreditHealthGauge` |
| Hooks | camelCase with `use` prefix | `useGameStore`, `useGameQuery` |
| Zustand stores | camelCase with `use` prefix | `useGameStore`, `useAuthStore` |
| Functions | camelCase | `calculateInterest()`, `advanceDay()` |
| Constants | SCREAMING_SNAKE | `MAX_CREDIT_LIMIT`, `DEFAULT_APR` |
| DB tables | snake_case plural | `game_accounts`, `transactions` |
| DB columns | snake_case | `created_at`, `credit_limit` |
| API endpoints | kebab-case | `/api/v1/game/{id}/advance-day` |
| Env vars | SCREAMING_SNAKE | `DATABASE_URL`, `JWT_SECRET` |
| SQS queues | kebab-case | `game-events`, `reward-fulfillment` |
| SNS topics | kebab-case | `user-events`, `game-events` |
| Feature flags | snake_case | `enable_investments`, `banking_plaid_enabled` |

### 7.3 Git Conventions

- **Branch naming:** `feat/ML-123-description`, `fix/ML-456-description`, `chore/ML-789-description`
- **Commit format:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`)
- **PR size:** Max 400 lines changed (excluding generated code, tests, migrations)
- **Required reviews:** 1 for services, 2 for simulation-engine or shared-types
- **Merge strategy:** Squash merge to main

---

## 8. Database Migration Strategy

### 8.1 Migration Numbering

```
migrations/
├── 001_initial_schema.sql          # users, sessions, devices
├── 002_game_tables.sql             # games, game_accounts, transactions, scheduled_bills
├── 003_rewards_tables.sql          # xp_ledger, coin_ledger, badges, streaks, redemptions
├── 004_social_tables.sql           # friends, classrooms, leaderboard_snapshots
├── 005_banking_tables.sql          # linked_accounts, synced_transactions, mirror_comparisons
├── 006_partner_tables.sql          # partners, partner_themes, partner_features, partner_rewards
├── 007_analytics_tables.sql        # events, experiment_assignments
```

### 8.2 Rules

1. **Migrations are append-only.** Never modify a migration that has been applied to staging/production.
2. **Every migration has an `up` and `down`.** The `down` must be tested.
3. **No data migrations in schema files.** Data migrations get their own numbered file (e.g., `003a_seed_badges.sql`).
4. **All DDL statements are idempotent** where possible (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`).
5. **Foreign keys use `ON DELETE` clauses explicitly.** Default: `ON DELETE CASCADE` for child records, `ON DELETE SET NULL` for optional references.
6. **Indexes:** Create indexes for all foreign keys and any column used in `WHERE` clauses. Name format: `idx_{table}_{column}`.
7. **Migration tool:** `node-pg-migrate` (lightweight, SQL-native, no ORM coupling).

### 8.3 Rollback Procedure

```bash
# Rollback last migration
pnpm --filter db-migrations migrate:down

# Rollback to specific version
pnpm --filter db-migrations migrate:down --to 005

# Verify current version
pnpm --filter db-migrations migrate:status
```

---

## 9. Feature Flag Catalog

| Flag | Default | Controls | Tier Requirement |
|---|---|---|---|
| `enable_investments` | `false` | Investment simulation feature | Level 4+ |
| `enable_insurance` | `false` | Insurance mechanics | Level 3+ |
| `enable_bnpl` | `false` | Buy Now Pay Later feature | Level 4+ |
| `enable_crypto` | `false` | Crypto in investment sim | Level 7+ |
| `enable_tax_filing` | `false` | Annual tax event | Level 5+ |
| `enable_mortgage` | `false` | Mortgage account type | Parent persona, Level 5+ |
| `enable_classroom_mode` | `true` | Classroom/teacher features | All |
| `enable_competitive_mode` | `false` | PvP leaderboards | All |
| `enable_mirror_mode` | `false` | Real vs simulated comparison | Banking integration required |
| `banking_plaid_enabled` | `false` | Plaid account linking | Requires API keys |
| `banking_truelayer_enabled` | `false` | TrueLayer account linking | Requires API keys |
| `banking_saltedge_enabled` | `false` | Salt Edge account linking | Requires API keys |
| `rewards_redemption_enabled` | `true` | Coin redemption for rewards | All |
| `rewards_sponsored_challenges` | `false` | Sponsored challenge system | Admin toggle |
| `ads_interstitial_enabled` | `true` | Interstitial ads (free tier) | Free tier only |
| `ads_banner_enabled` | `false` | Banner ads | Disabled — poor UX |
| `notifications_push_enabled` | `true` | Push notifications | All |
| `notifications_email_digest` | `true` | Weekly email digest | All |
| `social_friends_enabled` | `true` | Friend system | All |
| `social_leaderboards_enabled` | `true` | Leaderboard display | All |
| `offline_mode_enabled` | `true` | Offline play with sync | All |
| `auto_advance_enabled` | `true` | Auto-advance days | User setting |
| `difficulty_hard_enabled` | `true` | Hard mode available | Premium only |
| `persona_parent_enabled` | `true` | Parent persona available | Premium only |
| `partner_sso_enabled` | `false` | White-label SSO | Partner config |
| `partner_custom_scenarios` | `false` | Custom scenarios per partner | Professional+ tier |
| `partner_custom_rewards` | `false` | Custom reward catalog | Professional+ tier |
| `analytics_detailed_enabled` | `true` | Detailed event tracking | All |
| `gdpr_data_export` | `true` | User data export | All (required by law) |
| `gdpr_data_deletion` | `true` | User data deletion | All (required by law) |
| `maintenance_mode` | `false` | Global maintenance flag | Admin toggle |
| `rate_limit_strict` | `false` | Stricter rate limits (DDoS) | Admin toggle |

---

## 10. Localization

### 10.1 File Structure (react-i18next JSON)

```
packages/ui-kit/src/i18n/
├── locales/
│   ├── en.json          # English (base/fallback)
│   ├── ro.json          # Romanian
│   ├── pl.json          # Polish
│   ├── hu.json          # Hungarian
│   ├── cs.json          # Czech
│   ├── de.json          # German
│   └── fr.json          # French
├── i18n.ts              # i18next configuration
└── index.ts             # Export convenience hooks
```

### 10.2 Key Naming Convention

```json
{
  "appTitle": "MoneyLife",
  
  "onboarding": {
    "welcomeTitle": "Welcome to MoneyLife",
    "welcomeSubtitle": "Learn money by living it",
    "personaSelect": "Choose your life stage"
  },
  
  "game": {
    "dailySummary": "Day {{day}} of {{month}}",
    "balance": "{{amount}}"
  },
  
  "rewards": {
    "xpEarned": "+{{amount}} XP",
    "coinsCount_zero": "No coins",
    "coinsCount_one": "1 coin",
    "coinsCount_other": "{{count}} coins"
  },
  
  "error": {
    "network": "Connection lost. Your progress is saved locally.",
    "bankrupt": "You've gone bankrupt. But don't worry — every failure is a lesson."
  }
}
```

### 10.3 Currency Formatting

```typescript
// packages/ui-kit/src/utils/currency-formatter.ts

const CURRENCY_CONFIG: Record<string, { locale: string; symbol: string; decimals: number }> = {
  RON: { locale: 'ro-RO', symbol: 'lei', decimals: 2 },
  PLN: { locale: 'pl-PL', symbol: 'zł', decimals: 2 },
  HUF: { locale: 'hu-HU', symbol: 'Ft', decimals: 0 },
  CZK: { locale: 'cs-CZ', symbol: 'Kč', decimals: 2 },
  GBP: { locale: 'en-GB', symbol: '£', decimals: 2 },
  EUR: { locale: 'de-DE', symbol: '€', decimals: 2 },
  USD: { locale: 'en-US', symbol: '$', decimals: 2 },
};

export function formatCurrency(amountInCents: number, currencyCode: string): string {
  const config = CURRENCY_CONFIG[currencyCode];
  if (!config) return `${amountInCents} ${currencyCode}`;

  const amount = amountInCents / Math.pow(10, config.decimals);

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount);
}
```

---

## 11. Common Pitfalls (Don't Do This!)

### Backend

1. **Don't use floating-point for money.** All monetary values are integers in smallest currency unit (cents, bani, grosze). `5000` = €50.00. Exception: HUF has no subunit, so `5000` = 5000 Ft.

2. **Don't let the client compute game state.** The client sends actions; the server validates and returns new state. Never trust `balance` or `xp` from the client.

3. **Don't skip idempotency keys on mutations.** Every `POST` that changes state must accept an `idempotencyKey`. Duplicate submissions return the cached response, not a second mutation.

4. **Don't use `SELECT ... FOR UPDATE` without a timeout.** Deadlocks will happen under load. Use `SET LOCAL lock_timeout = '5s'` in transactions.

5. **Don't apply month-end processing partially.** All month-end steps are one atomic transaction. If step 7 (investments) fails, roll back steps 1-6 too.

6. **Don't store derived data without a cache invalidation strategy.** Net worth, credit health, and budget score are computed values. Store them as cached snapshots with a `computed_at` timestamp and recompute on `GET` if stale (>5 min).

7. **Don't use real credit scoring model names (FICO, VantageScore).** These are trademarked. Our metric is "Credit Health Index" — always use this name.

8. **Don't assume all currencies have 2 decimal places.** HUF has 0, BHD has 3, JPY has 0. Use the currency config's `decimalDigits` field.

9. **Don't hardcode region-specific values.** Tax rates, inflation rates, bill amounts — all come from `config/regions/{code}.json`. Never put `0.25` (VAT) directly in code.

10. **Don't emit SQS/SNS events inside a DB transaction.** Emit after commit. Use the outbox pattern: write events to an `outbox` table inside the transaction, then a separate process publishes them.

### Mobile (React Native)

11. **Don't make API calls from components directly.** All API calls via React Query hooks → API client. Components consume hooks, never call `fetch` or `axios` directly.

12. **Don't cache game state in `AsyncStorage`.** Use WatermelonDB for structured offline storage. AsyncStorage is for simple settings only (theme preference, last viewed screen).

13. **Don't show stale balances after an action.** After `submitAction()`, always use the returned `newState` to update Zustand store and invalidate React Query cache. Don't wait for a separate `getGame()` call.

14. **Don't hardcode strings.** Every user-visible string goes through react-i18next (`t('key')`). Even error messages.

15. **Don't manage complex state with `useState`.** Use Zustand stores for any state shared between components or that persists across screens. `useState` is fine for local UI-only state (modal open/close, text input value).

16. **Don't skip the loading/error/empty states.** Every screen that loads data has exactly 4 states: loading, loaded, error, empty. Handle all 4 with explicit components. React Query's `isLoading`, `isError`, `data` make this easy.

17. **Don't ignore keyboard overlap.** Decision card screens with text input must handle keyboard insets. Use `KeyboardAvoidingView` + `useHeaderHeight()` from Expo Router.

### Security

18. **Don't log sensitive data.** Never log: passwords, tokens, API keys, full transaction details, or PII. Use structured logging with a `sensitiveFields` redaction list.

19. **Don't store JWT in AsyncStorage.** Use `expo-secure-store` (Keychain on iOS, EncryptedSharedPreferences on Android) for tokens and sensitive data.

20. **Don't skip rate limiting on auth endpoints.** Login: 5 attempts per minute per IP. Register: 3 per minute per IP. Password reset: 1 per minute per email.

21. **Don't trust the `partner_id` from the client.** Partner context is derived from the API key / SSO token, never from a client-sent field.

22. **Don't return different error messages for "user not found" vs "wrong password."** Both return the same generic "Invalid credentials" to prevent user enumeration.

23. **Don't expose internal IDs in error messages.** Return error codes (`INSUFFICIENT_FUNDS`, `CARD_EXPIRED`) not database IDs or stack traces.

### Data

24. **Don't use `DELETE` for user data deletion.** Soft-delete with `deleted_at` timestamp. Hard-delete only after GDPR retention period (30 days) via a scheduled job.

25. **Don't forget to index `partner_id` on every multi-tenant table.** Every query in a white-label context filters by `partner_id`. Missing index = full table scan.

---

## 12. PR Review Checklist

### Backend Service PR

- [ ] Types defined in `shared-types` (not local to service)
- [ ] Input validation on all endpoints (zod schemas)
- [ ] Error handling: no unhandled promise rejections, errors mapped to API error codes
- [ ] Idempotency key on all mutation endpoints
- [ ] Rate limiting configured for new endpoints
- [ ] Database queries use parameterized queries (no SQL injection)
- [ ] Sensitive fields not logged
- [ ] Unit tests for new logic (≥85% coverage delta)
- [ ] Integration tests for new endpoints
- [ ] Migration file included if schema changed (with rollback)
- [ ] SQS/SNS events documented in event catalog
- [ ] OpenAPI spec updated for new/changed endpoints
- [ ] `partner_id` filtering on all multi-tenant queries

### Mobile / Web Screen PR

- [ ] Zustand store used for shared/persistent state (no `useState` for complex state)
- [ ] React Query hooks used for all server data fetching
- [ ] All 4 states handled: loading, loaded, error, empty
- [ ] All strings use react-i18next `t()` (no hardcoded strings)
- [ ] Currency values formatted via `formatCurrency()` from ui-kit
- [ ] Offline behavior defined and tested (WatermelonDB sync)
- [ ] Accessibility: `accessibilityLabel`, contrast, dynamic text sizes
- [ ] Component tests with React Native Testing Library (or React Testing Library for web)
- [ ] Screenshots attached for visual review
- [ ] Deep link handling if screen is navigable via URL (Expo Router handles this)
- [ ] White-label theming applied (uses theme context, not hardcoded colors)
- [ ] No inline styles — use StyleSheet.create or theme tokens
- [ ] `react-native-web` compatibility verified for shared ui-kit components

### Shared Library PR (ui-kit / simulation-engine)

- [ ] No side effects (pure functions where possible)
- [ ] 95%+ test coverage (simulation-engine) / 90%+ (ui-kit)
- [ ] Performance benchmarks for hot paths (interest calc, ledger operations)
- [ ] TypeScript strict mode passes
- [ ] JSDoc on all public functions
- [ ] Breaking changes documented in CHANGELOG
- [ ] Version bump in `package.json`
- [ ] Works on both React Native and web (for ui-kit components)

---

## Appendix: Quick Start for AI Agents

```bash
# 1. Clone and install
git clone https://github.com/andupetcu/moneylife.git
cd moneylife
pnpm install

# 2. Start infrastructure
docker compose up -d postgres redis localstack

# 3. Run migrations
pnpm --filter db-migrations migrate:up

# 4. Seed development data
pnpm --filter db-migrations seed

# 5. Start all backend services
pnpm dev  # uses turbo to start all services in parallel

# 6. Verify backend
curl http://localhost:3001/health  # auth
curl http://localhost:3002/health  # game-engine
curl http://localhost:3003/health  # rewards

# 7. Run tests
pnpm test         # all tests
pnpm test:unit    # unit only
pnpm test:integ   # integration only

# 8. Start mobile app
cd apps/mobile
npx expo start

# 9. Start web app
cd apps/web
pnpm dev

# 10. Run mobile E2E tests
cd apps/mobile
npx detox build --configuration ios.sim.debug
npx detox test --configuration ios.sim.debug
```

**Start building from Week 1 of the sprint plan. The simulation-engine is the foundation — get it right with 95%+ coverage before building anything on top.**
