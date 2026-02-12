# MoneyLife — Gap Analysis: Documentation vs Implementation

> Generated: 2026-02-12
> Verdict: **The project has a solid foundation but is roughly 30-40% built. You cannot play a real game yet.**

---

## Executive Summary

The documentation describes an ambitious, deeply-featured financial life simulation game with 8 microservices, real banking integrations, social features, rewards marketplace, and multi-region localization. The implementation has:

- ✅ A working **auth service** (register, login, JWT, social auth stubs, password reset)
- ✅ A partially working **game engine** (create game, advance day, decide cards, transfers)
- ✅ A solid **simulation engine library** (ledger, interest, credit health, inflation, investments, insurance, budget scoring — all pure functions)
- ✅ A functional **web frontend** (landing, auth, dashboard, game view, card decisions)
- ✅ Complete **database schema** (all 7 migrations covering all documented tables)
- ✅ Good **config data** (8 region configs, personas, levels, badges, scenarios)
- ⚠️ Skeletal secondary services (rewards, social, banking, partner, notification, admin — files exist but mostly stubs)
- ❌ No actual game loop that connects the pieces together
- ❌ No month-end processing
- ❌ No card generation pipeline
- ❌ No XP/coin awarding
- ❌ No level progression

**Bottom line: The bones are good. The simulation-engine math is real. But the game-engine doesn't actually USE the simulation-engine. The pieces exist in isolation.**

---

## 1. Features Documented but NOT Implemented

### 1.1 Month-End Processing (CRITICAL)
- **Docs describe:** Atomic month-end cycle: salary deposit → bill deductions → loan payments → interest calculations → credit card statements → insurance premiums → investment returns → inflation adjustments → budget scoring → CHI recalculation → monthly report generation → level-up check
- **Code:** `monthly-report.ts` controller only READS from `monthly_reports` table. No code exists that WRITES monthly reports or PERFORMS month-end processing. The `advance_day` action just increments the date — it doesn't check for month boundaries or trigger any financial processing.
- **Missing:** The entire month-end orchestration. This is the heart of the game.

### 1.2 Card Generation Pipeline (CRITICAL)
- **Docs describe:** Daily card generation based on persona, level, recent history, weighted random selection from scenario catalog. Cards per day vary by level (1-3 base + bonus chance).
- **Code:** `simulation-engine` has `selectDailyScenarios()`, `generateDecisionCard()`, `getCardsPerDay()` — all pure functions. The game-engine has `getPendingCardsController` that reads from DB. But **nothing connects them**. No code generates cards on day advance. No code inserts into `game_pending_cards`.
- **Missing:** The glue: when a day advances, generate cards from the scenario pool and insert them.

### 1.3 Card Consequence Application (CRITICAL)
- **Docs describe:** Choosing a card option triggers: balance changes, XP/coin awards, happiness changes, consequence chains (delayed follow-up cards), recurring effects.
- **Code:** `decide_card` action in `action-processor.ts` just marks the card as resolved and increments state_version. It does NOT: apply balance changes, award XP/coins, trigger consequences, update happiness, create transactions.
- **Missing:** The entire consequence engine.

### 1.4 Scheduled Bills & Recurring Expenses
- **Docs describe:** Bills system with auto-pay, due dates, missed payment penalties, late fees.
- **Code:** `scheduled_bills` table exists in migration 002. No service code reads or processes bills. No bills are created when a game starts.
- **Missing:** Bill creation on game init, bill processing on day advance, missed payment handling.

### 1.5 Savings Goals
- **Docs describe:** Create goals with target amounts and deadlines, track progress, earn badges.
- **Code:** No `savings_goals` table in migrations (documented in architecture ERD but not implemented). No API endpoint. No frontend.
- **Missing:** Everything.

### 1.6 Investment Holdings & Portfolio Management
- **Docs describe:** Buy/sell index funds, bonds, stocks, crypto. Monthly return simulation, quarterly dividends, DRIP.
- **Code:** `simulation-engine/investment-sim.ts` has all the math (simulateMonthlyReturn, portfolioMonth, dividends). No `investment_holdings` table in migrations. No game-engine endpoints for invest/sell actions. `action-processor.ts` handles `invest` and `sell_investment` with a generic no-op stub.
- **Missing:** DB table, API handlers, integration with month-end.

