# MoneyLife — System Architecture

> Version 1.1 · February 2026
> Implementation plan, data models, API design, infrastructure, and deployment strategy.

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Module Breakdown](#2-module-breakdown)
3. [Data Model (ERD)](#3-data-model-erd)
4. [API Design](#4-api-design)
5. [Tech Stack](#5-tech-stack)
6. [Infrastructure](#6-infrastructure)
7. [Performance Targets](#7-performance-targets)
8. [Security Architecture](#8-security-architecture)
9. [Offline-First Architecture](#9-offline-first-architecture)
10. [Event-Driven Architecture](#10-event-driven-architecture)
11. [Cross-Platform Strategy](#11-cross-platform-strategy)
12. [White-Label Architecture](#12-white-label-architecture)
13. [Deployment Model](#13-deployment-model)
14. [Sequence Diagrams](#14-sequence-diagrams)

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CDN (CloudFront)                              │
│                    Static assets, images, card media                     │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────────┐
│                        API Gateway (Kong)                                │
│              Rate limiting, auth validation, routing                      │
│         ┌─────────────────────────────────────────────┐                  │
│         │  /api/v1/auth/*    → Auth Service           │                  │
│         │  /api/v1/game/*    → Game Engine Service     │                  │
│         │  /api/v1/rewards/* → Rewards Service         │                  │
│         │  /api/v1/social/*  → Social Service          │                  │
│         │  /api/v1/partner/* → Partner Service         │                  │
│         │  /api/v1/banking/* → Banking Integration Svc │                  │
│         │  /api/v1/admin/*   → Admin Service           │                  │
│         └─────────────────────────────────────────────┘                  │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼───────┐  ┌──────────▼──────────┐  ┌───────▼───────────┐
│  Auth Service │  │  Game Engine Service │  │  Rewards Service  │
│               │  │                      │  │                   │
│ - Registration│  │ - Day advancement    │  │ - Coin management │
│ - Login/JWT   │  │ - Card generation    │  │ - Badge awarding  │
│ - OAuth/SSO   │  │ - Financial calcs    │  │ - Redemption flow │
│ - Device mgmt │  │ - Month-end proc.    │  │ - Partner catalog │
│ - Age verify  │  │ - Score calculation  │  │ - Streak tracking │
│               │  │ - Level progression  │  │ - Anti-abuse      │
└───────┬───────┘  └──────────┬──────────┘  └───────┬───────────┘
        │                     │                      │
        │          ┌──────────▼──────────┐           │
        │          │   Game State Store   │           │
        │          │   (PostgreSQL +      │           │
        │          │    Redis Cache)      │           │
        │          └─────────────────────┘           │
        │                                             │
┌───────▼───────┐  ┌─────────────────────┐  ┌───────▼───────────┐
│ Social Service│  │ Banking Integration │  │  Partner Service  │
│               │  │      Service        │  │                   │
│ - Leaderboard │  │ - Plaid/TrueLayer   │  │ - Partner mgmt    │
│ - Friends     │  │ - Transaction sync  │  │ - Catalog CRUD    │
│ - Classroom   │  │ - Mirror Mode       │  │ - Analytics       │
│ - Challenges  │  │ - Data enrichment   │  │ - Dashboard API   │
│ - Head-to-head│  │                     │  │ - White-label cfg │
└───────┬───────┘  └──────────┬──────────┘  └───────┬───────────┘
        │                     │                      │
        └─────────┬───────────┴──────────────────────┘
                  │
        ┌─────────▼─────────────┐      ┌────────────────────┐
        │   Message Queue       │      │  Notification Svc  │
        │   (Amazon SQS/SNS)    │─────>│  - Push (FCM/APNS) │
        │                       │      │  - Email (SES)     │
        │  Events:              │      │  - In-app          │
        │  - game.day.advanced  │      └────────────────────┘
        │  - game.month.ended   │
        │  - reward.redeemed    │      ┌────────────────────┐
        │  - user.registered    │─────>│  Analytics Service  │
        │  - user.level.up      │      │  - Mixpanel/Ampli  │
        │  - challenge.completed│      │  - Custom metrics  │
        │                       │      │  - Partner reports │
        └───────────────────────┘      └────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                         Data Stores                                 │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  PostgreSQL   │  │    Redis     │  │  Amazon S3   │              │
│  │  (Primary DB) │  │   (Cache +   │  │  (Media +    │              │
│  │              │  │   Sessions)  │  │   Exports)   │              │
│  │  - Users     │  │              │  │              │              │
│  │  - Games     │  │  - Session   │  │  - Card imgs │              │
│  │  - Accounts  │  │    tokens    │  │  - Badges    │              │
│  │  - Transact. │  │  - Leaderbd  │  │  - Reports   │              │
│  │  - Cards     │  │    cache     │  │  - Exports   │              │
│  │  - Rewards   │  │  - Rate limit│  │              │              │
│  │  - Partners  │  │    counters  │  │              │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└────────────────────────────────────────────────────────────────────┘
```

### 1.2 Request Flow Summary

```
React Native / Next.js Client → CDN (static assets)
                              → API Gateway (all API calls)
                                → Service (business logic)
                                  → Database (state mutation)
                                  → Event Bus (side effects)
                                    → Notifications
                                    → Analytics
                                    → Partner webhooks
```

---

## 2. Module Breakdown

### 2.1 Auth Service

| Responsibility | Details |
|---|---|
| User registration | Email/password, social (Google, Apple, Facebook), SSO (bank partners) |
| Authentication | JWT issuance (access + refresh tokens), token refresh |
| Authorization | Role-based: player, teacher, partner_admin, system_admin |
| Device management | Register/deregister devices, active session tracking |
| Age verification | Birthdate validation, parental consent flow |
| Password management | Reset, change, bcrypt hashing (cost factor 12) |
| OAuth2 provider | For bank partner SSO integration |
| Rate limiting (auth) | 5 login attempts per 15 min per IP |

**Technology:** Node.js (TypeScript) + Express

### 2.2 Game Engine Service

This is the core service. ALL game state mutations pass through here.

| Responsibility | Details |
|---|---|
| Game creation | Initialize game state from persona template |
| Day advancement | Process pending actions, advance game date |
| Decision card engine | Select, present, and resolve cards |
| Financial calculator | Interest, fees, amortization, inflation |
| Month-end processor | Full month-end cycle (see gameplay-and-rules.md §2.3) |
| Score calculator | XP, coins, CHI, budget score, net worth |
| Level progression | Check victory conditions, handle level-up |
| Account management | Create accounts, process transfers, validate limits |
| Loan processor | Origination, payment processing, default detection |
| Investment engine | Portfolio management, return simulation |
| Insurance processor | Premium deduction, claim processing |
| Bankruptcy handler | Detection, processing, recovery tracking |

**Technology:** Node.js (TypeScript) — single service but internally modular

**Internal module structure:**
```
game-engine/
  src/
    controllers/          # HTTP request handlers
    services/
      GameService.ts      # Orchestrates day/month/year cycles
      CardEngine.ts       # Decision card selection & resolution
      FinancialCalc.ts    # All financial formulas
      ScoreEngine.ts      # XP, coins, CHI, budget scoring
      LevelEngine.ts      # Level progression logic
      AccountService.ts   # Account CRUD and rules
      LoanService.ts      # Loan lifecycle
      InvestmentService.ts # Portfolio management
      InsuranceService.ts # Insurance lifecycle
      BankruptcyService.ts # Bankruptcy detection & processing
    models/               # TypeORM entities
    events/               # Event emitters
    validators/           # Input validation schemas (Zod)
    config/               # Game constants, difficulty params
```

### 2.3 Rewards Service

| Responsibility | Details |
|---|---|
| Coin ledger | Credit/debit coins with full audit trail |
| Badge engine | Check unlock conditions, award badges |
| Streak tracker | Track daily activity, calculate multipliers |
| Reward catalog | CRUD for reward items, inventory management |
| Redemption engine | Process redemptions, manage fulfillment states |
| Partner fulfillment | Call partner APIs, handle responses |
| Anti-abuse | Rate limiting, velocity checks, pattern detection |
| Achievement tiers | Track tier progression, apply tier perks |

**Technology:** Node.js (TypeScript) + Express

### 2.4 Social Service

| Responsibility | Details |
|---|---|
| Friend system | Add/remove friends, friend requests |
| Leaderboards | Global, friend, classroom leaderboards |
| Classroom management | Create/join classrooms, teacher controls |
| Challenge engine | Weekly/monthly challenges, seasonal events |
| Head-to-head | Matchmaking, synchronized card distribution |
| Referral tracking | Code generation, referral validation |

**Technology:** Node.js (TypeScript) + Express

### 2.5 Banking Integration Service

| Responsibility | Details |
|---|---|
| Plaid connector | Link flow, token management, transaction sync |
| TrueLayer connector | Auth, data access, payment initiation |
| Salt Edge connector | Connection lifecycle, enrichment |
| Mirror Mode engine | Compare simulated vs real spending |
| Transaction categorization | Rule engine + ML model integration |
| Consent management | Track/revoke user consents per regulation |

**Technology:** Node.js (TypeScript) + Express

### 2.6 Partner Service

| Responsibility | Details |
|---|---|
| Partner management | CRUD for partner organizations |
| White-label config | Theme, branding, feature flags per partner |
| Partner dashboard API | Analytics, catalog management, user stats |
| SSO integration | Per-partner SSO configuration |
| Data isolation | Tenant-scoped queries and access control |

**Technology:** Node.js (TypeScript) + Express

### 2.7 Notification Service

| Responsibility | Details |
|---|---|
| Push notifications | FCM (Android), APNS (iOS) |
| Email | Transactional emails via Amazon SES |
| In-app notifications | WebSocket-based real-time notifications |
| Template management | Per-locale, per-partner notification templates |
| Preference management | User opt-in/out per channel and type |

**Technology:** Node.js (TypeScript) + Bull (job queue on Redis)

### 2.8 Admin Service

| Responsibility | Details |
|---|---|
| User management | Search, view, suspend, delete users |
| Anti-cheat review | Review flagged accounts, take action |
| Content management | Decision card CRUD, event management |
| System configuration | Game constants, feature flags |
| Analytics dashboards | Internal metrics and monitoring |

**Technology:** Node.js (TypeScript) + React admin dashboard

---

## 3. Data Model (ERD)

### 3.1 Core Tables

```
┌─────────────────────┐       ┌──────────────────────┐
│       users          │       │      partners        │
├─────────────────────┤       ├──────────────────────┤
│ id (PK, UUID)       │       │ id (PK, UUID)        │
│ email (UNIQUE)      │       │ name                 │
│ password_hash       │       │ slug (UNIQUE)        │
│ display_name        │       │ config (JSONB)       │
│ date_of_birth       │──┐    │ theme (JSONB)        │
│ timezone            │  │    │ logo_url             │
│ locale              │  │    │ status (active/susp) │
│ partner_id (FK?)    │──┼───>│ created_at           │
│ role (player/teacher│  │    │ updated_at           │
│       /admin)       │  │    └──────────────────────┘
│ status              │  │
│ created_at          │  │    ┌──────────────────────┐
│ updated_at          │  │    │     devices          │
│ deleted_at          │  │    ├──────────────────────┤
└─────────────────────┘  │    │ id (PK, UUID)        │
                         │    │ user_id (FK)         │
                         ├───>│ device_uuid          │
                         │    │ platform (ios/and)   │
                         │    │ push_token           │
                         │    │ app_version          │
                         │    │ last_active_at       │
                         │    │ is_active_session    │
                         │    │ created_at           │
                         │    └──────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────┐
│                        games                            │
├─────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                          │
│ user_id (FK → users)                                    │
│ partner_id (FK → partners, nullable)                    │
│ persona (teen/student/young_adult/parent)                │
│ difficulty (easy/normal/hard)                            │
│ currency_code (USD/EUR/etc)                             │
│ ppp_factor (DECIMAL)                                    │
│ current_game_date (DATE)                                │
│ current_level (INT)                                     │
│ total_xp (INT)                                          │
│ level_xp (INT — XP within current level)                │
│ total_coins (INT)                                       │
│ happiness (INT, 0-100)                                  │
│ streak_current (INT)                                    │
│ streak_longest (INT)                                    │
│ streak_last_action_date (DATE)                          │
│ chi_score (INT, 300-850)                                │
│ chi_payment_history (INT, 0-100)                        │
│ chi_utilization (INT, 0-100)                            │
│ chi_credit_age (INT, 0-100)                             │
│ chi_credit_mix (INT, 0-100)                             │
│ chi_new_inquiries (INT, 0-100)                          │
│ budget_score (INT, 0-100)                               │
│ net_worth (DECIMAL)                                     │
│ monthly_income (DECIMAL — current)                      │
│ inflation_cumulative (DECIMAL)                          │
│ bankruptcy_count (INT)                                   │
│ bankruptcy_active (BOOL)                                │
│ bankruptcy_end_date (DATE, nullable)                    │
│ state_version (BIGINT — optimistic concurrency)         │
│ random_seed (BIGINT — for deterministic investment returns) │
│ status (active/paused/completed)                        │
│ created_at                                              │
│ updated_at                                              │
└─────────────────────────────────────────────────────────┘
          │
          │ 1:N
          ▼
┌─────────────────────────────────────────────────────────┐
│                    game_accounts                         │
├─────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                           │
│ game_id (FK → games)                                    │
│ type (checking/savings/credit_card/student_loan/         │
│       auto_loan/mortgage/personal_loan/bnpl/             │
│       investment_brokerage/investment_retirement)         │
│ balance (DECIMAL, 6 dp)                                  │
│ credit_limit (DECIMAL, nullable — credit cards)          │
│ interest_rate (DECIMAL — APR)                            │
│ principal (DECIMAL, nullable — loans)                    │
│ remaining_principal (DECIMAL, nullable)                   │
│ monthly_payment (DECIMAL, nullable)                      │
│ term_months (INT, nullable)                              │
│ months_paid (INT, nullable)                              │
│ auto_pay_setting (none/minimum/full)                     │
│ status (active/closed/frozen/defaulted)                  │
│ opened_game_date (DATE)                                  │
│ consecutive_missed_payments (INT)                         │
│ pending_interest (DECIMAL — accumulated fractional)       │
│ withdrawal_count_this_month (INT — savings)              │
│ created_at                                               │
│ updated_at                                               │
└─────────────────────────────────────────────────────────┘
          │
          │ 1:N
          ▼
┌─────────────────────────────────────────────────────────┐
│                   transactions                           │
├─────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                           │
│ game_id (FK → games)                                    │
│ account_id (FK → game_accounts)                         │
│ game_date (DATE)                                        │
│ type (income/expense/transfer/interest/fee/              │
│       insurance_premium/insurance_claim/                  │
│       loan_payment/investment_buy/investment_sell/        │
│       dividend/tax/refund)                               │
│ category (housing/food/transport/shopping/health/etc)     │
│ subcategory (VARCHAR)                                    │
│ amount (DECIMAL) — positive=credit, negative=debit       │
│ balance_after (DECIMAL)                                  │
│ description (VARCHAR)                                    │
│ card_id (FK → decision_cards, nullable)                  │
│ is_automated (BOOL — system-generated vs player action)  │
│ created_at                                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  decision_cards                           │
├─────────────────────────────────────────────────────────┤
│ id (PK, VARCHAR — e.g. "DC-YA-FOOD-042")                │
│ category (VARCHAR)                                       │
│ subcategory (VARCHAR)                                    │
│ title (VARCHAR)                                          │
│ description (TEXT)                                       │
│ persona_tags (VARCHAR[])                                 │
│ level_range_min (INT)                                    │
│ level_range_max (INT)                                    │
│ frequency_weight (INT)                                   │
│ options (JSONB)   — array of option objects               │
│ consequences (JSONB) — follow-up chain definitions        │
│ seasonal_event_id (FK, nullable)                         │
│ partner_id (FK, nullable — for sponsored cards)          │
│ is_active (BOOL)                                         │
│ created_at                                               │
│ updated_at                                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              game_pending_cards                           │
├─────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                           │
│ game_id (FK → games)                                    │
│ card_id (FK → decision_cards)                           │
│ presented_game_date (DATE)                               │
│ expires_game_date (DATE)                                 │
│ selected_option_id (VARCHAR, nullable)                    │
│ resolved_at (TIMESTAMP, nullable)                        │
│ xp_awarded (INT, nullable)                               │
│ coins_awarded (INT, nullable)                            │
│ status (pending/resolved/expired)                        │
│ created_at                                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│             consequence_queue                             │
├─────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                           │
│ game_id (FK → games)                                    │
│ trigger_card_id (FK)                                    │
│ trigger_option_id (VARCHAR)                              │
│ consequence_card_id (FK)                                 │
│ earliest_trigger_date (DATE)                             │
│ latest_trigger_date (DATE)                               │
│ probability (DECIMAL)                                    │
│ status (waiting/triggered/expired)                       │
│ created_at                                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                savings_goals                             │
├─────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                           │
│ account_id (FK → game_accounts)                         │
│ game_id (FK → games)                                    │
│ name (VARCHAR)                                          │
│ target_amount (DECIMAL)                                  │
│ current_amount (DECIMAL)                                 │
│ deadline_game_date (DATE, nullable)                      │
│ status (active/completed/abandoned)                      │
│ created_at                                               │
│ updated_at                                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              investment_holdings                          │
├─────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                           │
│ account_id (FK → game_accounts)                         │
│ asset_type (index/bond/stock/crypto)                     │
│ asset_name (VARCHAR — e.g. "S&P 500 Index")             │
│ units (DECIMAL)                                         │
│ cost_basis (DECIMAL — total cost paid)                   │
│ current_value (DECIMAL)                                  │
│ drip_enabled (BOOL)                                     │
│ created_at                                               │
│ updated_at                                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              insurance_policies                           │
├─────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                           │
│ game_id (FK → games)                                    │
│ type (health/auto/renters/homeowners/life/disability)    │
│ monthly_premium (DECIMAL)                                │
│ deductible (DECIMAL)                                     │
│ coverage_pct (DECIMAL)                                   │
│ payout_amount (DECIMAL, nullable — life insurance)       │
│ claims_filed (INT)                                       │
│ status (active/lapsed/cancelled)                         │
│ premium_increase_pct (DECIMAL — cumulative from claims)  │
│ started_game_date (DATE)                                 │
│ lapsed_game_date (DATE, nullable)                       │
│ created_at                                               │
│ updated_at                                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   budgets                                │
├─────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                           │
│ game_id (FK → games)                                    │
│ game_month (DATE — first of month)                      │
│ allocations (JSONB — { "housing": 800, "food": 300 })   │
│ actuals (JSONB — { "housing": 800, "food": 340 })       │
│ score (INT, 0-100)                                      │
│ created_at                                               │
│ updated_at                                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  monthly_reports                          │
├─────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                           │
│ game_id (FK)                                            │
│ game_month (DATE)                                       │
│ income_total (DECIMAL)                                   │
│ expense_total (DECIMAL)                                  │
│ savings_change (DECIMAL)                                 │
│ investment_change (DECIMAL)                               │
│ debt_change (DECIMAL)                                    │
│ net_worth (DECIMAL)                                      │
│ chi_score (INT)                                          │
│ budget_score (INT)                                       │
│ xp_earned (INT)                                          │
│ coins_earned (INT)                                       │
│ highlights (JSONB — key events/decisions)                 │
│ created_at                                               │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Rewards & Social Tables

```
┌─────────────────────────────────────────────────────────┐
│                  coin_ledger                              │
├─────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                           │
│ user_id (FK → users)                                    │
│ amount (INT — positive=credit, negative=debit)           │
│ balance_after (INT)                                      │
│ reason (VARCHAR — "card_decision", "level_up", etc)      │
│ reference_id (UUID, nullable — links to source)          │
│ created_at                                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  user_badges                              │
├─────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                           │
│ user_id (FK)                                            │
│ badge_id (VARCHAR — "BDG-SAVINGS-001")                  │
│ earned_at (TIMESTAMP)                                    │
│ game_id (FK, nullable — which game it was earned in)     │
│ difficulty (easy/normal/hard)                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              reward_catalog_items                         │
├─────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                           │
│ partner_id (FK → partners)                              │
│ name (VARCHAR)                                          │
│ description (TEXT)                                       │
│ image_url (VARCHAR)                                     │
│ category (gift_card/discount/physical/charity/experience)│
│ coin_cost (INT)                                          │
│ face_value_usd (DECIMAL)                                │
│ stock (INT, -1 = unlimited)                             │
│ fulfillment_type (instant_digital/async_digital/physical)│
│ partner_api_item_id (VARCHAR, nullable)                  │
│ status (active/paused/removed)                          │
│ tenant_ids (UUID[], nullable — NULL = all tenants)      │
│ created_at                                               │
│ updated_at                                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  redemptions                             │
├─────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                           │
│ user_id (FK)                                            │
│ catalog_item_id (FK)                                    │
│ coin_cost (INT)                                          │
│ idempotency_key (UUID, UNIQUE)                          │
│ status (pending/processing/fulfilled/confirmed/          │
│         failed/refunded/disputed/resolved)               │
│ fulfillment_details (JSONB — code, tracking, etc)        │
│ partner_redemption_id (VARCHAR, nullable)                │
│ delivery_email (VARCHAR, nullable)                       │
│ delivery_address (JSONB, nullable)                       │
│ error_message (TEXT, nullable)                           │
│ created_at                                               │
│ updated_at                                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  friendships                              │
├─────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                           │
│ user_id_a (FK — lower UUID)                             │
│ user_id_b (FK — higher UUID)                            │
│ status (pending/accepted/blocked)                        │
│ initiated_by (FK — who sent request)                    │
│ created_at                                               │
│ updated_at                                               │
│ UNIQUE(user_id_a, user_id_b)                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  classrooms                               │
├─────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                           │
│ teacher_id (FK → users)                                 │
│ partner_id (FK, nullable)                               │
│ name (VARCHAR)                                          │
│ join_code (VARCHAR, UNIQUE)                             │
│ config (JSONB — persona, difficulty, level range, etc)   │
│ status (active/archived)                                │
│ created_at                                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              classroom_members                            │
├─────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                           │
│ classroom_id (FK)                                       │
│ user_id (FK)                                            │
│ team_id (VARCHAR, nullable)                             │
│ joined_at                                                │
│ status (active/removed)                                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  challenges                               │
├─────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                           │
│ type (weekly/monthly/seasonal/classroom/head_to_head)    │
│ name (VARCHAR)                                          │
│ description (TEXT)                                       │
│ config (JSONB — challenge parameters)                    │
│ start_date (TIMESTAMP)                                  │
│ end_date (TIMESTAMP)                                    │
│ rewards (JSONB)                                         │
│ classroom_id (FK, nullable)                             │
│ partner_id (FK, nullable — sponsor)                     │
│ status (upcoming/active/ended)                          │
│ created_at                                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│            challenge_participants                         │
├─────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                           │
│ challenge_id (FK)                                       │
│ user_id (FK)                                            │
│ score (DECIMAL)                                         │
│ rank (INT, nullable — set at challenge end)              │
│ reward_claimed (BOOL)                                    │
│ joined_at                                                │
│ updated_at                                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  referrals                                │
├─────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                           │
│ referrer_id (FK → users)                                │
│ referee_id (FK → users)                                 │
│ referral_code (VARCHAR)                                 │
│ status (pending/confirmed/rewarded/rejected)             │
│ confirmed_at (TIMESTAMP, nullable)                      │
│ rewarded_at (TIMESTAMP, nullable)                       │
│ created_at                                               │
└─────────────────────────────────────────────────────────┘
```

### 3.3 Banking Integration Tables

```
┌─────────────────────────────────────────────────────────┐
│              banking_connections                          │
├─────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                           │
│ user_id (FK)                                            │
│ provider (plaid/truelayer/saltedge)                      │
│ provider_connection_id (VARCHAR)                         │
│ institution_name (VARCHAR)                               │
│ status (active/disconnected/error)                       │
│ consent_granted_at (TIMESTAMP)                          │
│ consent_expires_at (TIMESTAMP)                          │
│ last_sync_at (TIMESTAMP)                                │
│ created_at                                               │
│ updated_at                                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│            banking_transactions                           │
├─────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                           │
│ connection_id (FK)                                      │
│ user_id (FK)                                            │
│ provider_transaction_id (VARCHAR)                        │
│ date (DATE)                                              │
│ amount (DECIMAL)                                         │
│ currency (VARCHAR)                                       │
│ description (VARCHAR)                                    │
│ category (VARCHAR — our categorization)                  │
│ category_source (rule/ml/vendor)                        │
│ merchant_name (VARCHAR, nullable)                       │
│ is_pending (BOOL)                                        │
│ created_at                                               │
└─────────────────────────────────────────────────────────┘
```

---

## 4. API Design

### 4.1 Authentication Endpoints

```
POST /api/v1/auth/register
  Body: { email, password, display_name, date_of_birth, locale, timezone, referral_code? }
  Response: { user_id, access_token, refresh_token }
  
POST /api/v1/auth/login
  Body: { email, password, device_id }
  Response: { access_token, refresh_token, user }

POST /api/v1/auth/refresh
  Body: { refresh_token }
  Response: { access_token, refresh_token }

POST /api/v1/auth/logout
  Headers: Authorization: Bearer <token>
  Response: 204

POST /api/v1/auth/password/reset
  Body: { email }
  Response: 202

POST /api/v1/auth/password/change
  Body: { old_password, new_password }
  Response: 204

POST /api/v1/auth/social/google
  Body: { id_token, device_id }
  Response: { access_token, refresh_token, user, is_new }

POST /api/v1/auth/social/apple
  Body: { identity_token, authorization_code, device_id }
  Response: { access_token, refresh_token, user, is_new }

POST /api/v1/auth/sso/{partner_slug}
  Body: { sso_token, device_id }
  Response: { access_token, refresh_token, user }

GET /api/v1/auth/devices
  Response: { devices: [{ id, platform, last_active, is_current }] }

DELETE /api/v1/auth/devices/{device_id}
  Response: 204
```

### 4.2 Game Endpoints

```
POST /api/v1/game/create
  Body: { persona, difficulty, currency_code }
  Response: { game_id, initial_state }

GET /api/v1/game/{game_id}
  Response: { full game state }

GET /api/v1/game/{game_id}/summary
  Response: { balances, chi, level, xp, coins, next_bills, pending_cards }

POST /api/v1/game/{game_id}/advance-day
  Body: { current_game_date, state_version }
  Response: { new_game_date, events: [], new_cards: [], state_version }

POST /api/v1/game/{game_id}/card-decision
  Body: { card_instance_id, selected_option_id, state_version }
  Response: { consequences: { balance_changes, xp, coins, narrative }, state_version }

GET /api/v1/game/{game_id}/accounts
  Response: { accounts: [{ type, balance, details... }] }

POST /api/v1/game/{game_id}/accounts/{account_id}/transfer
  Body: { to_account_id, amount, state_version }
  Response: { from_balance, to_balance, state_version }

GET /api/v1/game/{game_id}/transactions
  Query: ?account_id=&from_date=&to_date=&category=&page=&limit=
  Response: { transactions: [], pagination }

POST /api/v1/game/{game_id}/budget
  Body: { allocations: { housing: 800, food: 300, ... } }
  Response: { budget_id, allocations }

GET /api/v1/game/{game_id}/budget/current
  Response: { allocations, actuals, score }

GET /api/v1/game/{game_id}/reports/{game_month}
  Response: { monthly_report }

GET /api/v1/game/{game_id}/reports
  Response: { reports: [ summaries ] }

POST /api/v1/game/{game_id}/savings-goals
  Body: { account_id, name, target_amount, deadline? }
  Response: { goal }

PUT /api/v1/game/{game_id}/savings-goals/{goal_id}
  Body: { name?, target_amount?, deadline? }
  Response: { goal }

DELETE /api/v1/game/{game_id}/savings-goals/{goal_id}
  Response: 204

GET /api/v1/game/{game_id}/investments
  Response: { holdings: [], total_value, total_gain_loss }

POST /api/v1/game/{game_id}/investments/order
  Body: { account_id, asset_type, asset_name, action: "buy"|"sell", amount_cu }
  Response: { order_id, status: "queued", executes_on }

DELETE /api/v1/game/{game_id}/investments/order/{order_id}
  Response: { cancelled: true }

POST /api/v1/game/{game_id}/insurance/{policy_id}/claim
  Body: { event_id }
  Response: { claim_result: { covered, deductible, player_pays, insurer_pays } }

GET /api/v1/game/{game_id}/chi-history
  Response: { history: [{ game_month, score, breakdown }] }

POST /api/v1/game/{game_id}/loan/apply
  Body: { type, amount, term_months }
  Response: { approved: bool, loan_details? | denial_reason? }

POST /api/v1/game/{game_id}/accounts/{account_id}/auto-pay
  Body: { setting: "none"|"minimum"|"full" }
  Response: 204
```

### 4.3 Rewards Endpoints

```
GET /api/v1/rewards/balance
  Response: { coins: 1234, tier: "Savings Champion", tier_level: 4 }

GET /api/v1/rewards/badges
  Response: { badges: [{ badge_id, name, rarity, earned_at, icon_url }] }

GET /api/v1/rewards/streak
  Response: { current: 14, longest: 45, multiplier: 1.2, last_action_date }

GET /api/v1/rewards/catalog
  Query: ?category=&min_coins=&max_coins=&partner=&page=&limit=
  Response: { items: [{ id, name, coins, partner, image, available }] }

GET /api/v1/rewards/catalog/{item_id}
  Response: { full item details }

POST /api/v1/rewards/redeem
  Body: { item_id, idempotency_key, delivery: { email? | address? } }
  Response: { redemption_id, status, fulfillment_details? }

GET /api/v1/rewards/redemptions
  Query: ?status=&page=&limit=
  Response: { redemptions: [] }

GET /api/v1/rewards/redemptions/{redemption_id}
  Response: { full redemption details }

POST /api/v1/rewards/streak-shield/activate
  Body: { }
  Response: { activated: true, coins_deducted: 50, grace_until }

POST /api/v1/rewards/streak-insurance/purchase
  Body: { }
  Response: { purchased: true, coins_deducted: 100, streak_restored: true }

GET /api/v1/rewards/achievements
  Response: { current_tier, lifetime_xp, tier_progress, next_tier, perks }

POST /api/v1/rewards/coin-purchase/verify
  Body: { platform: "ios"|"android", receipt, product_id }
  Response: { coins_credited, new_balance }
```

### 4.4 Social Endpoints

```
GET /api/v1/social/friends
  Response: { friends: [{ user_id, display_name, level, chi_score }] }

POST /api/v1/social/friends/request
  Body: { user_id | referral_code }
  Response: { friendship_id, status: "pending" }

PUT /api/v1/social/friends/{friendship_id}
  Body: { action: "accept"|"reject"|"block" }
  Response: 204

GET /api/v1/social/leaderboard/{type}
  Type: global|friends|classroom|weekly_challenge
  Query: ?metric=net_worth|chi|budget|xp&page=&limit=
  Response: { entries: [{ rank, user_id, display_name, score, level }] }

GET /api/v1/social/challenges
  Query: ?type=weekly|monthly|seasonal&status=active|upcoming
  Response: { challenges: [] }

POST /api/v1/social/challenges/{challenge_id}/join
  Response: { participation_id }

GET /api/v1/social/challenges/{challenge_id}/leaderboard
  Response: { entries: [] }

POST /api/v1/social/head-to-head/queue
  Response: { match_id, status: "matching"|"matched", opponent? }

GET /api/v1/social/head-to-head/{match_id}
  Response: { status, your_score, opponent_score, cards, winner? }

GET /api/v1/social/classrooms
  Response: { classrooms: [{ id, name, teacher, member_count }] }

POST /api/v1/social/classrooms/join
  Body: { join_code }
  Response: { classroom }

GET /api/v1/social/referral-code
  Response: { code: "ML-ALEX-7K2F", referrals_count, referrals_remaining }
```

### 4.5 Partner/Admin Endpoints

```
# Partner Dashboard API (separate auth: partner API key)

GET /api/v1/partner/analytics/overview
  Response: { total_users, dau, mau, avg_session, level_distribution }

GET /api/v1/partner/analytics/engagement
  Query: ?from=&to=
  Response: { daily_active_users: [], retention: { d1, d7, d30 } }

GET /api/v1/partner/analytics/learning
  Response: { avg_chi_progression, budget_adherence_trend, common_mistakes }

POST /api/v1/partner/catalog/items
  Body: { name, description, image_url, coin_cost, stock, fulfillment_type }
  Response: { item }

PUT /api/v1/partner/catalog/items/{item_id}
  Body: { ...updates }
  Response: { item }

DELETE /api/v1/partner/catalog/items/{item_id}
  Response: 204

GET /api/v1/partner/catalog/items
  Response: { items: [] }

POST /api/v1/partner/catalog/items/{item_id}/restock
  Body: { additional_stock }
  Response: { new_stock }

GET /api/v1/partner/config
  Response: { theme, branding, feature_flags }

PUT /api/v1/partner/config
  Body: { theme?, branding?, feature_flags? }
  Response: { config }
```

### 4.6 Banking Integration Endpoints

```
POST /api/v1/banking/connect/plaid/link-token
  Response: { link_token }

POST /api/v1/banking/connect/plaid/exchange
  Body: { public_token }
  Response: { connection_id }

POST /api/v1/banking/connect/truelayer/auth-url
  Response: { auth_url }

POST /api/v1/banking/connect/truelayer/callback
  Body: { code }
  Response: { connection_id }

GET /api/v1/banking/connections
  Response: { connections: [{ id, provider, institution, status, last_sync }] }

DELETE /api/v1/banking/connections/{connection_id}
  Response: 204

GET /api/v1/banking/connections/{connection_id}/transactions
  Query: ?from=&to=&page=&limit=
  Response: { transactions: [] }

GET /api/v1/banking/mirror-mode/comparison
  Query: ?game_id=&month=
  Response: { simulated: { by_category }, real: { by_category }, insights }

POST /api/v1/banking/connections/{connection_id}/sync
  Response: { synced_count, new_transactions }
```

### 4.7 Sync Endpoint

```
POST /api/v1/sync
  Body: {
    device_id,
    last_known_server_sequence,
    queued_actions: [{ action_type, payload, sequence_number, timestamp, checksum }],
    client_state_hash
  }
  Response: {
    accepted_actions: [sequence_numbers],
    rejected_actions: [{ sequence, reason, resolution }],
    server_state: { ...complete game state... },
    server_sequence
  }
```

### 4.8 Common Response Formats

```json
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Not enough balance for this transfer",
    "details": { "required": 500, "available": 320 }
  }
}

// Paginated
{
  "success": true,
  "data": { "items": [...] },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "has_more": true
  }
}
```

### 4.9 Common Headers

```
Request:
  Authorization: Bearer <JWT>
  X-Device-Id: <UUID>
  X-Request-Signature: HMAC-SHA256(body, device_secret)
  X-Timestamp: <ISO 8601>
  X-Idempotency-Key: <UUID> (for mutating requests)
  X-Client-Version: 2.1.0
  X-Partner-Id: <UUID> (white-label apps)
  Content-Type: application/json

Response:
  X-Request-Id: <UUID> (for debugging)
  X-Rate-Limit-Remaining: 95
  X-Rate-Limit-Reset: 1709236800
```

---

## 5. Tech Stack

### 5.1 Recommendation

| Layer | Technology | Justification |
|---|---|---|
| **Mobile Client** | **React Native (Expo)** | Single codebase for iOS + Android using Expo managed workflow. EAS Build for CI. Expo Router for file-based navigation. Large talent pool, TypeScript end-to-end with backend, excellent ecosystem of native modules. |
| **Web Client** | **Next.js** | Server-side rendering for SEO landing pages, shared React component library with mobile via react-native-web. App Router for modern React patterns. |
| **Shared UI** | **react-native-web** | ~70% of UI components shared between mobile and web. Shared design system in `packages/ui-kit/`. Platform-specific code via `.native.tsx` / `.web.tsx` extensions. |
| **State Management** | **Zustand + React Query** | Zustand for client state (game state, UI state). React Query (TanStack Query) for server state (API caching, mutations, optimistic updates). Lightweight, TypeScript-first, no boilerplate. |
| **Local Storage (Mobile)** | **WatermelonDB** | High-performance offline-first database for React Native. SQLite under the hood, lazy loading, observable queries for reactive UI. Perfect for offline game state and transaction history. |
| **Backend Language** | **TypeScript (Node.js)** | Shared type system with client, excellent async I/O for game server, huge ecosystem, easy hiring. |
| **Backend Framework** | **NestJS** | Structured, module-based architecture. Built-in DI, validation, guards. TypeORM integration. Production-proven. |
| **Primary Database** | **PostgreSQL 16** | JSONB for flexible schemas, excellent indexing, ACID transactions for financial calculations, proven at scale. |
| **Cache** | **Redis 7** | Session management, leaderboard caching, rate limiting counters, pub/sub for real-time. |
| **Message Queue** | **Amazon SQS + SNS** | Managed, reliable, scales automatically. SQS for task queues, SNS for event fan-out. |
| **Object Storage** | **Amazon S3** | Card images, badge icons, user exports, reports. CloudFront CDN in front. |
| **API Gateway** | **Kong** | Rate limiting, auth plugin, request transformation, logging. Open-source, Kubernetes-native. |
| **Search** | **PostgreSQL FTS** | Full-text search for reward catalog, card search. Sufficient for our scale; avoid Elasticsearch complexity. |
| **Push Notifications** | **Firebase Cloud Messaging (FCM) + APNS** | Industry standard. Use Firebase for Android + cross-platform, APNS for iOS direct. |
| **Email** | **Amazon SES** | Low cost, high deliverability, template support. |
| **Monitoring** | **Datadog** | APM, logs, metrics, dashboards, alerting — all in one. |
| **Error Tracking** | **Sentry** | Real-time error tracking with source maps (client + server). |
| **Analytics** | **Amplitude** | Product analytics, user journeys, retention analysis. Free tier covers MVP. |
| **CI/CD** | **GitHub Actions** | Native GitHub integration, reusable workflows, EAS Build for mobile. |
| **Infrastructure** | **AWS (EKS + RDS + ElastiCache)** | Kubernetes for services, managed PostgreSQL, managed Redis. |
| **IaC** | **Terraform** | Declarative, multi-environment, well-documented AWS provider. |
| **Container Orchestration** | **Kubernetes (EKS)** | Auto-scaling, rolling deploys, health checks. |
| **Container Registry** | **Amazon ECR** | Managed, integrates with EKS natively. |

### 5.2 Why React Native (Expo) + Next.js

```
Decision factors:
1. Code sharing: ~70% of components shared between iOS, Android, and web
   via react-native-web. Single design system in packages/ui-kit/.
   
2. TypeScript end-to-end: Same language on backend, mobile, and web.
   Shared types in packages/shared-types/ imported everywhere.
   No Dart ↔ TypeScript translation layer.

3. Talent pool: React/React Native has the largest hiring pool.
   Any React developer can contribute to mobile with minimal ramp-up.

4. Expo managed workflow: No native code to maintain. EAS Build handles
   iOS and Android builds in the cloud. OTA updates via expo-updates
   for instant patches without app store review.

5. Next.js for web: SSR for SEO (marketing pages, blog), plus the game
   UI as a web app sharing components with mobile. Teacher dashboard
   and admin portal can also share the component library.

6. State management: Zustand is 1KB, zero boilerplate, works identically
   on mobile and web. React Query handles server state with caching,
   background refetch, and optimistic updates built in.

7. WatermelonDB: Purpose-built for React Native offline-first apps.
   Observable queries drive reactive UI. Sync primitives built in.

Tradeoffs:
- Animation performance: Reanimated 3 + Skia gives near-native animation.
  For our card flip/balance animations, this is sufficient.
- App size: ~8-12MB (comparable to Flutter). Hermes engine helps.
- Native modules: Expo has 50+ built-in modules. For anything custom,
  Expo Config Plugins handle native code without ejecting.
```

---

## 6. Infrastructure

### 6.1 AWS Architecture

```
┌──────────────────── AWS Region: us-east-1 ────────────────────────┐
│                                                                    │
│  ┌──── VPC ──────────────────────────────────────────────────┐    │
│  │                                                            │    │
│  │  ┌── Public Subnet ──────────────────────────────────┐    │    │
│  │  │  ALB (Application Load Balancer)                   │    │    │
│  │  │  NAT Gateway                                       │    │    │
│  │  └────────────────────────────────────────────────────┘    │    │
│  │                                                            │    │
│  │  ┌── Private Subnet A ───────────────────────────────┐    │    │
│  │  │  EKS Node Group (3-10 nodes, m6i.xlarge)          │    │    │
│  │  │    - auth-service (2-5 pods)                       │    │    │
│  │  │    - game-engine (3-10 pods)                       │    │    │
│  │  │    - rewards-service (2-5 pods)                    │    │    │
│  │  │    - social-service (2-5 pods)                     │    │    │
│  │  │    - banking-service (2-3 pods)                    │    │    │
│  │  │    - partner-service (2-3 pods)                    │    │    │
│  │  │    - notification-service (2-5 pods)               │    │    │
│  │  │    - admin-service (2 pods)                        │    │    │
│  │  │    - kong-gateway (3 pods)                         │    │    │
│  │  └────────────────────────────────────────────────────┘    │    │
│  │                                                            │    │
│  │  ┌── Private Subnet B (Data) ────────────────────────┐    │    │
│  │  │  RDS PostgreSQL (db.r6g.xlarge, Multi-AZ)         │    │    │
│  │  │  ElastiCache Redis (cache.r6g.large, cluster)     │    │    │
│  │  └────────────────────────────────────────────────────┘    │    │
│  │                                                            │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                    │
│  S3 Buckets:                                                       │
│    moneylife-assets (card images, badges, static media)            │
│    moneylife-exports (user data exports, reports)                  │
│    moneylife-backups (DB snapshots)                                │
│                                                                    │
│  CloudFront Distribution → moneylife-assets                        │
│                                                                    │
│  SQS Queues:                                                       │
│    game-events, reward-fulfillment, notifications,                  │
│    banking-sync, analytics-events                                   │
│                                                                    │
│  SNS Topics:                                                       │
│    user-events, game-events, reward-events                         │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 6.2 CI/CD Pipeline

```
GitHub Repository (monorepo)
  │
  ├── Push to feature branch
  │   └── GitHub Actions: lint + test + build (parallel per service)
  │
  ├── PR to main
  │   └── GitHub Actions: full test suite + build + security scan
  │       └── Snyk for dependency vulnerabilities
  │       └── SAST with Semgrep
  │
  ├── Merge to main
  │   └── GitHub Actions:
  │       1. Build Docker images for changed services
  │       2. Push to ECR
  │       3. Deploy to staging (EKS staging cluster)
  │       4. Run E2E tests against staging
  │       5. If E2E pass: create deployment artifact
  │
  ├── Tag (v*.*.*)
  │   └── GitHub Actions:
  │       1. Deploy to production (EKS prod cluster, rolling update)
  │       2. Run smoke tests
  │       3. If smoke fail: auto-rollback
  │       4. Mobile: trigger EAS Build (iOS + Android)
  │
  └── Mobile release
      └── GitHub Actions:
          1. EAS Build (iOS + Android)
          2. iOS → EAS Submit → TestFlight → App Store review
          3. Android → EAS Submit → Play Console → Production track
          4. OTA update via expo-updates (for JS-only changes)
```

### 6.3 Monitoring Stack

```
Datadog:
  - APM: trace every request end-to-end
  - Logs: centralized logging from all services (structured JSON)
  - Metrics: custom business metrics + infrastructure metrics
  - Dashboards: service health, game engine performance, reward fulfillment
  - Alerts:
    - P1: service down, error rate > 5%, latency P95 > 2s
    - P2: error rate > 1%, disk usage > 80%, queue backlog > 1000
    - P3: anomaly detection on business metrics

Sentry:
  - Client errors (React Native + Next.js) with stack traces
  - Server errors with context
  - Release tracking
  - Performance monitoring

PagerDuty (on-call):
  - P1 alerts → immediate page
  - P2 alerts → within 1 hour
  - P3 alerts → next business day

Uptime monitoring:
  - Datadog Synthetics: health check endpoints every 30s
  - External: Pingdom or Better Uptime for CDN/gateway
```

---

## 7. Performance Targets

### 7.1 Latency Budgets

| Endpoint Category | P50 Target | P95 Target | P99 Target |
|---|---|---|---|
| Auth (login/register) | 100ms | 300ms | 500ms |
| Game state read | 50ms | 150ms | 300ms |
| Day advance | 200ms | 500ms | 1,000ms |
| Card decision | 100ms | 300ms | 500ms |
| Month-end processing | 500ms | 1,500ms | 3,000ms |
| Transfer | 100ms | 250ms | 500ms |
| Reward catalog | 50ms | 150ms | 300ms |
| Reward redemption | 200ms | 500ms | 1,000ms |
| Leaderboard | 100ms | 300ms | 500ms |
| Sync (offline catchup) | 300ms | 1,000ms | 2,000ms |

### 7.2 Throughput Requirements

```
Target: 100,000 DAU at launch, scaling to 1,000,000 DAU

At 100K DAU:
  Avg session: 5 min, 2 sessions/day
  Actions per session: ~10
  Peak RPS: ~500 (10× average for peak hour)
  
At 1M DAU:
  Peak RPS: ~5,000
  
Database:
  Read: 10,000 QPS peak
  Write: 2,000 QPS peak (with Redis write-behind for non-critical updates)

Month-end processing:
  Batch window: must process 100K games within 1 hour
  = ~28 games/second
  With 10 worker pods: ~3 games/second per pod (comfortable)
```

### 7.3 Storage Estimates

```
Per user (1 game):
  User record: ~500 bytes
  Game state: ~2 KB
  Accounts (5 avg): ~1 KB
  Transactions (200/month × 6 months avg): ~100 KB
  Decision card history: ~50 KB
  Reports: ~20 KB
  Total: ~175 KB per user

At 1M users:
  PostgreSQL: ~175 GB
  Redis cache: ~5 GB (active sessions + leaderboards)
  S3 (static assets): ~10 GB (shared, not per-user)
  S3 (exports): ~50 GB (generated on demand, TTL 7 days)
  
Growth rate: ~50 GB/month at 1M users
RDS storage: start at 500 GB, auto-scale
```

---

## 8. Security Architecture

### 8.1 Authentication Flow

```
┌──────────────┐                 ┌──────────────┐          ┌──────────┐
│    Client     │                 │  API Gateway  │          │Auth Svc  │
│ (RN / Next.js)│                 │   (Kong)      │          │          │
└──────┬───────┘                 └──────┬───────┘          └─────┬────┘
       │                                │                        │
       │  1. POST /auth/login           │                        │
       │  { email, password, device_id }│                        │
       │───────────────────────────────>│                        │
       │                                │  2. Forward             │
       │                                │───────────────────────>│
       │                                │                        │
       │                                │  3. Validate creds     │
       │                                │     Hash check (bcrypt)│
       │                                │     Generate JWT pair  │
       │                                │  4. Response           │
       │                                │<───────────────────────│
       │  5. { access_token (1hr),      │                        │
       │       refresh_token (30d),     │                        │
       │       user }                   │                        │
       │<───────────────────────────────│                        │
       │                                │                        │
       │  6. Subsequent requests:       │                        │
       │  Authorization: Bearer <JWT>   │                        │
       │───────────────────────────────>│                        │
       │                                │  7. Validate JWT       │
       │                                │  (Kong JWT plugin)     │
       │                                │  8. Forward if valid   │
       │                                │───────────────────────>│
```

### 8.2 JWT Structure

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "key-2026-02"
  },
  "payload": {
    "sub": "user-uuid",
    "iss": "moneylife-auth",
    "aud": "moneylife-api",
    "iat": 1709236800,
    "exp": 1709240400,
    "jti": "unique-token-id",
    "role": "player",
    "partner_id": "partner-uuid-or-null",
    "device_id": "device-uuid"
  }
}

Signing: RS256 (RSA + SHA-256)
Key rotation: every 90 days, old keys valid for 30 days after rotation
Access token TTL: 1 hour
Refresh token TTL: 30 days
Refresh token rotation: new refresh token issued on each refresh
```

### 8.3 Encryption

```
Data at rest:
  - PostgreSQL: AWS RDS encryption (AES-256) via AWS KMS
  - Redis: ElastiCache encryption at rest (AES-256)
  - S3: server-side encryption (SSE-S3 or SSE-KMS)
  - Mobile local storage: AES-256 with device-bound key
    iOS: Keychain for key storage
    Android: Android Keystore System

Data in transit:
  - All API: TLS 1.3 (minimum TLS 1.2)
  - Database connections: TLS
  - Inter-service: mTLS within Kubernetes (Istio service mesh)
  - Certificate pinning on mobile client (via expo-cert-pinner or custom plugin)

Sensitive fields:
  - Passwords: bcrypt (cost factor 12)
  - Banking tokens: AES-256-GCM encrypted at application level before storage
  - PII: encrypted columns for email, date_of_birth in DB
  
Key management:
  - AWS KMS for master keys
  - Application-level encryption keys derived from KMS
  - Key rotation: 90 days for JWT signing, 1 year for data encryption
  - Key access audited via CloudTrail
```

### 8.4 Security Measures Summary

```
1. Authentication: JWT + device binding + rate limiting
2. Authorization: RBAC (player/teacher/partner_admin/system_admin)
3. Input validation: Zod schemas on all endpoints, max payload 1MB
4. SQL injection: TypeORM parameterized queries (no raw SQL)
5. XSS: not applicable (no server-rendered HTML for game), CSP headers on Next.js pages
6. CSRF: not applicable (no cookies, JWT-based auth)
7. DDoS: Kong rate limiting + AWS WAF + CloudFront Shield
8. Certificate pinning: mobile client pins API gateway certificate
9. Code signing: iOS/Android app signing keys in secure vault (EAS credentials)
10. Dependency scanning: Snyk in CI/CD
11. Penetration testing: annually, by external firm
12. Bug bounty: planned for post-launch
13. OWASP compliance: top 10 addressed
14. SOC 2 Type II: target within 18 months of launch
```

---

## 9. Offline-First Architecture

### 9.1 Sync Protocol

```
Client maintains:
  - WatermelonDB local database (game state mirror)
  - Action queue (pending mutations)
  - Last known server sequence number

Sync flow:
  1. On every app foreground and every 5 minutes while active:
     Client → POST /api/v1/sync (see §4.7)
  
  2. Server processes queued actions sequentially
  
  3. Server returns authoritative state
  
  4. Client overwrites local state with server state
```

### 9.2 Conflict Resolution Algorithm

```python
def resolve_sync(server_state, client_actions):
    results = []
    current_state = server_state
    
    for action in client_actions:  # ordered by sequence_number
        # Validate action against current state
        validation = validate_action(action, current_state)
        
        if validation.is_valid:
            # Apply action
            new_state = apply_action(action, current_state)
            current_state = new_state
            results.append(ActionResult(
                sequence=action.sequence,
                status="accepted",
                state_delta=compute_delta(server_state, new_state)
            ))
        else:
            # Reject with reason
            results.append(ActionResult(
                sequence=action.sequence,
                status="rejected",
                reason=validation.reason,
                resolution=determine_resolution(action, validation)
            ))
    
    return SyncResponse(
        accepted=[r for r in results if r.status == "accepted"],
        rejected=[r for r in results if r.status == "rejected"],
        server_state=current_state,
        server_sequence=current_state.version
    )

def determine_resolution(action, validation):
    """Determine automatic resolution for rejected action"""
    if validation.reason == "card_expired":
        return "auto_skip"  # worst outcome applied server-side
    elif validation.reason == "insufficient_funds":
        return "insufficient_funds"  # inform user
    elif validation.reason == "stale_state":
        return "state_refreshed"  # client will get new state
    elif validation.reason == "already_processed":
        return "duplicate"  # idempotent, ignore
    else:
        return "manual_review"  # shouldn't happen
```

### 9.3 Local Storage Schema (WatermelonDB)

```typescript
// WatermelonDB model definitions for offline storage

// Mirror of server game state (read-only cache)
class GameState extends Model {
  static table = 'game_states';
  @text('game_id') gameId!: string;
  @json('state_data', sanitizeJSON) stateData!: object;
  @date('updated_at') updatedAt!: Date;
}

// Action queue (pending mutations)
class ActionQueue extends Model {
  static table = 'action_queue';
  @field('sequence_number') sequenceNumber!: number;
  @text('action_type') actionType!: string;
  @json('payload', sanitizeJSON) payload!: object;
  @text('timestamp') timestamp!: string;
  @text('checksum') checksum!: string;
  @field('synced') synced!: boolean;
}

// Cached decision cards (pre-fetched)
class CachedCard extends Model {
  static table = 'cached_cards';
  @text('card_instance_id') cardInstanceId!: string;
  @json('card_data', sanitizeJSON) cardData!: object;
  @date('fetched_at') fetchedAt!: Date;
}
```

---

## 10. Event-Driven Architecture

### 10.1 Event Catalog

| Event | Producer | Consumers | Payload |
|---|---|---|---|
| `user.registered` | Auth Service | Notification, Analytics, Partner | user_id, partner_id, persona, locale |
| `user.login` | Auth Service | Analytics | user_id, device, platform |
| `game.created` | Game Engine | Analytics, Social | game_id, user_id, persona, difficulty |
| `game.day.advanced` | Game Engine | Analytics, Streak Tracker | game_id, game_date, events |
| `game.card.resolved` | Game Engine | Rewards, Analytics | game_id, card_id, option, xp, coins |
| `game.month.ended` | Game Engine | Rewards, Analytics, Notification | game_id, month, report |
| `game.level.up` | Game Engine | Rewards, Social, Notification, Analytics | game_id, new_level |
| `game.bankruptcy` | Game Engine | Rewards, Social, Notification, Analytics | game_id |
| `game.completed` | Game Engine | Rewards, Social, Notification, Analytics | game_id, final_stats |
| `reward.coins.earned` | Rewards | Analytics | user_id, amount, reason |
| `reward.badge.earned` | Rewards | Notification, Analytics, Social | user_id, badge_id |
| `reward.redeemed` | Rewards | Partner, Notification, Analytics | redemption_id, item_id |
| `reward.fulfilled` | Rewards | Notification, Analytics | redemption_id |
| `social.friend.added` | Social | Notification | user_ids |
| `social.challenge.joined` | Social | Analytics | user_id, challenge_id |
| `social.challenge.ended` | Social | Rewards, Notification | challenge_id, rankings |
| `banking.connected` | Banking | Analytics, Notification | user_id, provider |
| `banking.transactions.synced` | Banking | Analytics | user_id, count |
| `streak.broken` | Rewards | Notification | user_id, streak_length |
| `streak.milestone` | Rewards | Notification, Analytics | user_id, days |

### 10.2 Event Bus Topology

```
SNS Topics (fan-out):
  user-events   → SQS: notification-queue, analytics-queue, partner-queue
  game-events   → SQS: rewards-queue, analytics-queue, notification-queue, social-queue
  reward-events → SQS: notification-queue, analytics-queue, partner-queue
  social-events → SQS: rewards-queue, notification-queue, analytics-queue

Each service has its own SQS queue:
  notification-queue  → Notification Service (email, push, in-app)
  analytics-queue     → Analytics Service (forward to Amplitude/Mixpanel)
  rewards-queue       → Rewards Service (coin/badge/streak processing)
  social-queue        → Social Service (leaderboard updates)
  partner-queue       → Partner Service (webhook delivery to partners)
  banking-sync-queue  → Banking Service (periodic transaction sync)

Dead Letter Queues:
  Each SQS queue has a DLQ. Messages retried 3 times before DLQ.
  DLQ alarm: trigger if messages > 0 (something is failing).
```

### 10.3 Event Schema

```json
{
  "event_id": "uuid",
  "event_type": "game.level.up",
  "version": "1.0",
  "timestamp": "2026-02-11T18:14:00Z",
  "source": "game-engine",
  "tenant_id": "partner-uuid-or-null",
  "data": {
    "game_id": "uuid",
    "user_id": "uuid",
    "new_level": 5,
    "total_xp": 18000,
    "persona": "young_adult"
  },
  "metadata": {
    "correlation_id": "uuid",
    "trace_id": "uuid"
  }
}
```

---

## 11. Cross-Platform Strategy

See §5.2 for React Native (Expo) + Next.js justification.

### 11.1 Code Sharing Architecture

```
moneylife/
├── apps/
│   ├── mobile/                 # Expo (React Native) — iOS & Android
│   └── web/                    # Next.js — Web app
├── packages/
│   ├── ui-kit/                 # Shared React Native components (RNW-compatible)
│   ├── shared-types/           # TypeScript types shared across everything
│   ├── simulation-engine/      # Core game logic (pure TypeScript)
│   └── config/                 # Region configs, personas, etc.
└── services/                   # Backend microservices

Code sharing breakdown (~70% shared):
┌──────────────────────────────────────────────────────────────────┐
│                        Shared (~70%)                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  packages/ui-kit/     — Design system components            │  │
│  │    Button, Card, Dialog, Loading, BalanceCard,              │  │
│  │    CreditHealthGauge, BudgetRing, TransactionList           │  │
│  │    (react-native-web makes these work on web too)           │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  packages/shared-types/ — All TypeScript interfaces         │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  Shared hooks:                                              │  │
│  │    useGameState, useDecisionCard, useRewards, useAuth       │  │
│  │    (Zustand stores + React Query hooks)                     │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  API client, formatters, validators, i18n strings           │  │
│  └────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│                    Mobile-Only (~15%)                             │
│  Push notifications, haptics, biometric auth, device storage,    │
│  native navigation transitions, Plaid Link SDK, app review       │
├──────────────────────────────────────────────────────────────────┤
│                     Web-Only (~15%)                               │
│  SSR pages, SEO metadata, keyboard shortcuts, responsive         │
│  layouts, web-specific analytics, social sharing meta tags       │
└──────────────────────────────────────────────────────────────────┘
```

### 11.2 Mobile Architecture (Expo / React Native)

```
apps/mobile/
  app/                          # Expo Router (file-based routing)
    (auth)/
      login.tsx
      register.tsx
      social-auth.tsx
    (tabs)/
      index.tsx                 # Home / Game Dashboard
      rewards.tsx               # Rewards & Badges
      social.tsx                # Friends & Leaderboards
      profile.tsx               # Profile & Settings
    game/
      [gameId]/
        daily.tsx               # Daily view
        card/[cardId].tsx       # Decision card screen
        monthly-review.tsx      # Month-end review
        account/[accountId].tsx # Account detail
        budget.tsx              # Budget setup/edit
    banking/
      connect.tsx               # Bank account linking
      mirror.tsx                # Mirror Mode comparison
    _layout.tsx                 # Root layout
  src/
    stores/                     # Zustand stores
      useGameStore.ts           # Game state
      useAuthStore.ts           # Auth tokens, user
      useRewardsStore.ts        # Coins, badges, streaks
      useSettingsStore.ts       # App preferences
    hooks/                      # React Query hooks
      useGameQuery.ts           # Game API queries/mutations
      useRewardsQuery.ts        # Rewards API queries
      useSyncMutation.ts        # Offline sync
    services/
      api-client.ts             # Axios instance + interceptors
      sync-engine.ts            # Offline sync orchestration
      notification-handler.ts   # Push notification handling
    db/                         # WatermelonDB models & schema
      schema.ts
      models/
        GameState.ts
        ActionQueue.ts
        CachedCard.ts
    providers/
      AuthProvider.tsx
      ThemeProvider.tsx          # White-label theming
      SyncProvider.tsx
    utils/
      currency-formatter.ts
      date-formatter.ts
  app.json                      # Expo config
  eas.json                      # EAS Build config
  metro.config.js               # Metro bundler config (for monorepo)
  tsconfig.json
```

### 11.3 State Management: Zustand + React Query

```typescript
// stores/useGameStore.ts — Zustand for client state
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameState, DecisionCard } from '@moneylife/shared-types';

interface GameStore {
  currentGame: GameState | null;
  pendingCards: DecisionCard[];
  isOffline: boolean;
  
  // Actions
  setGame: (game: GameState) => void;
  setPendingCards: (cards: DecisionCard[]) => void;
  setOffline: (offline: boolean) => void;
  clearGame: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      currentGame: null,
      pendingCards: [],
      isOffline: false,
      
      setGame: (game) => set({ currentGame: game }),
      setPendingCards: (cards) => set({ pendingCards: cards }),
      setOffline: (offline) => set({ isOffline: offline }),
      clearGame: () => set({ currentGame: null, pendingCards: [] }),
    }),
    {
      name: 'game-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// hooks/useGameQuery.ts — React Query for server state
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api-client';
import { useGameStore } from '../stores/useGameStore';
import type { GameAction, GameActionResult } from '@moneylife/shared-types';

export function useGameState(gameId: string) {
  const setGame = useGameStore((s) => s.setGame);
  
  return useQuery({
    queryKey: ['game', gameId],
    queryFn: () => apiClient.getGame(gameId),
    onSuccess: (data) => setGame(data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAdvanceDay(gameId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (action: GameAction) => apiClient.submitAction(gameId, action),
    onSuccess: (result: GameActionResult) => {
      queryClient.setQueryData(['game', gameId], (old: any) => ({
        ...old,
        ...result.newState,
      }));
    },
    onError: (error) => {
      if (error.message === 'OFFLINE') {
        // Queue for sync — handled by SyncProvider
      }
    },
  });
}
```

---

## 12. White-Label Architecture

### 12.1 Multi-Tenancy Model

```
Approach: SHARED infrastructure, ISOLATED data.

Database: Single PostgreSQL cluster, tenant_id column on all tables.
  - Row-Level Security (RLS) policies enforce tenant isolation.
  - Application layer ALSO filters by tenant_id (defense in depth).

Services: Shared service instances serve all tenants.
  - Tenant context extracted from JWT (partner_id claim).
  - All queries scoped by tenant.

Cache: Shared Redis, keys prefixed with tenant_id.
  - Leaderboard key: "lb:{tenant_id}:global:net_worth"

Storage: Shared S3, prefixed by tenant.
  - "s3://moneylife-assets/{tenant_id}/..."
```

### 12.2 Feature Flags

```json
// Per-tenant feature flag configuration
{
  "tenant_id": "bank-abc-uuid",
  "features": {
    "banking_integration": true,
    "mirror_mode": true,
    "crypto_investments": false,
    "bnpl": false,
    "referral_program": true,
    "head_to_head": false,
    "classroom_mode": true,
    "custom_decision_cards": true,
    "social_sharing": false,
    "in_app_purchases": false,
    "ads": false,
    "reward_catalog": "partner_only",
    "max_level": 8,
    "personas_available": ["young_adult", "parent"]
  }
}
```

### 12.3 Theming System

```json
// Per-tenant theme configuration
{
  "tenant_id": "bank-abc-uuid",
  "theme": {
    "brand_name": "SmartMoney by ABC Bank",
    "primary_color": "#0A3D6B",
    "secondary_color": "#E8F0FE",
    "accent_color": "#FF9800",
    "background_color": "#FFFFFF",
    "text_primary": "#1A1A1A",
    "text_secondary": "#666666",
    "font_family": "Roboto",
    "logo_url": "https://cdn.moneylife.app/partners/abc-bank/logo.png",
    "icon_url": "https://cdn.moneylife.app/partners/abc-bank/icon.png",
    "splash_image_url": "https://cdn.moneylife.app/partners/abc-bank/splash.png",
    "coin_name": "SmartPoints",
    "coin_icon_url": "https://cdn.moneylife.app/partners/abc-bank/coin.png"
  }
}
```

```typescript
// packages/ui-kit/src/theme/TenantTheme.ts
import { MD3LightTheme } from 'react-native-paper';

interface TenantThemeConfig {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  // ... other theme fields
}

export function createTenantTheme(config: TenantThemeConfig) {
  return {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: config.primaryColor,
      secondary: config.accentColor,
    },
    fonts: {
      ...MD3LightTheme.fonts,
      // Override with tenant font family
    },
  };
}
```

### 12.4 White-Label Build Pipeline

```
For each bank partner:
  1. Shared codebase (monorepo)
  2. Tenant config file: partners/{partner_slug}/config.json
  3. Tenant assets: partners/{partner_slug}/assets/ (icons, splash, logo)
  4. Build:
     EAS_PARTNER=abc-bank eas build --platform all --profile production
  5. Result: separate app binary with partner branding
  6. Published to partner's App Store / Play Store account via EAS Submit
```

---

## 13. Deployment Model

### 13.1 Multi-Tenant SaaS (Default)

```
All partners share:
  - Same EKS cluster
  - Same RDS instance (RLS for isolation)
  - Same Redis cluster
  - Same API Gateway

Benefits:
  - Cost efficient (shared infrastructure)
  - Easy to maintain (single deployment)
  - Fast partner onboarding (config-only)

Data isolation guaranteed by:
  - PostgreSQL Row-Level Security
  - Application-level tenant scoping
  - Separate S3 prefixes
  - API Gateway tenant header injection
```

### 13.2 Single-Tenant (Enterprise Option)

For large banks requiring dedicated infrastructure:

```
Dedicated:
  - Separate EKS cluster
  - Separate RDS instance
  - Separate Redis instance
  - Separate S3 bucket
  - Can be in bank's preferred region
  - Can be in bank's own AWS account (cross-account deployment)

Same codebase, different infrastructure.
Managed by our team via Terraform workspaces.

Pricing: 3-5× multi-tenant price (infrastructure + management overhead).
```

### 13.3 Environment Strategy

```
Environments:
  dev       → developers' shared environment (latest commit on main)
  staging   → pre-production (release candidates)
  production → live traffic

Per-environment config:
  - Separate database instances
  - Separate Redis instances
  - Separate AWS accounts (dev, staging+prod)
  - Feature flags can differ per environment
  
Database:
  dev:    db.t3.medium, single AZ
  staging: db.r6g.large, single AZ
  production: db.r6g.xlarge, Multi-AZ, read replicas
```

---

## 14. Sequence Diagrams

### 14.1 User Registration

```
Client          API GW          Auth Svc         DB              Queue
  │                │                │              │                │
  │ POST /register │                │              │                │
  │───────────────>│                │              │                │
  │                │ Forward        │              │                │
  │                │───────────────>│              │                │
  │                │                │ Validate     │                │
  │                │                │ input        │                │
  │                │                │              │                │
  │                │                │ Check email  │                │
  │                │                │ unique       │                │
  │                │                │─────────────>│                │
  │                │                │<─────────────│                │
  │                │                │              │                │
  │                │                │ Hash password│                │
  │                │                │ (bcrypt)     │                │
  │                │                │              │                │
  │                │                │ INSERT user  │                │
  │                │                │─────────────>│                │
  │                │                │<─────────────│                │
  │                │                │              │                │
  │                │                │ Generate JWT │                │
  │                │                │ pair         │                │
  │                │                │              │                │
  │                │                │ Emit event   │                │
  │                │                │─────────────────────────────>│
  │                │                │              │    user.       │
  │                │                │              │    registered  │
  │                │ 201 Created    │              │                │
  │                │<───────────────│              │                │
  │ { user, tokens }               │              │                │
  │<───────────────│                │              │                │
```

### 14.2 Game Action Submission (Card Decision)

```
Client          API GW          Game Svc         DB           Redis         Queue
  │                │                │              │              │            │
  │ POST /card-    │                │              │              │            │
  │  decision      │                │              │              │            │
  │───────────────>│                │              │              │            │
  │                │ Validate JWT   │              │              │            │
  │                │ Rate limit chk │              │              │            │
  │                │───────────────>│              │              │            │
  │                │                │              │              │            │
  │                │                │ Load game    │              │            │
  │                │                │─────────────>│              │            │
  │                │                │<─────────────│              │            │
  │                │                │              │              │            │
  │                │                │ Validate:    │              │            │
  │                │                │  state_ver   │              │            │
  │                │                │  card valid  │              │            │
  │                │                │  option valid│              │            │
  │                │                │              │              │            │
  │                │                │ Calculate:   │              │            │
  │                │                │  balance Δ   │              │            │
  │                │                │  XP earned   │              │            │
  │                │                │  coins earned│              │            │
  │                │                │  happiness Δ │              │            │
  │                │                │  CHI impact  │              │            │
  │                │                │              │              │            │
  │                │                │ BEGIN TRANSACTION            │            │
  │                │                │─────────────>│              │            │
  │                │                │ UPDATE game  │              │            │
  │                │                │ INSERT txn   │              │            │
  │                │                │ UPDATE card  │              │            │
  │                │                │ COMMIT       │              │            │
  │                │                │<─────────────│              │            │
  │                │                │              │              │            │
  │                │                │ Invalidate   │              │            │
  │                │                │ cache        │              │            │
  │                │                │─────────────────────────>│  │            │
  │                │                │              │              │            │
  │                │                │ Emit events  │              │            │
  │                │                │────────────────────────────────────────>│
  │                │                │              │              │  card.     │
  │                │                │              │              │  resolved  │
  │                │ 200 OK         │              │              │            │
  │                │<───────────────│              │              │            │
  │ { consequences,│                │              │              │            │
  │   new_state }  │                │              │              │            │
  │<───────────────│                │              │              │            │
```

### 14.3 Reward Redemption

```
Client        API GW        Rewards Svc       DB          Partner API      Queue
  │              │              │               │              │              │
  │ POST /redeem │              │               │              │              │
  │─────────────>│              │               │              │              │
  │              │─────────────>│               │              │              │
  │              │              │               │              │              │
  │              │              │ Check idemp.  │              │              │
  │              │              │ key           │              │              │
  │              │              │──────────────>│              │              │
  │              │              │<──────────────│              │              │
  │              │              │               │              │              │
  │              │              │ Check balance │              │              │
  │              │              │──────────────>│              │              │
  │              │              │<──────────────│              │              │
  │              │              │               │              │              │
  │              │              │ Rate limit    │              │              │
  │              │              │ check         │              │              │
  │              │              │               │              │              │
  │              │              │ Check stock   │              │              │
  │              │              │──────────────────────────>│  │              │
  │              │              │<──────────────────────────│  │              │
  │              │              │               │              │              │
  │              │              │ BEGIN TXN     │              │              │
  │              │              │ Deduct coins  │              │              │
  │              │              │ Create order  │              │              │
  │              │              │──────────────>│              │              │
  │              │              │ COMMIT        │              │              │
  │              │              │<──────────────│              │              │
  │              │              │               │              │              │
  │              │              │ Call partner  │              │              │
  │              │              │ redeem API    │              │              │
  │              │              │──────────────────────────>│  │              │
  │              │              │<──────────────────────────│  │              │
  │              │              │               │              │              │
  │              │              │ Update order  │              │              │
  │              │              │ status        │              │              │
  │              │              │──────────────>│              │              │
  │              │              │               │              │              │
  │              │              │ Emit event    │              │              │
  │              │              │────────────────────────────────────────>│  │
  │              │              │               │              │    reward.   │
  │              │ 200 OK       │               │              │    redeemed  │
  │              │<─────────────│               │              │              │
  │ { redemption │              │               │              │              │
  │   details }  │              │               │              │              │
  │<─────────────│              │               │              │              │
```

### 14.4 Bank Account Linking (Plaid)

```
Client          API GW          Banking Svc      Plaid API       DB
  │                │                │                │              │
  │ POST /plaid/   │                │                │              │
  │  link-token    │                │                │              │
  │───────────────>│───────────────>│                │              │
  │                │                │ POST /link/    │              │
  │                │                │ token/create   │              │
  │                │                │───────────────>│              │
  │                │                │<───────────────│              │
  │                │ { link_token } │                │              │
  │<───────────────│<───────────────│                │              │
  │                │                │                │              │
  │ Open Plaid     │                │                │              │
  │ Link SDK       │                │                │              │
  │ (in-app)       │                │                │              │
  │ ┌─────────┐    │                │                │              │
  │ │ Plaid   │    │                │                │              │
  │ │ Link UI │    │                │                │              │
  │ │ (bank   │    │                │                │              │
  │ │ select, │    │                │                │              │
  │ │ login)  │    │                │                │              │
  │ └────┬────┘    │                │                │              │
  │      │         │                │                │              │
  │ public_token   │                │                │              │
  │                │                │                │              │
  │ POST /plaid/   │                │                │              │
  │  exchange      │                │                │              │
  │ { public_token}│                │                │              │
  │───────────────>│───────────────>│                │              │
  │                │                │ POST /item/    │              │
  │                │                │ public_token/  │              │
  │                │                │ exchange       │              │
  │                │                │───────────────>│              │
  │                │                │<───────────────│              │
  │                │                │ { access_token}│              │
  │                │                │                │              │
  │                │                │ Encrypt & store│              │
  │                │                │───────────────────────────>│  │
  │                │                │                │              │
  │                │                │ Initial txn    │              │
  │                │                │ sync           │              │
  │                │                │───────────────>│              │
  │                │                │<───────────────│              │
  │                │                │ Store txns     │              │
  │                │                │───────────────────────────>│  │
  │                │                │                │              │
  │                │ { connection_id│                │              │
  │                │   status: ok } │                │              │
  │<───────────────│<───────────────│                │              │
```

---

*End of Architecture Specification*
