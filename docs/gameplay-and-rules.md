# MoneyLife — Gameplay & Rules (Exhaustive Specification)

> Version 1.0 · February 2026
> This document is the single source of truth for all gameplay mechanics.

---

## Table of Contents

1. [Game Overview](#1-game-overview)
2. [Time Model](#2-time-model)
3. [Persona System](#3-persona-system)
4. [Account Types](#4-account-types)
5. [Transaction Types & Formulas](#5-transaction-types--formulas)
6. [Decision Card System](#6-decision-card-system)
7. [Level Progression](#7-level-progression)
8. [Scoring System](#8-scoring-system)
9. [Credit Health Index](#9-credit-health-index)
10. [Budget Scoring Algorithm](#10-budget-scoring-algorithm)
11. [Difficulty Modes](#11-difficulty-modes)
12. [Victory & Loss Conditions](#12-victory--loss-conditions)
13. [Tutorial Flow](#13-tutorial-flow)
14. [Multiplayer & Competitive Modes](#14-multiplayer--competitive-modes)
15. [Currency & Localization](#15-currency--localization)

---

## 1. Game Overview

MoneyLife is a life-simulation mobile game where players manage personal finances through realistic scenarios. Players pick a persona, choose their local currency, and navigate financial decisions across escalating life stages. The game is server-authoritative: all balance mutations, interest calculations, and score updates are computed server-side and validated before being reflected on the client.

### 1.1 Core Loop

```
┌─────────────────────────────────────────────────────────────┐
│                    DAILY CYCLE                              │
│                                                             │
│  1. Wake-up summary (balances, upcoming bills, alerts)      │
│  2. Receive 1-3 Decision Cards (context-sensitive)          │
│  3. Make financial decisions (spend / save / invest / skip) │
│  4. See immediate consequences (balance changes, XP)        │
│  5. Optional: review accounts, adjust budget, check goals   │
│  6. Day advances → next day's events queue                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                   WEEKLY CYCLE                              │
│                                                             │
│  • Weekly financial summary (income vs spending)            │
│  • Budget adherence score calculated                        │
│  • Weekly challenge deadline (if active)                    │
│  • Savings interest accrual snapshot (for display)          │
│  • 1 Bonus Decision Card (higher stakes)                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                  MONTHLY CYCLE                              │
│                                                             │
│  • Salary/income deposited                                  │
│  • All bills auto-deducted (rent, utilities, subscriptions) │
│  • Credit card statement generated                          │
│  • Loan payments due                                        │
│  • Savings interest credited (compound)                     │
│  • Investment portfolio rebalanced/updated                  │
│  • Insurance premiums deducted                              │
│  • Credit Health Index recalculated                         │
│  • Monthly report card (XP summary, coin summary)           │
│  • Inflation adjustment applied to prices                   │
│  • Level-up check                                           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                 QUARTERLY CYCLE                             │
│                                                             │
│  • Investment dividend payments (if applicable)             │
│  • Insurance policy review event                            │
│  • Tax estimation preview (Levels 5+)                       │
│  • Net worth milestone check                                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                  ANNUAL CYCLE                               │
│                                                             │
│  • Tax filing event (Levels 5+)                             │
│  • Annual salary review (raise/cut based on performance)    │
│  • Insurance renewal                                        │
│  • Long-term goal progress assessment                       │
│  • Year-in-review animated summary                          │
│  • Possible life event (promotion, baby, move)              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Session Length

- **Target session**: 3-5 minutes per daily cycle
- **Full week**: ~20-35 minutes of play
- **Full in-game month**: ~2-3 hours of real play time
- Players can batch days (play multiple days in one sitting)
- Push notifications remind players of pending decisions (configurable)

---

## 2. Time Model

### 2.1 Real Time → Game Time Mapping

| Real Time Action | Game Time Effect |
|---|---|
| 1 tap to advance day | 1 game day passes |
| Player completes daily cards | Day is "complete" |
| Auto-advance (if enabled) | 1 game day per 4 real hours (max 3 days queued) |
| Idle > 24h real time | Game pauses; no days pass without input |

### 2.2 Clock Rules

- **Game clock is server-side**. The server tracks `game_current_date` as an abstract date (YYYY-MM-DD in game world).
- Game always starts on the 1st of a month (persona-dependent which month/year).
- **Day advancement** requires explicit player action OR auto-advance setting.
- **Auto-advance mode**: If enabled, the server advances 1 game day every 4 real-world hours, up to a maximum of 3 queued days. After 3 queued days, advancement pauses until the player processes them. Queued days generate their decision cards but hold them for player review.
- The client never determines the game date. The client sends `advance_day` requests; the server validates and returns the new state.

### 2.3 Month-End Trigger

Month-end processing fires when `game_current_date` advances past the last day of the current game month. The server executes these steps atomically in a transaction:

1. Credit salary/income to checking account
2. Deduct all recurring bills (rent, utilities, subscriptions, insurance premiums)
3. Generate credit card statement (sum of charges since last statement)
4. Process minimum payment or full payment (per player's auto-pay setting)
5. Calculate and credit savings interest
6. Calculate and deduct loan interest; apply loan payment
7. Update investment portfolio values
8. Apply inflation adjustment to all future prices: `new_price = old_price × (1 + monthly_inflation_rate)`
9. Recalculate Credit Health Index
10. Generate monthly report
11. Check level-up conditions
12. Emit `MONTH_END` event for analytics and achievement checks

### 2.4 Month Lengths

Game months follow real calendar lengths (28/29/30/31 days). The game starts in a non-leap year. Leap years occur every 4 game years (simplified — no century rule).

### 2.5 Timezone Handling

- The game world has no timezone concept — it's abstract dates.
- Real-world features (push notifications, streak tracking) use the player's device timezone, validated against IP geolocation. See `edge-cases.md` for timezone abuse prevention.
- Streak day boundary: midnight in the player's registered timezone.

---

## 3. Persona System

Players select a persona at game start. Each persona defines starting conditions, available mechanics, and narrative context. Personas are NOT difficulty levels — they change the *type* of financial challenge, not the *hardness*.

### 3.1 Persona Definitions

#### 3.1.1 Teen (Age 15-17)

| Attribute | Value |
|---|---|
| Starting Age | 15 |
| Starting Cash | 50 × currency_unit |
| Monthly Income | Allowance: 100 × currency_unit |
| Income Source | Parent allowance (fixed) + optional part-time job (Level 2+) |
| Available Accounts | Savings (custodial), Prepaid Card |
| Unavailable Until L3 | Checking account (with parental co-sign narrative) |
| Unavailable Until L5 | Credit card (secured, $200 limit) |
| Never Available | Mortgage, BNPL (age-gated) |
| Starting Bills | Phone plan: 15/mo, Streaming: 10/mo |
| Starting Goals | Save for a gaming console (300), Save for first car (3000) |
| Narrative Hook | "You just got your first allowance. Time to learn what money means." |
| Unique Mechanic | Parental approval events — some purchases require parent OK (random deny rate: 20%) |
| XP Modifier | 1.2× (learning bonus — teens get slightly more XP per action) |

#### 3.1.2 Student (Age 18-22)

| Attribute | Value |
|---|---|
| Starting Age | 18 |
| Starting Cash | 500 × currency_unit |
| Monthly Income | Part-time job: 800/mo + Student loan disbursement: 2000/semester |
| Income Source | Part-time wages (variable ±10%) + semester loan disbursement |
| Available Accounts | Checking, Savings, Student Credit Card (limit: 500) |
| Unavailable Until L4 | Investment account |
| Unavailable Until L6 | Mortgage |
| Starting Debt | Student loan: 5,000 (grows each semester by 2,000) |
| Starting Bills | Rent: 400/mo, Groceries: 200/mo, Phone: 25/mo, Transport: 50/mo |
| Starting Goals | Graduate without excess debt, Build emergency fund (1,000) |
| Narrative Hook | "Welcome to university. Your parents aren't paying for everything anymore." |
| Unique Mechanic | Semester events — tuition due every 6 game months, textbook purchases, spring break temptation cards |
| XP Modifier | 1.1× |

#### 3.1.3 Young Adult (Age 23-30)

| Attribute | Value |
|---|---|
| Starting Age | 23 |
| Starting Cash | 2,000 × currency_unit |
| Monthly Income | Salary: 3,000/mo (net, after tax) |
| Income Source | Employment salary (annual raises: 2-5% based on performance) |
| Available Accounts | Checking, Savings, Credit Card (limit: 2,000), Investment |
| Unavailable Until L5 | Mortgage |
| Starting Debt | Student loan: 15,000 (if Student persona was not played; 0 if continuing) |
| Starting Bills | Rent: 800/mo, Utilities: 100/mo, Groceries: 300/mo, Phone: 40/mo, Transport: 150/mo, Insurance: 80/mo |
| Starting Goals | Build 3-month emergency fund (9,000), Pay off student loans, Save for vacation (2,000) |
| Narrative Hook | "First real job, first real paycheck, first real responsibilities." |
| Unique Mechanic | Career events — performance reviews, side-hustle opportunities, networking events that cost money but unlock salary boosts |
| XP Modifier | 1.0× (baseline) |

#### 3.1.4 Parent (Age 30-45)

| Attribute | Value |
|---|---|
| Starting Age | 32 |
| Starting Cash | 8,000 × currency_unit |
| Monthly Income | Salary: 4,500/mo (dual income optional: +3,000/mo if partner works) |
| Income Source | Employment + optional partner income |
| Available Accounts | All account types unlocked from start |
| Starting Debt | Mortgage: 180,000 remaining, Car loan: 12,000 remaining |
| Starting Bills | Mortgage: 1,200/mo, Utilities: 200/mo, Groceries: 500/mo, Childcare: 800/mo, Insurance: 200/mo, Car payment: 350/mo, Phone: 60/mo |
| Starting Goals | College fund for child (50,000 target), Pay off car, Build 6-month emergency fund (27,000), Retirement savings |
| Narrative Hook | "Family life is expensive. Every decision affects more than just you." |
| Unique Mechanic | Family events — child's school expenses, medical emergencies, partner job loss, household repairs. Dual-income decisions (partner works/stays home). |
| XP Modifier | 0.9× (experienced — less XP per basic action, but access to high-XP family events) |

### 3.2 Persona Progression

Players can play personas in sequence ("Life Journey" mode) or pick any persona independently. In Life Journey mode:

- Teen → Student → Young Adult → Parent
- Completing one persona unlocks the next with carry-over bonuses:
  - 10% of ending savings carries over as starting bonus
  - Badges carry over
  - Credit Health Index starts 50 points higher (capped at 700)
  - Unique "Life Journey" badge for completing each transition

### 3.3 Starting Conditions Scaling by Currency

All monetary values above are in "currency units" (CU). When a player selects their real currency, values are scaled:

```
actual_value = base_value × currency_purchasing_power_factor

Currency factors (updated quarterly from World Bank PPP data):
  USD: 1.00
  EUR: 0.92
  GBP: 0.78
  JPY: 135.0
  INR: 83.0
  BRL: 5.0
  NGN: 780.0
  MXN: 17.5
  ... (full table in localization config)
```

The factor is applied once at game creation and stored. Mid-game currency changes are not supported (see `edge-cases.md`).

---

## 4. Account Types

### 4.1 Checking Account

| Property | Value |
|---|---|
| Purpose | Daily spending, bill payments, income deposit |
| Interest Rate | 0.01% APY (effectively zero) |
| Minimum Balance | 0 (can go negative — see overdraft) |
| Overdraft Limit | 500 × CU (Level 3+; must be unlocked) |
| Overdraft Fee | 35 × CU per occurrence (charged when balance goes below 0) |
| Overdraft Grace | 1 game day to restore positive balance before fee |
| Monthly Fee | 0 (free checking) |
| Max Balance | 1,000,000 × CU |
| Transaction Limit | Unlimited |
| Unlock Level | Level 1 (Teen: Level 3) |

**Rules:**
- Income is deposited here by default.
- Bills are deducted from here unless player routes to another account.
- If balance < bill amount and no overdraft: bill is "missed" → late fee + Credit Health penalty.
- Overdraft usage appears as a negative balance. Interest on negative balance: 18% APR, calculated daily.

### 4.2 Savings Account

| Property | Value |
|---|---|
| Purpose | Earning interest, emergency fund, goal saving |
| Interest Rate | Base: 2.5% APY (varies by level and difficulty) |
| Compounding | Monthly (on month-end) |
| Minimum Balance | 0 |
| Monthly Fee | 0 if balance ≥ 100 × CU; else 5 × CU/month |
| Withdrawal Limit | 6 per game month (Regulation D simulation) |
| Excess Withdrawal Fee | 10 × CU per withdrawal beyond 6 |
| Max Balance | 1,000,000 × CU |
| Unlock Level | Level 1 (all personas) |

**Interest Calculation (Monthly Compounding):**

```
monthly_rate = APY_to_monthly(annual_rate)
             = (1 + annual_rate)^(1/12) - 1

interest_earned = balance × monthly_rate

new_balance = balance + interest_earned
```

Example: Balance = 10,000, APY = 2.5%
```
monthly_rate = (1.025)^(1/12) - 1 = 0.002060 (0.206%)
interest = 10,000 × 0.002060 = 20.60
new_balance = 10,020.60
```

**Goal Buckets:** Players can create up to 5 named savings goals within one savings account. Each goal has a target amount and deadline. Buckets are virtual — the actual balance is pooled, but the UI shows progress per goal.

### 4.3 Credit Card

| Property | Value |
|---|---|
| Purpose | Building credit, purchase flexibility |
| Credit Limit | Starts at 500 × CU; increases with level and credit score |
| APR | 19.99% (Normal difficulty) |
| Grace Period | 21 game days from statement date |
| Minimum Payment | MAX(25 × CU, 2% of statement balance) |
| Late Fee | 35 × CU (first offense), 45 × CU (subsequent in same year) |
| Over-Limit Fee | 30 × CU |
| Annual Fee | 0 (basic card), 95 × CU (rewards card, Level 5+) |
| Cash Advance APR | 24.99% (no grace period) |
| Unlock Level | Level 2 (Teen: Level 5, secured card only) |

**Credit Limit Progression:**

```
base_limit = persona_base × level_multiplier

Level multipliers:
  L2: 1.0 (500 CU for Young Adult)
  L3: 1.5 (750)
  L4: 2.5 (1,250)
  L5: 4.0 (2,000)
  L6: 6.0 (3,000)
  L7: 10.0 (5,000)
  L8: 16.0 (8,000)

Actual limit = base_limit × credit_health_factor
  credit_health_factor:
    CHI >= 750: 1.3
    CHI 700-749: 1.15
    CHI 650-699: 1.0
    CHI 600-649: 0.85
    CHI < 600: 0.7
```

**Interest Calculation (Daily):**

```
daily_rate = APR / 365
daily_interest = outstanding_balance × daily_rate

Interest accrues on balances not paid within the grace period.
If statement is paid in full by due date: no interest charged for that cycle.
If partial payment: interest accrues on the ENTIRE original balance (not just remaining).
```

**Statement Cycle:**
- Statement generated on the last day of each game month.
- Due date = statement date + 21 game days.
- If auto-pay is set to "minimum," minimum payment is deducted from checking on due date.
- If auto-pay is set to "full," full statement balance is deducted.
- If no auto-pay and player doesn't manually pay: MISSED payment → late fee + Credit Health hit.

### 4.4 Loans

#### 4.4.1 Student Loan

| Property | Value |
|---|---|
| Amount | 5,000-50,000 × CU (depends on persona and progression) |
| Interest Rate | 5.5% APR (fixed) |
| Repayment Start | 6 months after "graduation" event |
| Term | 120 months (10 years) standard |
| Minimum Payment | Calculated via standard amortization |
| Prepayment Penalty | None |
| Deferment | Available during "unemployment" events (interest still accrues) |
| Unlock | Automatic for Student persona; optional for others via "continuing education" event |

#### 4.4.2 Auto Loan

| Property | Value |
|---|---|
| Amount | 5,000-40,000 × CU |
| Interest Rate | 6.5% APR (good credit) to 12% APR (poor credit) |
| Term | 36, 48, or 60 months (player chooses) |
| Down Payment | Minimum 10% of vehicle price |
| Minimum Payment | Amortized monthly payment |
| Late Fee | 5% of payment amount |
| Repossession | After 3 consecutive missed payments |
| Unlock | Level 4+ |

#### 4.4.3 Mortgage

| Property | Value |
|---|---|
| Amount | 50,000-500,000 × CU |
| Interest Rate | 4.5% APR (fixed, 30-year) or 3.8% APR (fixed, 15-year) |
| Down Payment | Minimum 5% (with PMI) or 20% (no PMI) |
| PMI Rate | 0.5% of loan amount per year (added to monthly payment) |
| Property Tax | 1.2% of home value per year (escrowed monthly) |
| Home Insurance | 0.5% of home value per year (escrowed monthly) |
| Term | 180 or 360 months |
| Late Fee | 5% of monthly payment after 15-day grace |
| Foreclosure | After 6 consecutive missed payments |
| Unlock | Level 5+ (Parent persona: available from start) |

**Amortization Formula (for all loans):**

```
M = P × [r(1+r)^n] / [(1+r)^n - 1]

Where:
  M = monthly payment
  P = principal (loan amount)
  r = monthly interest rate (APR / 12)
  n = total number of payments (term in months)

Example: Auto loan, $20,000, 6.5% APR, 48 months
  r = 0.065 / 12 = 0.005417
  n = 48
  M = 20000 × [0.005417 × (1.005417)^48] / [(1.005417)^48 - 1]
  M = 20000 × [0.005417 × 1.2964] / [1.2964 - 1]
  M = 20000 × 0.007021 / 0.2964
  M = 20000 × 0.023694
  M = $473.89/month
```

#### 4.4.4 Personal Loan

| Property | Value |
|---|---|
| Amount | 1,000-25,000 × CU |
| Interest Rate | 8% - 24% APR (based on Credit Health Index) |
| Term | 12, 24, 36, or 60 months |
| Origination Fee | 1-5% of loan amount (deducted from disbursement) |
| Late Fee | 5% of payment or 15 × CU, whichever is greater |
| Unlock | Level 4+ |

**Personal Loan APR by Credit Health Index:**

```
CHI >= 750: 8.0% APR
CHI 700-749: 10.5% APR
CHI 650-699: 14.0% APR
CHI 600-649: 18.0% APR
CHI 550-599: 22.0% APR
CHI < 550:   24.0% APR (or denied if < 500)
```

### 4.5 BNPL (Buy Now, Pay Later)

| Property | Value |
|---|---|
| Max Active Plans | 3 simultaneous |
| Split Options | 4 payments over 6 weeks (0% interest) OR 12 monthly payments (15% APR) |
| Late Fee | 7 × CU per missed installment |
| Max Purchase Amount | 1,000 × CU (increases with level) |
| Credit Impact | Late payments affect Credit Health (-15 per late payment) |
| Unlock | Level 3+ (Not available for Teen persona) |

**BNPL Payment Schedule (4-payment plan):**
```
Payment 1: Due at purchase (25% of total)
Payment 2: Due 2 weeks later (25%)
Payment 3: Due 4 weeks later (25%)
Payment 4: Due 6 weeks later (25%)
```

### 4.6 Investment Account

| Property | Value |
|---|---|
| Account Types | Brokerage (taxable), Retirement (tax-advantaged) |
| Available Assets | Index funds, Bonds, Individual stocks (simplified), Crypto (Level 7+) |
| Min Investment | 10 × CU |
| Trading Fee | 0 (commission-free, modern broker simulation) |
| Dividend Yield | Index: 2% annually, Bonds: 3.5% annually, Stocks: 0-5% variable |
| Volatility (monthly return standard deviation) | Index: 3%, Bonds: 0.5%, Stocks: 8%, Crypto: 20% |
| Expected Monthly Return (mean) | Index: 0.7%, Bonds: 0.3%, Stocks: 0.8%, Crypto: 1.0% |
| Retirement Contribution Limit | 500 × CU/month |
| Unlock | Level 4 (Parent: Level 1, Student: Level 4, Teen: never) |

**Investment Return Simulation:**

Returns are pre-generated per game month from a normal distribution, seeded by a server-side random seed per game instance. This ensures:
- Deterministic replay for anti-cheat
- Realistic variance
- No player manipulation

```
monthly_return = normal_distribution(mean=expected_return, stddev=volatility)
monthly_return = CLAMP(monthly_return, -30%, +30%)  // hard bounds

new_value = old_value × (1 + monthly_return)
```

Market events (crash, boom) are scripted at certain levels to teach specific lessons:
- Level 5, Month 8: Market correction (-15% index in one month)
- Level 7, Month 3: Crypto crash (-40%)
- Level 8, Month 6: Bull run (+12% index)

### 4.7 Insurance

| Type | Monthly Premium | Coverage | Deductible | Unlock |
|---|---|---|---|---|
| Health | 150 × CU | Medical emergency events: covers 80% after deductible | 500 × CU | Level 3 |
| Auto | 80 × CU | Car accident events: covers repair costs after deductible | 250 × CU | Level 4 (with car) |
| Renters | 15 × CU | Theft/damage events: covers personal property | 200 × CU | Level 2 |
| Homeowners | 0.5% of home value / 12 | Home damage events | 1,000 × CU | Level 5 (with home) |
| Life | 30 × CU | Pays out to "family" if game-over by health event | 100,000 × CU payout | Level 6 |
| Disability | 40 × CU | Income replacement during "injury" events: 60% of salary | N/A | Level 5 |

**Insurance Claim Flow:**
1. Random event triggers (e.g., "Your car was in a fender bender")
2. Player files claim (or pays out of pocket — decision card)
3. If insured: deductible deducted from checking, remainder covered
4. If uninsured: full cost from checking (can cause overdraft/debt spiral)
5. Claim affects next year's premium: +10% per claim filed

---

## 5. Transaction Types & Formulas

### 5.1 Income Transactions

| Type | Frequency | Formula |
|---|---|---|
| Salary | Monthly | `base_salary × (1 + annual_raise_pct/12)^months_employed` |
| Part-time wages | Bi-weekly | `hourly_rate × hours_worked` (hours: 10-20/week, variable) |
| Allowance | Monthly | Fixed amount per persona |
| Freelance/Side hustle | Sporadic | Random events: 200-2,000 × CU, triggered by career decisions |
| Investment dividends | Quarterly | `portfolio_value × (dividend_yield / 4)` |
| Tax refund | Annual | `taxes_overpaid` (calculated during tax event) |
| Gift money | Sporadic | Decision card events: birthdays, holidays (50-500 × CU) |

### 5.2 Expense Transactions

| Type | Frequency | Notes |
|---|---|---|
| Rent/Mortgage | Monthly | Fixed (rent) or amortized (mortgage) |
| Utilities | Monthly | Base + variable: `base_utility + random(-15%, +25%) × base_utility` |
| Groceries | Weekly | Budget-dependent: player sets grocery budget; actual = budget × variance(0.85, 1.20) |
| Transport | Monthly | Fixed (car payment + gas) or variable (public transit usage) |
| Subscriptions | Monthly | Player-chosen: streaming (10), gym (30), news (8), etc. |
| Dining out | Per decision card | 15-80 × CU per event |
| Shopping | Per decision card | 20-500 × CU per event |
| Medical | Sporadic | 50-5,000 × CU (pre-insurance) |
| Education | Per event | Tuition: 2,000/semester, Books: 200/semester, Courses: 50-500 |
| Childcare | Monthly (Parent) | 400-1,200 × CU/month |
| Home repair | Sporadic | 100-5,000 × CU |
| Emergency | Sporadic | 200-10,000 × CU (car breakdown, medical, job loss) |

### 5.3 Interest Calculations

#### Savings Interest (Monthly Compound)

```
A = P × (1 + r/n)^(n×t)

For monthly calculation:
  interest_this_month = balance × ((1 + APY)^(1/12) - 1)

Applied on month-end. Balance used is the average daily balance for the month:
  avg_daily_balance = sum(daily_closing_balances) / days_in_month
  interest = avg_daily_balance × monthly_rate
```

#### Credit Card Interest (Daily Compound)

```
DPR = APR / 365
daily_interest = outstanding_balance × DPR

Interest accrues daily on balances carried past the grace period.
Monthly interest charge = sum of daily interest for the billing cycle.

If statement paid in full by due date → no interest (grace period honored).
If not paid in full → interest on AVERAGE DAILY BALANCE for the cycle:
  ADB = sum(daily_balances) / days_in_cycle
  monthly_interest = ADB × DPR × days_in_cycle
```

#### Loan Interest (Monthly, Standard Amortization)

```
Each monthly payment splits into interest and principal:
  interest_portion = remaining_principal × (APR / 12)
  principal_portion = monthly_payment - interest_portion
  new_remaining = remaining_principal - principal_portion
```

#### Overdraft Interest (Daily)

```
If checking_balance < 0:
  daily_charge = |checking_balance| × (0.18 / 365)
  Applied daily until balance restored to >= 0.
```

### 5.4 Inflation Model

```
monthly_inflation_rate = annual_inflation_rate / 12

Default annual rates by difficulty:
  Easy:   1.5%
  Normal: 3.0%
  Hard:   5.0%

Applied on month-end to all expense base amounts:
  new_base_cost = old_base_cost × (1 + monthly_inflation_rate)

Income does NOT automatically adjust — salary raises are separate events.
This naturally creates financial pressure over time.

Cumulative inflation tracked:
  cumulative_inflation = (1 + monthly_inflation_rate)^total_months_played
```

### 5.5 Late Fee Schedule

| Account | Late Fee | Trigger | Grace Period |
|---|---|---|---|
| Credit Card | 35-45 × CU | Payment not made by due date | 0 days past due date |
| Rent | 50 × CU + 5/day after 5 days | Rent not paid on 1st | 5 days |
| Loan (any) | 5% of payment amount | Payment missed on due date | 15 days |
| BNPL | 7 × CU | Installment missed | 0 days |
| Insurance Premium | Policy lapse after 30 days | Premium not paid | 30 days |
| Utility Bill | Service "reduction" event | Bill unpaid for 2 months | 60 days |

---

## 6. Decision Card System

Decision cards are the primary interaction mechanic. They present real-life financial scenarios requiring player choice.

### 6.1 Card Structure

```json
{
  "id": "DC-YA-FOOD-042",
  "category": "dining",
  "subcategory": "social",
  "title": "Friday Night with Friends",
  "description": "Your friends want to go to a trendy new restaurant downtown. The average meal is about 55 CU.",
  "persona_tags": ["young_adult", "student"],
  "level_range": [2, 8],
  "frequency_weight": 3,
  "options": [
    {
      "id": "A",
      "label": "Go and enjoy the full experience",
      "cost": 55,
      "cost_variance": [45, 70],
      "xp": 5,
      "coins": 2,
      "happiness_delta": +8,
      "budget_category": "dining",
      "credit_health_impact": 0,
      "follow_up_card": null,
      "narrative": "You had a great time! The truffle pasta was worth every penny."
    },
    {
      "id": "B",
      "label": "Go but stick to appetizers and water",
      "cost": 18,
      "cost_variance": [12, 22],
      "xp": 10,
      "coins": 5,
      "happiness_delta": +4,
      "budget_category": "dining",
      "credit_health_impact": 0,
      "follow_up_card": null,
      "narrative": "Smart move. You socialized without breaking the bank."
    },
    {
      "id": "C",
      "label": "Suggest a potluck at your place instead",
      "cost": 15,
      "cost_variance": [10, 25],
      "xp": 15,
      "coins": 8,
      "happiness_delta": +6,
      "budget_category": "groceries",
      "credit_health_impact": 0,
      "follow_up_card": "DC-YA-FOOD-042F",
      "narrative": "Everyone loves the idea! You spend less and have more fun."
    },
    {
      "id": "D",
      "label": "Skip it — stay home and save",
      "cost": 0,
      "xp": 8,
      "coins": 3,
      "happiness_delta": -3,
      "budget_category": null,
      "credit_health_impact": 0,
      "follow_up_card": null,
      "narrative": "You saved money but felt a bit left out scrolling through their posts."
    }
  ],
  "consequences": {
    "recurring": false,
    "happiness_threshold_warning": "If happiness < 20, trigger 'burnout' event chain"
  }
}
```

### 6.2 Card Categories

| Category | Subcategories | Frequency (cards/month) | Examples |
|---|---|---|---|
| Housing | rent, utilities, repair, furniture, moving | 2-4 | "Your AC broke," "Roommate wants to split better internet" |
| Food | groceries, dining, delivery, cooking | 6-10 | "Meal prep Sunday," "Coworker's birthday lunch" |
| Transport | gas, maintenance, public transit, ride-share | 2-4 | "Car needs new tires," "Monthly transit pass vs per-ride" |
| Shopping | clothing, electronics, gifts, impulse | 3-6 | "Flash sale on headphones," "Friend's wedding gift" |
| Health | medical, dental, fitness, mental health | 1-3 | "Annual checkup," "Gym membership renewal" |
| Education | courses, books, certifications, tutoring | 1-2 | "Online course on investing," "Professional certification" |
| Entertainment | streaming, events, hobbies, travel | 3-5 | "Concert tickets," "Weekend camping trip" |
| Career | networking, tools, work clothes, commute | 1-3 | "Professional conference," "New laptop for side hustle" |
| Financial | savings, investing, debt payoff, insurance | 2-4 | "Emergency fund contribution," "Refinance offer" |
| Family (Parent) | childcare, school, family activities, gifts | 3-6 | "Child needs braces," "Family vacation planning" |
| Social | dating, gifts, charity, community | 2-4 | "Charity donation drive," "Date night budget" |
| Emergency | unexpected bills, accidents, job loss | 0-2 | "Water heater burst," "Company layoffs" |

### 6.3 Card Selection Algorithm

Each game day, the server selects cards using this algorithm:

```python
def select_daily_cards(player_state):
    num_cards = get_daily_card_count(player_state.level)  # 1-3
    
    eligible_cards = filter(ALL_CARDS, where:
        card.persona_tags includes player_state.persona
        AND card.level_range contains player_state.level
        AND card.id not in player_state.recently_seen  # last 30 days
        AND card.prerequisites_met(player_state)
    )
    
    # Weight by category need
    for card in eligible_cards:
        card.selection_weight = card.frequency_weight
        
        # Boost categories the player hasn't seen recently
        days_since_category = player_state.days_since_category(card.category)
        if days_since_category > 7:
            card.selection_weight *= 1.5
        if days_since_category > 14:
            card.selection_weight *= 2.0
        
        # Boost emergency cards if player is doing "too well"
        if card.category == "emergency" and player_state.financial_comfort > 0.8:
            card.selection_weight *= 2.5
        
        # Boost financial literacy cards if budget score is low
        if card.category == "financial" and player_state.budget_score < 50:
            card.selection_weight *= 2.0
        
        # Apply difficulty modifier
        card.selection_weight *= difficulty_card_weight_modifier(
            player_state.difficulty, card.category
        )
    
    return weighted_random_sample(eligible_cards, num_cards)
```

**Daily Card Count by Level:**

| Level | Cards per Day | Bonus Card Chance |
|---|---|---|
| 1 | 1 | 0% |
| 2 | 1-2 | 20% for 2nd |
| 3 | 2 | 10% for 3rd |
| 4 | 2 | 20% for 3rd |
| 5 | 2-3 | 30% for 3rd |
| 6 | 2-3 | 40% for 3rd |
| 7 | 3 | 10% for 4th |
| 8 | 3 | 20% for 4th |

### 6.4 Consequence Chains

Some decisions trigger follow-up cards days or weeks later:

```
"Buy cheap tires" → 2 months later: "Tire blowout on highway — repair cost 400 CU"
"Skip dental checkup" → 6 months later: "Cavity needs filling — 300 CU"
"Invest in friend's startup" → 3-12 months later: "Startup failed (lose investment)" OR "Startup succeeded (3x return)" (70/30 split)
"Skip insurance" → Random: "Uninsured medical event — 5,000 CU out of pocket"
```

Consequence chains are stored as:
```json
{
  "trigger_card": "DC-YA-HEALTH-003",
  "trigger_option": "B",
  "consequence_card": "DC-YA-HEALTH-003C",
  "delay_days_min": 90,
  "delay_days_max": 180,
  "probability": 0.6
}
```

### 6.5 Happiness System

Decisions affect a hidden "happiness" score (0-100, starts at 60). Happiness is NOT shown to the player directly but influences:

- **Card availability**: Unhappy players get "mental health day" cards
- **Work performance**: Happiness < 30 → salary raise reduced by 50%
- **Social events**: Happiness < 20 → "burnout" event chain (forced time off, medical costs)
- **Happiness > 80**: Positive events more likely (friend repays loan, boss gives bonus)

```
Happiness decay: -1 per week naturally (life is hard)
Happiness recovery: social events, entertainment, achievements
Happiness floor: 5 (never reaches 0)
Happiness ceiling: 95 (never perfect)
```

---

## 7. Level Progression

### 7.1 Level Definitions

#### Level 1: "First Steps"

| Property | Value |
|---|---|
| Duration | ~2 game months |
| Theme | Basic income and spending |
| Unlocked Mechanics | Checking account, savings account, basic budgeting |
| New Card Categories | Food, shopping, basic entertainment |
| Monthly Income | Persona default |
| Decision Cards/Day | 1 |
| XP to Complete | 500 XP |
| Victory Condition | Complete the month without overdrafting AND save at least 50 × CU |
| Narrative | "Learn to balance your first budget" |
| Tutorial Active | Yes — guided prompts on every action |

#### Level 2: "Building Habits"

| Property | Value |
|---|---|
| Duration | ~3 game months |
| Theme | Recurring expenses and saving goals |
| Unlocked Mechanics | Credit card (basic), subscriptions, savings goals |
| New Card Categories | Transport, subscriptions, social |
| Monthly Income | Persona default + possible part-time job |
| Decision Cards/Day | 1-2 |
| XP to Complete | 1,500 XP (cumulative from L1: 2,000) |
| Victory Condition | Set and reach one savings goal (any amount) AND maintain budget adherence ≥ 60% for 2 months |
| Narrative | "Consistency is the foundation of financial health" |
| New Mechanics Tutorial | Credit card basics, minimum payments, statement cycles |

#### Level 3: "Real World"

| Property | Value |
|---|---|
| Duration | ~4 game months |
| Theme | Dealing with unexpected expenses |
| Unlocked Mechanics | Emergency fund concept, overdraft protection, BNPL, renters insurance, health insurance |
| New Card Categories | Emergency, health, insurance decisions |
| Monthly Income | Persona default (possible raise event) |
| Decision Cards/Day | 2 |
| XP to Complete | 3,000 XP (cumulative: 5,000) |
| Victory Condition | Build emergency fund ≥ 1 month expenses AND handle at least 1 emergency without going into debt |
| Narrative | "Life throws curveballs. Are you ready?" |
| Key Events | First emergency event guaranteed in Month 2 of this level |

#### Level 4: "Growing Up"

| Property | Value |
|---|---|
| Duration | ~4 game months |
| Theme | Debt management and investment basics |
| Unlocked Mechanics | Personal loans, auto loans, investment account (index funds only), BNPL expanded |
| New Card Categories | Career advancement, investment decisions |
| Monthly Income | First salary raise event |
| Decision Cards/Day | 2-3 |
| XP to Complete | 5,000 XP (cumulative: 10,000) |
| Victory Condition | Reduce total debt by 20% OR grow investment portfolio to 1,000 × CU AND maintain CHI ≥ 650 |
| Narrative | "Time to make your money work for you" |
| Key Events | "Investment opportunity" card guaranteed. Job offer decision (higher pay vs stability). |

#### Level 5: "Adulting"

| Property | Value |
|---|---|
| Duration | ~5 game months |
| Theme | Major life decisions |
| Unlocked Mechanics | Mortgage, home buying process, tax filing, disability insurance, all investment types |
| New Card Categories | Housing (buy vs rent), tax events, major purchases |
| Monthly Income | Raise + possible promotion event |
| Decision Cards/Day | 2-3 |
| XP to Complete | 8,000 XP (cumulative: 18,000) |
| Victory Condition | Either: buy a home with ≤30% DTI ratio OR build net worth ≥ 20,000 × CU |
| Narrative | "The big decisions shape your financial future" |
| Key Events | Tax filing event, home buying opportunity, market correction event |

#### Level 6: "Building Wealth"

| Property | Value |
|---|---|
| Duration | ~5 game months |
| Theme | Wealth building and protection |
| Unlocked Mechanics | Life insurance, estate planning (simplified), diversified portfolio, side hustle income |
| New Card Categories | Wealth management, estate, side hustle |
| Monthly Income | Highest tier + side hustle variable |
| Decision Cards/Day | 3 |
| XP to Complete | 12,000 XP (cumulative: 30,000) |
| Victory Condition | Net worth ≥ 50,000 × CU AND debt-to-income ratio ≤ 36% AND CHI ≥ 700 |
| Narrative | "Financial security means freedom to choose" |
| Key Events | "Friend asks for large loan" moral dilemma, insurance claim event |

#### Level 7: "Financial Freedom"

| Property | Value |
|---|---|
| Duration | ~6 game months |
| Theme | Advanced strategies and giving back |
| Unlocked Mechanics | Crypto (volatile asset class), charitable giving tax benefits, refinancing, rental property income |
| New Card Categories | Advanced investing, philanthropy, passive income |
| Monthly Income | Multiple income streams |
| Decision Cards/Day | 3 |
| XP to Complete | 18,000 XP (cumulative: 48,000) |
| Victory Condition | Achieve 6-month emergency fund AND investment portfolio ≥ 3× monthly income AND help 2 "community" events |
| Narrative | "True wealth is having options AND giving back" |
| Key Events | Crypto volatility event, rental property opportunity, community investment |

#### Level 8: "Legacy"

| Property | Value |
|---|---|
| Duration | ~6 game months (then endless) |
| Theme | Long-term planning and mastery |
| Unlocked Mechanics | All mechanics available, retirement planning calculator, will/trust, generational wealth concepts |
| New Card Categories | Retirement, legacy, mentoring |
| Monthly Income | Peak + passive income |
| Decision Cards/Day | 3-4 |
| XP to Complete | 25,000 XP (cumulative: 73,000) — then endless mode |
| Victory Condition | Retirement readiness score ≥ 80% AND net worth ≥ 200,000 × CU AND CHI ≥ 750 |
| Narrative | "Plan for the future. Your legacy is what you leave behind." |
| Key Events | Retirement planning session, market boom event, generational wealth decision |
| Endless Mode | After completing L8, game continues with all mechanics. Monthly "mastery challenges" for XP/coins. Leaderboard-eligible. |

### 7.2 Level-Up Flow

```
1. Month-end processing completes
2. Server checks: has player met ALL victory conditions for current level?
3. If YES:
   a. Level-up animation plays
   b. New mechanics tutorial screens shown
   c. Coins bonus awarded: level_number × 100 coins
   d. XP bonus: level_number × 250 XP
   e. Badge awarded: "Level X Graduate"
   f. New account types and cards become available
   g. Credit limit increase applied
   h. Next level's narrative intro plays
4. If NO:
   a. "Keep going" message with progress indicators
   b. Hints about what's missing (e.g., "Your emergency fund needs 200 more CU")
```

### 7.3 XP Requirements Summary

| Level | XP Required (this level) | Cumulative XP | Approx Real-Time to Complete |
|---|---|---|---|
| 1 | 500 | 500 | ~1 week |
| 2 | 1,500 | 2,000 | ~2 weeks |
| 3 | 3,000 | 5,000 | ~3 weeks |
| 4 | 5,000 | 10,000 | ~3 weeks |
| 5 | 8,000 | 18,000 | ~4 weeks |
| 6 | 12,000 | 30,000 | ~4 weeks |
| 7 | 18,000 | 48,000 | ~5 weeks |
| 8 | 25,000 | 73,000 | ~5 weeks |
| **Total** | **73,000** | | **~27 weeks** |

---

## 8. Scoring System

### 8.1 XP (Experience Points)

XP measures learning and engagement. It drives level progression.

**XP Earning Actions:**

| Action | Base XP | Notes |
|---|---|---|
| Complete a decision card | 5-25 | Based on financial wisdom of choice |
| Make a budget-conscious choice | +5 bonus | When cheapest option is chosen in context |
| Pay bill on time | 10 | Per bill |
| Pay credit card in full | 20 | Monthly |
| Make a savings deposit | 5 | Per deposit |
| Reach a savings goal | 50-200 | Based on goal size |
| Make an investment | 10 | Per transaction |
| Complete a weekly challenge | 50-100 | Based on difficulty |
| Complete a monthly challenge | 200-500 | Based on difficulty |
| File taxes correctly | 100 | Annual event |
| Handle emergency well | 25-75 | Based on preparedness |
| Complete tutorial step | 15 | One-time each |
| Maintain budget adherence ≥80% for a month | 50 | Monthly bonus |
| Achieve a streak milestone | 25-200 | Based on streak length |
| Help in classroom challenge | 30 | Per participation |

**XP Modifiers:**

```
final_xp = base_xp × persona_modifier × streak_modifier × difficulty_modifier

Persona modifiers:
  Teen: 1.2
  Student: 1.1
  Young Adult: 1.0
  Parent: 0.9

Streak modifiers (consecutive days played):
  1-6 days: 1.0
  7-13 days: 1.1
  14-29 days: 1.2
  30-59 days: 1.3
  60-89 days: 1.4
  90+ days: 1.5

Difficulty modifiers:
  Easy: 0.8
  Normal: 1.0
  Hard: 1.3
```

### 8.2 Coins (Reward Currency)

Coins are the spendable reward currency, redeemable for real-world rewards through partners.

**Coin Earning Actions:**

| Action | Coins | Notes |
|---|---|---|
| Complete a decision card (smart choice) | 1-10 | Higher for better financial decisions |
| Complete a daily set (all cards for the day) | 5 | Daily bonus |
| Complete weekly challenge | 20-50 | Based on difficulty |
| Complete monthly challenge | 100-250 | Based on difficulty |
| Level up | level × 100 | One-time |
| Earn a badge | 10-100 | Based on rarity |
| Referral (friend joins) | 200 | One-time per referral, max 10 |
| Daily login bonus | 1-5 | Scales with streak |
| Perfect budget month | 50 | Monthly |
| Maintain CHI ≥ 750 for 3 months | 100 | Quarterly bonus |

**Coin Sinks (Spending):**

| Sink | Cost | Purpose |
|---|---|---|
| Avatar customization | 10-50 | Cosmetic |
| Home decoration (in-game) | 20-100 | Cosmetic |
| Hint on decision card | 15 | Reveals optimal choice |
| Skip waiting period | 10-30 | Skip time-gated events |
| Real-world rewards | 500-10,000 | Partner gift cards, discounts |
| Charitable donation (in-game) | 50-500 | Donates to real charity via partner |
| Premium challenge entry | 25 | Competitive mode entry |

### 8.3 Net Worth Score

Calculated for leaderboard and milestone tracking:

```
net_worth = total_assets - total_liabilities

total_assets = checking_balance
             + savings_balance
             + investment_portfolio_value
             + home_equity (home_value - mortgage_remaining)
             + vehicle_value (depreciating: original × 0.85^years_owned)

total_liabilities = credit_card_balance
                  + student_loan_remaining
                  + auto_loan_remaining
                  + mortgage_remaining
                  + personal_loan_remaining
                  + bnpl_remaining
```

---

## 9. Credit Health Index (CHI)

The Credit Health Index simulates a credit score (300-850 range) and is the most important ongoing metric.

### 9.1 Sub-Scores

| Component | Weight | Range | Description |
|---|---|---|---|
| Payment History | 35% | 0-100 | On-time payment track record |
| Credit Utilization | 30% | 0-100 | How much of available credit is used |
| Credit Age | 15% | 0-100 | How long accounts have been open |
| Credit Mix | 10% | 0-100 | Variety of account types |
| New Credit Inquiries | 10% | 0-100 | Recent applications for new credit |

### 9.2 Sub-Score Calculations

#### Payment History (35%)

```
payment_history_score = 100 - (penalty_points)

Penalty points:
  Late payment (1-30 days): -10 per occurrence
  Late payment (31-60 days): -20 per occurrence
  Late payment (61-90 days): -35 per occurrence
  Missed payment (90+ days): -50 per occurrence
  Collection/default: -75

Recovery:
  Each on-time payment: +2 (up to max 100)
  Each 6 consecutive on-time months: +10 bonus recovery
  Penalties decay: 50% reduction after 12 game months, removed after 24 game months

Minimum score: 0
```

#### Credit Utilization (30%)

```
utilization_ratio = total_credit_used / total_credit_available

Score mapping:
  0%:        85 (slightly penalized for no usage)
  1-9%:      100 (optimal)
  10-29%:    90
  30-49%:    70
  50-74%:    45
  75-99%:    20
  100%+:     0 (maxed out)

If no credit accounts exist: score = 50 (neutral)
```

#### Credit Age (15%)

```
average_account_age = sum(age_of_each_account_in_months) / number_of_accounts

Score mapping:
  0-3 months:   20
  4-6 months:   35
  7-12 months:  50
  13-24 months: 65
  25-36 months: 75
  37-60 months: 85
  61+ months:   100
```

#### Credit Mix (10%)

```
account_types_held = set of unique account types player has

Points per type:
  Checking: 10
  Savings: 10
  Credit card: 20
  Student loan: 15
  Auto loan: 15
  Mortgage: 20
  Personal loan: 10
  Investment: 5 (not traditional credit but shows financial maturity)

Score = MIN(100, sum of points for held types)

Example: Checking + Savings + Credit Card + Auto Loan = 10 + 10 + 20 + 15 = 55
```

#### New Credit Inquiries (10%)

```
recent_applications = count of new credit applications in last 6 game months

Score mapping:
  0 applications: 100
  1 application:  90
  2 applications: 75
  3 applications: 55
  4 applications: 35
  5+ applications: 15
```

### 9.3 Final CHI Calculation

```
raw_score = (payment_history × 0.35)
          + (utilization × 0.30)
          + (credit_age × 0.15)
          + (credit_mix × 0.10)
          + (new_inquiries × 0.10)

// raw_score is 0-100. Map to 300-850 range:
CHI = 300 + (raw_score / 100) × 550

// Round to nearest integer
CHI = ROUND(CHI)

// Clamp
CHI = CLAMP(CHI, 300, 850)
```

**Example:**
```
Payment History: 85 × 0.35 = 29.75
Utilization: 90 × 0.30 = 27.00
Credit Age: 50 × 0.15 = 7.50
Credit Mix: 55 × 0.10 = 5.50
New Inquiries: 100 × 0.10 = 10.00
Raw = 79.75
CHI = 300 + (79.75/100) × 550 = 300 + 438.6 = 739
```

### 9.4 CHI Impact on Gameplay

| CHI Range | Label | Effects |
|---|---|---|
| 750-850 | Excellent | Best loan rates, highest credit limits, premium card offers, achievement badges |
| 700-749 | Good | Good loan rates, increased credit limits |
| 650-699 | Fair | Standard rates, some applications may be denied |
| 600-649 | Below Average | Higher interest rates, lower limits, secured credit card only |
| 500-599 | Poor | Most credit applications denied, highest rates if approved |
| 300-499 | Very Poor | All credit denied, debt collection events trigger |

---

## 10. Budget Scoring Algorithm

Players set monthly budgets per category. The budget score measures adherence.

### 10.1 Category Budgets

Players allocate their expected monthly income across categories:

```
Required categories (must allocate):
  - Housing (rent/mortgage)
  - Food (groceries + dining)
  - Transport
  - Utilities
  - Savings (recommended: ≥ 10% of income)

Optional categories:
  - Entertainment
  - Shopping
  - Health
  - Education
  - Subscriptions
  - Miscellaneous

Unallocated amount = Income - sum(all_allocations)
  If unallocated > 0: treated as "flexible spending"
  If unallocated < 0: budget is invalid, player must adjust
```

### 10.2 Adherence Calculation

```
For each category:
  spent = actual spending in category this month
  budgeted = allocated budget for category
  
  if budgeted == 0 and spent == 0:
    category_score = 100
  elif budgeted == 0 and spent > 0:
    category_score = 0 (unbudgeted spending)
  else:
    ratio = spent / budgeted
    if ratio <= 1.0:
      // Under budget: perfect is using 80-100% of budget
      if ratio >= 0.8:
        category_score = 100
      elif ratio >= 0.5:
        category_score = 90  // slightly under-utilizing
      else:
        category_score = 75  // significantly under budget (over-allocated)
    else:
      // Over budget
      overage = ratio - 1.0
      category_score = MAX(0, 100 - (overage × 200))
      // 10% over = 80, 25% over = 50, 50% over = 0

Monthly budget score = weighted average of category scores
  Weight per category = budgeted amount / total budget
  
  budget_score = sum(category_score_i × weight_i)
```

### 10.3 Budget Score Rewards

| Monthly Budget Score | Reward |
|---|---|
| 90-100 | 50 XP + 25 coins + "Budget Master" streak increment |
| 75-89 | 30 XP + 10 coins |
| 60-74 | 15 XP + 5 coins |
| 40-59 | 5 XP + 0 coins + "Budget needs work" notification |
| < 40 | 0 XP + 0 coins + "Financial stress" event risk +20% |

---

## 11. Difficulty Modes

### 11.1 Parameter Differences

| Parameter | Easy | Normal | Hard |
|---|---|---|---|
| Starting cash bonus | +50% | 0% | -25% |
| Income variability | ±5% | ±10% | ±20% |
| Emergency event frequency | 1 per 4 months | 1 per 3 months | 1 per 2 months |
| Emergency cost range | 50-80% of normal | 100% | 120-150% of normal |
| Inflation rate (annual) | 1.5% | 3.0% | 5.0% |
| Savings APY | 3.5% | 2.5% | 1.5% |
| Credit card APR | 15.99% | 19.99% | 24.99% |
| Late fee amounts | 50% of normal | 100% | 150% |
| Overdraft grace period | 3 days | 1 day | 0 days |
| Loan approval threshold (CHI) | 500 | 550 | 650 |
| Decision card "good choice" XP bonus | +50% | 0% | 0% |
| Consequence chain probability | 50% of normal | 100% | 130% |
| XP multiplier | 0.8× | 1.0× | 1.3× |
| Bill reminder lead time | 7 days | 3 days | 1 day |
| Salary raise frequency | Every 3 months | Every 6 months | Every 12 months |
| Investment volatility | 60% of normal | 100% | 140% |
| Happiness decay rate | -0.5/week | -1/week | -2/week |
| Happiness from spending | +50% | 0% | -25% |

### 11.2 Difficulty Selection

- Selectable at game start.
- Can be changed between levels (not mid-level).
- Changing to easier difficulty: no penalty but leaderboard flag ("Easy mode" indicator).
- Changing to harder difficulty: 10% XP bonus for the next level.
- Achievements/badges note the difficulty they were earned on.

---

## 12. Victory & Loss Conditions

### 12.1 Victory Conditions

Per-level victory conditions are defined in Section 7.1. Additionally:

**Game Completion:** Completing Level 8 triggers the "Financial Freedom" ending:
- Animated summary of entire financial journey
- Final net worth, CHI, and key decisions highlighted
- Comparison to "optimal path" (what perfect play would look like)
- Endless mode unlocked

**Perfect Completion Requirements (for "MoneyLife Master" badge):**
- Complete all 8 levels
- CHI never dropped below 650
- Budget score averaged ≥ 75% across all months
- Net worth positive every month from Level 3 onward
- All savings goals met
- Zero bankruptcies

### 12.2 Loss Conditions

There is no permanent "game over." Instead, the game applies escalating consequences:

**Stage 1: Financial Stress**
- Trigger: Net worth < 0 for 2 consecutive months OR CHI < 500
- Effect: "Financial stress" narrative, harder decision cards, happiness -10
- Recovery: Restore net worth > 0 and CHI > 500

**Stage 2: Collection**
- Trigger: Any debt 90+ days delinquent
- Effect: Debt collector events (garnishment of 25% of income), CHI -100, restricted credit access
- Recovery: Pay off delinquent debt or negotiate payment plan (takes 6 game months)

**Stage 3: Bankruptcy**
- Trigger: Total debt > 5× annual income AND unable to make minimum payments for 3 consecutive months
- Effect: Bankruptcy declaration event
  - All unsecured debt discharged
  - CHI set to 350
  - Credit access completely restricted for 12 game months
  - Investment accounts frozen for 6 game months
  - "Fresh Start" narrative
- Recovery: Continue playing from current level with restricted mechanics. CHI rebuilds over 12-24 game months.

**Foreclosure/Repossession:**
- Mortgage: 6 missed payments → home lost, equity forfeited
- Auto loan: 3 missed payments → car repossessed, must use public transit

**No Restart Penalty:** Players can restart any level or start a new game at any time. Previous game data is preserved in history.

---

## 13. Tutorial Flow

### 13.1 Level 1 Tutorial (Mandatory for New Players)

The tutorial is woven into Level 1 gameplay. Each step is a guided decision with explanatory overlays.

**Step 1: Welcome & Persona Selection** (Day 0)
```
- Animated intro: "Welcome to MoneyLife!"
- Currency selection (auto-detected from device locale, changeable)
- Persona selection with previews of each path
- Difficulty selection with clear explanations
- "Your MoneyLife begins now" transition
```

**Step 2: Your First Paycheck** (Day 1)
```
- Income arrives in checking account
- Guided tour of account screen
- Explanation: "This is your checking account. Money in, money out."
- Interactive: Tap on balance to see details
- Tooltip: "Income sources" breakdown
```

**Step 3: Your First Bill** (Day 2)
```
- Phone bill due notification
- Guided: "Bills are paid from your checking account"
- Interactive: Pay the bill (one-tap)
- Explanation: "Paying on time protects your Credit Health"
- Show CHI for first time with explanation
```

**Step 4: Your First Decision Card** (Day 3)
```
- Decision card: "Grocery Shopping"
  Options: Store brand (30 CU) vs Name brand (50 CU) vs Skip (0 CU, happiness hit)
- Guided: "Every choice has financial consequences"
- Show XP and coin rewards after choice
- Explain budget categories
```

**Step 5: Setting a Budget** (Day 4)
```
- Guided budget setup screen
- Pre-filled recommendations based on persona income
- Interactive: Adjust allocations with sliders
- Explanation: "Budgets help you plan. We'll track how you do."
- Show 50/30/20 rule as guideline (50% needs, 30% wants, 20% savings)
```

**Step 6: Opening Savings** (Day 5)
```
- Guided: "Let's open a savings account"
- Transfer 100 CU from checking to savings
- Explanation: Interest, compounding, savings goals
- Set first savings goal
- Show interest projection ("In 12 months, this 100 CU becomes 102.50 CU")
```

**Step 7: Your First Week** (Day 7)
```
- Weekly summary appears
- Guided tour of summary screen
- Budget adherence score shown for first time
- "Great first week!" encouragement
- Streak explanation: "Play every day for bonus XP"
```

**Step 8: End of Tutorial** (Day 14-15)
```
- "Tutorial complete!" celebration
- All guided overlays become optional (can be re-enabled in settings)
- Free play begins within Level 1
- Reminder of Level 1 victory conditions
```

### 13.2 Mechanic Tutorials (Per Level Unlock)

Each new mechanic gets a 2-3 screen tutorial when first unlocked:

- **Credit Card (Level 2):** Statement cycle, minimum payment, grace period, interest
- **Emergency Fund (Level 3):** Why 3-6 months expenses, how to build it
- **Investing (Level 4):** Risk vs reward, diversification, compound growth
- **Mortgage (Level 5):** Down payment, amortization, DTI ratio
- **Insurance (Level 3+):** Premiums, deductibles, when to claim
- **Tax Filing (Level 5):** Income, deductions, refunds (simplified)
- **Retirement (Level 8):** 401k/pension concepts, time value of money

---

## 14. Multiplayer & Competitive Modes

### 14.1 Friend Leaderboards

- Players add friends via invite code or social media connection
- Leaderboards rank by:
  - **Net Worth** (current level only — normalized by level for fairness)
  - **CHI Score**
  - **Budget Adherence** (monthly average)
  - **Total XP** (all-time)
  - **Streak Length** (current)
- Leaderboard refresh: daily
- Privacy: Players can opt out of leaderboards entirely

### 14.2 Classroom Mode

Designed for educational institutions:

**Setup:**
- Teacher creates a "classroom" via white-label dashboard or teacher portal
- Students join via class code
- Teacher selects: persona, difficulty, level range, specific learning objectives
- Teacher can enable/disable specific card categories

**Classroom Challenges:**
- Teacher sets a challenge: "Save 500 CU in 2 game weeks"
- All students work toward the same goal simultaneously
- Real-time progress dashboard for teacher
- Rankings visible to class (optional, teacher-controlled)
- Team challenges: students grouped into teams, collective score

**Classroom Features:**
- Teacher can pause/resume all students' games
- Teacher can inject custom decision cards (from template library)
- Progress reports exportable as CSV/PDF
- Learning outcome tracking: which financial concepts each student demonstrated understanding of
- Integration with LMS (Moodle, Canvas, Google Classroom) via LTI

### 14.3 Weekly Challenges

Global challenges available to all players:

```
Example challenges:
- "Savings Sprint": Save the highest percentage of income this week
- "Budget Boss": Achieve the highest budget adherence score
- "Frugal Friday": Spend the least on a specific day while maintaining happiness > 50
- "Investment Guru": Best investment return this month (luck + strategy)
- "Debt Destroyer": Pay off the most debt this week

Rewards:
  Top 10%: 100 coins + exclusive badge
  Top 25%: 50 coins
  Top 50%: 25 coins
  Participation: 10 coins
```

### 14.4 Head-to-Head Mode

Two players face the same decision cards simultaneously:

- Both receive identical cards with identical parameters
- Both start with identical financial states
- After 7 game days, compare net worth, CHI, and budget scores
- Winner gets 50 coins, loser gets 15 coins
- Tied: both get 30 coins
- Matchmaking: based on level and CHI (±1 level, ±50 CHI)
- Cost to enter: 10 coins

---

## 15. Currency & Localization

### 15.1 Supported Currencies (Launch)

| Currency | Code | Symbol | Decimal Places | PPP Factor |
|---|---|---|---|---|
| US Dollar | USD | $ | 2 | 1.00 |
| Euro | EUR | € | 2 | 0.92 |
| British Pound | GBP | £ | 2 | 0.78 |
| Japanese Yen | JPY | ¥ | 0 | 135.0 |
| Indian Rupee | INR | ₹ | 2 | 83.0 |
| Brazilian Real | BRL | R$ | 2 | 5.0 |
| Mexican Peso | MXN | $ | 2 | 17.5 |
| Nigerian Naira | NGN | ₦ | 2 | 780.0 |
| South African Rand | ZAR | R | 2 | 18.5 |
| Canadian Dollar | CAD | $ | 2 | 1.35 |
| Australian Dollar | AUD | $ | 2 | 1.55 |
| Turkish Lira | TRY | ₺ | 2 | 27.0 |
| Indonesian Rupiah | IDR | Rp | 0 | 15,500 |
| Philippine Peso | PHP | ₱ | 2 | 56.0 |
| Thai Baht | THB | ฿ | 2 | 35.0 |

### 15.2 Currency Scaling Rules

```
All base values in game design are in "CU" (Currency Units) = 1 USD equivalent.

When displaying to player:
  display_value = base_value × PPP_factor
  display_value = ROUND(display_value, currency_decimal_places)

When storing:
  All values stored internally in CU (base currency units)
  Display conversion happens at the presentation layer only

Rounding rule: 
  ROUND_HALF_UP for all financial calculations
  No display of fractions beyond currency's decimal places
  For JPY/IDR (0 decimals): round to nearest whole number
```

### 15.3 Localization Beyond Currency

Each locale also customizes:
- **Bill names**: "Rent" vs "Miete" vs "Loyer"
- **Decision card narratives**: Culturally appropriate scenarios
- **Food prices**: Scaled to local restaurant/grocery prices
- **Transport**: Car-centric vs public-transit-centric based on region
- **Insurance types**: Region-appropriate (e.g., NHS context for UK reduces health insurance relevance)
- **Tax events**: Simplified per-country tax model
- **Interest rate ranges**: Based on regional central bank rates
- **Financial products**: Some products unavailable in some regions (e.g., BNPL restrictions in some EU countries)

### 15.4 Right-to-Left (RTL) Support

For Arabic (AR) and Hebrew (HE):
- Full RTL layout mirroring
- Number display remains LTR within RTL context
- Currency symbol placement follows locale convention
- Decision card text right-aligned

---

## Appendix A: Game Constants

```yaml
# All tunable game constants in one place

# Time
MAX_QUEUED_DAYS: 3
AUTO_ADVANCE_INTERVAL_HOURS: 4

# Accounts
CHECKING_MAX_BALANCE: 1000000
SAVINGS_MAX_BALANCE: 1000000
SAVINGS_WITHDRAWAL_LIMIT_PER_MONTH: 6
SAVINGS_EXCESS_WITHDRAWAL_FEE: 10
SAVINGS_MIN_BALANCE_FOR_FREE: 100
SAVINGS_MONTHLY_FEE: 5
OVERDRAFT_LIMIT: 500
OVERDRAFT_FEE: 35
OVERDRAFT_APR: 0.18

# Credit Card
CC_BASE_APR: 0.1999
CC_CASH_ADVANCE_APR: 0.2499
CC_GRACE_PERIOD_DAYS: 21
CC_MIN_PAYMENT_FLOOR: 25
CC_MIN_PAYMENT_PERCENT: 0.02
CC_LATE_FEE_FIRST: 35
CC_LATE_FEE_SUBSEQUENT: 45
CC_OVER_LIMIT_FEE: 30
CC_ANNUAL_FEE_REWARDS: 95

# Loans
STUDENT_LOAN_APR: 0.055
AUTO_LOAN_APR_GOOD: 0.065
AUTO_LOAN_APR_BAD: 0.12
MORTGAGE_APR_30Y: 0.045
MORTGAGE_APR_15Y: 0.038
PMI_RATE: 0.005
PROPERTY_TAX_RATE: 0.012
HOME_INSURANCE_RATE: 0.005
PERSONAL_LOAN_APR_MIN: 0.08
PERSONAL_LOAN_APR_MAX: 0.24

# BNPL
BNPL_MAX_ACTIVE_PLANS: 3
BNPL_LATE_FEE: 7
BNPL_12M_APR: 0.15

# Insurance
HEALTH_INSURANCE_PREMIUM: 150
HEALTH_INSURANCE_DEDUCTIBLE: 500
HEALTH_INSURANCE_COVERAGE: 0.80
AUTO_INSURANCE_PREMIUM: 80
AUTO_INSURANCE_DEDUCTIBLE: 250
RENTERS_INSURANCE_PREMIUM: 15
RENTERS_INSURANCE_DEDUCTIBLE: 200
LIFE_INSURANCE_PREMIUM: 30
LIFE_INSURANCE_PAYOUT: 100000
DISABILITY_INSURANCE_PREMIUM: 40
DISABILITY_INCOME_REPLACEMENT: 0.60
INSURANCE_CLAIM_PREMIUM_INCREASE: 0.10

# Investment
INVESTMENT_MIN: 10
INDEX_MONTHLY_RETURN_MEAN: 0.007
INDEX_MONTHLY_RETURN_STDDEV: 0.03
BOND_MONTHLY_RETURN_MEAN: 0.003
BOND_MONTHLY_RETURN_STDDEV: 0.005
STOCK_MONTHLY_RETURN_MEAN: 0.008
STOCK_MONTHLY_RETURN_STDDEV: 0.08
CRYPTO_MONTHLY_RETURN_MEAN: 0.01
CRYPTO_MONTHLY_RETURN_STDDEV: 0.20
INVESTMENT_RETURN_CLAMP_MIN: -0.30
INVESTMENT_RETURN_CLAMP_MAX: 0.30
RETIREMENT_CONTRIBUTION_LIMIT_MONTHLY: 500

# Happiness
HAPPINESS_START: 60
HAPPINESS_MIN: 5
HAPPINESS_MAX: 95
HAPPINESS_WEEKLY_DECAY: -1
HAPPINESS_BURNOUT_THRESHOLD: 20

# Scoring
CHI_MIN: 300
CHI_MAX: 850
CHI_PAYMENT_HISTORY_WEIGHT: 0.35
CHI_UTILIZATION_WEIGHT: 0.30
CHI_CREDIT_AGE_WEIGHT: 0.15
CHI_CREDIT_MIX_WEIGHT: 0.10
CHI_NEW_INQUIRIES_WEIGHT: 0.10

# Inflation
INFLATION_ANNUAL_EASY: 0.015
INFLATION_ANNUAL_NORMAL: 0.03
INFLATION_ANNUAL_HARD: 0.05

# Progression
XP_LEVEL_1: 500
XP_LEVEL_2: 1500
XP_LEVEL_3: 3000
XP_LEVEL_4: 5000
XP_LEVEL_5: 8000
XP_LEVEL_6: 12000
XP_LEVEL_7: 18000
XP_LEVEL_8: 25000

# Vehicle Depreciation
VEHICLE_ANNUAL_DEPRECIATION: 0.15

# Bankruptcy
BANKRUPTCY_DEBT_INCOME_RATIO_TRIGGER: 5.0
BANKRUPTCY_CONSECUTIVE_MISSED_MONTHS: 3
BANKRUPTCY_CHI_AFTER: 350
BANKRUPTCY_CREDIT_RESTRICTION_MONTHS: 12
BANKRUPTCY_INVESTMENT_FREEZE_MONTHS: 6
FORECLOSURE_MISSED_PAYMENTS: 6
REPOSSESSION_MISSED_PAYMENTS: 3
```

---

## Appendix B: Event Probability Table

| Event | Probability per Game Month | Level Range | Cost Range (CU) |
|---|---|---|---|
| Minor car repair | 8% | 4-8 | 200-800 |
| Major car repair | 3% | 4-8 | 1,000-3,000 |
| Medical emergency (minor) | 10% | 3-8 | 100-500 |
| Medical emergency (major) | 3% | 3-8 | 2,000-10,000 |
| Home appliance failure | 7% | 5-8 | 200-1,500 |
| Job loss | 2% | 3-8 | 0 (loss of income for 1-3 months) |
| Pay raise | 5% | 2-8 | +3-8% salary increase |
| Bonus at work | 8% | 3-8 | 50-200% of monthly salary |
| Wedding invitation | 6% | 3-8 | 200-1,000 (gift + travel) |
| Natural disaster (property) | 1% | 5-8 | 1,000-10,000 |
| Identity theft | 2% | 3-8 | 500-2,000 (+ credit freeze event) |
| Inheritance | 1% | 5-8 | 5,000-50,000 |
| Friend repays old loan | 3% | 2-8 | 50-500 |
| Pet emergency | 5% | 2-8 | 200-2,000 |
| Parking/traffic ticket | 7% | 3-8 | 50-300 |
| Phone screen crack | 6% | 1-8 | 100-300 |
| Utility rate increase | 4% | 3-8 | +10-25% on utility bill |

---

*End of Gameplay & Rules Specification*