### 1.7 Insurance Policies & Claims
- **Docs describe:** Buy policies (health/auto/renters/etc), monthly premiums, deductibles, claims, lapse/reinstatement.
- **Code:** `simulation-engine/insurance-sim.ts` has complete math. No `insurance_policies` table in migrations. No game-engine endpoints. `buy_insurance` and `file_claim` actions are no-op stubs.
- **Missing:** DB table, API handlers, integration with month-end.

### 1.8 Budget Management
- **Docs describe:** Set monthly budget allocations per category, track actuals vs budget, score adherence, award XP.
- **Code:** `simulation-engine/budget-scorer.ts` has scoring logic. No `budgets` table in migrations. No `set_budget` action handler (stub only). No frontend budget screen.
- **Missing:** DB table, API, frontend, integration.

### 1.9 Loan Lifecycle
- **Docs describe:** Loan origination, amortization payments, missed payment consequences, default, collections.
- **Code:** `simulation-engine/interest.ts` has amortization math. Game accounts support loan types. But no loan-specific processing in game-engine. No `open_account` for loans. No monthly payment processing.
- **Missing:** Loan creation flow, monthly payment processing, default detection.

### 1.10 Level Progression & XP System
- **Docs describe:** 8 levels with XP thresholds, victory conditions, level-up celebrations, mechanic unlocks.
- **Code:** `packages/config/src/levels.json` defines all 8 levels with XP requirements and conditions. Game table has `current_level` and `total_xp`. But **no code ever awards XP or checks for level-up**.
- **Missing:** XP granting after actions, level-up detection, mechanic unlocking.

### 1.11 Rewards Service Integration
- **Docs describe:** XP/coin ledger, badge engine, streak tracking, reward catalog, redemption flow.
- **Code:** `services/rewards/` has ~550 lines across services (badge-engine with 65 badge definitions, streak-tracker, coin-engine, xp-engine, event-consumer). But: (a) the event consumer is a stub that doesn't actually receive SQS messages, (b) the game-engine doesn't emit events to SQS, (c) badges are defined but never evaluated during gameplay.
- **Missing:** Event pipeline, actual badge evaluation during play, reward redemption flow.

### 1.12 Social Features
- **Docs describe:** Friends, leaderboards, classrooms, challenges, head-to-head.
- **Code:** `services/social/` has ~194 lines across 3 controllers. DB schema exists (friendships, classrooms, leaderboard_snapshots). Frontend social page is a placeholder ("No friends").
- **Missing:** Most business logic. Leaderboard computation. Challenge system.

### 1.13 Banking Integration (Mirror Mode)
- **Docs describe:** Plaid/TrueLayer/Salt Edge integration, transaction sync, Mirror Mode comparison.
- **Code:** `services/banking/` has ~255 lines. Plaid controller has basic link token creation structure. Mirror mode controller has comparison stub.
- **Missing:** Actual API integration, webhook handling, transaction sync, comparison engine.

### 1.14 Notification Service
- **Docs describe:** Push (FCM/APNS), email (SES), in-app notifications, templates, preferences.
- **Code:** Service directory exists with boilerplate. No actual notification sending.
- **Missing:** Everything functional.

### 1.15 Admin Dashboard
- **Docs describe:** User management, anti-cheat review, content management, analytics.
- **Code:** Service directory exists with boilerplate. No admin-web app.
- **Missing:** Everything.

### 1.16 AI Financial Advisor
- **Docs describe:** (Referenced in product strategy) Contextual financial advice.
- **Code:** Nothing.
- **Missing:** Everything.

### 1.17 Offline-First / Sync Engine
- **Docs describe:** WatermelonDB local DB, action queue, conflict resolution, sync protocol.
- **Code:** Nothing (no mobile app yet, web app does direct API calls).
- **Missing:** Everything.

### 1.18 Mobile App (React Native / Expo)
- **Docs describe:** Full Expo app with file-based routing, Zustand stores, WatermelonDB, animations.
- **Code:** No `apps/mobile/` directory exists.
- **Missing:** Entire mobile app.

### 1.19 Consequence Chains
- **Docs describe:** Cards can trigger delayed follow-up cards (e.g., ignoring car repair → breakdown in 30-90 days).
- **Code:** `consequence_queue` not in DB migrations. Seed scenarios reference consequences in JSON but nothing processes them. `decision-cards.ts` `processCardDecision` only handles `balance_change`.
- **Missing:** Consequence queue table, trigger processing on day advance.

