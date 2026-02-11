# MoneyLife — Rewards System Specification

> Version 1.0 · February 2026
> Complete rewards, badges, economy, and partner integration documentation.

---

## Table of Contents

1. [Dual Currency System](#1-dual-currency-system)
2. [Badge Catalog](#2-badge-catalog)
3. [Streak System](#3-streak-system)
4. [Reward Partner Integration](#4-reward-partner-integration)
5. [Redemption Flow](#5-redemption-flow)
6. [Anti-Abuse](#6-anti-abuse)
7. [Economy Balancing](#7-economy-balancing)
8. [Seasonal Events & Challenges](#8-seasonal-events--challenges)
9. [Referral Rewards](#9-referral-rewards)
10. [Achievement Tiers](#10-achievement-tiers)
11. [Classroom & Team Rewards](#11-classroom--team-rewards)
12. [White-Label Reward Customization](#12-white-label-reward-customization)

---

## 1. Dual Currency System

### 1.1 XP (Experience Points) — Progression Currency

XP is non-spendable. It accumulates and drives level progression.

**Properties:**
- Cannot be spent, traded, or transferred
- Monotonically increasing (never decreases)
- Displayed as total and per-level progress bar
- Not convertible to coins

**Complete XP Earning Table:**

| Action | Base XP | Conditions | Frequency Cap |
|---|---|---|---|
| Complete decision card (any choice) | 5 | Always | Per card |
| Complete decision card (optimal choice) | 15-25 | Server-determined best financial choice | Per card |
| Complete decision card (good choice) | 10-15 | Financially reasonable choice | Per card |
| Pay bill on time | 10 | Per bill successfully paid | Per bill/month |
| Pay credit card in full by due date | 20 | Full statement balance paid | 1/month |
| Pay credit card minimum by due date | 8 | Minimum payment made | 1/month |
| Make savings deposit | 5 | Any amount deposited to savings | 3/day |
| Reach savings goal | 50-200 | Based on goal target (50 if target < 500 CU, 100 if < 2000, 200 if ≥ 2000) | Per goal |
| Make investment purchase | 10 | Any investment buy order | 2/day |
| Rebalance portfolio | 15 | Sell + buy different asset | 1/month |
| Set up auto-pay | 20 | First time per account | One-time per account |
| Create a budget | 25 | First time | One-time |
| Adjust budget | 5 | Modify allocations | 1/month |
| Monthly budget adherence ≥ 90% | 50 | Month-end | 1/month |
| Monthly budget adherence ≥ 75% | 30 | Month-end | 1/month |
| Advance a game day | 3 | Day advancement | Per day |
| Complete weekly challenge | 50-100 | Challenge-specific | Per challenge |
| Complete monthly challenge | 200-500 | Challenge-specific | Per challenge |
| Handle emergency (with insurance) | 25 | Had insurance, filed claim | Per event |
| Handle emergency (with emergency fund) | 50 | Paid from savings, no debt | Per event |
| Handle emergency (went into debt) | 10 | Learning opportunity | Per event |
| File taxes correctly (Level 5+) | 100 | Annual tax event | 1/year |
| Complete level | level × 250 | Level-up event | Per level |
| Complete tutorial step | 15 | Tutorial actions | One-time each |
| First action of the day | 5 | Login/play | 1/real day |
| Review monthly report | 10 | View and dismiss report | 1/month |
| Open a new account type | 20 | First time per type | One-time per type |
| Pay off a loan completely | 100-300 | Based on original principal | Per loan |
| Maintain CHI ≥ 750 for 3 months | 150 | Quarterly check | 1/quarter |
| Recover from bankruptcy | 200 | Complete recovery milestones | Per bankruptcy |

### 1.2 Coins — Reward Currency

Coins are the spendable currency, redeemable for real-world rewards.

**Properties:**
- Earned through gameplay
- Spendable in reward catalog
- Purchasable via IAP (optional monetization)
- Not transferable between players
- No expiration (coins never expire)
- Can be earned in white-label and consumer app

**Complete Coin Earning Table:**

| Action | Coins | Conditions | Frequency Cap |
|---|---|---|---|
| Complete decision card (smart choice) | 2-10 | Based on financial wisdom | Per card |
| Complete decision card (any choice) | 1 | Always, minimum | Per card |
| Complete daily card set | 5 | All day's cards resolved | 1/real day |
| Daily login bonus (Day 1) | 1 | Play on a given day | 1/real day |
| Daily login bonus (Day 2-6) | 2 | Consecutive day | 1/real day |
| Daily login bonus (Day 7+) | 3 | 7+ day streak | 1/real day |
| Complete weekly challenge | 20-50 | Based on difficulty | Per challenge |
| Complete monthly challenge | 100-250 | Based on difficulty | Per challenge |
| Level up | level × 100 | Level completion | Per level |
| Earn a Common badge | 10 | Badge unlocked | Per badge |
| Earn a Rare badge | 25 | Badge unlocked | Per badge |
| Earn an Epic badge | 50 | Badge unlocked | Per badge |
| Earn a Legendary badge | 100 | Badge unlocked | Per badge |
| Referral (friend joins and reaches L2) | 200 | Verified referral | Max 10 |
| Perfect budget month (≥ 95%) | 50 | Month-end | 1/month |
| CHI ≥ 750 for 3 months | 100 | Quarterly | 1/quarter |
| Classroom challenge winner | 50-200 | Teacher-confirmed | Per challenge |
| Head-to-head win | 50 | Versus mode | Per match |
| Head-to-head loss | 15 | Participation | Per match |
| Weekly challenge top 10% | 100 | Leaderboard | Per challenge |
| Weekly challenge top 25% | 50 | Leaderboard | Per challenge |
| Weekly challenge top 50% | 25 | Leaderboard | Per challenge |
| Weekly challenge participation | 10 | Attempted | Per challenge |
| Seasonal event completion | 100-500 | Event-specific | Per event |
| First game completion (all 8 levels) | 1,000 | One-time achievement | Once |

**Coin Purchase (IAP):**

| Package | Price (USD) | Coins | Bonus |
|---|---|---|---|
| Starter | $0.99 | 100 | — |
| Standard | $4.99 | 550 | 10% bonus |
| Premium | $9.99 | 1,200 | 20% bonus |
| Mega | $19.99 | 2,600 | 30% bonus |
| Ultra | $49.99 | 7,000 | 40% bonus |

---

## 2. Badge Catalog

### 2.1 Badge Structure

```json
{
  "badge_id": "BDG-SAVINGS-001",
  "name": "First Saver",
  "description": "Make your first deposit into a savings account",
  "icon": "piggy-bank-bronze",
  "rarity": "Common",
  "category": "savings",
  "unlock_condition": "savings_deposits >= 1",
  "coin_reward": 10,
  "xp_reward": 15,
  "hidden": false,
  "repeatable": false,
  "difficulty_specific": false
}
```

### 2.2 Complete Badge Catalog (60 Badges)

#### Savings Badges

| # | Name | Rarity | Unlock Condition | Coins |
|---|---|---|---|---|
| 1 | First Saver | Common | Make 1st savings deposit | 10 |
| 2 | Consistent Saver | Common | Make savings deposits in 4 consecutive months | 10 |
| 3 | Emergency Ready | Rare | Build emergency fund ≥ 1 month expenses | 25 |
| 4 | Safety Net | Rare | Build emergency fund ≥ 3 months expenses | 25 |
| 5 | Fortress | Epic | Build emergency fund ≥ 6 months expenses | 50 |
| 6 | Goal Getter | Common | Complete any savings goal | 10 |
| 7 | Goal Crusher | Rare | Complete 5 savings goals | 25 |
| 8 | Goal Legend | Epic | Complete 15 savings goals | 50 |
| 9 | Savings Rate Star | Rare | Save ≥ 20% of income for 3 consecutive months | 25 |
| 10 | Millionaire (Game) | Legendary | Savings balance reaches 100,000 CU | 100 |

#### Credit Badges

| # | Name | Rarity | Unlock Condition | Coins |
|---|---|---|---|---|
| 11 | Credit Beginner | Common | Open first credit card | 10 |
| 12 | Full Payer | Common | Pay credit card in full 1 time | 10 |
| 13 | Spotless Record | Rare | Pay all bills on time for 6 consecutive months | 25 |
| 14 | Credit Master | Epic | Maintain CHI ≥ 750 for 6 consecutive months | 50 |
| 15 | Perfect Score | Legendary | Reach CHI = 850 | 100 |
| 16 | Utilization Pro | Rare | Keep credit utilization < 10% for 3 months | 25 |
| 17 | Debt Destroyer | Rare | Pay off any loan completely | 25 |
| 18 | Debt Free | Epic | Have zero non-mortgage debt | 50 |
| 19 | Completely Free | Legendary | Have zero total debt (including mortgage) | 100 |
| 20 | Recovery Hero | Epic | Recover CHI from < 550 to > 700 | 50 |

#### Budget Badges

| # | Name | Rarity | Unlock Condition | Coins |
|---|---|---|---|---|
| 21 | Budget Beginner | Common | Create first budget | 10 |
| 22 | Budget Adherent | Common | Score ≥ 75% budget adherence for 1 month | 10 |
| 23 | Budget Boss | Rare | Score ≥ 90% budget adherence for 3 consecutive months | 25 |
| 24 | Budget Master | Epic | Score ≥ 90% budget adherence for 6 consecutive months | 50 |
| 25 | Budget Legend | Legendary | Score ≥ 95% budget adherence for 12 consecutive months | 100 |
| 26 | 50/30/20 | Rare | Allocate budget within 5% of 50/30/20 rule | 25 |

#### Investment Badges

| # | Name | Rarity | Unlock Condition | Coins |
|---|---|---|---|---|
| 27 | First Investment | Common | Make first investment purchase | 10 |
| 28 | Diversified | Rare | Hold 3+ different asset types simultaneously | 25 |
| 29 | Patient Investor | Rare | Hold an investment for 12+ game months without selling | 25 |
| 30 | Market Survivor | Epic | Maintain portfolio through a market crash event (don't panic sell) | 50 |
| 31 | Portfolio Pro | Epic | Portfolio value exceeds 10,000 CU | 50 |
| 32 | Retirement Ready | Legendary | Retirement readiness score ≥ 80% | 100 |
| 33 | Crypto Survivor | Rare | Hold crypto through a crash without selling | 25 |
| 34 | Dividend Collector | Common | Receive 4 dividend payments | 10 |

#### Life Event Badges

| # | Name | Rarity | Unlock Condition | Coins |
|---|---|---|---|---|
| 35 | Homeowner | Epic | Purchase a home | 50 |
| 36 | Smart Buyer | Rare | Purchase home with ≥ 20% down payment (no PMI) | 25 |
| 37 | Wheels | Common | Purchase/finance a car | 10 |
| 38 | Insured | Common | Hold any insurance policy for 6 months | 10 |
| 39 | Fully Covered | Rare | Hold 3+ insurance types simultaneously | 25 |
| 40 | Claim Navigator | Rare | Successfully resolve an insurance claim | 25 |
| 41 | Tax Pro | Rare | File taxes correctly (no errors) first time | 25 |
| 42 | Good Parent | Epic | Fund child's college savings goal (Parent persona) | 50 |
| 43 | Emergency Handler | Rare | Handle emergency without going into debt | 25 |
| 44 | Side Hustler | Common | Complete a side-hustle event | 10 |

#### Engagement Badges

| # | Name | Rarity | Unlock Condition | Coins |
|---|---|---|---|---|
| 45 | First Week | Common | Play for 7 consecutive days | 10 |
| 46 | Monthly Regular | Common | Play for 30 consecutive days | 10 |
| 47 | Dedicated | Rare | Play for 60 consecutive days | 25 |
| 48 | Committed | Epic | Play for 90 consecutive days | 50 |
| 49 | MoneyLife Veteran | Legendary | Play for 180 consecutive days | 100 |
| 50 | Speed Runner | Rare | Complete Level 1-4 in under 60 game days | 25 |

#### Progression Badges

| # | Name | Rarity | Unlock Condition | Coins |
|---|---|---|---|---|
| 51 | Level 1 Graduate | Common | Complete Level 1 | 10 |
| 52 | Level 2 Graduate | Common | Complete Level 2 | 10 |
| 53 | Level 3 Graduate | Common | Complete Level 3 | 10 |
| 54 | Level 4 Graduate | Rare | Complete Level 4 | 25 |
| 55 | Level 5 Graduate | Rare | Complete Level 5 | 25 |
| 56 | Level 6 Graduate | Epic | Complete Level 6 | 50 |
| 57 | Level 7 Graduate | Epic | Complete Level 7 | 50 |
| 58 | Level 8 Graduate | Legendary | Complete Level 8 | 100 |
| 59 | MoneyLife Master | Legendary | Complete all 8 levels with CHI never < 650 | 100 |
| 60 | Life Journey | Legendary | Complete Teen → Student → Young Adult → Parent sequence | 100 |

### 2.3 Hidden Badges (Bonus — Not Shown Until Earned)

| # | Name | Rarity | Unlock Condition | Coins |
|---|---|---|---|---|
| H1 | Penny Pincher | Rare | Choose the cheapest option on 20 consecutive decision cards | 25 |
| H2 | YOLO | Rare | Choose the most expensive option on 10 consecutive cards | 25 |
| H3 | Bankruptcy Bounce-Back | Epic | Go bankrupt and then reach CHI 700+ | 50 |
| H4 | Against All Odds | Legendary | Complete game on Hard difficulty after bankruptcy | 100 |
| H5 | Philanthropist | Rare | Donate to charity events 5 times | 25 |

---

## 3. Streak System

### 3.1 Streak Mechanics

```
A streak increments when:
  - Player performs at least 1 meaningful action per calendar day (in their timezone)
  - Meaningful actions: resolve a decision card, advance a day, make a transfer, adjust budget
  - Simply opening the app does NOT count (must take an action)

Streak counter:
  current_streak: integer (days)
  longest_streak: integer (lifetime max)
  streak_start_date: date
  last_action_date: date
```

### 3.2 Grace Period

```
Standard grace window: 23 hours
  - If player's last action was at 11:00 PM on Day 1
  - They have until 10:00 PM on Day 2 to maintain streak
  - This accounts for varying daily schedules

Extended grace: "Streak Shield" (purchasable with coins)
  - Cost: 50 coins
  - Grants 48-hour grace period (instead of 23 hours)
  - Usable once per 30 days
  - Must be activated BEFORE streak breaks
  - Auto-activates if purchased and streak would break at midnight

Server downtime grace: automatic +24 hours if server was unavailable
  (see edge-cases.md §18.4)
```

### 3.3 Streak Bonus Multipliers

```
Applied to ALL XP and coin earnings:

Days 1-6:    1.0× (no bonus)
Days 7-13:   1.1× (+10%)
Days 14-29:  1.2× (+20%)
Days 30-59:  1.3× (+30%)
Days 60-89:  1.4× (+40%)
Days 90+:    1.5× (+50%) — maximum

Multiplier displayed in HUD when active (Day 7+).
```

### 3.4 Streak Recovery

```
When a streak breaks:
  1. Counter resets to 0
  2. Player receives empathetic notification: "Your streak ended at [X] days. Start a new one today!"
  3. "Streak Insurance" offered: 100 coins to restore streak (one-time per break)
     - Must be purchased within 24 hours of break
     - If purchased: streak restored, counter continues as if unbroken
     - If not purchased: new streak starts at Day 1
  4. Previous streak recorded in history
  5. Longest streak record preserved
```

### 3.5 Streak Milestones

| Days | Milestone | Reward |
|---|---|---|
| 7 | 1 Week | 25 XP + 10 coins |
| 14 | 2 Weeks | 50 XP + 20 coins |
| 30 | 1 Month | 100 XP + 50 coins + "Monthly Regular" badge |
| 60 | 2 Months | 150 XP + 75 coins + "Dedicated" badge |
| 90 | 3 Months | 200 XP + 100 coins + "Committed" badge |
| 180 | 6 Months | 500 XP + 250 coins + "Veteran" badge |
| 365 | 1 Year | 1,000 XP + 500 coins + "MoneyLife Legend" badge |

---

## 4. Reward Partner Integration

### 4.1 Partner Onboarding Flow

```
1. Business Development:
   - Partner signs commercial agreement (rev-share or flat fee)
   - Partner provides: brand assets, reward catalog, API credentials, support contact
   
2. Technical Integration:
   a. Partner provides API or we integrate their existing gift card API
   b. Supported partner types:
      - Digital gift cards (e.g., Amazon, Starbucks, Netflix)
      - Discount codes (e.g., 10% off at partner retailer)
      - Physical rewards (shipped goods)
      - Charitable donations (we donate on player's behalf)
      - Experiences (e.g., financial coaching session)
   
3. Catalog Setup:
   - Partner submits reward items via Partner Dashboard or CSV upload
   - Each item: name, description, image, coin cost, stock level, fulfillment method
   - MoneyLife team reviews and approves (content & pricing review)
   - Items added to catalog with partner branding
   
4. Testing:
   - Sandbox redemption testing (dummy rewards)
   - End-to-end fulfillment test
   - Error scenario testing (out of stock, timeout, duplicate)
   
5. Launch:
   - Rewards appear in catalog
   - Partner featured in "New Rewards" section for 14 days
   - Push notification to players about new partner
```

### 4.2 Partner API Contract

```
MoneyLife calls partner API for:

1. Inventory Check
   GET {partner_base_url}/api/v1/inventory/{item_id}
   Response: { "available": true, "stock": 150 }
   Called: before displaying to user, cached for 1 hour

2. Redemption Request  
   POST {partner_base_url}/api/v1/redeem
   Body: {
     "order_id": "ML-ORD-uuid",
     "item_id": "PARTNER-ITEM-001",
     "quantity": 1,
     "recipient": {
       "email": "user@example.com"  // for digital delivery
       // OR
       "address": { ... }  // for physical delivery
     },
     "idempotency_key": "uuid"
   }
   Response: {
     "redemption_id": "PARTNER-RDM-123",
     "status": "PROCESSING" | "FULFILLED",
     "fulfillment_details": {
       "code": "GIFT-XXXX-XXXX",  // for digital
       "tracking_number": "..."    // for physical
     }
   }

3. Status Check
   GET {partner_base_url}/api/v1/redemption/{redemption_id}
   Response: { "status": "PROCESSING" | "SHIPPED" | "DELIVERED" | "FAILED" }
   Called: polling every 1 hour for PROCESSING, every 4 hours for SHIPPED

4. Cancellation
   DELETE {partner_base_url}/api/v1/redemption/{redemption_id}
   Response: { "cancelled": true | false }
   Called: if player cancels before fulfillment, or anti-abuse trigger
```

### 4.3 Fallback: Non-API Partners

For partners without API integration:

```
1. Manual fulfillment queue:
   - Redemption creates a ticket in MoneyLife operations dashboard
   - Operations team manually processes (purchases gift card, sends to user)
   - SLA: 48 hours for digital, 7 business days for physical
   
2. Pre-purchased inventory:
   - MoneyLife pre-purchases gift card codes in bulk
   - Stored encrypted in our database
   - Instant fulfillment from inventory
   - Restock alert when inventory < 20% of monthly redemption rate

3. Partner without digital rewards:
   - Discount code generation (unique per user)
   - PDF coupon generation and email delivery
```

### 4.4 Revenue Model with Partners

```
Revenue split options (per partner agreement):

Option A: Rev-share
  - MoneyLife retains 15-30% of reward face value
  - Partner provides reward at wholesale (e.g., $10 gift card costs us $7-8.50)
  - Coin-to-reward pricing covers MoneyLife margin

Option B: Flat sponsorship
  - Partner pays monthly fee for catalog placement ($500-5,000/month)
  - Rewards provided at face value (no discount)
  - Featured placement and branding

Option C: Sponsored challenges
  - Partner sponsors a weekly/monthly challenge
  - Challenge prizes are partner's rewards
  - Partner pays fixed sponsorship fee
  - MoneyLife distributes rewards, partner gets branding + analytics

Pricing formula for coin cost:
  coin_cost = (wholesale_cost_usd / coin_value_usd) × (1 + margin_pct)
  
  Where coin_value_usd = $0.01 (1 coin ≈ 1 cent target value)
  margin_pct = 10-30% (covers operations, platform costs)
  
  Example: $10 Starbucks card, wholesale $8, 20% margin
  coin_cost = (8.00 / 0.01) × 1.20 = 960 coins
  Displayed as: 960 coins for $10 Starbucks card
```

---

## 5. Redemption Flow

### 5.1 User Journey

```
Step 1: Browse Catalog
  - Player opens Rewards tab
  - Sees categories: Gift Cards, Discounts, Experiences, Charity, Cosmetics
  - Each item shows: image, name, partner, coin cost, availability
  - Filter by: category, coin range, partner
  - Sort by: popular, newest, coin cost

Step 2: Select Reward
  - Player taps reward item
  - Detail screen: full description, terms & conditions, redemption instructions
  - "Redeem for [X] coins" button
  - If insufficient coins: "You need [Y] more coins" with link to earn more

Step 3: Confirmation
  - Summary screen: reward name, coin cost, delivery method
  - For digital: confirm email address
  - For physical: enter/confirm shipping address
  - For charity: select charity from list
  - "Confirm Redemption" button (requires explicit tap, no accidental redemptions)

Step 4: Processing
  - Coins deducted immediately
  - Order created with status PENDING
  - Loading screen: "Processing your reward..."
  - For instant digital: code appears in 5-30 seconds
  - For non-instant: "Your reward is being prepared. We'll notify you!"

Step 5: Fulfillment
  - Digital: code/link displayed in-app + sent to email
  - Physical: tracking information provided when available
  - Charity: confirmation of donation with receipt

Step 6: Confirmation
  - In-app notification: "Your reward is ready!"
  - Reward appears in "My Rewards" history
  - Rating prompt: "How was this reward?" (1-5 stars)
```

### 5.2 Fulfillment States

```
State Machine:

  PENDING → PROCESSING → FULFILLED → CONFIRMED
              ↓                         ↓
           FAILED                   DISPUTED
              ↓                         ↓
           REFUNDED               RESOLVED/REFUNDED

States:
  PENDING:     Coins deducted, order created, not yet sent to partner
  PROCESSING:  Order sent to partner API, awaiting fulfillment
  FULFILLED:   Partner confirmed fulfillment (code delivered / item shipped)
  CONFIRMED:   Player acknowledged receipt (or auto-confirmed after 14 days)
  FAILED:      Partner couldn't fulfill (out of stock, API error)
  REFUNDED:    Coins returned to player after failure
  DISPUTED:    Player reports issue with received reward
  RESOLVED:    Dispute resolved (re-sent reward or refunded)

Auto-transitions:
  PENDING → PROCESSING: within 5 minutes (batch processing every 5 min)
  FULFILLED → CONFIRMED: after 14 days if player doesn't dispute
  FAILED → REFUNDED: automatic, within 1 hour
```

### 5.3 Error Handling

| Error | Response | User Message |
|---|---|---|
| Insufficient coins | Redemption blocked | "You need X more coins" |
| Partner API timeout (< 30s) | Retry 3 times | "Processing..." (transparent to user) |
| Partner API timeout (> 30s) | Order queued for manual processing | "Your reward is being prepared" |
| Partner API error (500) | Retry 3 times, then manual queue | "Your reward is being prepared" |
| Partner API: item unavailable | Immediate rejection, coins refunded | "This reward is temporarily unavailable" |
| Duplicate request | Idempotent — return original | Original confirmation shown |
| Invalid delivery address | Reject before coins deducted | "Please check your shipping address" |
| Player account suspended during processing | Hold fulfillment | No notification until resolved |
| Partner fulfills wrong item | Dispute flow → manual resolution | "Report an issue" button |

---

## 6. Anti-Abuse

### 6.1 Rate Limiting

```
Per player per 24-hour rolling window:
  - Max redemptions: 5
  - Max coin spend: 5,000 coins
  - Max same-partner redemptions: 3
  - Max same-item redemptions: 2

Per player per 30-day rolling window:
  - Max redemptions: 20
  - Max coin spend: 20,000 coins
  - Max same-partner redemptions: 10

Exceeding limits:
  - Soft block: "You've reached the redemption limit. Try again tomorrow/next month."
  - No permanent penalty — just time-based cooldown.
```

### 6.2 Velocity Checks

```
Suspicious patterns detected in real-time:

1. Rapid redemption after large coin purchase:
   - IAP of 5,000+ coins → redemption within 1 hour
   - Flag: possible stolen payment method
   - Action: hold redemption for 24 hours, send email verification
   
2. Unusual redemption pattern:
   - Player normally redeems 1-2 items/month → suddenly 5 in one day
   - Flag: possible account compromise
   - Action: require password re-authentication
   
3. Gift card hoarding:
   - Redeeming 3+ of same gift card (e.g., $10 Amazon × 3)
   - Flag: possible reselling
   - Action: require additional verification (email OTP) for 3rd+ same-partner redemption in a day
   
4. New account burst:
   - Account < 7 days old attempts redemption
   - Block: "Redemptions available after 7 days of gameplay"
   - Exception: classroom accounts with teacher approval
```

### 6.3 Suspicious Pattern Detection

```
Server-side analytics (batch, daily):

1. Coin accumulation anomaly:
   expected_coins_per_day(level) = {
     1: 15, 2: 25, 3: 35, 4: 45, 5: 55, 6: 70, 7: 85, 8: 100
   }
   
   If actual > expected × 2.5 for 3+ consecutive days: FLAG
   
2. XP/Coin ratio anomaly:
   Normal ratio: ~3:1 (XP:Coins) based on earning tables
   If ratio < 1:1 for extended period: possible exploit (earning coins without XP)
   FLAG for investigation

3. IAP fraud detection:
   - Chargebacks on IAP → immediate coin deduction
   - If coin balance < chargeback amount → negative coin balance (blocks redemptions)
   - 3+ chargebacks → account suspended
   
4. Multi-account detection:
   - Same device ID, different accounts, coins flowing to redemptions
   - Flag: possible farming
   - Action: link accounts for review, pause redemptions on newer accounts
```

---

## 7. Economy Balancing

### 7.1 Expected Earn Rates Per Level

```
Assumptions: Normal difficulty, baseline persona, no streak bonus, ~5 min/day play

Level 1 (2 game months):
  Decision cards: ~1/day × 60 days × avg 8 XP = 480 XP, × avg 3 coins = 180 coins
  Bills on time: ~4 bills/month × 2 months × 10 XP = 80 XP
  Savings deposits: ~2/week × 8 weeks × 5 XP = 80 XP
  Daily login: 60 × 2 coins = 120 coins
  Budget adherence: 2 months × 30 XP = 60 XP
  Day advances: 60 × 3 XP = 180 XP
  Tutorial: ~8 steps × 15 XP = 120 XP
  Level completion: 250 XP, 100 coins
  
  TOTAL L1: ~1,250 XP, ~450 coins
  Time: ~2 weeks real time

Level 4 (4 game months):
  Decision cards: ~2.5/day × 120 days × avg 12 XP = 3,600 XP, × avg 5 coins = 1,500 coins
  Bills on time: ~6 bills/month × 4 months × 10 XP = 240 XP
  Credit card full pay: 4 × 20 XP = 80 XP
  Savings deposits: ~3/week × 16 weeks × 5 XP = 240 XP
  Investment trades: ~4/month × 4 × 10 XP = 160 XP
  Daily login: 120 × 2.5 coins = 300 coins
  Budget adherence: 4 × 40 XP = 160 XP
  Day advances: 120 × 3 XP = 360 XP
  Weekly challenges: ~16 × 75 XP = 1,200 XP, × 35 coins = 560 coins
  Level completion: 1,000 XP, 400 coins
  Badges: ~4 × avg 20 coins = 80 coins
  
  TOTAL L4: ~7,040 XP, ~2,840 coins
  Time: ~3 weeks real time

Level 8 (6 game months):
  Decision cards: ~3.5/day × 180 days × avg 15 XP = 9,450 XP, × avg 7 coins = 4,410 coins
  All monthly activities: ~1,500 XP, ~600 coins
  Challenges: ~1,800 XP, ~900 coins
  Investment returns/activities: ~300 XP
  Day advances: 540 XP
  Level completion: 2,000 XP, 800 coins
  Badges: ~200 coins
  Streak bonus (1.3× avg): multiplied into above
  
  TOTAL L8: ~20,000 XP, ~7,000 coins
  Time: ~5 weeks real time
```

### 7.2 Lifetime Earn Projection

```
Complete playthrough (Levels 1-8, Normal difficulty, good but not perfect play):
  Total XP: ~73,000-90,000
  Total Coins: ~15,000-25,000
  
  With streak bonus (avg 1.2× after first month): +20% = 18,000-30,000 coins
  With IAP: unlimited additional
  
Expected redemption purchasing power:
  Low earner: ~$150-250 in rewards over full playthrough (~6 months)
  High earner: ~$250-300 in rewards (optimal play + streak)
  
Revenue note: at coin_value ≈ $0.01, a full playthrough's free coin earnings
represent ~$200 in reward value. This is subsidized by:
  1. IAP purchases from players who want more coins
  2. Partner rev-share (we buy rewards at wholesale)
  3. White-label license fees
  4. Sponsored challenges
```

### 7.3 Sink/Faucet Analysis

```
FAUCETS (coin sources):
  Game actions (decision cards, bills, challenges): ~70% of coins
  Level-up bonuses: ~10%
  Badges: ~5%
  Streaks/milestones: ~5%
  IAP: ~10% (for paying players)

SINKS (coin drains):
  Reward redemptions: ~60% of coins spent
  Cosmetics (avatar, home): ~15%
  Hints on decision cards: ~10%
  Streak shields/insurance: ~5%
  Competitive mode entry: ~5%
  Skip waiting periods: ~5%

Balance target:
  Free player: earns enough for 1-2 meaningful rewards per month
  Active free player: 2-3 rewards per month
  Paying player: 5+ rewards per month
  
Inflation prevention:
  - Coin earning rates fixed per level (don't scale infinitely)
  - Endless mode (post-L8) has reduced coin earning (0.7× multiplier)
  - New reward sinks introduced seasonally
  - Limited-time cosmetics keep spending active
```

---

## 8. Seasonal Events & Challenges

### 8.1 Event Calendar

```
Recurring annual events:

January: "New Year, New Budget"
  - Theme: Fresh start, financial planning
  - Challenge: Create and maintain a budget for the month (≥ 85% adherence)
  - Duration: full month
  - Rewards: 200 coins + "Fresh Start" seasonal badge
  - Special cards: New Year's resolution decisions

February: "Love & Money"
  - Theme: Balancing relationships and finances
  - Challenge: Navigate 10 social spending cards without overspending
  - Duration: 14 days (Feb 1-14)
  - Rewards: 150 coins + "Smart Valentine" badge
  - Special cards: Valentine's Day spending, partner financial conversations

April: "Tax Season Sprint"
  - Theme: Tax preparation and understanding
  - Challenge: Complete tax filing event with 0 errors
  - Duration: 15 days (April 1-15)
  - Rewards: 300 coins + "Tax Wizard" badge
  - Available: Level 5+ only

June: "Summer Savings Challenge"
  - Theme: Resisting summer spending temptation
  - Challenge: Save 15% of income for 4 consecutive game weeks
  - Duration: full month
  - Rewards: 250 coins + "Summer Saver" badge

September: "Back to School Finance"
  - Theme: Education and career investment
  - Challenge: Complete 5 education/career decision cards with smart choices
  - Duration: 3 weeks
  - Rewards: 200 coins + "Lifelong Learner" badge

November: "Spending Awareness Month"
  - Theme: Mindful consumption
  - Challenge: Keep total spending 20% below budget
  - Duration: full month
  - Rewards: 300 coins + "Mindful Spender" badge
  - Special cards: Black Friday temptation cards

December: "Year in Review"
  - Theme: Reflection and celebration
  - Challenge: Complete annual financial review (interactive summary)
  - Duration: full month
  - Rewards: 500 coins + "Year Champion" badge
  - Special: animated year-in-review video shareable on social media
```

### 8.2 Limited-Time Challenge Structure

```json
{
  "event_id": "EVT-2026-JAN",
  "name": "New Year, New Budget",
  "start_date": "2026-01-01",
  "end_date": "2026-01-31",
  "description": "Start the year with a perfect budget...",
  "challenge": {
    "type": "budget_adherence",
    "target": 85,
    "duration_months": 1,
    "measurement": "percentage"
  },
  "rewards": {
    "completion": { "coins": 200, "badge_id": "BDG-SEASONAL-JAN26" },
    "leaderboard_top_10": { "coins": 100, "badge_id": null },
    "participation": { "coins": 25, "badge_id": null }
  },
  "special_cards": ["DC-SEASONAL-JAN-001", "DC-SEASONAL-JAN-002"],
  "eligible_levels": [1, 2, 3, 4, 5, 6, 7, 8]
}
```

### 8.3 Partner-Sponsored Events

```
Partners can sponsor seasonal events:

Example: "Starbucks Coffee Budget Challenge"
  - Sponsor: Starbucks
  - Challenge: Track your coffee spending for 2 weeks
  - Rewards: Starbucks gift card (from sponsor inventory)
  - Branding: Starbucks logo on challenge screen, branded decision cards
  
Sponsorship levels:
  Bronze ($5,000): Logo on challenge screen, 100 rewards
  Silver ($15,000): Branded challenge, 500 rewards, push notification mention
  Gold ($30,000): Full custom event, 2,000 rewards, featured in-app placement for 30 days
```

---

## 9. Referral Rewards

### 9.1 Referral Mechanics

```
Referral code: unique per player (format: ML-[username]-[4 random chars])
  Example: ML-ALEX-7K2F

Referral process:
  1. Referrer shares code via: in-app share sheet, SMS, social media, copy to clipboard
  2. New user enters code during registration (or within first 7 days)
  3. Referral tracked:
     - referee_id linked to referrer_id
     - Referral status: PENDING until referee reaches Level 2
     
Referral validation:
  - Referee must reach Level 2 (prevents throwaway signups)
  - Referee must have unique device ID (prevents self-referral)
  - Referee's email must be different from referrer's (basic check)
  - Referee must play for at least 7 real days (prevents quick-farm)
```

### 9.2 Referral Rewards

```
When referral is CONFIRMED (referee reaches Level 2):

Referrer receives:
  - 200 coins
  - 100 XP
  - Referral count incremented (for badges)
  - Push notification: "[Friend's name] just started their MoneyLife journey!"

Referee receives:
  - 100 coins (welcome bonus)
  - 50 XP
  - "Referred Friend" badge
  - Notification: "Welcome bonus from [referrer's name]!"

Limits:
  - Max 10 successful referrals per player (2,000 coins total possible)
  - Max 3 referrals per 30-day period (prevents spam)
  - After 10: referrer still sees referral count but no more coin rewards

Referral milestones:
  3 referrals: "Social Starter" badge (Rare, 25 coins)
  5 referrals: "Community Builder" badge (Epic, 50 coins)
  10 referrals: "MoneyLife Ambassador" badge (Legendary, 100 coins)
```

### 9.3 Anti-Abuse for Referrals

```
Automated checks:
  1. Device fingerprint: same device cannot be referrer and referee
  2. IP address: same IP for referrer and referee → flag (not block, could be household)
  3. Email pattern: similar emails (john1@, john2@) → flag
  4. Rapid referral: 3+ referrals from different devices in same hour → flag
  5. Referee behavior: if referee reaches L2 and immediately stops playing → flag

Manual review for flagged referrals. If abuse confirmed:
  - Referral rewards revoked (coins deducted)
  - Referrer warned (first offense)
  - Referrer banned from referral program (second offense)
  - Account suspended (third offense / egregious abuse)
```

---

## 10. Achievement Tiers

### 10.1 Tier Progression System

Players progress through achievement tiers that represent their overall financial mastery. This is separate from game levels.

```
Tier 1: Financial Rookie
  Requirement: 0-999 lifetime XP
  Title shown on profile
  Badge color: Gray
  Perks: none

Tier 2: Money Aware
  Requirement: 1,000-4,999 lifetime XP
  Badge color: Bronze
  Perks: Access to basic avatar customizations

Tier 3: Budget Detective
  Requirement: 5,000-14,999 lifetime XP
  Badge color: Silver
  Perks: Access to weekly challenge participation

Tier 4: Savings Champion
  Requirement: 15,000-29,999 lifetime XP
  Badge color: Gold
  Perks: 5% bonus coins on all earnings

Tier 5: Investment Strategist
  Requirement: 30,000-54,999 lifetime XP
  Badge color: Platinum
  Perks: Access to premium challenges, 10% bonus coins

Tier 6: Wealth Builder
  Requirement: 55,000-84,999 lifetime XP
  Badge color: Diamond
  Perks: Exclusive cosmetics, 15% bonus coins

Tier 7: Financial Advisor
  Requirement: 85,000+ lifetime XP
  Badge color: Legendary (animated)
  Perks: "Mentor" status (can be matched with new players for mentoring), 20% bonus coins, exclusive profile frame
```

### 10.2 Mentor System (Tier 7+)

```
Financial Advisors can opt into mentoring:
  - Matched with 1-3 "rookie" players (Tier 1-2)
  - Receive their mentees' weekly summaries
  - Can send 1 tip per week (from pre-approved tip library)
  - If mentee reaches Tier 3: mentor receives 100 coins + "Great Mentor" badge
  
Mentoring is entirely optional and uses only pre-approved messages (no free-text to prevent abuse).
```

---

## 11. Classroom & Team Rewards

### 11.1 Classroom Challenge Rewards

```
Teacher creates challenge → sets reward structure:

Default reward tiers:
  1st place: 200 coins + "Class Champion" badge
  2nd place: 150 coins
  3rd place: 100 coins
  Top 25%: 50 coins + "Honor Student" badge
  Participation: 25 coins

Teacher can customize:
  - Increase/decrease coin rewards (within 0.5×-2× of default)
  - Add custom badge names
  - Enable/disable competitive rankings
  - Set collaborative goal (all students contribute to shared target)
```

### 11.2 Team/Group Challenges

```
Team structure:
  - Teacher assigns teams (2-6 players per team)
  - Or players self-select teams (with teacher approval)
  
Team scoring:
  team_score = average(member_scores)
  OR
  team_score = sum(member_scores) — for collaborative challenges
  
  Configurable by teacher.

Team rewards:
  - Distributed equally to all team members
  - Winning team: 100 coins per member
  - Bonus for team with highest participation rate: 50 coins per member
```

### 11.3 Class Leaderboard

```
Display options (teacher-controlled):
  - Full ranking (1st, 2nd, 3rd... last)
  - Tier-based (Gold/Silver/Bronze tiers only, no exact ranking)
  - Hidden (teacher sees, students don't)
  
Leaderboard metrics:
  - Net worth (default)
  - Budget adherence
  - CHI score
  - XP earned (this challenge)
  - Custom metric (teacher selects)

Privacy:
  - Student names shown as first name + last initial
  - Teacher can use anonymous IDs instead (Student 1, Student 2...)
  - Opt-out: student can request to be hidden from peer leaderboard (still visible to teacher)
```

---

## 12. White-Label Reward Customization

### 12.1 Bank Partner Customization Options

```
What partners CAN customize:

1. Reward Catalog:
   - Add bank-specific rewards (e.g., "Open a real savings account → bonus")
   - Add partner-exclusive rewards (bank's retail partners)
   - Remove categories (e.g., remove competitor bank offers)
   - Set custom coin costs for their rewards
   - Feature their rewards at the top of catalog
   
2. Branding:
   - Custom coin name (e.g., "StarPoints" instead of "Coins")
   - Custom coin icon
   - Custom reward section header/footer
   - Bank logo on reward screens
   
3. Earn Rates:
   - Cannot change base earn rates (game balance integrity)
   - CAN add bank-specific bonus earning:
     "Link your real [Bank] account → 500 bonus [CoinName]"
     "Complete a real savings goal at [Bank] → 200 bonus [CoinName]"
   - Bonus earning capped at 2× base earn rate to prevent imbalance
   
4. Exclusive Challenges:
   - Bank-branded monthly challenges
   - Rewards funded by bank
   - Participants must be in bank's tenant

What partners CANNOT customize:

1. Base XP/coin earning rates per game action
2. Badge unlock conditions
3. Streak mechanics
4. Achievement tier thresholds
5. Anti-abuse rules
6. Redemption rate limits
```

### 12.2 Partner Dashboard

```
Bank partners access a web dashboard with:

1. User Analytics:
   - Total active users
   - DAU/MAU/WAU
   - Average session length
   - Level distribution
   - Retention cohorts (D1, D7, D30, D90)
   
2. Reward Analytics:
   - Total redemptions (count and value)
   - Most popular rewards
   - Redemption fulfillment rate
   - Average coins per user per month
   
3. Financial Literacy Metrics:
   - Average CHI score progression
   - Budget adherence trends
   - Most common financial mistakes (decision card patterns)
   - Learning outcome tracking (which concepts are understood)
   
4. Catalog Management:
   - Add/remove rewards
   - Adjust coin pricing
   - View inventory levels
   - Fulfillment status monitoring
   
5. Challenge Management:
   - Create/edit bank-specific challenges
   - View participation and completion rates
   - Export challenge results
```

### 12.3 Reward Catalog API for Partners

```
Partners can manage catalog programmatically:

POST /api/v1/partner/catalog/items
  Add new reward item
  Body: { name, description, image_url, coin_cost, stock, category, fulfillment_type }

PUT /api/v1/partner/catalog/items/{item_id}
  Update reward item
  
DELETE /api/v1/partner/catalog/items/{item_id}
  Remove reward item (soft delete — pending redemptions still fulfilled)

GET /api/v1/partner/catalog/items
  List all partner's reward items with stock levels

POST /api/v1/partner/catalog/items/{item_id}/restock
  Update stock level
  Body: { additional_stock: 100 }

GET /api/v1/partner/analytics/redemptions
  Redemption analytics
  Query params: start_date, end_date, item_id
  Response: { total_redemptions, total_coin_value, by_item: [...] }
```

---

## Appendix: Reward Economy Formulas

```
# Coins per hour of play (target)
target_coins_per_hour = 60 (Normal difficulty, active play)

# Dollar value per coin
coin_to_usd = 0.01

# Expected dollar value per hour of play
expected_value_per_hour = 60 × 0.01 = $0.60/hour

# This is intentionally low — game value is in education, not rewards.
# Rewards are a bonus, not the primary incentive.

# Break-even analysis for free player
cost_to_serve_per_user_month = $0.50 (server, CDN, support)
revenue_needed_per_user_month = $0.50 minimum
revenue_sources:
  - Ads (non-premium): ~$0.30/month
  - Data insights (anonymized, aggregated): ~$0.10/month
  - Conversion to premium: ~$0.15/month (5% convert × $2.99)
  - IAP: ~$0.20/month (average across all users including non-payers)
  Total: ~$0.75/month — sustainable

# For white-label (no ads):
revenue = license fee / active users
  Target: $2-5 per active user per month from bank partner
  Covers: server costs + reward funding + margin
```

---

*End of Rewards System Specification*
