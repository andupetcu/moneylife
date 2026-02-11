# MoneyLife — Banking Integrations

> Version 1.0 · February 2026
> Real banking system integration specifications for Mirror Mode and white-label partners.

---

## Table of Contents

1. [Integration Overview](#1-integration-overview)
2. [Open Banking (PSD2/PSD3)](#2-open-banking-psd2psd3)
3. [Plaid Integration](#3-plaid-integration)
4. [TrueLayer Integration](#4-truelayer-integration)
5. [Salt Edge Integration](#5-salt-edge-integration)
6. [Tink (Visa) Integration](#6-tink-visa-integration)
7. [Mirror Mode Design](#7-mirror-mode-design)
8. [Bank White-Label Integration](#8-bank-white-label-integration)
9. [Regulatory Compliance](#9-regulatory-compliance)
10. [Sandbox & Production](#10-sandbox--production)
11. [Fallback Strategies](#11-fallback-strategies)
12. [Transaction Categorization](#12-transaction-categorization)
13. [Data Minimization](#13-data-minimization)

---

## 1. Integration Overview

### 1.1 Why Banking Integration?

MoneyLife's "Mirror Mode" lets players compare their simulated financial decisions with their real banking data. This is the killer feature for:
- User engagement (real relevance)
- White-label bank partners (data stays in ecosystem)
- Financial literacy outcomes (concrete improvement metrics)

### 1.2 Provider Selection Matrix

| Provider | Coverage | Strengths | Weaknesses | Our Use Case |
|---|---|---|---|---|
| Plaid | US, CA, UK, EU (16 countries) | Largest US bank coverage, excellent SDK, transaction enrichment | Expensive at scale, limited non-US | Primary for US/CA |
| TrueLayer | UK, EU (12 countries) | PSD2-native, payment initiation, strong UK coverage | Smaller institution list than Plaid | Primary for UK/EU |
| Salt Edge | Global (50+ countries) | Widest geographic coverage, enrichment API | Screen scraping in some markets, variable data quality | Primary for non-US/UK markets |
| Tink (Visa) | EU (18 countries) | Visa backing, growing bank network | API less mature, Visa integration pending | Secondary EU option |

### 1.3 Integration Architecture

```
┌──────────────┐     ┌───────────────────┐     ┌──────────────────┐
│  Mobile App  │────>│  Banking Service   │────>│  Provider APIs   │
│              │     │                     │     │  - Plaid         │
│  Mirror Mode │     │  - Provider Router  │     │  - TrueLayer     │
│  UI          │     │  - Token Manager    │     │  - Salt Edge     │
│              │     │  - Sync Engine      │     │  - Tink          │
│              │     │  - Categorizer      │     │                  │
│              │     │  - Data Proxy       │     │                  │
└──────────────┘     └───────────────────┘     └──────────────────┘
                              │
                     ┌────────▼────────┐
                     │   Encrypted DB   │
                     │  - Connections   │
                     │  - Tokens (enc)  │
                     │  - Transactions  │
                     │    (minimal)     │
                     └─────────────────┘
```

---

## 2. Open Banking (PSD2/PSD3)

### 2.1 Overview

PSD2 (Payment Services Directive 2) mandates that European banks provide API access to account data (with user consent). PSD3 (proposed) will expand this. Our TrueLayer and Tink integrations are PSD2-compliant.

### 2.2 Consent Model

```
PSD2 Consent Flow:

1. User initiates bank link in MoneyLife
2. MoneyLife redirects to bank's authorization server
3. User authenticates directly with their bank (SCA — Strong Customer Authentication)
4. Bank issues consent with specific scope:
   - Account Information (AIS scope)
   - We do NOT request Payment Initiation (PIS scope)
5. Bank redirects back to MoneyLife with authorization code
6. MoneyLife exchanges code for access token
7. Access token stored encrypted, used for data access

Consent properties:
  - Scope: Account balances + Transaction history (read-only)
  - Duration: 90 days (PSD2 mandate), then re-consent required
  - Granularity: per-account (user selects which accounts to share)
  - Revocation: user can revoke at any time via bank app or MoneyLife settings
```

### 2.3 Token Lifecycle

```
┌─────────────┐   90 days   ┌─────────────┐
│   Active     │────────────>│   Expired    │
│   Token      │             │   (re-auth   │
│              │             │   required)  │
└──────┬───────┘             └──────────────┘
       │
       │ every 5-15 min
       │ (provider-dependent)
       ▼
┌─────────────┐
│  Refresh     │
│  (automatic) │
└─────────────┘

Token storage:
  - Access token: AES-256-GCM encrypted at application level
  - Encryption key: derived from AWS KMS master key
  - Stored in: banking_connections.encrypted_access_token
  - Refresh token: same encryption, separate column
  - Token metadata (expiry, scope): plaintext columns for operational use

Re-consent flow (every 90 days):
  1. Server detects token expiring within 7 days
  2. Push notification: "Please re-authorize your bank connection to keep Mirror Mode active"
  3. User opens app → banner with "Re-authorize" button
  4. Full consent flow repeats
  5. If user doesn't re-authorize: connection status → "expired"
  6. Mirror Mode continues showing historical data but no new sync
```

### 2.4 Strong Customer Authentication (SCA)

```
SCA is mandatory for PSD2 access. Methods:

1. Redirect SCA: User is redirected to bank's website/app for authentication
   - Most common for initial consent
   - User enters bank credentials + 2FA on bank's page
   - MoneyLife never sees bank credentials

2. Decoupled SCA: Bank sends push notification to banking app
   - User approves in banking app
   - No redirect needed
   - Better UX but not all banks support it

3. Embedded SCA: Credentials entered in TPP (us) interface
   - NOT RECOMMENDED and being phased out by PSD3
   - We will NOT implement this

Our implementation: Redirect SCA exclusively.
  - WebView or system browser for the redirect
  - Deep link callback to return to MoneyLife app
  - Callback URL: moneylife://banking/callback?code={code}&state={state}
```

---

## 3. Plaid Integration

### 3.1 Overview

Plaid is our primary provider for US and Canadian markets. We use their Link SDK for the connection flow and their API for data access.

**Plaid Products Used:**
- `transactions` — Transaction history and real-time updates
- `auth` — Account and routing numbers (not needed for Mirror Mode, but available)
- `identity` — Account holder identity verification (optional)
- `balance` — Real-time balance checks

**Documentation:** https://plaid.com/docs/

### 3.2 Link Flow

```
Step 1: Create Link Token (Server-side)
  POST https://production.plaid.com/link/token/create
  Headers:
    Content-Type: application/json
  Body: {
    "client_id": "{PLAID_CLIENT_ID}",
    "secret": "{PLAID_SECRET}",
    "user": {
      "client_user_id": "{moneylife_user_id}"
    },
    "client_name": "MoneyLife",
    "products": ["transactions"],
    "country_codes": ["US", "CA", "GB"],
    "language": "en",
    "redirect_uri": "https://app.moneylife.com/plaid/callback",
    "account_filters": {
      "depository": {
        "account_subtypes": ["checking", "savings"]
      },
      "credit": {
        "account_subtypes": ["credit card"]
      }
    }
  }
  Response: {
    "link_token": "link-production-xxx",
    "expiration": "2026-02-11T22:14:00Z"
  }

Step 2: Open Plaid Link (Client-side)
  // Flutter
  PlaidLink.open(
    linkToken: linkToken,
    onSuccess: (publicToken, metadata) {
      // Send to server
      api.exchangePlaidToken(publicToken);
    },
    onExit: (error, metadata) {
      // Handle exit/error
    },
  );

Step 3: Exchange Public Token (Server-side)
  POST https://production.plaid.com/item/public_token/exchange
  Body: {
    "client_id": "{PLAID_CLIENT_ID}",
    "secret": "{PLAID_SECRET}",
    "public_token": "{public_token_from_client}"
  }
  Response: {
    "access_token": "access-production-xxx",
    "item_id": "item-xxx"
  }

Step 4: Store Connection
  INSERT INTO banking_connections (
    user_id, provider, provider_connection_id, 
    encrypted_access_token, institution_name, status
  ) VALUES (
    user_id, 'plaid', item_id,
    encrypt(access_token), metadata.institution.name, 'active'
  );
```

### 3.3 Transaction Sync

```
Initial sync (on connection):
  POST https://production.plaid.com/transactions/sync
  Body: {
    "client_id": "{PLAID_CLIENT_ID}",
    "secret": "{PLAID_SECRET}",
    "access_token": "{access_token}",
    "cursor": ""  // empty for initial sync
  }
  Response: {
    "added": [
      {
        "transaction_id": "txn-xxx",
        "account_id": "acc-xxx",
        "amount": 25.50,
        "date": "2026-02-10",
        "name": "STARBUCKS #12345",
        "merchant_name": "Starbucks",
        "category": ["Food and Drink", "Coffee Shop"],
        "pending": false
      },
      ...
    ],
    "modified": [],
    "removed": [],
    "next_cursor": "cursor-xxx",
    "has_more": true
  }

Pagination:
  Continue calling with next_cursor until has_more = false.

Incremental sync (periodic):
  Same endpoint, use stored cursor.
  Server stores last cursor per connection.
  
Sync schedule:
  - Immediately on connection
  - Every 4 hours via background job
  - On user request (pull-to-refresh in Mirror Mode)
  - On webhook trigger (see §3.4)
```

### 3.4 Webhook Handling

```
Plaid sends webhooks for real-time updates.

Webhook endpoint: POST https://api.moneylife.com/webhooks/plaid

Webhook types we handle:

1. TRANSACTIONS (SYNC_UPDATES_AVAILABLE)
   {
     "webhook_type": "TRANSACTIONS",
     "webhook_code": "SYNC_UPDATES_AVAILABLE",
     "item_id": "item-xxx"
   }
   Action: trigger incremental sync for this connection

2. TRANSACTIONS (RECURRING_TRANSACTIONS_UPDATE)
   Action: update recurring transaction detection for Mirror Mode

3. ITEM (ERROR)
   {
     "webhook_type": "ITEM",
     "webhook_code": "ERROR",
     "item_id": "item-xxx",
     "error": { "error_code": "ITEM_LOGIN_REQUIRED" }
   }
   Action: mark connection as "needs_reauth", notify user

4. ITEM (PENDING_EXPIRATION)
   Action: notify user to re-consent (access token expiring)

Webhook verification:
  - Plaid signs webhooks with JWT
  - Verify using Plaid's public key (fetched from /webhook_verification_key/get)
  - Reject unverified webhooks with 401
```

### 3.5 Supported Countries

```
Plaid coverage (as of 2026):
  US: ~12,000 financial institutions
  Canada: ~300 institutions
  UK: ~100 institutions (via Plaid UK)
  EU: Limited (France, Spain, Germany, Ireland, Netherlands)
  
For non-US: we supplement with TrueLayer (UK/EU) and Salt Edge (global)
```

### 3.6 Plaid Pricing

```
Plaid pricing tiers (approximate, negotiable):
  - Per connection/month: $0.30-$1.50 depending on volume
  - Transaction enrichment: included in Transactions product
  - Identity verification: separate product, $1.50-$3.00 per verification
  
Our cost model:
  At 10K connected users: ~$5,000-15,000/month
  At 100K connected users: ~$30,000-100,000/month (volume discount)
  
Monetization must cover this:
  White-label: included in partner license fee
  Consumer: Mirror Mode as premium feature ($2.99/month)
```

---

## 4. TrueLayer Integration

### 4.1 Overview

TrueLayer is our primary provider for UK and European markets. PSD2-native, no screen scraping.

**Products Used:**
- Data API — Account information and transactions
- Payments API — NOT used (we don't initiate payments)

**Documentation:** https://truelayer.com/docs/

### 4.2 Auth Redirect Flow

```
Step 1: Generate Auth URL (Server-side)
  Build authorization URL:
  
  https://auth.truelayer.com/?
    response_type=code&
    client_id={TRUELAYER_CLIENT_ID}&
    redirect_uri=https://app.moneylife.com/truelayer/callback&
    scope=info%20accounts%20balance%20transactions%20offline_access&
    providers=uk-ob-all%20uk-oauth-all&
    state={random_state_token}

Step 2: Open in Browser/WebView (Client-side)
  // Flutter
  launchUrl(authUrl, mode: LaunchMode.externalApplication);
  
  // Deep link handler
  // moneylife://truelayer/callback?code={code}&state={state}

Step 3: Exchange Code (Server-side)
  POST https://auth.truelayer.com/connect/token
  Headers:
    Content-Type: application/x-www-form-urlencoded
  Body:
    grant_type=authorization_code&
    client_id={TRUELAYER_CLIENT_ID}&
    client_secret={TRUELAYER_SECRET}&
    redirect_uri=https://app.moneylife.com/truelayer/callback&
    code={authorization_code}
  Response: {
    "access_token": "eyJ...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "refresh_token": "ref-xxx",
    "scope": "info accounts balance transactions offline_access"
  }

Step 4: Fetch Accounts
  GET https://api.truelayer.com/data/v1/accounts
  Headers:
    Authorization: Bearer {access_token}
  Response: {
    "results": [
      {
        "account_id": "acc-xxx",
        "account_type": "TRANSACTION",
        "display_name": "Current Account",
        "currency": "GBP",
        "provider": {
          "display_name": "HSBC",
          "provider_id": "hsbc"
        }
      }
    ]
  }
```

### 4.3 Data Access

```
Fetch Transactions:
  GET https://api.truelayer.com/data/v1/accounts/{account_id}/transactions
  Query: ?from=2026-01-01&to=2026-02-11
  Headers:
    Authorization: Bearer {access_token}
  Response: {
    "results": [
      {
        "transaction_id": "txn-xxx",
        "timestamp": "2026-02-10T14:30:00Z",
        "description": "STARBUCKS COFFEE",
        "amount": -4.50,
        "currency": "GBP",
        "transaction_type": "DEBIT",
        "transaction_category": "PURCHASE",
        "merchant_name": "Starbucks",
        "running_balance": { "amount": 1234.56, "currency": "GBP" }
      }
    ]
  }

Fetch Balance:
  GET https://api.truelayer.com/data/v1/accounts/{account_id}/balance
  Response: {
    "results": [
      {
        "current": 1234.56,
        "available": 1200.00,
        "currency": "GBP"
      }
    ]
  }

Token refresh:
  POST https://auth.truelayer.com/connect/token
  Body:
    grant_type=refresh_token&
    client_id={TRUELAYER_CLIENT_ID}&
    client_secret={TRUELAYER_SECRET}&
    refresh_token={refresh_token}
    
  Auto-refresh when access_token expires (every ~1 hour).
  Refresh token valid for 90 days (PSD2 consent period).
```

### 4.4 TrueLayer Supported Countries

```
UK: ~50 banks (all major: HSBC, Barclays, Lloyds, NatWest, etc.)
Ireland: ~10 banks
France: ~15 banks
Germany: ~20 banks
Spain: ~15 banks
Italy: ~10 banks
Netherlands: ~10 banks
Finland, Lithuania, Latvia, Estonia, Poland, Portugal

Total: ~200+ institutions across 12+ countries
```

---

## 5. Salt Edge Integration

### 5.1 Overview

Salt Edge provides the widest geographic coverage. Used for markets not covered by Plaid or TrueLayer. Uses a mix of Open Banking APIs and (where necessary) screen scraping.

**Documentation:** https://docs.saltedge.com/

### 5.2 Connection Lifecycle

```
Step 1: Create Customer
  POST https://www.saltedge.com/api/v5/customers
  Headers:
    App-id: {SALT_EDGE_APP_ID}
    Secret: {SALT_EDGE_SECRET}
  Body: {
    "data": {
      "identifier": "{moneylife_user_id}"
    }
  }
  Response: { "data": { "id": "customer-xxx" } }

Step 2: Create Connect Session
  POST https://www.saltedge.com/api/v5/connect_sessions/create
  Body: {
    "data": {
      "customer_id": "customer-xxx",
      "consent": {
        "scopes": ["account_details", "transactions_details"],
        "period_days": 90
      },
      "attempt": {
        "return_to": "moneylife://saltedge/callback"
      },
      "allowed_countries": ["BR", "MX", "NG", "ZA", "ID", "PH", "TH"],
      "provider_code": "specific_bank_code"  // optional, pre-select bank
    }
  }
  Response: {
    "data": {
      "connect_url": "https://www.saltedge.com/connect?token=xxx",
      "expires_at": "2026-02-11T22:14:00Z"
    }
  }

Step 3: User Completes Connection
  // Open connect_url in WebView
  // User selects bank, authenticates
  // Redirect back to moneylife://saltedge/callback?connection_id=xxx

Step 4: Fetch Connection Details
  GET https://www.saltedge.com/api/v5/connections/{connection_id}
  Response: {
    "data": {
      "id": "connection-xxx",
      "provider_code": "banco_do_brasil",
      "provider_name": "Banco do Brasil",
      "status": "active",
      "last_success_at": "2026-02-11T18:00:00Z"
    }
  }
```

### 5.3 Transaction Sync

```
Fetch Transactions:
  GET https://www.saltedge.com/api/v5/transactions
  Query: ?connection_id={connection_id}&from_id={last_transaction_id}&per_page=100
  Headers:
    App-id: {SALT_EDGE_APP_ID}
    Secret: {SALT_EDGE_SECRET}
  Response: {
    "data": [
      {
        "id": "txn-xxx",
        "duplicated": false,
        "mode": "normal",
        "status": "posted",
        "made_on": "2026-02-10",
        "amount": -25.50,
        "currency_code": "BRL",
        "description": "COMPRA STARBUCKS",
        "category": "food_and_drink",
        "extra": {
          "merchant_id": "merchant-xxx",
          "original_amount": -25.50,
          "original_currency_code": "BRL"
        }
      }
    ],
    "meta": {
      "next_id": "txn-yyy",
      "next_page": "https://..."
    }
  }

Sync schedule: same as Plaid (4-hourly + webhook-triggered)
```

### 5.4 Enrichment API

```
Salt Edge provides transaction enrichment:

POST https://www.saltedge.com/api/v5/enrichment
Body: {
  "data": [
    {
      "original_amount": -25.50,
      "original_currency_code": "BRL",
      "description": "COMPRA STARBUCKS SAO PAULO",
      "made_on": "2026-02-10"
    }
  ]
}
Response: {
  "data": [
    {
      "category": "food_and_drink",
      "subcategory": "coffee_shop",
      "merchant": {
        "name": "Starbucks",
        "logo_url": "https://...",
        "type": "restaurant"
      }
    }
  ]
}

We use this to normalize transaction categories across all providers.
```

### 5.5 Salt Edge Coverage

```
50+ countries including:
  Brazil, Mexico, Argentina, Colombia
  Nigeria, South Africa, Kenya
  India, Indonesia, Philippines, Thailand
  Turkey, Saudi Arabia, UAE
  + all of EU/UK (as alternative to TrueLayer)

Total: 5,000+ financial institutions globally
```

---

## 6. Tink (Visa) Integration

### 6.1 Overview

Tink (acquired by Visa) is a European Open Banking platform. We include it as a secondary option for EU markets and for bank partners who have existing Tink relationships.

**Documentation:** https://docs.tink.com/

### 6.2 Comparison with TrueLayer

| Feature | TrueLayer | Tink |
|---|---|---|
| UK Coverage | Excellent | Good |
| EU Coverage | Good (12 countries) | Better (18 countries) |
| PSD2 Compliance | Native | Native |
| Payment Initiation | Yes (not our use) | Yes (not our use) |
| Data Enrichment | Basic | Good (via Visa) |
| SDK Quality | Good | Excellent |
| Pricing | Competitive | Competitive |
| Visa Backing | No | Yes (potential advantage for bank partners) |

### 6.3 When to Use Tink

```
Use Tink when:
  1. Bank partner already has Tink relationship → reduce integration effort
  2. Nordic/Eastern European markets → better coverage than TrueLayer
  3. Visa co-branded opportunity → joint marketing with Visa
  
Default to TrueLayer for UK and core EU markets (our primary integration).
```

### 6.4 Integration Pattern

Similar to TrueLayer — OAuth2 redirect flow, REST API for data access. Implementation follows same Banking Service abstraction (see §1.3).

```typescript
// Banking Service uses a provider-agnostic interface
interface BankingProvider {
  createAuthUrl(userId: string, options: AuthOptions): Promise<string>;
  exchangeCode(code: string): Promise<TokenPair>;
  refreshToken(refreshToken: string): Promise<TokenPair>;
  getAccounts(accessToken: string): Promise<BankAccount[]>;
  getTransactions(accessToken: string, accountId: string, from: Date, to: Date): Promise<BankTransaction[]>;
  getBalance(accessToken: string, accountId: string): Promise<Balance>;
  revokeAccess(accessToken: string): Promise<void>;
}

// Implementations
class PlaidProvider implements BankingProvider { ... }
class TrueLayerProvider implements BankingProvider { ... }
class SaltEdgeProvider implements BankingProvider { ... }
class TinkProvider implements BankingProvider { ... }
```

---

## 7. Mirror Mode Design

### 7.1 Concept

Mirror Mode shows a side-by-side comparison of the player's simulated financial life vs their real financial data. The goal is to help players see how their real-world habits compare to the financial strategies they're learning in-game.

### 7.2 Data Flow

```
Real Bank Data (via Plaid/TrueLayer/Salt Edge)
  ↓
  Categorize & normalize
  ↓
  Monthly summary by category
  ↓
┌─────────────────────────────────────┐
│         MIRROR MODE UI              │
│                                     │
│  ┌──────────┐   ┌──────────┐       │
│  │ Simulated│   │   Real   │       │
│  │  (Game)  │   │ (Banking)│       │
│  ├──────────┤   ├──────────┤       │
│  │ Housing  │   │ Housing  │       │
│  │ $800/mo  │   │ $950/mo  │       │
│  │          │   │          │       │
│  │ Food     │   │ Food     │       │
│  │ $350/mo  │   │ $480/mo  │ ← "You're spending 37% more on food IRL" │
│  │          │   │          │       │
│  │ Transport│   │ Transport│       │
│  │ $100/mo  │   │ $150/mo  │       │
│  │          │   │          │       │
│  │ Savings  │   │ Savings  │       │
│  │ 15%      │   │ 8%       │ ← "Your game savings rate is almost 2× higher!" │
│  │          │   │          │       │
│  │ Total    │   │ Total    │       │
│  │ $2,800   │   │ $3,200   │       │
│  └──────────┘   └──────────┘       │
│                                     │
│  💡 Insights:                       │
│  "If you applied your game budget   │
│   to real life, you'd save an extra │
│   $400/month!"                      │
│                                     │
└─────────────────────────────────────┘
```

### 7.3 Comparison Algorithm

```python
def generate_mirror_comparison(game_id, user_id, month):
    # Get simulated data
    game_budget = get_game_budget(game_id, month)
    game_actuals = get_game_actuals(game_id, month)
    
    # Get real banking data
    connections = get_banking_connections(user_id)
    real_transactions = []
    for conn in connections:
        txns = fetch_transactions(conn, month)
        real_transactions.extend(txns)
    
    # Categorize real transactions
    categorized = categorize_transactions(real_transactions)
    
    # Normalize to same categories
    category_map = {
        'housing': ['rent', 'mortgage', 'housing'],
        'food': ['groceries', 'dining', 'food_and_drink', 'coffee_shop'],
        'transport': ['gas', 'parking', 'transit', 'ride_share', 'auto'],
        'shopping': ['clothing', 'electronics', 'retail', 'online_shopping'],
        'health': ['medical', 'pharmacy', 'fitness', 'healthcare'],
        'entertainment': ['streaming', 'movies', 'games', 'recreation'],
        'utilities': ['electric', 'water', 'internet', 'phone'],
        'subscriptions': ['subscription', 'membership'],
    }
    
    real_by_category = aggregate_by_category(categorized, category_map)
    game_by_category = aggregate_game_by_category(game_actuals, category_map)
    
    # Generate insights
    insights = []
    for category in category_map:
        game_amt = game_by_category.get(category, 0)
        real_amt = real_by_category.get(category, 0)
        
        if real_amt > 0 and game_amt > 0:
            diff_pct = (real_amt - game_amt) / game_amt * 100
            
            if diff_pct > 30:
                insights.append({
                    'type': 'overspending',
                    'category': category,
                    'message': f"You're spending {abs(diff_pct):.0f}% more on {category} in real life vs your game budget.",
                    'suggestion': f"Try applying your game's {category} strategy to real life — you could save ${real_amt - game_amt:.0f}/month."
                })
            elif diff_pct < -20:
                insights.append({
                    'type': 'good_habit',
                    'category': category,
                    'message': f"Great job! Your real {category} spending is {abs(diff_pct):.0f}% less than your game budget."
                })
    
    # Savings rate comparison
    game_savings_rate = game_budget['savings'] / game_budget['income'] if game_budget['income'] > 0 else 0
    real_income = sum(t.amount for t in real_transactions if t.amount > 0)
    real_spending = sum(abs(t.amount) for t in real_transactions if t.amount < 0)
    real_savings_rate = (real_income - real_spending) / real_income if real_income > 0 else 0
    
    insights.append({
        'type': 'savings_comparison',
        'game_rate': game_savings_rate,
        'real_rate': real_savings_rate,
        'message': generate_savings_message(game_savings_rate, real_savings_rate)
    })
    
    return {
        'game': game_by_category,
        'real': real_by_category,
        'insights': insights,
        'month': month
    }
```

### 7.4 Privacy Controls

```
Mirror Mode is entirely opt-in:

1. Player must explicitly enable Mirror Mode in settings
2. Player must connect at least one bank account
3. Player can disconnect at any time → all real banking data purged within 24 hours
4. Player controls which accounts are visible in Mirror Mode
5. No real banking data is used for game mechanics — purely informational
6. Real transaction data is NEVER shared with:
   - Other players
   - Leaderboards
   - Bank partners (unless player's own bank in white-label version)
   - Analytics (only anonymized, aggregated category totals)

Data display rules:
  - Real amounts shown in player's actual currency
  - Game amounts shown in game currency
  - If currencies differ: both shown with conversion note
  - No individual transaction details shown in comparison (only category totals)
  - Player can tap into category to see their real transactions (their own data)
```

### 7.5 Mirror Mode Gamification

```
Mirror Mode unlocks additional rewards:

1. "Reality Check" badge: Connect first bank account (25 coins)
2. "Self-Aware" badge: View Mirror Mode comparison 5 times (25 coins)
3. "Improving" badge: Real savings rate increases by 5%+ over 3 months (100 coins)
4. "Budget Aligned" badge: Real spending within 10% of game budget for 1 month (50 coins)
5. "Financial Transformation" badge: Legendary — real spending matches game budget (±5%) for 3 months (200 coins)

Monthly Mirror Mode challenges:
  "Close the Gap": reduce the biggest overspending category by 10% this month
  Reward: 50 coins + 100 XP
```

---

## 8. Bank White-Label Integration

### 8.1 SSO from Banking App

```
Flow: User is already logged into their bank's mobile app.
Bank app has a "Financial Education" or "MoneyLife" button.
Tapping it launches MoneyLife with SSO.

Technical flow:
  1. Bank app generates SSO token:
     POST {bank_auth_server}/api/moneylife/sso
     Headers: Authorization: Bearer {bank_user_token}
     Response: { "sso_token": "jwt-signed-by-bank", "expires_in": 300 }
     
  2. Bank app opens MoneyLife (deep link or embedded WebView):
     moneylife://sso?token={sso_token}&partner={partner_slug}
     
  3. MoneyLife client sends to our backend:
     POST /api/v1/auth/sso/{partner_slug}
     Body: { "sso_token": "{sso_token}", "device_id": "{device_id}" }
     
  4. Our backend validates SSO token:
     a. Fetch bank's public key from /.well-known/jwks.json
     b. Verify JWT signature
     c. Extract claims: { sub: bank_user_id, email, name, dob }
     d. Match to existing MoneyLife user OR create new user
     e. Issue MoneyLife JWT pair
     
  5. Player is logged in, partner branding applied automatically

SSO Token Claims (required from bank):
  {
    "iss": "bank-abc-auth-server",
    "sub": "bank-user-id-12345",
    "aud": "moneylife",
    "exp": 1709237100,
    "iat": 1709236800,
    "email": "user@example.com",
    "name": "John Doe",
    "dob": "1990-05-15"
  }
```

### 8.2 Data Sharing Agreement

```
When a bank deploys MoneyLife as a white-label:

Data MoneyLife shares with Bank Partner (via Partner Dashboard):
  - Aggregated user engagement metrics (DAU, retention, session length)
  - Aggregated financial literacy metrics (avg CHI progression, budget scores)
  - Individual user progress (if user consents) — level, CHI, badges
  - Challenge completion rates
  - NO individual financial decisions or transaction data

Data Bank shares with MoneyLife:
  - SSO tokens for authentication
  - User profile data (as per SSO claims)
  - Optionally: account data via their own API (instead of Plaid)
    This is preferred for white-label — bank provides direct API access
    to user's accounts, avoiding third-party aggregator costs

Data Processing Agreement (DPA):
  - MoneyLife is Data Processor, Bank is Data Controller
  - Data stored in bank's preferred region (configurable)
  - Data retention: per bank's policy (default: 2 years after last activity)
  - Deletion: within 30 days of request
  - Audit rights: bank can audit our data handling annually
  - Sub-processors: listed in DPA (AWS, Datadog, etc.)
```

### 8.3 Co-Branding

```
White-label apps are co-branded:

App name: "{Bank Name} MoneyLife" or "{Bank Name} SmartMoney"
App icon: Bank's icon with MoneyLife accent
Splash screen: Bank logo → MoneyLife logo transition
Navigation: Bank branding throughout (colors, logo in header)
Legal: "Powered by MoneyLife" in footer
  Tappable → MoneyLife website
  Required by our brand guidelines

Content co-branding:
  Decision cards can reference bank products:
  "Your {Bank} savings account offers 3.5% APY — want to move funds?"
  These are flagged as "educational, not financial advice"

App Store listing:
  Published under bank's developer account
  Bank controls the listing (description, screenshots)
  We provide marketing materials and screenshot templates
```

---

## 9. Regulatory Compliance

### 9.1 AISP/PISP Registration

```
When MoneyLife accesses bank account data:

AISP (Account Information Service Provider):
  Required when: Accessing account data directly via Open Banking APIs
  NOT required when: Using a licensed aggregator (Plaid/TrueLayer/Salt Edge are licensed AISPs)
  
  Our strategy: Use licensed aggregators → we are NOT an AISP.
  We are a client/TPP (Third Party Provider) of the aggregator.
  
  Exception: If a bank partner provides direct API access (not via aggregator),
  we may need AISP registration in that jurisdiction.
  
PISP (Payment Initiation Service Provider):
  Required when: Initiating payments from user accounts
  We do NOT initiate payments → PISP registration NOT needed.

Registration matrix:
  US: No AISP equivalent. Plaid operates under existing frameworks.
  UK: FCA registration as AISP needed ONLY if we bypass aggregators.
  EU: National regulator registration per country ONLY if we bypass aggregators.
  
  Decision: DO NOT bypass aggregators. Use Plaid/TrueLayer/Salt Edge for all
  bank data access. This avoids regulatory registration in all markets.
  
  If a bank partner insists on direct API: they register us as their agent
  under their own license (bank is already regulated).
```

### 9.2 Compliance Per Market

| Market | Regulation | Our Obligation | Provider Used |
|---|---|---|---|
| US | No specific open banking law (Dodd-Frank §1033 pending) | Privacy policy, user consent | Plaid |
| UK | Open Banking (CMA Order) + FCA | Use FCA-registered AISP | TrueLayer (FCA-registered) |
| EU | PSD2 / upcoming PSD3 | Use nationally registered AISP | TrueLayer or Tink |
| Canada | Consumer-Directed Finance (in progress) | Use compliant provider | Plaid |
| Brazil | Open Finance (BCB) | Use BCB-authorized provider | Salt Edge |
| India | Account Aggregator (RBI) | Use RBI-licensed AA | Salt Edge or direct AA |
| Nigeria | Open Banking (CBN) | Use licensed aggregator | Salt Edge |

### 9.3 Data Protection Regulations

```
GDPR (EU/UK):
  - Data minimization: only collect what's needed for Mirror Mode
  - Purpose limitation: banking data used ONLY for Mirror Mode comparison
  - Right to erasure: delete all banking data within 30 days of request
  - Data portability: export banking transaction history on request
  - DPO: Data Protection Officer appointed
  - DPIA: Data Protection Impact Assessment completed for Mirror Mode

CCPA (California):
  - "Do Not Sell" applies to banking data
  - Banking data categorized as "sensitive personal information"
  - Deletion requests honored for banking data

LGPD (Brazil):
  - Similar to GDPR
  - Consent must be specific and informed for banking data access
  - DPO (Encarregado) appointed

POPIA (South Africa):
  - Consent required for processing banking data
  - Purpose specified and limited
  - Data stored within SA or with adequate protection
```

---

## 10. Sandbox & Production

### 10.1 Provider Sandbox Environments

| Provider | Sandbox URL | Test Credentials | Limitations |
|---|---|---|---|
| Plaid | sandbox.plaid.com | user: `user_good`, pass: `pass_good` | Static test data, no real banks |
| TrueLayer | auth.truelayer-sandbox.com | Mock bank provided | Limited transaction history |
| Salt Edge | sandbox.saltedge.com | Test provider codes | Fake data, limited enrichment |
| Tink | api.tink.com (sandbox mode) | Test users provided | EU test banks only |

### 10.2 Development Testing Strategy

```
Layer 1: Unit tests
  - Mock all provider APIs
  - Test categorization logic, comparison algorithm
  - Test token encryption/decryption
  - Test webhook signature verification

Layer 2: Integration tests (provider sandbox)
  - Full Link/Connect flow against sandbox
  - Transaction sync against sandbox data
  - Token refresh flow
  - Webhook delivery simulation

Layer 3: E2E tests (staging with sandbox)
  - Full Mirror Mode flow: connect → sync → compare → disconnect
  - Error scenarios: token expiry, bank error, network failure
  - Multi-provider: test with Plaid + TrueLayer simultaneously

Layer 4: Pre-production (production API, test accounts)
  - Plaid: use Plaid development environment with real banks
  - TrueLayer: use live API with test bank accounts
  - Limited to internal testers only
  - Verify real bank connectivity before launch
```

### 10.3 Production Cutover Checklist

```
Before enabling banking integrations in production:

□ Provider contracts signed (Plaid, TrueLayer, Salt Edge)
□ Production API keys obtained and stored in AWS Secrets Manager
□ Webhook endpoints configured and verified with each provider
□ SSL certificates valid and pinned
□ Data encryption verified (tokens encrypted at rest and in transit)
□ GDPR/privacy review completed by legal
□ DPA signed with each provider
□ Rate limiting configured (respect provider limits)
□ Error handling tested for all failure modes
□ Monitoring alerts configured (token expiry, sync failures, error rates)
□ User consent flow approved by legal
□ Privacy policy updated with banking data collection disclosure
□ Data deletion flow tested end-to-end
□ Incident response plan for data breach scenario documented
□ Penetration test completed on banking service endpoints
□ Provider-specific certifications obtained (if required)
```

---

## 11. Fallback Strategies

### 11.1 Provider API Down

```
Detection:
  - Health check endpoint per provider (every 30 seconds)
  - Circuit breaker pattern (Opossum library):
    - Error threshold: 50% failure rate in 10-second window
    - Open duration: 30 seconds (then half-open retry)
    
Fallback behavior:

Level 1: Provider temporarily slow (latency > 5s)
  → Extend timeout to 15s
  → Queue sync for later
  → Show cached data to user
  → "Data may be a few hours old" notice

Level 2: Provider returning errors (5xx)
  → Circuit breaker opens
  → Skip sync, use cached data
  → "Bank connection temporarily unavailable" notice
  → Auto-retry every 30 minutes

Level 3: Provider completely down (> 1 hour)
  → Switch to alternative provider if available for that bank
  → If no alternative: "Mirror Mode data will update when your bank is available"
  → No game impact — Mirror Mode is informational only
  → Email notification if down > 4 hours

Level 4: Provider permanently unavailable (deprecated/shutdown)
  → Migrate affected connections to alternative provider
  → User re-consent required (new provider, new authorization)
  → Push notification with migration instructions
  → Grace period: 30 days to re-connect
```

### 11.2 Multi-Provider Fallback Chain

```typescript
const PROVIDER_PRIORITY = {
  'US': ['plaid', 'salt_edge'],
  'CA': ['plaid', 'salt_edge'],
  'GB': ['truelayer', 'tink', 'salt_edge'],
  'DE': ['truelayer', 'tink', 'salt_edge'],
  'FR': ['truelayer', 'tink', 'salt_edge'],
  'BR': ['salt_edge'],
  'NG': ['salt_edge'],
  // ... etc for all supported countries
};

async function connectBank(userId: string, country: string): Promise<ConnectionResult> {
  const providers = PROVIDER_PRIORITY[country];
  
  for (const provider of providers) {
    if (await isProviderHealthy(provider)) {
      try {
        return await initiateConnection(provider, userId);
      } catch (error) {
        logger.warn(`Provider ${provider} failed for ${country}, trying next`);
        continue;
      }
    }
  }
  
  throw new Error(`No available banking provider for country ${country}`);
}
```

### 11.3 Cached Data Strategy

```
Caching layers:

1. Redis cache (hot data):
   - Latest account balances: TTL 1 hour
   - Recent transactions (last 30 days): TTL 4 hours
   - Key: "banking:{user_id}:{connection_id}:balance"
   
2. Database (warm data):
   - All synced transactions: permanent (until deletion)
   - Historical comparisons: permanent
   
3. Client cache (offline):
   - Last viewed Mirror Mode data: encrypted local storage
   - Refreshed on each app foreground + successful sync

When provider is down:
  → Serve from Redis cache (if < 4 hours old)
  → Fall back to database (any age)
  → Fall back to client cache (if server unreachable)
  → Show "last updated X hours ago" timestamp
```

---

## 12. Transaction Categorization

### 12.1 Strategy

We use a three-tier categorization approach:

```
Tier 1: Vendor categorization (highest quality)
  - Use Plaid's built-in categories
  - Use Salt Edge's enrichment API
  - Pre-categorized by the banking provider

Tier 2: Rule-based categorization (fast, deterministic)
  - Merchant name matching against our database
  - Keyword matching in transaction descriptions
  - Amount-based heuristics (e.g., recurring $X.99 = subscription)

Tier 3: ML model categorization (fallback)
  - TensorFlow Lite model running on our server
  - Trained on anonymized, aggregated transaction data
  - Features: description text, amount, merchant, day of week, frequency
  - Accuracy target: > 85% for top-level categories
```

### 12.2 Category Taxonomy

```
Our unified category taxonomy (maps to game budget categories):

housing
  ├── rent
  ├── mortgage
  ├── property_tax
  ├── home_insurance
  └── home_repair
food
  ├── groceries
  ├── dining_out
  ├── coffee_shop
  ├── food_delivery
  └── alcohol
transport
  ├── gas
  ├── public_transit
  ├── ride_share
  ├── parking
  ├── car_maintenance
  └── car_insurance
shopping
  ├── clothing
  ├── electronics
  ├── household
  ├── gifts
  └── online_shopping
health
  ├── medical
  ├── dental
  ├── pharmacy
  ├── fitness
  └── mental_health
entertainment
  ├── streaming
  ├── movies_events
  ├── gaming
  ├── books_media
  └── hobbies
utilities
  ├── electric
  ├── water
  ├── gas_utility
  ├── internet
  └── phone
education
  ├── tuition
  ├── books
  ├── courses
  └── supplies
subscriptions
  ├── streaming
  ├── software
  ├── news
  └── membership
income
  ├── salary
  ├── freelance
  ├── refund
  ├── transfer_in
  └── other_income
transfers
  ├── internal_transfer
  ├── peer_transfer
  └── investment
savings
  ├── savings_deposit
  └── investment_deposit
debt_payment
  ├── credit_card_payment
  ├── loan_payment
  └── other_debt
```

### 12.3 Categorization Pipeline

```python
def categorize_transaction(txn: BankTransaction) -> str:
    # Tier 1: Use vendor category if available and confident
    if txn.vendor_category and txn.vendor_confidence > 0.8:
        return map_vendor_category(txn.vendor_category, txn.provider)
    
    # Tier 2: Rule-based matching
    rule_result = rule_engine.categorize(
        description=txn.description,
        merchant=txn.merchant_name,
        amount=txn.amount
    )
    if rule_result.confidence > 0.7:
        return rule_result.category
    
    # Tier 3: ML model
    ml_result = ml_model.predict(
        description=txn.description,
        amount=txn.amount,
        merchant=txn.merchant_name,
        day_of_week=txn.date.weekday(),
        is_recurring=detect_recurring(txn)
    )
    if ml_result.confidence > 0.6:
        return ml_result.category
    
    # Fallback: "uncategorized"
    return "uncategorized"
```

### 12.4 Rule Engine Examples

```yaml
# rules/merchant_rules.yaml
rules:
  - name: "Starbucks"
    patterns: ["STARBUCKS", "SBUX"]
    category: "food.coffee_shop"
    
  - name: "Uber"
    patterns: ["UBER TRIP", "UBER *TRIP"]
    category: "transport.ride_share"
    
  - name: "Uber Eats"
    patterns: ["UBER *EATS", "UBEREATS"]
    category: "food.food_delivery"
    
  - name: "Netflix"
    patterns: ["NETFLIX", "NETFLIX.COM"]
    category: "subscriptions.streaming"
    
  - name: "Gym"
    patterns: ["PLANET FITNESS", "LA FITNESS", "EQUINOX", "ANYTIME FITNESS"]
    category: "health.fitness"

# rules/amount_rules.yaml
rules:
  - name: "Subscription detection"
    condition: "is_recurring AND amount < 50"
    category: "subscriptions"
    confidence: 0.6

  - name: "Large medical"
    condition: "merchant_type == 'healthcare' AND amount > 200"
    category: "health.medical"
    confidence: 0.8
```

### 12.5 User Override

```
Players can manually recategorize any transaction:

1. In Mirror Mode, tap a transaction
2. "Change category" option
3. Select from category list
4. Override stored: next time same merchant appears, use this category
5. Overrides stored per user, not globally (privacy)

Learning from overrides:
  - Anonymized overrides aggregated monthly
  - If > 50 users override same merchant → same category: update rule engine
  - Requires manual review before rule change
```

---

## 13. Data Minimization

### 13.1 What We Store vs. Proxy

```
STORED in our database:
  ✅ Connection metadata (provider, institution name, status, consent dates)
  ✅ Encrypted access/refresh tokens (necessary for data access)
  ✅ Transactions: date, amount, category, merchant_name
  ✅ Account balances (latest)
  ✅ Categorization results

NOT stored (proxied/discarded):
  ❌ Full transaction descriptions (only merchant name extracted)
  ❌ Account numbers or routing numbers
  ❌ Card numbers
  ❌ User's bank login credentials (never touch our system)
  ❌ Raw API responses from providers (processed and discarded)
  ❌ Pending transactions (only posted/confirmed)
  ❌ Check images
  ❌ Geolocation data from transactions

NEVER accessed:
  ❌ Payment initiation (we have no PISP scope)
  ❌ Account creation/closure
  ❌ Standing orders or direct debits management
  ❌ Investment account details (via banking — we simulate investments separately)
```

### 13.2 Data Retention

```
Banking connection data:
  Active connection: retained while connection is active
  Disconnected: deleted within 24 hours
  Account deletion: deleted within 30 days (per GDPR process)
  Inactive connection (no sync in 6 months): auto-deleted with notification

Transaction data:
  Active: last 12 months retained
  Older than 12 months: auto-deleted (we only need recent data for Mirror Mode)
  On disconnect: all transactions for that connection deleted within 24 hours

Aggregated/anonymized data:
  Category spending averages (no PII): retained indefinitely
  Used for: economy balancing, game design insights
  Cannot be linked back to individual users
```

### 13.3 Encryption at Every Layer

```
Layer 1: Transport
  TLS 1.3 for all API calls to providers
  Certificate pinning for provider API endpoints

Layer 2: Application
  Access tokens: AES-256-GCM encrypted before database storage
  Encryption key: per-tenant key derived from AWS KMS CMK
  Key ID stored alongside ciphertext for rotation support

Layer 3: Database
  RDS encryption at rest (AES-256)
  Backup encryption (same key)

Layer 4: Access Control
  Banking service has exclusive database access to banking tables
  Other services CANNOT query banking tables directly
  Mirror Mode data served through Banking Service API only
  API responses: minimal data (category totals, not individual transactions)
  
Layer 5: Audit
  All access to banking data logged
  Logs include: who, when, what (but NOT the data itself)
  Logs retained for 2 years (regulatory requirement)
```

---

*End of Banking Integrations Specification*