### 1.20 Bankruptcy Detection & Recovery
- **Docs describe:** Automatic bankruptcy when debt-to-income > 300% or net worth < -200% of monthly income.
- **Code:** Game table has `bankruptcy_active` and `bankruptcy_count` columns. No detection logic anywhere.
- **Missing:** Detection, processing, recovery flow.

---

## 2. Features Implemented but Incomplete

### 2.1 Day Advancement (40% complete)
- ✅ Date increments correctly
- ✅ Blocks if pending cards unresolved
- ❌ No financial processing on day change
- ❌ No card generation
- ❌ No bill checking
- ❌ No month-end detection/trigger

### 2.2 Card Decision (20% complete)
- ✅ Can select an option on a pending card
- ✅ Marks card as resolved in DB
- ❌ No consequences applied
- ❌ No XP/coins awarded
- ❌ No transactions created
- ❌ No happiness changes
- ❌ No follow-up consequence chains

### 2.3 Transfers (60% complete)
- ✅ Balance updates on both accounts
- ✅ Transactions recorded
- ✅ Insufficient funds check
- ❌ No double-entry ledger used (direct SQL, not through simulation-engine)
- ❌ No overdraft fee processing
- ❌ No savings withdrawal count tracking

### 2.4 Game Creation (70% complete)
- ✅ Creates game with persona defaults
- ✅ Creates initial accounts
- ✅ Validates input with Zod
- ❌ No scheduled bills created
- ❌ No region-specific starting conditions (hardcoded defaults, ignores region config files)
- ❌ No initial decision card generation

### 2.5 Web Frontend (50% complete)
- ✅ Landing page, login, register (functional)
- ✅ Dashboard with game list and creation
- ✅ Game view with accounts, stats, transactions
- ✅ Card decision page
- ✅ i18n setup with react-i18next
- ✅ TanStack Query + auth context
- ❌ No budget screen
- ❌ No monthly review screen
- ❌ No rewards/badges screen (placeholder)
- ❌ No social features (placeholder)
- ❌ No onboarding tutorial
- ❌ Account detail / history pages missing
- ❌ No animations or gamification feel

### 2.6 Rewards/Badge System (30% complete)
- ✅ 65 badges fully defined with conditions in badge-engine.ts
- ✅ Badge evaluation logic works (evaluateCondition/evaluateBadges)
- ✅ Event consumer framework exists
- ❌ Never called during actual gameplay
- ❌ No player metrics collection to feed into evaluation
- ❌ No event pipeline (SQS) connected

### 2.7 Localization (40% complete)
- ✅ 8 region config JSON files (ro, gb, us, de, fr, pl, hu, cz)
- ✅ i18n setup with en.json and ro.json locale files
- ✅ Game stores region and currency_code
- ❌ Region configs never loaded at runtime — game uses hardcoded persona defaults
- ❌ No currency formatting using region config
- ❌ No region-specific scenarios
- ❌ No tax system implementation

---

## 3. Implementation Quality Assessment

### What's Actually Good

| Component | Quality | Notes |
|---|---|---|
| **simulation-engine** | ⭐⭐⭐⭐ | Real, tested-quality math. Double-entry ledger, banker's rounding, amortization schedules, credit health scoring, inflation, investments, insurance. This is production-grade library code. |
| **Database schema** | ⭐⭐⭐⭐ | Comprehensive, well-indexed, proper constraints, supports all documented features. Ready for production. |
| **Auth service** | ⭐⭐⭐⭐ | Solid: JWT with refresh tokens, bcrypt, rate limiting, social auth stub, device tracking, partner context. Missing only SSO and real social token verification. |
| **Config data** | ⭐⭐⭐⭐ | 8 region configs with real financial data, 65 badge definitions, 8 level definitions, scenario catalog. Good content foundation. |
| **shared-types** | ⭐⭐⭐⭐ | Clean TypeScript interfaces matching the architecture docs. |
| **Web frontend** | ⭐⭐⭐ | Clean, functional React. Uses proper patterns (TanStack Query, context, i18n). But basic — inline styles, no component library usage, no animations. |
| **Game engine** | ⭐⭐ | Routes, validation, and basic CRUD work. But the core game loop is missing. It's a CRUD API, not a game engine. |
| **Secondary services** | ⭐ | Exist as directories with boilerplate. 100-250 lines each. Not functional. |

### What's a Stub

