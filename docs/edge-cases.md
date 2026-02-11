# MoneyLife — Edge Cases & Error Handling

> Version 1.0 · February 2026
> Exhaustive catalog of edge cases, boundary conditions, and resolution strategies.

---

## Table of Contents

1. [Balance & Account Edge Cases](#1-balance--account-edge-cases)
2. [Bankruptcy & Game-Over Scenarios](#2-bankruptcy--game-over-scenarios)
3. [Currency Edge Cases](#3-currency-edge-cases)
4. [Time Manipulation & Abuse](#4-time-manipulation--abuse)
5. [Offline Mode & Sync Conflicts](#5-offline-mode--sync-conflicts)
6. [Anti-Cheat & Server Validation](#6-anti-cheat--server-validation)
7. [Age-Gating Edge Cases](#7-age-gating-edge-cases)
8. [Reward Redemption Edge Cases](#8-reward-redemption-edge-cases)
9. [Account Limits](#9-account-limits)
10. [Concurrent Device Play](#10-concurrent-device-play)
11. [Region & Currency Migration](#11-region--currency-migration)
12. [Household & Family Edge Cases](#12-household--family-edge-cases)
13. [Insurance Edge Cases](#13-insurance-edge-cases)
14. [Investment Edge Cases](#14-investment-edge-cases)
15. [Subscription & Billing Edge Cases](#15-subscription--billing-edge-cases)
16. [Leaderboard Manipulation](#16-leaderboard-manipulation)
17. [Data Privacy & Deletion](#17-data-privacy--deletion)
18. [Network & Transaction Integrity](#18-network--transaction-integrity)
19. [Platform-Specific Edge Cases](#19-platform-specific-edge-cases)
20. [White-Label Partner Edge Cases](#20-white-label-partner-edge-cases)

---

## 1. Balance & Account Edge Cases

### 1.1 Negative Checking Balance

**Scenario:** Player's checking balance goes below zero due to an auto-deducted bill.

**Rules:**
```
IF checking_balance < 0:
  IF player has overdraft protection enabled (Level 3+):
    IF |checking_balance| <= OVERDRAFT_LIMIT (500 CU):
      → Balance goes negative. Overdraft fee (35 CU) charged ONCE per overdraft event.
      → Daily interest accrues: |balance| × (0.18 / 365)
      → Grace period: 1 day (Easy: 3 days) to restore positive balance before fee applies.
      → If not restored within grace period: fee charged, interest starts.
      → If not restored within 30 days: overdraft access revoked, account flagged.
    ELSE (overdraft exceeded):
      → Transaction that would exceed overdraft limit is DECLINED.
      → Bill is marked "MISSED" → late fee + CHI penalty applied.
  ELSE (no overdraft):
    → Any transaction that would make balance < 0 is DECLINED.
    → Bill is marked "MISSED."
    → Exception: if balance is exactly 0 and bill amount is ≤ 5 CU, allow negative (micro-overdraft courtesy).
```

**Edge case within edge case:** Multiple bills due on the same day when balance covers some but not all.

**Resolution:** Bills are processed in this priority order:
1. Mortgage/Rent (housing)
2. Loan payments (secured first: auto, then unsecured)
3. Insurance premiums
4. Utilities
5. Credit card minimum payment
6. Subscriptions
7. Other

Bills are processed sequentially. Once balance hits 0 (or overdraft limit), remaining bills are MISSED.

### 1.2 Exactly Zero Balance

**Scenario:** Player has exactly 0.00 in checking.

**Rules:**
- Player can still play decision cards that have a 0-cost option.
- Decision cards with only paid options: player must choose "decline" (always available as hidden option for exactly-zero-balance state).
- "Decline" option: 0 cost, -5 happiness, +2 XP ("learning from limitations").
- Bills due with zero balance: MISSED (see 1.1).

### 1.3 Balance at Maximum

**Scenario:** Player's checking or savings reaches 1,000,000 CU cap.

**Rules:**
- Incoming deposits that would exceed cap: excess is REJECTED.
- Income exceeding cap: deposited up to cap, remainder shown as "unclaimed income."
- Player receives alert: "Account at maximum. Consider investing or opening additional accounts."
- Interest on savings at cap: still calculated but not credited if it would exceed cap.
- This creates a natural incentive to invest or diversify.

### 1.4 Rounding Accumulation

**Scenario:** Repeated operations create rounding drift (e.g., 1/3 split of a bill).

**Rules:**
- All internal calculations use 6 decimal places.
- Display rounds to currency's decimal places (2 for most, 0 for JPY/IDR).
- Rounding only occurs at DISPLAY and TRANSACTION FINALIZATION.
- Banker's rounding (round half to even) used for all financial calculations.
- Monthly reconciliation: if internal balance differs from displayed balance by > 0.01 CU, snap internal to displayed + smallest representable unit.
- Audit log tracks all rounding adjustments.

### 1.5 Simultaneous Deposits and Withdrawals

**Scenario:** Salary deposits and bills deduct on the same game day (month-end).

**Resolution:** Processing order for same-day transactions:
1. ALL deposits processed first (salary, interest, dividends, refunds)
2. Then ALL withdrawals processed (bills, loan payments, in priority order from 1.1)
3. This ensures maximum bill coverage — player-friendly behavior.

### 1.6 Transfer Between Own Accounts

**Scenario:** Player tries to transfer more than available from savings to checking.

**Rules:**
- Transfer amount capped at available balance (no negative savings).
- If savings has monthly fee exemption minimum (100 CU) and transfer would drop below: warning shown but allowed.
- Savings withdrawal count incremented. If > 6/month: excess withdrawal fee (10 CU) deducted from savings.
- Transfer is instant (same game day). No delay.

---

## 2. Bankruptcy & Game-Over Scenarios

### 2.1 Bankruptcy Trigger Conditions

```
Bankruptcy evaluates on MONTH-END processing:

trigger = (total_debt > 5.0 × annual_income)
          AND (consecutive_months_missed_all_minimums >= 3)

total_debt = sum of ALL outstanding balances:
  credit_card_balance
  + student_loan_remaining
  + auto_loan_remaining
  + mortgage_remaining
  + personal_loan_remaining
  + bnpl_remaining
  + overdraft_balance

annual_income = monthly_income × 12

"missed_all_minimums" = player failed to make minimum payment on ANY debt account for the month
```

### 2.2 Bankruptcy Process

```
When triggered:
1. Bankruptcy declaration event shown (narrative + animation)
2. Unsecured debt discharged:
   - Credit card balance → 0
   - Personal loan balance → 0
   - BNPL remaining → 0
   - Student loans → REDUCED by 50% (not fully discharged, mirrors real life)
3. Secured debt:
   - Mortgage: if current, keeps home. If delinquent, foreclosure.
   - Auto loan: if current, keeps car. If delinquent, repossession.
4. CHI set to 350
5. Credit access restricted:
   - Credit card CLOSED. Cannot open new for 12 game months.
   - Cannot apply for any new loans for 12 game months.
   - Existing secured loans continue.
6. Investment accounts FROZEN for 6 game months (cannot buy/sell, but values still change)
7. "Fresh Start" narrative plays
8. Player continues at current level with restricted mechanics
9. Bankruptcy flag on profile for 24 game months (affects leaderboard eligibility)
```

### 2.3 Post-Bankruptcy Recovery Path

```
Month 1-6 post-bankruptcy:
  - Only checking + savings available
  - Decision cards focus on rebuilding basics
  - Guided "recovery plan" with specific milestones
  - XP bonus for recovery actions: 1.5× multiplier

Month 7-12:
  - Secured credit card offered (deposit-backed, 200 CU limit)
  - Investment accounts unfrozen
  - Small personal loan available (max 500 CU, high APR)

Month 13-24:
  - Regular credit card available (low limit)
  - Normal loan access at higher rates
  - CHI rebuilding normally

Month 25+:
  - Bankruptcy flag removed
  - Full financial access restored
  - CHI continues to recover based on behavior
```

### 2.4 Multiple Bankruptcies

**Scenario:** Player goes bankrupt a second time.

**Rules:**
- Second bankruptcy allowed after 24 game months from first.
- Second bankruptcy is harsher:
  - Student loans NOT reduced (0% discharge)
  - Recovery period: 18 months (vs 12)
  - CHI set to 300 (minimum)
  - XP recovery bonus only 1.2× (vs 1.5×)
- Third bankruptcy: same as second. No further escalation.
- Leaderboard: permanently flagged as "multi-bankruptcy" (but can still play and earn rewards).

### 2.5 Bankruptcy During Classroom Mode

**Scenario:** Student goes bankrupt in a classroom challenge.

**Rules:**
- Teacher is notified.
- Teacher can choose:
  a) Allow bankruptcy process (educational)
  b) Reset student to level start with 75% of starting cash (compassionate reset)
  c) Pause student's game for teacher intervention / discussion
- Default if teacher doesn't choose within 24h: option (a).

### 2.6 Game Restart Options

| Option | Description | Preserves |
|---|---|---|
| Restart Level | Restart current level from beginning | XP from prior levels, all badges, coins |
| Restart Persona | Restart current persona from Level 1 | Badges, coins, premium purchases |
| New Game | Start completely fresh | Premium purchases only |
| Continue (after bankruptcy) | Keep playing with restrictions | Everything (but restricted) |

---

## 3. Currency Edge Cases

### 3.1 Hyperinflation Scenarios

**Scenario:** Player's selected currency has extreme real-world inflation (e.g., Argentine Peso, Turkish Lira).

**Rules:**
- PPP factors are updated quarterly from World Bank data via server config push.
- In-game inflation is SEPARATE from real-world inflation. It uses the fixed rates per difficulty (1.5%/3%/5% annual).
- PPP factor only affects initial value scaling at game creation.
- If a player creates a game with ARS (Argentine Peso) and PPP factor is 800, all values scale accordingly.
- The game does NOT re-scale values mid-game when PPP factors update. The factor is locked at game creation.

**Extreme case:** If a currency's PPP factor exceeds 10,000 (e.g., Venezuelan Bolívar):
- Display switches to abbreviated notation: "1.5M VES" instead of "1,500,000 VES"
- Internal calculations unchanged (still in CU)
- Decision card amounts displayed in local currency with abbreviated notation

### 3.2 Currency Conversion Rounding

**Scenario:** Internal CU value converts to a display value with problematic rounding.

```
Example: 
  Internal: 33.333333 CU
  Display (JPY, 0 decimals): 33.333333 × 135 = 4,500.0 → ¥4,500
  Display (USD, 2 decimals): $33.33

Rule: All rounding uses ROUND_HALF_EVEN (banker's rounding).
  0.5 → 0 (rounds to even)
  1.5 → 2 (rounds to even)
  2.5 → 2 (rounds to even)
  3.5 → 4 (rounds to even)

For zero-decimal currencies (JPY, IDR, KRW):
  All transaction amounts are rounded to whole numbers before storage.
  Interest calculations still use fractional CU internally.
  Monthly interest < 0.5 CU equivalent → rounds to 0 → player sees no interest that month.
  Mitigation: accumulate fractional interest in a "pending_interest" field, credit when it reaches ≥ 1 display unit.
```

### 3.3 Unsupported Currency Selected

**Scenario:** Device locale suggests a currency not in our supported list.

**Rules:**
- Fallback to USD with a prompt: "Your local currency isn't supported yet. Playing in USD. We'll notify you when [currency] is available."
- Player can manually select any supported currency regardless of locale.
- Unsupported currency request logged for prioritization analytics.

### 3.4 Currency Symbol Collision

**Scenario:** Multiple currencies use "$" (USD, CAD, AUD, MXN).

**Rules:**
- Always display currency code alongside symbol when ambiguity possible.
- In-game: use the format "$ 1,000 USD" or "$ 1,350 CAD" in any context where multiple currencies could appear (leaderboards, cross-region comparisons).
- In single-player mode within player's own game: symbol only (player knows their currency).

---

## 4. Time Manipulation & Abuse

### 4.1 Device Clock Change

**Scenario:** Player changes device clock forward to trigger month-end processing, or backward to replay days.

**Prevention:**
```
1. Game clock is SERVER-SIDE. The device clock has zero influence on game date.
2. Day advancement requires an explicit API call: POST /api/v1/game/advance-day
3. Server validates:
   - Request authenticated with valid JWT
   - Previous day's cards were resolved (or auto-resolved as "skip")
   - Minimum 10 seconds between day advances (rate limit)
   - Maximum 50 day-advances per real-world hour (burst limit)
4. Server tracks real-world timestamp of each advance. If >50 advances in 1 hour:
   - Soft-lock: "Take a break! Your game will be ready in [remaining time]."
   - Flag for review if persistent (>3 occurrences/week)
```

### 4.2 Timezone Abuse for Streaks

**Scenario:** Player changes device timezone to avoid missing a streak day.

**Prevention:**
```
1. Streak day boundary is midnight in player's REGISTERED timezone.
2. Timezone is set during account creation based on IP geolocation.
3. Timezone can be changed ONCE per 30 days via settings.
4. When timezone changes:
   - If change would "gain" a day (e.g., UTC+2 → UTC-10): current day is NOT reset.
   - Streak continuity check: did the player perform an action within any calendar day
     in EITHER the old or new timezone? If yes, streak maintained.
5. Server uses its own clock (UTC) and converts. Player's device TZ is for display only.
6. Grace period for streaks: see rewards-system.md §3 (23-hour grace window)
```

### 4.3 Background App Abuse

**Scenario:** Player force-kills app to avoid consequences of a decision card choice.

**Prevention:**
```
1. Decision card selection is a TWO-PHASE COMMIT:
   Phase 1: Player selects option → client sends POST /api/v1/game/card-decision
   Phase 2: Server applies consequences, returns result → client displays
   
2. If app killed between Phase 1 and Phase 2:
   - Server has already committed the decision.
   - On next app open: server sends pending results.
   - Player sees "While you were away..." catch-up screen.

3. If app killed BEFORE Phase 1 (card displayed but no selection):
   - Card remains pending. On next open: card re-displayed.
   - Cards expire after 3 game days. If expired without selection:
     → "Time ran out" → worst financial outcome applied.
     → This prevents indefinite decision avoidance.
```

### 4.4 Fast Day-Advancing

**Scenario:** Player rapidly advances days without engaging with content to farm XP.

**Prevention:**
```
1. Unresolved decision cards BLOCK day advancement.
   - Must resolve all cards for the day before advancing.
   - "Skip all" button available but awards 0 XP, 0 coins, and triggers worst outcomes.
   
2. Auto-advance mode (if enabled) holds at pending card days.

3. XP from skipped cards: 0.
   XP from choosing "decline/skip" option: 2 XP (minimal).
   XP from engaging with card: 5-25 XP.
   
4. "Rapid advance" detection:
   - If player resolves 10+ cards in < 60 seconds real time:
     → XP multiplier reduced to 0.5× for that session.
     → "Slow down to learn more!" gentle nudge shown.
   - No permanent penalty — just reduced rewards for speed-running.
```

---

## 5. Offline Mode & Sync Conflicts

### 5.1 Offline Capability

MoneyLife supports limited offline play:

```
Offline-capable actions:
  - View all account balances (cached from last sync)
  - View budget dashboard
  - View decision cards that were pre-fetched
  - Make decision card selections (queued locally)
  - View game history and reports
  - View badges and achievements

NOT available offline:
  - Day advancement (requires server)
  - Account transfers (requires server validation)
  - Reward redemption (requires server)
  - Leaderboard viewing (requires server)
  - Multiplayer features (requires server)
```

### 5.2 Action Queuing

```
When offline, player actions are stored in a local queue:

queue_entry = {
  "action_type": "card_decision",
  "card_id": "DC-YA-FOOD-042",
  "selected_option": "B",
  "timestamp_local": "2026-02-11T15:30:00Z",
  "sequence_number": 47,  // monotonically increasing per device
  "device_id": "uuid-...",
  "checksum": "sha256(action_data + device_secret)"
}

Queue is stored in encrypted local storage.
Maximum queue size: 50 actions.
If queue is full: further actions blocked with "Please connect to sync" message.
```

### 5.3 Sync Protocol

```
On reconnection:

1. Client sends: POST /api/v1/sync
   Body: {
     "device_id": "...",
     "last_known_server_sequence": 1234,
     "queued_actions": [...],
     "client_state_hash": "sha256(...)"
   }

2. Server processes:
   a. Validates each queued action in sequence order
   b. For each action:
      - If valid and no conflict: APPLY, increment server sequence
      - If invalid (e.g., card no longer available): REJECT with reason
      - If conflict (see 5.4): resolve per conflict rules
   c. Returns:
      {
        "accepted_actions": [47, 48, 50],
        "rejected_actions": [
          {"sequence": 49, "reason": "card_expired", "resolution": "auto_skip"}
        ],
        "server_state": { ...full current game state... },
        "server_sequence": 1240
      }

3. Client replaces local state with server_state.
4. Client displays resolution summary if any actions were rejected.
```

### 5.4 Conflict Resolution

| Conflict Type | Resolution | User Notification |
|---|---|---|
| Card decision submitted offline but card expired on server | Auto-skip with worst outcome | "A decision timed out while you were offline" |
| Transfer submitted but insufficient funds (bill paid while offline) | Transfer rejected | "Transfer couldn't complete — insufficient funds after bills" |
| Same card decided on two devices | First-to-server wins; second rejected | "This decision was already made on another device" |
| Day advanced on one device while other device had queued card decisions | Queued decisions applied to the day they were meant for (if still valid) | Silent if successful; notification if rejected |
| Budget changed on two devices | Last-write-wins (server timestamp) | "Your budget was updated on another device" |
| Game state diverged significantly (>5 actions out of sync) | Full server state push; local actions discarded | "Your game has been synced with the latest data. Some offline actions couldn't be applied." |

### 5.5 Extended Offline (>7 Days)

```
If player is offline for >7 real-world days:
  - No game days advance (game is paused)
  - On reconnection: "Welcome back!" screen
  - Streak is broken (unless grace period covers it)
  - No catch-up mechanism — just resume where left off
  - Any time-sensitive events (bill due dates that passed) are processed as missed
  - Server applies consequences for missed bills during the offline period
```

---

## 6. Anti-Cheat & Server Validation

### 6.1 Server-Authoritative Principle

```
RULE: The client is NEVER trusted for game state mutations.

The client may:
  - Display data
  - Send user input (decisions, transfers, settings)
  - Cache state for offline viewing

The client may NOT:
  - Set balances
  - Set XP or coins
  - Set CHI score
  - Set level
  - Set time/date
  - Generate decision cards
  - Calculate interest or fees

Every mutation goes through the server. The client sends INTENT, the server sends RESULT.
```

### 6.2 Validation Rules

```python
# Server validates every incoming action

def validate_action(action, player_state):
    # 1. Authentication
    assert action.jwt is valid and not expired
    assert action.user_id matches jwt.sub
    
    # 2. Rate limiting
    assert action.timestamp - last_action.timestamp >= MIN_ACTION_INTERVAL (10s)
    assert actions_this_hour <= MAX_ACTIONS_PER_HOUR (100)
    assert actions_today <= MAX_ACTIONS_PER_DAY (500)
    
    # 3. Sequence validation
    assert action.sequence == expected_next_sequence
    
    # 4. State validity
    if action.type == "card_decision":
        assert action.card_id in player_state.pending_cards
        assert action.option_id in card.options
        assert card not expired
    
    if action.type == "transfer":
        assert action.amount > 0
        assert action.from_account in player.accounts
        assert action.to_account in player.accounts
        assert player.accounts[action.from_account].balance >= action.amount
        assert action.amount <= MAX_TRANSFER_AMOUNT (100,000 CU)
    
    if action.type == "advance_day":
        assert all pending cards resolved
        assert no unresolved month-end events
    
    # 5. Impossible state detection
    if player_state.xp > theoretical_max_xp_for_days_played:
        flag_for_review("impossible XP accumulation")
    
    if player_state.coins > theoretical_max_coins_for_level:
        flag_for_review("impossible coin accumulation")
    
    if player_state.CHI increased by > 50 in one month:
        flag_for_review("abnormal CHI increase")
```

### 6.3 Impossible Progression Detection

```
Server runs nightly batch analysis:

1. XP velocity check:
   max_xp_per_day = 25 (max card XP) × 4 (max cards) × 1.5 (max streak) × 1.3 (hard difficulty)
                   = 195 XP/day theoretical max
   
   If player earned > 195 XP in any single game day: FLAG
   
2. Coin velocity check:
   max_coins_per_day = 10 (max card coins) × 4 + 5 (daily set bonus) = 45 coins/day
   
   If player earned > 100 coins in any single game day (excluding level-up/badges): FLAG

3. Level speed check:
   minimum_days_per_level = XP_required / max_xp_per_day
   Level 1: 500 / 195 ≈ 3 days minimum
   
   If player completed Level 1 in < 3 game days: FLAG

4. Balance anomaly check:
   If net_worth increased by > 50% in one game month without identifiable source: FLAG

5. All FLAGs go to an admin review queue.
   Action levels:
   - 1 flag: logged, no action
   - 3 flags in 30 days: account under review, rewards redemption paused
   - 5 flags in 30 days: account suspended pending investigation
```

### 6.4 API Request Signing

```
All API requests include:
  Headers:
    Authorization: Bearer <JWT>
    X-Device-Id: <device UUID>
    X-Request-Signature: HMAC-SHA256(request_body, device_secret)
    X-Timestamp: <ISO 8601 UTC>

Server validates:
  - JWT not expired (max 1 hour validity)
  - Device ID matches a registered device for this user
  - Signature matches (proves request wasn't tampered)
  - Timestamp within 5 minutes of server time (prevents replay)
  - Nonce (from JWT jti) not reused (prevents replay)
```

### 6.5 Client Integrity

```
Mobile client includes:
  - Certificate pinning (prevents MITM proxy interception)
  - Root/jailbreak detection → warning (not block, to avoid false positives on legitimate devices)
  - App signature verification
  - Obfuscated game state (encrypted local storage with device-bound key)

If root/jailbreak detected:
  - Leaderboard submissions flagged
  - Reward redemption requires additional verification (email OTP)
  - Game still playable (don't lock out users)
```

---

## 7. Age-Gating Edge Cases

### 7.1 Minimum Age

```
Minimum age to play: 13 (COPPA compliance)
Minimum age for rewards redemption: 16 (or parental consent)
Minimum age for banking integration (Mirror Mode): 18

Age verified via:
  - Self-declared date of birth during registration
  - For rewards: parental email verification for 13-15
  - For banking: identity verification through partner
```

### 7.2 Minor Turns 18 Mid-Game

**Scenario:** Player registered at 16, now turns 18 during active gameplay.

**Rules:**
```
1. On the player's 18th birthday (real-world):
   - Server event triggers: "Happy Birthday! New features unlocked."
   - Banking integration (Mirror Mode) becomes available
   - Parental consent requirements removed
   - BNPL becomes available if it was age-gated in their region
   
2. Parental consent link:
   - If parent had linked account for oversight:
     → Parent receives notification: "Your child is now 18. Parental oversight will end in 30 days unless they choose to keep it."
     → After 30 days: parental access automatically revoked
     → Player can revoke immediately via settings
   
3. No game disruption — just feature expansion
```

### 7.3 Parental Consent Withdrawal

**Scenario:** Parent of a 14-year-old revokes consent for the child's account.

**Rules:**
```
1. Parent sends consent revocation (via parental dashboard or email)
2. Server processes within 48 hours:
   a. Player's reward redemption immediately suspended
   b. Player receives notification: "A parent has updated your account settings"
   c. Player can continue playing the game (gameplay not blocked)
   d. All personal data marked for review
   e. If full account deletion requested by parent:
      → Follow GDPR deletion process (see §17)
      → Game data anonymized and removed within 30 days
      → Unredeemed coins forfeited
3. If consent is re-granted: full account restored from anonymized backup (within 30-day window)
4. After 30 days: permanent deletion, no recovery
```

### 7.4 Age Verification Dispute

**Scenario:** User entered wrong birthdate (claims to be older/younger than actual).

**Rules:**
- If user contacts support claiming wrong age: verify with government ID (for 18+ features).
- If user is actually underage and entered 18+: retroactively apply age restrictions, preserve game data but restrict features.
- If user is actually overage and entered underage: remove restrictions, no penalty.
- No automated re-verification — only on user-initiated support request.

---

## 8. Reward Redemption Edge Cases

### 8.1 Out of Stock

**Scenario:** Player attempts to redeem coins for a partner gift card that's out of stock.

**Rules:**
```
1. Redemption attempt → server checks partner inventory API
2. If out of stock:
   a. Player notified: "This reward is temporarily unavailable"
   b. Coins NOT deducted
   c. Player offered alternatives:
      - Same partner, different denomination (if available)
      - Similar partner in same category
      - "Notify me when available" option (push notification)
   d. Reward marked as "out_of_stock" in catalog (refreshed hourly)
3. If stock depleted DURING redemption (race condition):
   a. Server uses optimistic locking on partner inventory
   b. If lock fails: coins refunded immediately
   c. Player notified: "Someone just got the last one! Coins refunded."
```

### 8.2 Partner Withdrawal

**Scenario:** A reward partner (e.g., Starbucks) terminates their partnership.

**Rules:**
```
1. Partner gives 30-day notice (per contract)
2. During 30-day wind-down:
   a. No NEW redemptions for this partner
   b. All PENDING redemptions (already submitted) are fulfilled
   c. Partner's rewards removed from catalog
   d. Players with "wishlist" items from this partner are notified
3. After 30 days:
   a. Partner fully removed from catalog
   b. Historical redemption data retained for records
   c. If partner had exclusive badges: badges remain earned but marked "legacy"
```

### 8.3 Partial Fulfillment

**Scenario:** Player redeems a physical reward but delivery fails.

**Rules:**
```
1. Physical rewards have fulfillment states:
   REDEEMED → PROCESSING → SHIPPED → DELIVERED → CONFIRMED
   
2. If delivery fails (returned/lost):
   a. State → DELIVERY_FAILED
   b. Player notified
   c. Options:
      - Re-ship to same or new address (1 retry)
      - Refund coins (full amount)
      - Exchange for digital reward of same value
   d. Player has 30 days to choose. Default: coin refund.
   
3. Coins deducted at REDEEMED state. If refunded: coins restored with transaction log entry.
```

### 8.4 Redemption During Account Suspension

**Scenario:** Player redeems coins, then account is suspended for anti-cheat investigation.

**Rules:**
```
1. If redemption already CONFIRMED/DELIVERED: no clawback (player keeps reward)
2. If redemption in PROCESSING/SHIPPED:
   a. Fulfillment paused
   b. If investigation clears player: fulfillment resumes
   c. If investigation finds cheating: fulfillment cancelled, coins voided
3. During suspension: no new redemptions allowed
```

### 8.5 Double Redemption (Idempotency)

**Scenario:** Network glitch causes client to send same redemption request twice.

**Rules:**
```
1. Each redemption request includes a client-generated idempotency key (UUID)
2. Server stores idempotency keys for 24 hours
3. Duplicate key → return original response, do NOT process twice
4. Coins deducted exactly once
```

### 8.6 Coin Balance Insufficient After Server Update

**Scenario:** Player sees 500 coins on client, attempts to redeem a 500-coin reward, but server shows 480 coins (sync delay).

**Rules:**
```
1. Server is source of truth for coin balance
2. Redemption request validated against server balance
3. If insufficient: rejection with current balance returned
4. Client refreshes display to server balance
5. Error message: "Your coin balance has been updated. You currently have 480 coins."
```

---

## 9. Account Limits

### 9.1 Maximum Accounts Per Player

| Account Type | Max Count | Notes |
|---|---|---|
| Checking | 1 | One primary checking |
| Savings | 3 | With up to 5 goal buckets each |
| Credit Card | 2 | Basic + rewards (Level 5+) |
| Student Loan | 1 | Fixed at persona start |
| Auto Loan | 1 | One at a time |
| Mortgage | 1 | One at a time |
| Personal Loan | 2 | Concurrent |
| BNPL Plan | 3 | Concurrent active plans |
| Investment (Brokerage) | 1 | With multiple asset holdings |
| Investment (Retirement) | 1 | With multiple asset holdings |
| Insurance Policies | 1 per type | Up to 6 types |

**Attempting to exceed:** "You've reached the maximum number of [account type] accounts."

### 9.2 Maximum Transactions Per Day

```
Per game day:
  Decision card actions: up to 4 (limited by card generation)
  Manual transfers: 10
  Investment trades: 5
  Budget adjustments: unlimited
  
Per real-world day:
  API calls (total): 1,000
  Day advances: 50
  Sync requests: 100

Exceeding limits:
  Game day limits: hard block with message
  API limits: HTTP 429 with Retry-After header
```

### 9.3 Loan Stacking Limits

```
Maximum total debt-to-income ratio for new loan approval: 
  Easy: 50%
  Normal: 43%
  Hard: 36%

DTI = total_monthly_debt_payments / monthly_income

If applying for new loan would push DTI above limit: DENIED
  "Your debt-to-income ratio is too high for this loan."
  Show current DTI and threshold.

Exception: student loans are not counted in DTI for auto loan/mortgage applications
  (mirrors real-world practice in many jurisdictions)
```

### 9.4 Savings Goal Limits

```
Per savings account: 5 goals maximum
Total across all savings accounts: 15 goals
Goal target minimum: 10 CU
Goal target maximum: 500,000 CU
Goal deadline: optional; if set, minimum 7 game days in future
```

---

## 10. Concurrent Device Play

### 10.1 Multi-Device Policy

```
Players can have the game installed on multiple devices.
Maximum registered devices: 5

Active session policy: ONE active session at a time.

When a new session starts on Device B while Device A is active:
1. Device A receives a push: "Session started on another device"
2. Device A's session becomes READ-ONLY (can view, cannot act)
3. Device B becomes the active session
4. No data loss — Device A had already synced (or queued for sync)

Session timeout: 30 minutes of inactivity → session released
```

### 10.2 Race Condition: Simultaneous Actions

**Scenario:** Both devices somehow send actions at the exact same time (e.g., network delay on session transfer).

**Resolution:**
```
1. Server uses optimistic concurrency control:
   - Each action includes the player's current state_version
   - Server compares action.state_version with current server state_version
   - If match: process action, increment state_version
   - If mismatch: reject action with "stale state" error, send current state

2. The first action to arrive at the server wins.
3. The second device receives a sync response with the updated state.
4. Conflict resolution is automatic; no user intervention needed.
```

### 10.3 Device Deregistration

```
Player can deregister devices in settings.
If 5 devices registered and player needs a 6th:
  - Prompted to remove one
  - Oldest inactive device suggested for removal
  - Removing a device: local data wiped on next app launch on that device
```

---

## 11. Region & Currency Migration

### 11.1 Currency Change Request

**Scenario:** Player moves countries and wants to change game currency.

**Rules:**
```
Currency change is NOT SUPPORTED mid-game because:
  1. All historical transactions are denominated in original CU factor
  2. Re-scaling would create confusing financial history
  3. Interest rates, loan terms, etc. were calibrated for original currency

Alternative options:
  a. Start a new game with new currency (preserving badges and coins)
  b. Continue current game in original currency (still playable anywhere)
  
If player chooses (a):
  - New game created with new currency
  - Badges copy over
  - Coins copy over
  - Old game preserved in "game history" (can resume anytime)
  - XP and level do NOT carry over (fresh progression)
  - Achievement: "World Traveler" badge for having games in 2+ currencies
```

### 11.2 Region-Specific Content

```
If player moves regions but keeps currency:
  - Decision cards adapt to new region (localized scenarios)
  - Change detected via: IP geolocation OR manual region setting
  - Transition is gradual: new region cards mixed in over 1 game month
  - No abrupt content change

If player's region has different financial regulations:
  - Example: BNPL restricted in EU but was available in US game
  - Existing BNPL plans continue until paid off
  - No new BNPL plans available
  - Notification: "Some features have changed based on your region"
```

### 11.3 Locale Change (Language Only)

```
Language can be changed anytime in settings.
  - Immediate effect on all UI text
  - Decision card text: use localized version if available, else fallback to English
  - Historical transactions: amounts stay same, labels translate
  - No gameplay impact
```

---

## 12. Household & Family Edge Cases

These apply primarily to the Parent persona.

### 12.1 Divorce Scenario

**Scenario:** Game event triggers a divorce in the Parent persona.

**Rules:**
```
Divorce event (triggered by narrative, not player choice):
  Probability: 5% per game year after Year 2 of Parent persona
  
Consequences:
  1. Partner income removed (if dual-income)
  2. Housing: Player chooses to keep home (refinance mortgage in own name) or sell
     - Keep: mortgage payment unchanged, but now sole income
     - Sell: split equity 50/50, must find new housing (rent)
  3. Childcare costs: may increase or decrease depending on custody
  4. Legal fees: one-time 2,000-5,000 CU expense
  5. Child support: if partner keeps primary custody, player pays 15% of income
     OR if player keeps custody, partner pays 10% of income
  6. New decision cards: "dating expenses," "solo parenting costs"
  7. Happiness: -20 immediately, recovery over 6 game months

Player agency: Divorce is always a NARRATIVE EVENT (random trigger), not player-chosen.
  The player chooses how to handle the financial aftermath.
```

### 12.2 New Baby

**Scenario:** Baby event in Parent persona (or Young Adult at Level 6+).

**Rules:**
```
Baby event options:
  A: "We're having a baby!" (accept)
  B: Not presented — this is a narrative event, not a choice

Financial impact:
  1. One-time costs: Hospital/delivery: 3,000-8,000 CU (depending on insurance)
  2. New recurring: Diapers/supplies: 100 CU/month, Childcare: 400-1,200 CU/month
  3. Possible income change: one parent may reduce hours (-30% income)
  4. New savings goal auto-created: "College fund" (target: 50,000 CU)
  5. New insurance need: life insurance becomes recommended
  6. Tax benefit: slight income boost (child tax credit simulation)
  
Happiness: +15 initially, ongoing +2/month ("joy of parenthood") but
  -5/month for first 6 months ("sleep deprivation adjustment")
```

### 12.3 Household Member Removal

**Scenario:** In Parent persona, child "grows up" and moves out.

**Rules:**
```
At certain game milestones (child turns 18):
  1. Childcare costs removed
  2. Groceries reduced by 20%
  3. Possible: child's college tuition event begins
  4. If college fund goal exists: check if target met
     - Met: celebratory event, +500 XP, "Good Parent" badge
     - Not met: student loan event for child (narrative guilt + decision card about helping)
  5. "Empty nest" narrative, happiness -5 temporary
```

### 12.4 Partner Job Loss

**Scenario:** In dual-income Parent household, partner loses job.

**Rules:**
```
Event: "Your partner was laid off."
Duration: 2-6 game months (random)
Impact:
  - Partner income → 0 immediately
  - After 1 month: unemployment benefits = 40% of partner's previous income
  - Decision cards: "Should partner take a lower-paying job?" / "Should partner go back to school?"
  - After 2-6 months: partner finds new job (salary may be different: ±20% of original)
  
Player has NO control over partner's job loss or re-employment timing.
Player DOES control financial decisions during the period.
```

---

## 13. Insurance Edge Cases

### 13.1 Claim on Lapsed Policy

**Scenario:** Player stopped paying insurance premium, policy lapsed, then emergency occurs.

**Rules:**
```
Policy lapse timeline:
  Month 1 missed: Grace period. Policy still active. Premium due becomes overdue.
  Month 2 missed: WARNING notification. Coverage continues.
  Month 3 missed (31+ days unpaid): Policy LAPSED. Coverage ends.

If emergency occurs during grace period (Month 1-2): claim honored, but overdue premiums deducted first.
If emergency occurs after lapse: NOT covered. Full cost to player.

Reinstatement:
  Within 60 days of lapse: pay all overdue premiums + 10% reinstatement fee.
  After 60 days: must apply for new policy (new premium calculation, possibly higher).
```

### 13.2 Simultaneous Claims

**Scenario:** Two insurable events occur in the same game month.

**Rules:**
```
Each claim is processed independently.
Both deductibles apply (one per incident).
Coverage limits are per-incident, not per-month.
Premium increase: +10% per claim (cumulative).
  Two claims in one month: +20% premium increase at next renewal.
```

### 13.3 Claim Dispute Event

**Scenario:** Insurance company (game narrative) disputes a claim.

**Rules:**
```
Probability: 10% per claim filed.
Decision card: "Your insurance company denied your claim for [reason]. What do you do?"
  A: Accept denial (0 cost, lose claim benefit)
  B: Appeal (50 CU filing fee, 70% success rate → if success, claim paid; if fail, lose fee)
  C: Hire a lawyer (200 CU, 95% success rate → if success, claim paid + legal fees refunded)
  
This teaches real-world insurance dispute navigation.
```

### 13.4 Insurance Fraud Attempt

**Scenario:** Game does not allow player to commit insurance fraud (no option exists), but edge case of filing claim without qualifying event.

**Rules:**
```
Server validates: claim requires a corresponding event_id in the game log.
No event = no claim option shown.
API endpoint POST /api/v1/insurance/claim requires valid event_reference.
If somehow submitted without event (API manipulation): rejected, flagged for anti-cheat.
```

---

## 14. Investment Edge Cases

### 14.1 Negative Returns Causing Zero Balance

**Scenario:** Market crash reduces investment to near-zero.

**Rules:**
```
Investment value minimum: 0.01 CU (never exactly zero from returns alone).
Monthly return clamped to [-30%, +30%].
If value drops below 1 CU: "Your portfolio is nearly depleted" notification.
Player can still hold (recovery possible) or sell (realize loss).
No margin calls (no leverage allowed in game).
```

### 14.2 Market Crash Simulation Bounds

```
Worst possible single month: -30% (hard clamp)
Worst possible quarter: -30% × 3 = -65.7% compound (theoretical max loss)
Worst possible year: -30% × 12 = -97.2% (extreme, very unlikely with normal distribution)

In practice, the random seed ensures most months are within ±10%.
Scripted crash events (Level 5/7/8) are pre-determined and override random returns.
```

### 14.3 Selling During Freeze (Post-Bankruptcy)

**Scenario:** Player tries to sell investments during the 6-month bankruptcy freeze.

**Rules:**
```
All buy/sell buttons disabled with explanation: "Investments frozen due to bankruptcy. Unfreezes in [X] months."
Portfolio values still update (player can see losses/gains, just can't act).
Dividends still accumulate but are held in escrow until unfreeze.
On unfreeze: accumulated dividends credited to checking.
```

### 14.4 Retirement Account Early Withdrawal

**Scenario:** Player withdraws from retirement account before "retirement age" in game.

**Rules:**
```
Early withdrawal penalty: 10% of withdrawal amount
Plus: withdrawal taxed as income (simplified: 20% tax)
Total cost of early withdrawal: ~30% of amount
  
Example: Withdraw 1,000 CU from retirement
  Penalty: 100 CU
  Tax: 200 CU
  Net received: 700 CU
  
Decision card when attempting: "Are you sure? Early withdrawal costs [X] in penalties."
Educational moment about retirement account rules.
```

### 14.5 Dividend Reinvestment (DRIP)

**Scenario:** Player enables DRIP but portfolio is at max allocation.

**Rules:**
```
DRIP toggle available per asset.
If enabled: dividends auto-purchase more of the same asset.
If disabled: dividends go to checking account.
No maximum portfolio value (unlike checking/savings caps).
Fractional shares supported (down to 0.001 units).
```

---

## 15. Subscription & Billing Edge Cases

### 15.1 Premium Subscription Cancellation Mid-Billing

**Scenario:** Player cancels MoneyLife Premium subscription mid-billing period.

**Rules:**
```
Premium features:
  - Ad-free experience
  - Extra decision card hints (3/day vs 1/day)
  - Exclusive cosmetics
  - Advanced analytics dashboard

Cancellation:
  - Premium features remain active until end of current billing period
  - Billing period = calendar month from subscription date
  - No partial refund for remaining days
  - In-game coins and XP earned during premium: RETAINED
  - Exclusive cosmetics: RETAINED (keep forever)
  - Analytics: reverts to basic view
  - Ads return at period end
  
Resubscription:
  - Immediate access to premium features
  - No loss of previous premium perks
```

### 15.2 Free Trial Abuse

**Scenario:** User creates multiple accounts for free trial.

**Prevention:**
```
Free trial limited by:
  - Device ID (one trial per device)
  - Apple ID / Google Play account (one trial per store account)
  - Payment method (one trial per card)

If duplicate detected:
  - Trial not offered
  - "You've already used your free trial" message
  - Direct to subscription page

Note: determined users can still circumvent (new device, new store account).
Mitigation: trial gives limited premium features, not full premium.
Free trial duration: 7 days.
```

### 15.3 Payment Failure

**Scenario:** Player's real payment method fails for premium renewal.

**Rules:**
```
Day 0: Payment fails → retry in 24 hours
Day 1: Retry fails → notification to player "Update your payment method"
Day 3: Third retry → fails → premium features suspended
Day 7: Final retry → fails → subscription cancelled
Day 7-14: Grace period → if payment method updated, subscription resumes without gap
Day 14+: Must resubscribe (no auto-resume)

During suspension (Day 3-7):
  - Ads shown
  - Hints limited to 1/day
  - Analytics basic
  - Cosmetics retained
  - No premium coin bonus
```

---

## 16. Leaderboard Manipulation

### 16.1 Smurf Accounts

**Scenario:** Experienced player creates new account to dominate low-level leaderboards.

**Prevention:**
```
1. Device-based detection: if same device has another account at Level 5+,
   new account flagged as "experienced player"
2. Flagged accounts compete in a separate bracket for first 2 levels
3. If progression speed is in top 1% for new accounts: soft flag
4. No hard block — player might genuinely be restarting

Leaderboard brackets:
  - "New Players" (Level 1-2, account < 30 days, no flags)
  - "Standard" (all other players)
  - "Expert" (Level 7-8, account > 6 months)
  
Cross-bracket: players see their bracket by default but can view others
```

### 16.2 Score Farming

**Scenario:** Player finds a repeatable action loop that generates disproportionate coins/XP.

**Prevention:**
```
1. Diminishing returns on repeated actions:
   - Same decision card category 5+ times in a week: XP reduced to 50%
   - Same card category 10+ times: XP reduced to 25%
   - Resets weekly
   
2. Transfer farming prevention:
   - Transferring between own accounts generates 0 XP
   - No XP for "undo" actions (e.g., invest then immediately withdraw)
   
3. Economy balancing reviews: monthly analysis of top earners
   - If earning rate > 3σ above mean for their level: investigation
   - If exploit found: fix exploit, no retroactive punishment (unless clearly abuse)
```

### 16.3 Leaderboard Integrity

```
Leaderboard eligibility requirements:
  - Account email verified
  - At least 7 game days played
  - No active anti-cheat flags
  - Not in "Easy" mode (Easy mode has separate leaderboard)
  - Not in bankruptcy state

Leaderboard displays:
  - Player username (customizable, no real names required)
  - Level and persona
  - Score (net worth, CHI, budget adherence, or XP depending on leaderboard)
  - Difficulty badge (Normal / Hard)
```

---

## 17. Data Privacy & Deletion

### 17.1 GDPR Right to Erasure

**Scenario:** EU player requests complete data deletion under GDPR Article 17.

**Process:**
```
1. Player submits deletion request via:
   a. In-app settings → Privacy → Delete My Data
   b. Email to privacy@moneylife.app
   c. In-app form with identity verification

2. Verification:
   - Email OTP sent to registered email
   - Player must confirm deletion within 72 hours
   
3. Processing (within 30 days per GDPR):
   Day 0: Request received, acknowledged
   Day 1-7: Account deactivated (no login, no play)
   Day 7: Deletion preview sent to player email listing all data to be deleted
   Day 14: If no cancellation: deletion process begins
   Day 14-28: 
     - All PII deleted: name, email, phone, IP logs, device IDs
     - Game data anonymized: player_id replaced with hash, gameplay data retained for analytics (no PII link)
     - Reward redemption records: PII removed, transaction IDs retained for financial records (legal requirement: 7 years)
     - Payment records: handled by payment processor (Stripe/Apple/Google), MoneyLife deletes its copies
     - Leaderboard entries: replaced with "[Deleted User]"
     - Classroom data: if in a classroom, teacher notified, student data anonymized
   Day 28: Confirmation email sent to last known email (then email deleted)
   Day 30: Process complete, audit log entry

4. Unredeemed coins: FORFEITED (warned during confirmation)
5. Active subscriptions: cancelled, refund for unused period
6. Pending reward fulfillment: completed if already shipped, cancelled if not yet processed (coins not refunded since account deleted)

Cancellation: player can cancel deletion request within 14 days via email link.
```

### 17.2 Data Portability (GDPR Article 20)

```
Player can request data export:
  - In-app: Settings → Privacy → Export My Data
  - Format: JSON + CSV bundle
  - Contents:
    - Profile information
    - Complete game history (every transaction, every decision)
    - Budget history
    - Achievement/badge list
    - Coin transaction history
    - Investment history
    - Credit Health Index history
  - Generated within 72 hours
  - Download link valid for 7 days
  - Maximum 1 export request per 30 days
```

### 17.3 CCPA Compliance (California)

```
Additional for California residents:
  - "Do Not Sell My Personal Information" toggle in settings
  - When enabled: no data shared with analytics partners beyond essential operations
  - No behavioral advertising data collection
  - Annual transparency report available
```

### 17.4 Children's Data (COPPA)

```
For users age 13-15:
  - No behavioral advertising
  - No data sharing with third parties (except essential service providers)
  - Parental consent required for account creation
  - Parent can view and delete child's data at any time
  - Data automatically purged if parental consent not verified within 7 days of registration
  
For users under 13:
  - Account creation BLOCKED
  - If somehow created (age lie): account suspended, data purged upon discovery
```

### 17.5 Data Deletion Mid-Game in Classroom

**Scenario:** Student requests data deletion while enrolled in a classroom challenge.

**Rules:**
```
1. Student can ALWAYS exercise deletion rights (cannot be overridden by teacher/institution)
2. Process:
   a. Student removed from classroom
   b. Teacher sees: "A student has left the classroom" (no name, no reason)
   c. Classroom aggregated stats recalculated without this student
   d. Student's individual data anonymized per standard process
3. If classroom is graded:
   a. Teacher must handle grading separately (MoneyLife provides no grade data post-deletion)
   b. Recommended: teachers maintain their own grade records
```

---

## 18. Network & Transaction Integrity

### 18.1 Network Interruption During Day Advance

**Scenario:** Player taps "advance day," network drops before server response.

**Resolution:**
```
1. Day advance is idempotent per game_day:
   - Client sends: POST /api/v1/game/advance-day { current_day: "2026-03-15" }
   - Server: if already processed day 15 → return current state (no re-processing)
   - Server: if not yet processed → process, return new state
   
2. Client retries with exponential backoff:
   - Attempt 1: immediate
   - Attempt 2: 2 seconds
   - Attempt 3: 4 seconds
   - Attempt 4: 8 seconds
   - Attempt 5: 16 seconds
   - After 5 failures: "Connection issue. Your progress is safe. Please try again later."
   
3. No partial day processing. Day advance is atomic:
   - Either ALL month-end operations complete, or NONE do.
   - Database transaction wraps entire day processing.
```

### 18.2 Network Interruption During Reward Redemption

**Scenario:** Player redeems coins, network drops before confirmation.

**Resolution:**
```
1. Redemption uses idempotency key (see §8.5)
2. Client shows "Processing..." with spinner
3. On reconnection: client checks redemption status via GET /api/v1/rewards/redemption/{idempotency_key}
4. Possible states:
   - NOT_FOUND: redemption never reached server → retry
   - PENDING: server received, processing → wait
   - COMPLETED: done → show confirmation
   - FAILED: server rejected → show error, coins not deducted
5. Client shows appropriate screen based on state
```

### 18.3 Network Interruption During Investment Trade

**Scenario:** Player submits investment buy order, network drops.

**Resolution:**
```
1. Investment orders are queued, not instant:
   - Client sends: POST /api/v1/investments/order
   - Server responds with order_id
   - Order executes at next day's prices (not real-time)
   
2. If network drops before server response:
   - Client retries with idempotency key
   - If order was received: returns existing order_id
   - If not received: creates new order
   
3. Orders can be cancelled before next day advance:
   - DELETE /api/v1/investments/order/{order_id}
   - If day already advanced (order executed): cannot cancel
```

### 18.4 Server Downtime

**Scenario:** MoneyLife servers are down for maintenance or outage.

**Handling:**
```
1. Client detects server unavailability (HTTP 503 or timeout)
2. Switches to offline mode (see §5.1)
3. Banner: "MoneyLife is temporarily unavailable. You can still view your accounts."
4. Auto-retry every 60 seconds in background
5. When server returns: automatic sync
6. If downtime > 4 hours: push notification when back online

Streaks:
  - If downtime causes player to miss a streak day through no fault of their own:
  - Server-side detection: if server was down for >1 hour during midnight in ANY timezone
  - All streaks automatically granted a +1 day grace for that calendar day
  - Applied retroactively on server recovery
```

---

## 19. Platform-Specific Edge Cases

### 19.1 iOS App Store Guidelines

```
Edge cases:
  - Coin purchases (IAP): must use Apple IAP. 30% Apple commission.
  - Reward redemption: cannot link to external purchase flows.
    Resolution: all reward redemptions happen in-app via our catalog.
  - Subscription management: must use Apple Subscriptions infrastructure.
  - "Sign in with Apple" must be offered if any social login is provided.
  - Parental controls: respect iOS Screen Time restrictions.
    If Screen Time blocks MoneyLife → streak grace applies.
  - Guideline 4.2.3: no templated/cookie-cutter apps.
    White-label versions need sufficient differentiation (custom theming, unique content).
```

### 19.2 Google Play Guidelines

```
Edge cases:
  - IAP: must use Google Play Billing for digital goods.
  - Alternative billing (EU DMA): may use alternative payment in EEA.
    Implementation: dual billing UI in EEA regions.
  - Family Link: respect parental controls.
  - Data safety form: must accurately declare all data collection.
  - Subscription: must support Google Play subscription management.
```

### 19.3 Cross-Platform Account

```
Player creates account on iOS, wants to play on Android:
  1. Login with same credentials (email/social)
  2. Full game state syncs from server
  3. Premium subscription: NOT transferable between platforms
     - iOS subscription valid on iOS only
     - Android subscription valid on Android only
     - Player must cancel one and subscribe on other
     - Premium features active as long as ANY platform subscription is active
  4. Coins earned: fully transferable (server-side balance)
  5. IAP coin purchases: reflected immediately on all platforms
```

### 19.4 App Update Required

**Scenario:** Server requires minimum client version but player hasn't updated.

```
Handling:
  - Server returns HTTP 426 (Upgrade Required) with:
    { "min_version": "2.1.0", "current_version": "1.9.0", "store_url": "..." }
  - Client shows: "Please update MoneyLife to continue playing"
  - Link to app store
  - Offline viewing still works (cached data)
  - No game actions possible until updated
  - Grace period: 7 days from new version release before enforcement
```

---

## 20. White-Label Partner Edge Cases

### 20.1 Partner Branding Conflict

**Scenario:** Bank partner's brand guidelines conflict with game UX requirements.

**Rules:**
```
Customizable:
  - App icon, splash screen, color scheme (primary, secondary, accent)
  - Logo placement (header, loading screen)
  - Welcome text and onboarding copy
  - Reward catalog (partner-specific)
  - Push notification sender name
  - Terms of service / privacy policy URL

NOT customizable (game integrity):
  - Game mechanics and formulas
  - CHI calculation
  - Decision card content (partner can add cards, not modify existing)
  - XP/coin earning rates
  - Level progression
  - Anti-cheat rules

Conflict resolution: MoneyLife product team has final say on UX decisions.
Partner can escalate to joint steering committee.
```

### 20.2 Partner Data Isolation

```
Multi-tenant data architecture:

Each partner gets:
  - Isolated database schema (tenant_id on all tables)
  - Separate encryption keys
  - Separate analytics dashboards
  - Separate user pools (no cross-partner user visibility)

Cross-partner restrictions:
  - Player A (Bank Partner 1) cannot see Player B (Bank Partner 2) on leaderboards
  - Classroom mode: only within same partner tenant
  - Referrals: only count within same partner tenant
  - Exception: consumer (free) app is its own "tenant" with global leaderboards

Data migration between partners:
  - NOT supported
  - If player switches banks: must create new game in new partner's app
  - Coins do NOT transfer between partner apps
```

### 20.3 Partner API Rate Limits

```
Per partner:
  - Dashboard API: 100 req/min
  - User management API: 50 req/min  
  - Analytics API: 10 req/min (heavy queries)
  - Webhook delivery: up to 1,000/min burst, 10,000/hour sustained
  
Exceeding limits: HTTP 429, request queued, delivered when rate allows.
Critical paths (SSO, user creation): higher limits (500 req/min).
```

### 20.4 Partner Contract Termination

**Scenario:** Bank partner terminates contract.

**Rules:**
```
Per contract, 90-day termination notice.

Day 0: Notice received
Day 0-30: 
  - No changes for end users
  - Data export prepared for partner
  
Day 31-60:
  - New user registration disabled for partner's app
  - Existing users continue playing
  - Partner notified to communicate to users
  
Day 61-90:
  - Users prompted to migrate to consumer (free) app
  - Migration path: same account, badges, coins transfer
  - Game state transfers (fresh start in consumer app with carryover bonuses)
  - Partner-specific rewards removed from catalog
  
Day 90:
  - Partner app deactivated
  - Remaining users auto-migrated to consumer app
  - Partner data exported and deleted from our systems within 30 days
  - Partner-specific branding/assets deleted
```

### 20.5 Partner SSO Integration Failure

**Scenario:** Bank's SSO system is down; player can't log in to white-label app.

```
Fallback flow:
  1. SSO attempt times out (5-second timeout)
  2. Fallback login shown: email + password (if player set up MoneyLife credentials)
  3. If no fallback credentials: "Your bank's login system is temporarily unavailable. Please try again later."
  4. Offline mode available for already-authenticated sessions (JWT not expired)
  5. JWT validity: 24 hours for white-label apps (longer than consumer to reduce SSO dependency)
```

---

## Appendix: Edge Case Decision Matrix

For quick reference, here's how the system responds to common ambiguous situations:

| Situation | Resolution | Notification |
|---|---|---|
| Bill due, insufficient funds, no overdraft | Bill missed, late fee | "Your [bill] payment was missed" |
| Bill due, insufficient funds, with overdraft | Paid via overdraft, overdraft fee | "Your [bill] was paid using overdraft" |
| Two bills due, can only afford one | Priority order (§1.1), second missed | Per-bill notification |
| Card decision expires | Worst outcome applied | "Time ran out on a decision" |
| Internet drops mid-decision | Decision queued locally | "Saved offline, will sync" |
| Player plays on 2 devices simultaneously | Second device takes over, first read-only | "Session moved to another device" |
| CHI calculation produces > 850 | Clamped to 850 | None |
| CHI calculation produces < 300 | Clamped to 300 | None |
| Interest rounds to < 0.01 CU | Accumulated in pending_interest | None until credited |
| Investment return would make value negative | Clamped to 0.01 CU | "Your portfolio has been severely impacted" |
| Player skips 30+ game days rapidly | Rate limited to 50/hour | "Take a break!" at limit |
| Reward partner API timeout | Retry 3x, then "temporarily unavailable" | "Please try again later" |
| Player age changes to 18 | Features unlocked, parental oversight winds down | "Happy birthday! New features available" |
| Server downtime during month-end | Retried on recovery, streak grace applied | "Catch-up processing complete" |

---

*End of Edge Cases Specification*
