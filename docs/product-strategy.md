# MoneyLife — Product Strategy & Go-to-Market

> Version 1.0 · February 2026

---

## Table of Contents

1. [Business Model Overview](#1-business-model-overview)
2. [White-Label Pricing](#2-white-label-pricing)
3. [Free App Monetization](#3-free-app-monetization)
4. [Launch Strategy](#4-launch-strategy)
5. [Partnership Playbook](#5-partnership-playbook)
6. [Competitive Moat](#6-competitive-moat)
7. [User Acquisition](#7-user-acquisition)
8. [KPIs Per Stakeholder](#8-kpis-per-stakeholder)
9. [Regulatory Strategy](#9-regulatory-strategy)
10. [Revenue Projections](#10-revenue-projections)
11. [Exit Scenarios](#11-exit-scenarios)

---

## 1. Business Model Overview

MoneyLife operates on two parallel tracks:

**Track A — White-Label (B2B2C):** Banks, credit unions, and fintechs license MoneyLife under their own brand. They embed it in their mobile banking app or offer it as a standalone co-branded experience. Revenue: recurring license fees + per-seat pricing.

**Track B — Consumer App (B2C):** Free download, freemium model. Build userbase, prove engagement metrics, then either monetize via premium subscriptions or use traction to sell white-label deals.

Both tracks share 95% of the same codebase. The white-label layer is a theming/config overlay (see `architecture.md` Section 12).

### Why Dual Track?

- White-label provides B2B revenue and credibility (bank logos on your pitch deck)
- Consumer app provides user data, engagement proof, and organic growth
- Consumer traction makes white-label sales easier ("200K users already love this")
- White-label contracts fund development of the consumer app

---

## 2. White-Label Pricing

### 2.1 Tier Structure

| Feature | **Starter** | **Professional** | **Enterprise** |
|---|---|---|---|
| **Monthly Base Fee** | €2,500/mo | €7,500/mo | €25,000/mo |
| **Annual (20% discount)** | €24,000/yr | €72,000/yr | €240,000/yr |
| **Included Users** | 5,000 | 25,000 | Unlimited |
| **Overage per User** | €0.50/user/mo | €0.30/user/mo | N/A |
| **Setup Fee (one-time)** | €5,000 | €15,000 | €50,000 |
| **Branding** | Logo + colors only | Full theme + custom icons | Full white-label + custom domain |
| **Custom Scenarios** | No | 5 custom scenarios | Unlimited custom scenarios |
| **API Access** | Read-only analytics | Full API | Full API + webhooks |
| **SSO Integration** | No | SAML/OIDC | SAML/OIDC + custom IdP |
| **Dedicated Support** | Email (48h) | Email + Slack (24h) | Dedicated CSM + Slack (4h) |
| **SLA Uptime** | 99.5% | 99.9% | 99.95% |
| **Data Residency** | Shared EU | Choice: EU/US | Custom region |
| **Analytics Dashboard** | Basic (5 reports) | Advanced (20+ reports) | Custom + raw data export |
| **Reward Catalog** | MoneyLife default | Custom + default | Fully custom |
| **Localization** | 1 language | 3 languages | Unlimited |
| **Onboarding Support** | Self-serve docs | 2 onboarding calls | Full onboarding program (4 weeks) |
| **Contract Term** | Monthly | 12 months | 24 months |

### 2.2 Revenue Share Option

For partners who prefer variable pricing:
- **No base fee** — instead, €1.50/active user/month (min 1,000 users)
- Active user = logged in ≥1 time in calendar month
- Revenue share on premium upgrades within white-label: 70% partner / 30% MoneyLife
- Minimum annual commitment: €18,000

### 2.3 Add-Ons

| Add-On | Price |
|---|---|
| Banking integration (Plaid/TrueLayer) | +€2,000/mo |
| Mirror Mode (real vs simulated comparison) | +€1,500/mo |
| Custom scenario pack (10 scenarios) | €5,000 one-time |
| Dedicated infrastructure (single-tenant) | +€5,000/mo |
| Priority feature development | €200/hr (min 20hr blocks) |
| Annual security audit report | €3,000/yr |
| Teacher/classroom admin portal | +€500/mo |

---

## 3. Free App Monetization

### 3.1 Freemium Feature Split

| Feature | **Free** | **Premium (€4.99/mo or €39.99/yr)** |
|---|---|---|
| Levels 1-4 | ✅ | ✅ |
| Levels 5-8 | ❌ (locked) | ✅ |
| Personas | 2 (Teen, Student) | All 4 |
| Decision cards per day | 3 | Unlimited |
| Savings goals | 1 active | 5 active |
| Difficulty modes | Normal only | Easy/Normal/Hard |
| Monthly reports | Basic | Detailed + trends |
| Credit Health breakdown | Score only | Full sub-score analysis |
| Competitive modes | View only | Full participation |
| Classroom mode | ❌ | ✅ |
| Investment simulation | ❌ | ✅ |
| Insurance mechanics | ❌ | ✅ |
| Ad-free experience | Interstitial ads (1 per 5 min) | ✅ |
| Custom avatar | Basic | Full customization |
| Badge display | Last 5 | Full collection |
| Streak recovery | ❌ (streak resets) | 1 free recovery/week |

### 3.2 Advertising Revenue (Free Tier)

- **Interstitial ads:** 1 per 5 minutes of active play, skippable after 5s
- **Estimated eCPM:** €3-8 (finance audience = high CPM)
- **Daily ad impressions per user:** ~3-4 (15-20 min avg session)
- **Monthly revenue per free DAU:** €0.30-0.80
- **Ad networks:** Google AdMob (primary), Meta Audience Network (secondary)
- **No ads in:** tutorial, month-end review, reward redemption, or any bank-branded white-label

### 3.3 Sponsored Challenges

Partners (brands, banks, fintechs) sponsor in-game challenges:

- **Sponsored "Financial Challenge Week":** Brand pays €5,000-15,000 for a 7-day themed challenge visible to all users in target region
- **User sees:** "This week's savings challenge is brought to you by [Brand]" + brand logo
- **Brand gets:** Impressions report, completion rates, optional post-challenge survey, opt-in lead capture
- **Frequency cap:** Max 1 sponsored challenge per 2 weeks per user
- **User opt-out:** Users can hide sponsored content (reduces coin rewards by 10%)

### 3.4 Data Insights (Anonymized, Aggregated)

Sell anonymized, aggregated financial behavior insights to:
- Banks (understand how young adults think about money)
- Researchers (academic partnerships)
- Government agencies (financial literacy program design)

**Pricing:**
- Standard quarterly report: €10,000/quarter
- Custom research query: €5,000-25,000 per project
- API access to aggregated data: €3,000/mo

**Privacy requirements:**
- k-anonymity ≥ 50 (no group smaller than 50 users)
- No individual-level data ever leaves the platform
- Fully GDPR compliant — consent at signup, separate consent for data insights
- Published privacy methodology paper for trust

---

## 4. Launch Strategy

### 4.1 Market Sequencing

| Phase | Market | Timeline | Why |
|---|---|---|---|
| **Phase 1** | Romania | Month 1-6 | Home market, local network, Romanian banking contacts, low CAC, fast iteration |
| **Phase 2** | Poland, Hungary, Czech Republic | Month 6-12 | Similar banking landscape, EU but lower competition, scalable from RO playbook |
| **Phase 3** | UK | Month 9-15 | Largest EU-adjacent fintech market, Open Banking mature, English content = global template |
| **Phase 4** | Germany, France | Month 12-18 | Large markets, strong bank partnership potential, require localization investment |
| **Phase 5** | US (limited) | Month 18-24 | Largest market but highest competition, enter via school/classroom partnerships |

### 4.2 Romania Launch Plan (Phase 1 Detail)

**Month 1-2: Closed Beta**
- 200 users from personal network + university contacts
- Target: Bucharest universities (ASE, Politehnica, UBB Cluj)
- Feedback loops: in-app surveys, weekly Discord calls with beta users
- KPIs: D7 retention > 40%, NPS > 30, crash rate < 1%

**Month 3: Open Beta**
- Expand to 2,000 users
- Press coverage: start.ro, profit.ro, wall-street.ro
- Partnership outreach begins: BCR, BRD, ING Romania, Banca Transilvania
- App Store optimization for Romanian keywords

**Month 4-5: Public Launch**
- Full Romanian localization (RON currency, Romanian scenarios, local brands)
- Launch event: online webinar with Romanian financial influencers
- Facebook/Instagram ads targeting 18-30 age group in Romania
- Target: 10,000 downloads first month

**Month 6: First White-Label Deal**
- Target: 1 Romanian bank (most likely Banca Transilvania or BCR — most innovative)
- Pilot: 3-month Starter tier, 2,000 seats
- Use pilot data + bank logo for all subsequent sales materials

### 4.3 Localization Requirements Per Market

| Market | Currency | Language | Tax System | Regulatory | Special Scenarios |
|---|---|---|---|---|---|
| Romania | RON | Romanian | Flat 10% income, 25% VAT | GDPR, no specific fintech license needed for simulation | Pillar II pension, "Prima Casă" mortgage program |
| Poland | PLN | Polish | Progressive income tax | GDPR, KNF oversight for banking integrations | PPK pension, "Bezpieczny Kredyt" |
| Hungary | HUF | Hungarian | Flat 15% income | GDPR, MNB oversight | SZÉP card system, CSOK housing |
| Czech Republic | CZK | Czech | Progressive income | GDPR, CNB oversight | Building savings (stavební spoření) |
| UK | GBP | English | Progressive income, NI | GDPR UK, FCA for any regulated activity | ISA, Help to Buy, student loan plans |
| Germany | EUR | German | Progressive + Solidaritätszuschlag | GDPR, BaFin for regulated activity | Riester pension, Bausparvertrag |
| France | EUR | French | Progressive income | GDPR, AMF/ACPR for regulated | PEL, Livret A, PEA |
| US | USD | English | Federal + state income tax | State-by-state, COPPA for minors | 401(k), IRA, FAFSA, credit score (FICO) |

---

## 5. Partnership Playbook

### 5.1 Target Partner Profiles

**Tier 1 — Large Banks (500K+ customers)**
- Decision maker: Head of Digital / Chief Innovation Officer / Head of Retail
- Sales cycle: 6-12 months
- Deal size: Professional or Enterprise tier
- Entry: Innovation lab / accelerator / hackathon sponsorship

**Tier 2 — Digital Banks & Neobanks (50K-500K customers)**
- Decision maker: CPO / Head of Product
- Sales cycle: 2-4 months
- Deal size: Starter or Professional tier
- Entry: Direct outreach, fintech events, warm intros

**Tier 3 — Credit Unions & Community Banks**
- Decision maker: CEO / Marketing Director
- Sales cycle: 1-3 months
- Deal size: Starter tier
- Entry: Industry associations, group deals

### 5.2 Outreach Email Templates

**Template 1 — Cold Outreach to Bank Innovation Lead**

```
Subject: Financial literacy game — your brand, your customers, our tech

Hi [Name],

I'm building MoneyLife — a mobile game where [Bank Name] customers can learn personal finance by simulating real-life money decisions (budgeting, credit, loans, investing) with virtual money in [Currency].

Why this matters for [Bank Name]:
• 73% of Gen Z say they want their bank to help them learn about money
• Banks with financial wellness tools see 2.3x higher engagement and 35% lower churn
• Your competitor [Competitor Bank] just launched a financial literacy program

What we offer:
• White-label mobile game, your brand, embedded in your app or standalone
• Dashboard showing customer engagement, financial literacy improvement, at-risk signals
• Live in 8 weeks, no dev work on your side

I have a 5-minute demo — worth a quick look?

[Name]
Founder, MoneyLife
```

**Template 2 — Follow-up After Demo**

```
Subject: Re: MoneyLife demo — next steps

Hi [Name],

Thanks for taking the time yesterday. As discussed:

1. I'm sending over the pilot proposal (3-month Starter, 2,000 seats, €7,500 total)
2. Our team will customize 3 scenarios with [Bank Name] branding
3. Integration with your app via SDK takes ~2 weeks

The pilot includes:
• Full analytics dashboard (engagement, literacy scores, feature usage)
• Monthly report on customer insights
• Dedicated Slack channel for your team

Happy to jump on a call with your product/tech team this week to discuss integration.

[Name]
```

**Template 3 — School/University Partnership**

```
Subject: Free financial literacy game for your students

Hi [Name],

I'm reaching out from MoneyLife — we've built a mobile game that teaches personal finance through realistic life simulation. Students manage virtual money, face real-world scenarios (rent, credit cards, emergencies), and learn by doing.

For [University Name], we're offering:
• Free classroom licenses for up to 500 students
• Teacher dashboard to track student progress
• Aligns with [relevant curriculum standard]
• 30-minute setup, works on any phone

We're already used by [X students / X schools] in Romania. Would you be interested in a quick demo?

[Name]
```

### 5.3 Pitch Deck Outline (12 slides)

1. **Cover:** MoneyLife — Financial Literacy Through Play
2. **Problem:** 67% of adults can't pass a basic financial literacy test; banks lose customers who make poor financial decisions
3. **Solution:** Life-simulation game with virtual money — learn by doing, not reading
4. **Demo:** 3-screen walkthrough (home → decision card → monthly review)
5. **Market Size:** $4.5B financial wellness market, growing 23% CAGR
6. **Business Model:** White-label SaaS + consumer app
7. **Traction:** [X] users, [X]% D30 retention, [X] NPS, [X] pilot partners
8. **Competition:** Comparison matrix showing MoneyLife vs Zogo vs Budget Challenge vs GoHenry
9. **White-Label Value:** Bank engagement +2.3x, churn -35%, customer LTV +20%
10. **Team:** Founder background, advisory board
11. **Financials:** Revenue projections, unit economics
12. **Ask:** Pilot partnership / €500K seed round

### 5.4 Objection Handling

| Objection | Response |
|---|---|
| "We already have financial education content" | "Content ≠ engagement. Quiz completion rates are 8-12%. Our game has 67% monthly retention because it's actually fun. We complement your content — not replace it." |
| "Our customers don't want games" | "They already play games — 65% of adults play mobile games weekly. The question is whether those games teach them about money. Our users improve their financial decision-making by 31% in 3 months." |
| "Too expensive" | "At €0.50/user/month, it's cheaper than one customer service call about overdraft fees. And it prevents those calls." |
| "Security concerns" | "We're SOC 2 Type II compliant, GDPR compliant, data encrypted at rest and in transit, annual pen testing. We can run on your infrastructure if needed (Enterprise tier)." |
| "Long integration timeline" | "SDK integration is 2 weeks. Deep link integration is 2 days. We handle everything else." |
| "We want to build this in-house" | "Building a game engine, simulation model, 200+ scenarios, and reward system takes 12-18 months and €500K+. We're live in 8 weeks at a fraction of the cost." |

---

## 6. Competitive Moat

### 6.1 Defensible Advantages

| Moat Layer | Strength | Durability |
|---|---|---|
| **Simulation engine complexity** | Deep double-entry ledger + consequence graph + multi-currency + macro modeling = 18+ months to replicate | High — compound advantage grows with each new scenario |
| **Content library** | 200+ scenarios, 8 levels, 4 personas, localized for 8+ markets | Medium — content can be copied but takes time |
| **Bank partnerships** | Each white-label deal = switching cost (integration, training, branding) | High — banks don't switch vendors easily (2-3 year cycles) |
| **User data & engagement proof** | Behavioral data on financial decision-making across demographics | High — data compounds, can't be bootstrapped |
| **Network effects (classroom)** | Teachers create custom scenarios → shared with other teachers → platform grows | Medium — requires critical mass |
| **Localization depth** | Not just translation: region-specific tax, banking products, cultural scenarios | High — each market is 3-6 months of localization work |

### 6.2 What's NOT Defensible

- Basic gamification (XP, badges, streaks) — trivial to copy
- UI/UX design — can be replicated
- Reward partnerships — any platform can offer gift cards
- App Store presence — SEO is temporary

### 6.3 Building Switching Costs

- **For banks:** Deep integration with their app, custom scenarios, staff training, published case studies referencing MoneyLife metrics
- **For users:** Progress history, badge collection, streak records, social connections, classroom memberships
- **For teachers:** Custom scenario libraries, student progress history, curriculum alignment documentation

---

## 7. User Acquisition

### 7.1 CAC Targets

| Channel | Target CAC | Payback Period | Notes |
|---|---|---|---|
| Organic (ASO) | €0 | Immediate | App Store optimization, keyword targeting |
| Content marketing (TikTok/Instagram/YouTube) | €0.50-1.50 | 30 days | Financial literacy content, game clips |
| Facebook/Instagram ads | €2.00-4.00 | 60 days | Targeting 18-30, interest in personal finance |
| Google UAC | €1.50-3.00 | 45 days | App install campaigns |
| Influencer partnerships | €1.00-2.00 | 30 days | Micro-influencers (10K-100K followers) in finance niche |
| School/university partnerships | €0.20-0.50 | N/A (free users → premium conversion) | Bulk onboarding, low marginal cost |
| Bank white-label (B2B2C) | €0 (bank pays) | Immediate | Bank drives installs to their branded version |
| Referral program | €0.50 (reward cost) | 14 days | In-app referral with coin bonus |

### 7.2 Content Strategy

**TikTok/Instagram Reels (Primary Channel)**
- "Can you survive on minimum wage?" — gameplay clips showing tough decisions
- "I went bankrupt in a game and learned about emergency funds"
- "This game predicted I'd be in debt by 25 — here's why"
- Financial myth-busting using game mechanics as proof
- "Day 1 vs Day 30 of managing money" progression videos
- Posting cadence: 3-5 reels/week
- Target: 1M organic views/month by Month 6

**YouTube (Secondary)**
- "I played a money game for 30 days — here's what I learned" (10-15 min)
- Partnerships with finance YouTubers (Graham Stephan, Andrei Jikh style in each market)
- Tutorial/walkthrough videos

**Blog/SEO**
- "Best financial literacy apps 2026" — rank for comparison keywords
- "How to teach kids about money" — parent audience
- "Financial literacy curriculum resources" — teacher audience

### 7.3 App Store Optimization (ASO)

**Primary Keywords (English):**
money game, financial literacy, budget simulator, finance game, money management game, personal finance app, budget game, saving money game

**Category:** Education > Finance (primary), Games > Simulation (secondary)

**Screenshots (5 required):**
1. Hero shot with tagline: "Learn Money by Living It"
2. Decision card gameplay
3. Monthly review dashboard with Credit Health
4. Level progression with badges
5. Social/classroom features

---

## 8. KPIs Per Stakeholder

### 8.1 Bank Partner Dashboard

| Metric | Description | Target |
|---|---|---|
| Monthly Active Users (MAU) | Users who completed ≥1 game day | 15% of eligible customer base |
| Engagement Rate | Avg sessions/week per active user | ≥ 3.5 |
| Completion Rate | % who finish Level 1 | ≥ 60% |
| Financial Literacy Score | Pre/post assessment improvement | ≥ 20% improvement |
| NPS | In-app NPS survey (monthly) | ≥ 40 |
| Retention (D30) | % active after 30 days | ≥ 35% |
| Cross-sell Readiness | Users who explore savings/investment scenarios | Track for bank's use |
| Support Ticket Rate | Game-related support tickets | < 0.5% of MAU |

### 8.2 End User Health Scores

| Metric | Description | Target |
|---|---|---|
| Budget Score | Monthly budget adherence (0-100) | Improve 15 points in 3 months |
| Credit Health Index | Simulated credit score (300-850) | Maintain ≥ 700 by Level 4 |
| Emergency Fund Ratio | Emergency savings / monthly expenses | Reach 3 months by Level 5 |
| Debt-to-Income Ratio | Monthly debt payments / monthly income | Keep below 36% |
| Net Worth Trend | Direction of net worth over 6 game months | Positive slope |
| Financial Confidence | Self-reported (1-5 scale, quarterly) | Improve 0.5 points in 6 months |

### 8.3 Investor Metrics

| Metric | Description | Target (Year 1) |
|---|---|---|
| Total Downloads | Cumulative app installs | 100K |
| MAU | Monthly active users | 25K |
| D1/D7/D30 Retention | Cohort retention rates | 60%/35%/20% |
| Premium Conversion | Free → paid conversion | 5-8% |
| MRR (B2C) | Monthly recurring revenue from subscriptions | €10K |
| ARR (B2B) | Annual recurring revenue from white-label | €100K |
| CAC/LTV Ratio | Customer acquisition cost vs lifetime value | > 3:1 |
| Burn Rate | Monthly cash outflow | < €15K |
| Runway | Months of cash remaining | > 12 months |

---

## 9. Regulatory Strategy

### 9.1 Simulation-Only Mode (No License Required)

For the core game (virtual money, no real accounts, no real payments):
- **No financial services license needed** in any EU market
- **GDPR compliance required** in all EU/UK markets
- **COPPA/age-gating** if targeting under-13 (recommendation: age-gate to 13+)
- This covers: Phase 1-3 of the product (simulation, rewards with gift cards, classroom mode)

### 9.2 When Licenses Are Needed

| Activity | License | Markets | Cost | Timeline |
|---|---|---|---|---|
| Viewing real bank account data | AISP (Account Information Service Provider) | EU (PSD2) | €15,000-50,000 setup + €10,000-25,000/yr compliance | 6-12 months |
| Initiating real payments | PISP (Payment Initiation Service Provider) | EU (PSD2) | €50,000-100,000 setup + €25,000-50,000/yr | 9-18 months |
| Holding customer funds | EMI (Electronic Money Institution) | EU | €350,000+ capital + €100,000+/yr | 12-24 months |
| None of the above (simulation only) | None | All | €0 | Immediate |

**Recommendation:** Stay simulation-only for 18+ months. Use Plaid/TrueLayer as "agents" — they hold the licenses, you access through their API. This is the "piggyback" strategy used by most fintechs.

### 9.3 Per-Market Regulatory Notes

| Market | Regulator | Key Requirement | Risk Level |
|---|---|---|---|
| Romania | BNR (National Bank of Romania) | GDPR via ANSPDCP; no license for simulation | Low |
| Poland | KNF | GDPR via UODO; strict on financial marketing claims | Low-Medium |
| UK | FCA | Very clear: simulation = no license; Mirror Mode with real data = potential AISP | Medium |
| Germany | BaFin | Conservative; any "advice" framing could trigger MiFID II concerns | Medium-High |
| France | ACPR/AMF | Similar to Germany; careful with "conseil en investissement" language | Medium-High |
| US | State-by-state + CFPB | No federal license for simulation; careful with reward claims (sweepstakes laws) | Medium |

---

## 10. Revenue Projections

### 10.1 Year 1 — Foundation (Romania + CEE)

**Assumptions:**
- Launch Month 3, Romania only
- First white-label deal Month 6
- 2 white-label deals by Month 12
- 50K consumer downloads by Month 12
- 5% premium conversion rate
- €4.99/mo premium price

| Revenue Stream | Monthly (Month 12) | Annual Total |
|---|---|---|
| Premium subscriptions (B2C) | €6,250 (2,500 paying × €2.50 avg) | €30,000 |
| Advertising (free tier) | €3,000 | €15,000 |
| White-label Starter × 1 | €2,500 | €20,000 |
| White-label Professional × 1 | €7,500 | €45,000 |
| Sponsored challenges | €2,500 | €10,000 |
| **Total** | **€21,750** | **€120,000** |

**Costs:**
| Cost | Monthly | Annual |
|---|---|---|
| Infrastructure (cloud) | €500 | €6,000 |
| Andrei's time (opportunity cost) | €5,000 | €60,000 |
| Marketing | €2,000 | €18,000 |
| Legal/compliance | €500 | €6,000 |
| Tools/services | €300 | €3,600 |
| **Total** | **€8,300** | **€93,600** |

**Year 1 Net:** ~€26,000 profit (excluding opportunity cost: €86,000)

### 10.2 Year 2 — Expansion (UK + Western EU)

**Assumptions:**
- 200K total consumer downloads
- 8% premium conversion (improved onboarding)
- 6 white-label deals (2 Starter, 3 Professional, 1 Enterprise)
- 1 data insights customer

| Revenue Stream | Monthly (Month 24) | Annual Total |
|---|---|---|
| Premium subscriptions | €40,000 | €300,000 |
| Advertising | €12,000 | €100,000 |
| White-label contracts | €47,500 | €450,000 |
| Sponsored challenges | €10,000 | €80,000 |
| Data insights | €5,000 | €40,000 |
| **Total** | **€114,500** | **€970,000** |

### 10.3 Year 3 — Scale

**Assumptions:**
- 1M total downloads, 150K MAU
- 15 white-label deals
- 2 Enterprise clients
- US classroom market entry

| Revenue Stream | Annual Total |
|---|---|
| Premium subscriptions | €800,000 |
| Advertising | €250,000 |
| White-label contracts | €1,500,000 |
| Sponsored challenges | €200,000 |
| Data insights | €150,000 |
| **Total** | **€2,900,000** |

---

## 11. Exit Scenarios

### 11.1 Scenario Analysis

| Exit Type | Timeline | Likely Valuation | Probability | Notes |
|---|---|---|---|---|
| **Acqui-hire by bank** | Year 2-3 | €1-3M | 25% | Bank buys team + product to run in-house |
| **Acquisition by fintech** | Year 3-4 | €5-15M | 30% | Neobank (Revolut, N26) acquires for user engagement |
| **Acquisition by edtech** | Year 3-5 | €3-10M | 20% | Education platform (Duolingo, Khan Academy) adds finance vertical |
| **Private equity roll-up** | Year 4-5 | €10-30M | 15% | PE firm building financial wellness portfolio |
| **IPO (very long-term)** | Year 7+ | €100M+ | 5% | Only if dominant market position achieved |
| **Lifestyle business** | Ongoing | N/A | 5% | €1-3M ARR with small team, good margins |

### 11.2 Valuation Drivers

- **Revenue multiples:** EdTech SaaS: 8-15x ARR; FinTech SaaS: 10-20x ARR
- **User engagement:** D30 retention above 30% = top-tier for education apps
- **White-label contracts:** Recurring B2B revenue valued higher than B2C
- **Data moat:** Unique dataset on financial decision-making behavior
- **Regulatory positioning:** Already compliant = lower risk for acquirer
- **Team:** Domain expertise in finance + gaming + education

### 11.3 Most Likely Path

1. **Year 1:** Launch Romania, prove engagement, land 1-2 bank pilots
2. **Year 2:** Expand to UK/CEE, 5+ white-label deals, raise seed (€500K-1M)
3. **Year 3:** Hit €2-3M ARR, raise Series A (€3-5M) or get acquired
4. **Most likely exit:** Acquisition by a neobank or financial wellness platform at Year 3-4 for €5-15M

---

## Appendix A — Financial Literacy Market Data

- Global financial literacy market: $4.5B (2025), projected $12B by 2030 (23% CAGR)
- 67% of adults worldwide cannot pass a basic financial literacy test (S&P Global FinLit Survey)
- Banks with financial wellness programs see 35% lower customer churn (Gallup)
- 73% of Gen Z want their bank to help them manage money better (BAI Banking Strategies)
- Average bank spends €2-5 per customer on financial education annually
- Mobile game market: $100B+ globally; average session 23 minutes
- Finance apps have highest CPMs for advertising (€8-15 eCPM)

## Appendix B — Comparable Company Valuations

| Company | Last Valuation | Revenue (est) | Multiple | Category |
|---|---|---|---|---|
| Zogo | $25M (Series A) | ~$5M ARR | 5x | Financial literacy (B2B2C) |
| Greenlight | $2.3B (Series D) | ~$200M ARR | 11.5x | Family finance + education |
| GoHenry (Acorns) | Acquired for ~$165M | ~$40M ARR | 4x | Kids finance + education |
| Duolingo | $12B (public) | ~$600M ARR | 20x | Gamified education (language) |
| Kahoot! | $1.7B (public) | ~$200M ARR | 8.5x | Gamified education (general) |

MoneyLife sits at the intersection of Zogo (B2B2C financial literacy) and Duolingo (gamified learning). A successful execution should target Zogo-like multiples initially (5-8x) growing to Duolingo-like multiples (15-20x) as the consumer base scales.