The following action types in `action-processor.ts` are handled by a generic no-op that just increments `state_version`:
- `set_budget`, `set_autopay`, `open_account`, `close_account`, `set_goal`, `buy_insurance`, `file_claim`, `invest`, `sell_investment`

### The Core Problem

**The simulation-engine is excellent but orphaned.** It exports `advanceDay`, `calculateSavingsInterest`, `calculateCreditHealthIndex`, `calculateBudgetScore`, `selectDailyScenarios`, `generateDecisionCard`, `processCardDecision`, `simulatePortfolioMonth`, `processClaim`, etc. — but the game-engine only imports `advanceDay` and `isLastDayOfMonth`. The entire financial simulation library sits unused.

---

## 4. Priority Actions — Top 10 to Make the Game Playable

### 🔴 P0 — Without these, there is no game

**1. Wire the Game Loop (advance day → generate cards → process finances)**
- On `advance_day`: check for bills due, generate daily decision cards from scenario pool, process any automated payments
- On month boundary: trigger full month-end processing using simulation-engine functions
- This is THE blocker. Everything else depends on this.

**2. Implement Card Consequence Application**
- When a card is decided: apply balance changes via ledger, record transactions, award XP/coins, update happiness, queue consequence chains
- Use `processCardDecision()` from simulation-engine and actually write results to DB

**3. Implement Month-End Processing**
- Salary deposit, bill processing, interest calculations (savings + credit cards + loans), insurance premiums, investment returns, inflation, CHI recalculation, budget scoring, monthly report generation
- All the math exists in simulation-engine — just needs orchestration

**4. Implement XP/Coin Granting & Level Progression**
- Award XP/coins from card decisions and month-end bonuses
- Check level-up conditions from levels.json
- Update game state on level-up, unlock new mechanics

### 🟡 P1 — Makes the game actually fun

**5. Seed More Decision Cards (need 200+, have 5 in DB + ~20 in JSON)**
- The scenario catalog JSON has maybe 20 entries. The game needs 200+ for variety.
- Write cards for all categories: housing, health, career, emergency, investment, insurance, social, education, tax
- Include region-specific cards (at least for Romania)

**6. Create Scheduled Bills on Game Init**
- When creating a game: set up rent, utilities, phone, insurance, subscriptions based on persona and region config
- Process bills on due dates during day advancement

**7. Build Budget Management**
- Create `budgets` table (or use existing JSONB approach)
- API to set/update budget allocations
- Frontend budget screen
- Score calculation at month-end

**8. Implement Open/Close Account Actions**
- Let players open credit cards, take loans, open investment accounts
- Each with proper initialization (credit limits, terms, rates from region config)

### 🟢 P2 — Polish and engagement

**9. Monthly Review Screen**
- Build the month-end review UI: animated summary, income vs expenses chart, CHI gauge, XP tally, highlights
- This is the "dopamine moment" — critical for retention

**10. Badge Evaluation Integration**
- After each significant action, collect player metrics and run badge evaluation
- Show badge unlock animations
- Build the badge collection screen

---

## 5. Effort Estimates

| Priority | Item | Estimated Effort |
|---|---|---|
| P0-1 | Wire game loop | 2-3 days |
| P0-2 | Card consequences | 1-2 days |
| P0-3 | Month-end processing | 3-4 days |
| P0-4 | XP/level progression | 1 day |
| P1-5 | Write 200+ cards | 3-5 days (content) |
| P1-6 | Scheduled bills | 1-2 days |
| P1-7 | Budget management | 2-3 days |
| P1-8 | Account actions | 2-3 days |
| P2-9 | Monthly review UI | 2-3 days |
| P2-10 | Badge integration | 1-2 days |
| **Total** | | **~18-28 days** |

After completing P0 items (1 week), you'd have a playable game loop. After P1 (2 more weeks), it'd be genuinely fun. After P2, it's beta-ready.

---

## 6. What's NOT Missing (Good News)

Things that are solidly done and don't need rework:

1. **Database schema** — all tables exist, properly indexed, ready to go
2. **Financial math** — simulation-engine is production quality
3. **Auth** — works, secure, has all the right patterns
4. **Type system** — shared-types are clean and comprehensive
5. **Config data** — region files, personas, levels, badges all defined
6. **Web app structure** — Next.js with proper patterns, i18n, auth context
7. **API patterns** — Zod validation, idempotency keys, optimistic locking, error handling

The foundation is strong. The gap is in **orchestration** — connecting all the well-built pieces into an actual game loop.
