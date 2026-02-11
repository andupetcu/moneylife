# MoneyLife — Localization & Regional Configuration

> Version 1.0 · February 2026
> Comprehensive guide for making MoneyLife authentically local in every target market.
> Based on regulatory research: `financial-game-app-research.md` + `localization-regulatory-research.md`

---

## Table of Contents

1. [Localization Philosophy](#1-localization-philosophy)
2. [Territory Profiles](#2-territory-profiles)
3. [Currency System](#3-currency-system)
4. [Exchange Rate Engine](#4-exchange-rate-engine)
5. [Financial Products Per Region](#5-financial-products-per-region)
6. [Tax Systems Per Region](#6-tax-systems-per-region)
7. [Payment Rails & Scenario Realism](#7-payment-rails--scenario-realism)
8. [Youth Privacy & Age Gating](#8-youth-privacy--age-gating)
9. [Reward & Prize Compliance](#9-reward--prize-compliance)
10. [Data Residency & Cross-Border](#10-data-residency--cross-border)
11. [Language & UI Localization](#11-language--ui-localization)
12. [Regional Scenario Catalog](#12-regional-scenario-catalog)
13. [Implementation: Region Config Schema](#13-implementation-region-config-schema)

---

## 1. Localization Philosophy

MoneyLife is not a translated app — it's a **locally authentic** financial simulation. A Romanian player should encounter RON, Prima Casă mortgages, and RoPay transfers. A Swedish player should see SEK, Swish payments, and ISK pension contributions. A Japanese player should see JPY (no decimals), Zengin bank transfers, and NISA investment accounts.

### 1.1 Three Layers of Localization

| Layer | What | Example |
|---|---|---|
| **L1 — Language** | UI strings, tutorials, narrative text | "Economii" (RO) vs "Savings" (EN) |
| **L2 — Financial System** | Tax rules, banking products, payment methods, insurance types, retirement systems | Pillar II pension (RO) vs 401(k) (US) vs ISA (UK) |
| **L3 — Cultural Context** | Spending patterns, typical salaries, cost of living, brand names, life milestones | University tuition free (RO/DE) vs $50K/yr (US) |

All three layers must be consistent. Translating the UI to Romanian but showing US tax brackets breaks immersion and teaches the wrong system.

### 1.2 "Learn Foreign" Mode

Players can optionally select a **different** region than their home to learn a foreign financial system:

- A Romanian student planning to move to Germany can simulate EUR life with German tax and rent rules
- A US parent can explore how the UK system works before relocating
- A teacher can assign "compare your country's system with Japan's"

This is toggled at game creation: `home_region` (default, from device locale) vs `simulation_region` (user-selected). Currency, tax, products, and scenarios all follow the `simulation_region`.

---

## 2. Territory Profiles

### 2.1 Launch Priority & Status

| Priority | Territory | Currency | Language | Status | Notes |
|---|---|---|---|---|---|
| **P1** | Romania | RON | Romanian | Launch market | Home turf, full depth |
| **P1** | UK | GBP | English | Month 9 | Largest fintech market, English = global template |
| **P2** | Poland | PLN | Polish | Month 6 | CEE expansion, similar banking |
| **P2** | Hungary | HUF | Hungarian | Month 8 | CEE, unique currency (0 decimals) |
| **P2** | Czech Republic | CZK | Czech | Month 8 | CEE cluster |
| **P3** | France | EUR | French | Month 12 | Large EU market, Cartes Bancaires |
| **P3** | Spain | EUR | Spanish | Month 12 | Large EU market, Bizum |
| **P3** | Italy | EUR | Italian | Month 14 | Large EU market, BANCOMAT/PagoPA |
| **P3** | Germany | EUR | German | Month 12 | Conservative banking, BaFin caution |
| **P4** | Nordics (DK/SE/NO/FI/IS) | DKK/SEK/NOK/EUR/ISK | Local + EN | Month 15 | High fintech adoption, 5 currencies |
| **P4** | USA | USD | English | Month 18 | Largest market, highest complexity |
| **P5** | Canada | CAD | EN/FR | Month 20 | Bilingual, strong FX API |
| **P5** | Australia | AUD | English | Month 20 | CDR, strong fintech |
| **P6** | Japan | JPY | Japanese | Month 24 | 0-decimal currency, APPI |
| **P6** | Brazil | BRL | Portuguese | Month 24 | Pix, Open Finance |
| **P6** | India | INR | Hindi/English | Month 24 | UPI, Account Aggregator |
| **P7** | China | CNY | Chinese | Month 30+ | PIPL, data localization, high risk |

### 2.2 Regulatory Profile Groups

```
Group A — EU/EEA (GDPR + PSD2)
├── Romania, France, Spain, Italy, Germany
├── Denmark, Sweden, Finland (EU)
└── Norway, Iceland (EEA — PSD2 via EEA)

Group B — Mandated Open Data
├── Australia (Consumer Data Right)
├── Brazil (Open Finance)
└── India (Account Aggregator)

Group C — Evolving Open Banking + Strong Promo/Tax Ops
├── USA (Section 1033 in flux)
└── Canada (Consumer-driven banking rollout)

Group D — High Localization Pressure
├── China (PIPL + data localization + sensitive data controls)
└── Japan (APPI + cross-border transfer controls)
```

---

## 3. Currency System

### 3.1 Supported Currencies

| ISO Code | Name | Symbol | Decimal Digits | Smallest Unit | Symbol Position | Grouping Separator | Decimal Separator |
|---|---|---|---|---|---|---|---|
| RON | Romanian Leu | lei | 2 | ban (1/100) | after, space: `1.234,56 lei` | `.` | `,` |
| EUR | Euro | € | 2 | cent (1/100) | varies by locale | varies | varies |
| GBP | British Pound | £ | 2 | penny (1/100) | before: `£1,234.56` | `,` | `.` |
| PLN | Polish Złoty | zł | 2 | grosz (1/100) | after, space: `1 234,56 zł` | ` ` (space) | `,` |
| HUF | Hungarian Forint | Ft | **0** | — (no subunit) | after, space: `1 234 Ft` | ` ` (space) | — |
| CZK | Czech Koruna | Kč | 2 | haléř (1/100) | after, space: `1 234,56 Kč` | ` ` (space) | `,` |
| DKK | Danish Krone | kr. | 2 | øre (1/100) | after: `1.234,56 kr.` | `.` | `,` |
| SEK | Swedish Krona | kr | 2 | öre (1/100)* | after, space: `1 234,56 kr` | ` ` (space) | `,` |
| NOK | Norwegian Krone | kr | 2 | øre (1/100)* | after, space: `1 234,56 kr` | ` ` (space) | `,` |
| ISK | Icelandic Króna | kr. | **0** | — (no subunit) | after: `1.234 kr.` | `.` | — |
| USD | US Dollar | $ | 2 | cent (1/100) | before: `$1,234.56` | `,` | `.` |
| CAD | Canadian Dollar | $ | 2 | cent (1/100) | before: `$1,234.56` (EN) / `1 234,56 $` (FR) | `,`/` ` | `.`/`,` |
| AUD | Australian Dollar | $ | 2 | cent (1/100) | before: `$1,234.56` | `,` | `.` |
| JPY | Japanese Yen | ¥ | **0** | — (no subunit) | before: `¥1,234` | `,` | — |
| BRL | Brazilian Real | R$ | 2 | centavo (1/100) | before: `R$ 1.234,56` | `.` | `,` |
| INR | Indian Rupee | ₹ | 2 | paisa (1/100) | before: `₹1,23,456.78` | `,` (lakhs grouping) | `.` |
| CNY | Chinese Yuan | ¥ | 2 | fēn (1/100) | before: `¥1,234.56` | `,` | `.` |

*\*SEK/NOK: öre/øre exist technically but are not used in cash; still used in digital transactions.*

### 3.2 Internal Representation

**ALL monetary values stored as integers in the smallest unit:**

| Currency | Internal 5,000.00 | Internal 5,000 (no decimals) |
|---|---|---|
| RON | `500000` (bani) | — |
| EUR | `500000` (cents) | — |
| HUF | `5000` (forints) | `5000` |
| JPY | `5000` (yen) | `5000` |
| INR | `500000` (paise) | — |

**Critical rule:** The `decimal_digits` field in the currency config determines the multiplier. `amount_in_display = amount_internal / (10 ^ decimal_digits)`.

### 3.3 Display Rules

1. **Always show the ISO code** alongside the symbol in any context where ambiguity is possible ($ could be USD, CAD, AUD, or others)
2. Use CLDR/ICU formatting via `intl` package — never hardcode separators
3. For currencies with 0 decimal digits (HUF, JPY, ISK), never show `.00`
4. Negative amounts: use locale convention (parentheses in US accounting, minus sign elsewhere)
5. Color coding: green for positive, red for negative — but verify against colorblind-safe palette

### 3.4 Rounding Rules

| Context | Rule | Example (EUR) |
|---|---|---|
| Display | Round to currency's decimal digits | `€12.345` → `€12.35` |
| Interest calculation | Compute in full precision, round at credit time | `10000 × 0.002060 = 20.60` → credit `2060` (cents) |
| FX conversion | Round to target currency's decimal digits, **round half-even** (banker's rounding) | `100 USD × 0.9234 = 92.34 EUR` |
| Tax calculation | Round **down** (truncate) — taxpayer-favorable | `tax = floor(income × rate)` |
| Loan amortization | Last payment absorbs rounding remainder | Final installment adjusted ±1 cent |
| Inflation adjustment | Round to nearest unit, apply monthly | `price × (1 + monthly_rate)`, round |

---

## 4. Exchange Rate Engine

### 4.1 Two Modes

**Mode A — Simulated FX (Default)**
- Fixed rates defined per scenario/level
- Deterministic — same seed = same rates
- Best for: pedagogy, A/B testing, competitive fairness
- Rates can drift ±5% per game year to teach FX concepts
- Config: `fx_mode: "simulated"` in region config

**Mode B — Live Reference FX**
- Daily rates from official central bank sources
- Cached once per day, labeled "indicative"
- Best for: realism mode, Mirror Mode
- Config: `fx_mode: "live_reference"`

### 4.2 Official FX Sources Per Territory

| Territory | Source | API/Feed | Update Frequency | Format | Rate Type |
|---|---|---|---|---|---|
| EU/Eurozone | European Central Bank | `https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml` | Daily ~16:00 CET | XML | Reference rates vs EUR |
| Romania | National Bank of Romania (BNR) | `https://www.bnr.ro/nbrfxrates.xml` | Daily ~13:00 EET | XML | Official rates vs RON |
| Denmark | Danmarks Nationalbank | API (JSON) | Daily | JSON | Official rates vs DKK |
| Sweden | Sveriges Riksbank | API (JSON/XML) | Daily | JSON/XML | Cross rates vs SEK |
| Norway | Norges Bank | API (JSON/XML) | Daily | JSON/XML | Reference rates vs NOK |
| Iceland | Central Bank of Iceland | Published rates page | Daily | HTML/CSV | Official rates vs ISK |
| UK | Bank of England | Statistical Interactive Database | Daily | XML/CSV | Spot rates vs GBP |
| USA | Federal Reserve | H.10 release / FRED API | Daily (business days) | XML/JSON | Noon buying rates |
| Canada | Bank of Canada | Valet API (`https://www.bankofcanada.ca/valet/`) | Daily | JSON/XML/CSV | Indicative rates vs CAD |
| Australia | Reserve Bank of Australia | Statistical tables | Daily (business days) | CSV | 4pm rates vs AUD |
| Japan | Bank of Japan | Time-series data | Daily | CSV | Reference rates vs JPY |
| Brazil | Banco Central do Brasil | PTAX (SGS system) | Daily | JSON | Buy/sell PTAX vs BRL |
| India | Reserve Bank of India | Reference Rate page | Daily | HTML | Reference rates vs INR |
| China | CFETS / PBoC | China Money central parity | Daily ~09:15 CST | Published | Central parity vs CNY |

### 4.3 FX Fallback Chain

```
1. Primary: Official central bank API for the user's home currency
2. Secondary: ECB reference rates (covers 30+ currencies vs EUR)
3. Tertiary: Commercial API (e.g., exchangeratesapi.io, Open Exchange Rates)
4. Emergency: Last cached rate + stale indicator shown to user
```

### 4.4 FX in Gameplay

Exchange rates appear in these scenarios:
- **Level 3+:** "Online Shopping" cards where price is in foreign currency
- **Level 5+:** "Travel" scenarios with currency conversion
- **Level 6+:** "Foreign Investment" with FX exposure
- **Level 7+:** "Inflation vs FX" — macro scenario comparing purchasing power across currencies
- **"Learn Foreign" mode:** All prices shown in simulation_region currency with optional home_region comparison

---

## 5. Financial Products Per Region

Each region has unique financial products that must be accurately represented in scenarios.

### 5.1 Romania (RON)

| Product | Game Equivalent | Details |
|---|---|---|
| **Cont curent** | Checking account | Standard, usually free for salary accounts |
| **Cont de economii** | Savings account | Typically 3-5% APY (2024-2026 range) |
| **Card de credit** | Credit card | APR 20-35%, minimum payment 3-5% |
| **Credit de nevoi personale** | Personal loan | APR 8-15%, 1-5 year terms |
| **Credit ipotecar** | Mortgage | APR 5-8% variable, 15-30 years |
| **Prima Casă / Noua Casă** | Government mortgage program | Subsidized rate, max €70K, state guarantee — unique Level 5+ scenario |
| **Pilonul II pensii** | Mandatory private pension | 3.75% of gross salary auto-deducted — teach as "forced savings" |
| **Pilonul III pensii** | Voluntary pension | Tax-deductible up to €400/yr — savings optimization scenario |
| **RoPay / Plăți Instant** | Instant transfer | Domestic instant A2A — "pay friend" scenario |
| **ROBOR** | Reference interest rate | Variable loan rates tied to ROBOR — teach "rate shock" risk |
| **Asigurare RCA** | Mandatory car insurance | Required by law — insurance scenario |
| **Asigurare PAD** | Mandatory home insurance (earthquake) | Required for homeowners — insurance scenario |
| **Depozit bancar** | Term deposit | Fixed term, higher rate than savings — time-value-of-money lesson |

### 5.2 UK (GBP)

| Product | Game Equivalent | Details |
|---|---|---|
| **Current account** | Checking | Often free, overdraft buffer common |
| **ISA (Individual Savings Account)** | Tax-free savings | £20K annual allowance, tax-free interest — unique product |
| **Lifetime ISA** | First-home savings | 25% government bonus up to £1K/yr, penalty for non-qualifying withdrawal |
| **Cash ISA / Stocks & Shares ISA** | Savings/Investment | Tax wrapper concept — unique to UK |
| **Help to Buy: Equity Loan** | Government mortgage support | Regional availability — housing scenario |
| **Student loan (Plan 2/5)** | Student debt | Repayment tied to income (9% above threshold), written off after 40 years |
| **National Insurance** | Social tax | Employee + employer contributions — paycheck deduction |
| **Council Tax** | Local property tax | Monthly bill, varies by property band — housing cost scenario |
| **TV Licence** | Mandatory media fee | £169.50/yr — subscription management scenario |
| **Faster Payments** | Instant transfer | UK domestic instant A2A |
| **Contactless limit** | Card payment | £100 limit — spending awareness |
| **Workplace pension (auto-enrolment)** | Employer pension | 8% minimum (5% employee + 3% employer) — retirement planning |
| **Bank of England base rate** | Reference rate | Variable mortgages/savings tied to this |

### 5.3 USA (USD)

| Product | Game Equivalent | Details |
|---|---|---|
| **Checking account** | Checking | Monthly fees common ($5-15), waivable with balance/DD |
| **Savings account** | Savings | Reg D limits (6 withdrawals/mo historically, relaxed but teach it) |
| **401(k)** | Employer retirement | Pre-tax, employer match up to 6%, $23,500 limit (2025) |
| **Roth IRA** | After-tax retirement | $7,000 limit, income limits, tax-free growth |
| **Traditional IRA** | Pre-tax retirement | $7,000 limit, tax-deferred |
| **529 Plan** | Education savings | State tax benefits, education expenses only |
| **HSA** | Health savings | Triple tax advantage, requires HDHP |
| **FICO Score** | Credit score | 300-850, five factors — map to Credit Health Index |
| **Federal student loans** | Student debt | FAFSA, income-driven repayment, forgiveness programs |
| **Zelle** | Instant transfer | Bank-to-bank instant, no fees |
| **Venmo/Cash App** | P2P payment | Social payments — spending scenario |
| **Federal income tax** | Progressive brackets | 10-37%, standard deduction $15,200 (2025) |
| **State income tax** | State tax | 0% (TX, FL) to 13.3% (CA) — regional variation |
| **FICA** | Social Security + Medicare | 7.65% employee, 7.65% employer |
| **Property tax** | Housing cost | 0.3-2.5% of assessed value by state |
| **Health insurance** | Insurance | Employer-provided or ACA marketplace, high premiums |
| **Auto insurance** | Insurance | Required in most states, varies wildly |

### 5.4 Germany (EUR)

| Product | Game Equivalent | Details |
|---|---|---|
| **Girokonto** | Checking | Some free, some €5-10/mo |
| **Tagesgeldkonto** | Savings (daily access) | Variable rate, no lock |
| **Festgeldkonto** | Term deposit | Fixed rate, fixed term |
| **Bausparvertrag** | Building savings contract | Hybrid savings+loan for home purchase — unique German product |
| **Riester-Rente** | Government-subsidized pension | State bonuses + tax deduction, complex rules |
| **Rürup-Rente** | Self-employed pension | Tax-deductible, no state bonus |
| **GKV (Gesetzliche Krankenversicherung)** | Statutory health insurance | ~14.6% + supplementary, split employer/employee |
| **PKV (Private Krankenversicherung)** | Private health insurance | Income-dependent eligibility, fixed premiums |
| **Solidaritätszuschlag** | Solidarity surcharge | 5.5% on income tax (high earners only post-2021) |
| **Kirchensteuer** | Church tax | 8-9% of income tax — opt-out possible |
| **Rundfunkbeitrag** | Public broadcasting fee | €18.36/mo per household |
| **SCHUFA** | Credit score equivalent | Private credit bureau, affects all applications |

### 5.5 France (EUR)

| Product | Game Equivalent | Details |
|---|---|---|
| **Compte courant** | Checking | Often includes card fees |
| **Livret A** | Tax-free savings | €22,950 cap, government-set rate (3% in 2024), tax-exempt — unique product |
| **PEL (Plan d'Épargne Logement)** | Housing savings plan | Regulated rate, generates mortgage rights after 4 years |
| **PEA (Plan d'Épargne en Actions)** | Tax-advantaged investment | €150K cap, tax-free gains after 5 years, EU stocks only |
| **Assurance-vie** | Life insurance / investment wrapper | Tax-advantaged after 8 years, most popular savings vehicle |
| **CSG/CRDS** | Social contributions | ~9.7% on investment income — affects net returns |
| **Impôt sur le revenu** | Progressive income tax | 0-45%, family quotient system (parts) — unique calculation |
| **Carte Bancaire (CB)** | Debit/credit card | Domestic scheme, €50 contactless |
| **Prélèvement à la source** | Tax withholding | Monthly paycheck deduction since 2019 |

### 5.6 Other Regions (Summary)

| Region | Key Unique Products | Key Unique Mechanics |
|---|---|---|
| **Poland** | PPK (workplace pension, auto-enrolled), "Bezpieczny Kredyt 2%" (subsidized mortgage), BLIK (instant mobile payment) | PLN formatting with space separators |
| **Hungary** | SZÉP card (employer benefit, tax-free), CSOK (family housing grant based on # of children), MÁP+ (government retail bond) | HUF 0-decimal, large numbers (avg salary ~600,000 HUF) |
| **Czech Republic** | Stavební spoření (building savings), doplňkové penzijní spoření (supplementary pension) | CZK with comma decimal |
| **Nordics (DK)** | NemKonto (national default account), Dankort (domestic card), ratepension (employer pension) | DKK with period grouping |
| **Nordics (SE)** | Swish (dominant P2P), ISK (investment savings account, flat tax on notional return), tjänstepension (occupational pension) | SEK with space grouping |
| **Nordics (NO)** | Vipps (dominant P2P/wallet), BSU (tax-deductible youth savings, <34 yrs), AFP (early retirement pension) | NOK with space grouping |
| **Nordics (FI)** | Euro zone, ASP (youth first-home savings, government bonus) | EUR with Finnish locale |
| **Nordics (IS)** | ISK 0-decimal, high inflation history, indexed loans (mortgage principal adjusts with CPI) | ISK 0-decimal, inflation-indexed loans unique mechanic |
| **Canada** | TFSA (Tax-Free Savings Account), RRSP (retirement), RESP (education), Interac e-Transfer | CAD bilingual (EN/FR) formatting |
| **Australia** | Superannuation (mandatory 11.5% employer contribution), HECS-HELP (income-contingent student loans), First Home Super Saver | AUD, NPP/Osko, BPAY bill codes |
| **Japan** | NISA (tax-free investment), iDeCo (self-directed pension), Zengin bank transfers, furusato nōzei (hometown tax donations) | JPY 0-decimal, fiscal year April-March |
| **Brazil** | Pix (instant A2A), CDI (reference rate), FGTS (mandatory savings fund), Bolsa Família (social welfare) | BRL, Pix as primary scenario rail |
| **India** | UPI (instant payments), PPF (Public Provident Fund), NPS (National Pension), FD (Fixed Deposit), SIP (Systematic Investment Plan) | INR lakhs grouping (₹1,23,456) |
| **China** | WeChat Pay / Alipay (dominant), hukou-based social services, zhufang gongjijin (housing provident fund) | CNY, no cash-like rewards, local hosting required |

---

## 6. Tax Systems Per Region

### 6.1 Income Tax Comparison (For Salary Simulation)

| Territory | Type | Brackets (Simplified) | Standard Deduction / Allowance | Filing Period |
|---|---|---|---|---|
| **Romania** | Flat | 10% on net income | Social contributions deducted first (~35% employer+employee total) | Calendar year, filed by May 25 |
| **UK** | Progressive | 0% (£12,570), 20% (to £50,270), 40% (to £125,140), 45% (above) | £12,570 personal allowance | Tax year Apr 6 – Apr 5 |
| **USA** | Progressive | 10/12/22/24/32/35/37% brackets | $15,200 standard deduction (2025) | Calendar year, filed by Apr 15 |
| **Germany** | Progressive (formula-based) | 0% (€11,604), 14-42% (progressive formula), 45% (€277,826+) | Grundfreibetrag €11,604 | Calendar year |
| **France** | Progressive + quotient familial | 0% (€11,294), 11/30/41/45% | Family parts system (unique) | Calendar year |
| **Poland** | Progressive | 12% (to 120,000 PLN), 32% (above) | 30,000 PLN tax-free amount | Calendar year |
| **Hungary** | Flat | 15% personal income tax | Social contribution 18.5% | Calendar year |
| **Japan** | Progressive | 5/10/20/23/33/40/45% | Various deductions | Calendar year (Apr fiscal for corps) |
| **Canada** | Progressive (federal + provincial) | 15/20.5/26/29/33% federal | $15,705 basic personal amount (2024) | Calendar year |
| **Australia** | Progressive | 0% ($18,200), 16/30/37/45% | Tax-free threshold $18,200 | Fiscal year Jul 1 – Jun 30 |

### 6.2 Tax in Gameplay

- **Levels 1-4:** Tax is simplified (flat deduction from salary, explained as "tax")
- **Level 5+:** Full tax system unlocked — players see breakdown of income tax, social contributions, and net pay
- **Level 6+:** "Tax optimization" scenarios — contribute to pension for deduction, choose investment wrappers
- **Annual event (Level 5+):** Tax filing — review year, potential refund or bill
- Tax rules come from `config/regions/{code}.json` — never hardcoded

---

## 7. Payment Rails & Scenario Realism

### 7.1 Per-Region Payment Scenarios

The game simulates real payment methods players would actually use:

| Territory | Primary Card | Instant A2A / P2P | Bill Payment | QR Payments | Notable |
|---|---|---|---|---|---|
| Romania | Visa/Mastercard | RoPay / Plăți Instant | Direct debit, standing orders | RoPay QR | Cash still common (~40% of transactions) |
| UK | Visa/Mastercard (debit dominant) | Faster Payments / Pay.UK | Direct Debit (DD mandate system) | — | Contactless dominant (£100 limit) |
| USA | Visa/MC/Amex/Discover | Zelle, FedNow (emerging) | ACH, bill pay portals | — | Check writing still exists (teach it) |
| Germany | Girocard (EC), Visa/MC | SEPA Instant | SEPA DD, Lastschrift | — | Cash preference higher than EU average |
| France | Carte Bancaire (CB) | SEPA Instant | SEPA DD, prélèvement | — | CB is co-branded with Visa/MC |
| Spain | Visa/MC | Bizum (dominant P2P) | SEPA DD | Bizum QR | Bizum near-universal adoption |
| Nordics | Local + Visa/MC | Swish (SE), Vipps (NO/DK), MobilePay (DK/FI) | Direct debit | QR via Swish/Vipps | Near-cashless societies |
| Japan | JCB, Visa/MC | Zengin (bank), PayPay (QR) | Convenience store (konbini) payments, bank transfer | PayPay, LinePay | Konbini payment is unique scenario |
| Brazil | Visa/MC/Elo | Pix (dominant) | Boleto bancário | Pix QR | Pix is #1 payment method |
| India | RuPay, Visa/MC | UPI (dominant) | NACH (auto-debit), BBPS (bill payments) | UPI QR | UPI QR at street vendors |
| Australia | Visa/MC (tap-to-pay) | NPP/Osko, PayID | BPAY (bill codes) | — | BPAY unique to AU |
| Canada | Visa/MC/Interac | Interac e-Transfer | Pre-authorized debit | — | Interac debit dominant domestically |
| China | UnionPay | WeChat Pay, Alipay | Auto-debit | QR dominant | WeChat/Alipay handle ~90% of mobile payments |

### 7.2 Payment Method Scenarios in Game

```
Level 1: "Pay for groceries" → card tap (contactless) or cash
Level 2: "Split dinner with friend" → P2P transfer (Bizum/Swish/Zelle/UPI per region)
Level 3: "Set up rent payment" → standing order / direct debit
Level 3: "Pay utility bill" → bill payment method (BPAY/konbini/boleto per region)
Level 4: "Online shopping in foreign currency" → card + FX markup lesson
Level 5: "Pay freelancer invoice" → bank transfer + reference number
Level 6: "Set up investment auto-deposit" → recurring transfer to investment account
Level 7: "Send money to family abroad" → international wire / remittance + FX
```

---

## 8. Youth Privacy & Age Gating

### 8.1 Consent Age Per Territory

| Territory | Online Consent Age | Source | Game Impact |
|---|---|---|---|
| Romania | 16 | GDPR default, Romanian DPA FAQ | Under 16: parental consent required, no data-driven features |
| France | 15 | CNIL guidance | Under 15: parental consent |
| Spain | 14 | AEPD materials | Under 14: parental consent |
| Italy | 14 | Personal Data Protection Code | Under 14: parental consent |
| Germany | 16 | GDPR default | Under 16: parental consent |
| Denmark | 13 | Danish DPA | Under 13: parental consent |
| Sweden | 13 | Swedish DPA publications | Under 13: parental consent |
| Finland | 13 | Finnish DPA | Under 13: parental consent |
| Norway | 13 | Norwegian DPA | Under 13: parental consent |
| UK | 13 | UK GDPR / ICO | Under 13: parental consent |
| USA | 13 (COPPA) | FTC COPPA Rule | Under 13: strict — verifiable parental consent, data minimization |
| Canada | Varies (13 common) | PIPEDA + app store policies | Under 13: treat as COPPA-equivalent |
| Australia | No specific age (app store: 13) | App Store/Play Store policies | Under 13: app store family policies |
| Japan | No specific age (industry: 15-16) | APPI + industry practice | Conservative: treat under 16 as needing parental consent |
| China | **14** | PIPL Article 31 | Under 14: guardian consent mandatory, financial data = "sensitive" |
| Brazil | 12-18 (ECA framework) | LGPD + Child/Adolescent Statute | Under 18: best interest principle, under 12: parental consent |
| India | 18 (proposed DPDPA) | Digital Personal Data Protection Act | Under 18: verifiable parental consent (strictest globally) |

### 8.2 Two-Track System

**Track A — Minor (below territory's consent age)**
- Zero third-party ad tracking
- Minimal data collection (no email required — device ID only)
- No cash-like rewards (badges/cosmetics only)
- No external links without parental gate
- No social features with strangers (classroom mode only with teacher oversight)
- No bank account linking
- No PII in analytics events

**Track B — Adult / Consented Teen**
- Full feature set
- Optional personalization
- Rewards eligible
- Social features enabled
- Bank linking available (where supported)

### 8.3 App Store Compliance

| Platform | Policy | Key Requirements |
|---|---|---|
| Apple App Store | Kids Category OR Standard (13+) | If Kids: no ads, no tracking, limited external links. Recommend: rate 12+ or 13+, NOT Kids category |
| Google Play | Families Policy | If child audience: no advertising ID, no behavioral targeting, no personal/sensitive data transmission |

**Recommendation:** Rate the app **13+** on both platforms. This avoids Kids/Families category restrictions while still allowing 13-17 users. Implement parental consent flows for territories with higher age thresholds (16 for RO/DE, 15 for FR, 14 for ES/IT/CN).

---

## 9. Reward & Prize Compliance

### 9.1 Risk Matrix

| Feature | Pure Simulation | In-App Cosmetics | Gift Cards/Vouchers | Cash-Like Rewards | Sweepstakes/Draws |
|---|---|---|---|---|---|
| Regulatory risk | None | None | Low-Medium | Medium-High | High |
| AML/KYC trigger | No | No | No (< €150/yr) | Possible | Possible |
| Tax reporting | No | No | Territory-specific | Yes | Yes |
| Minor eligibility | Yes (all) | Yes (all) | Territory-specific | No (adults only) | No (adults only) |
| Recommended | ✅ Default | ✅ Default | ✅ Phase 2 | ⚠️ Phase 3+ | ❌ Avoid |

### 9.2 Per-Territory Prize Rules

| Territory | Key Constraint | Tax Reporting Trigger | Recommendation |
|---|---|---|---|
| **USA** | "Prize + chance + consideration" = illegal lottery. State-specific (FL statute, NY registration/bonding for games of chance) | IRS 1099-MISC at $600+ for prizes/awards | Skill-based only, "no purchase necessary", collect W-9 for prizes > $600 |
| **Canada** | Competition Bureau disclosure requirements (number/value of prizes, odds, areas) | Lottery winnings generally not taxed, but prizes from promotional contests may be | Skill-based, detailed rules, bilingual disclosures |
| **Australia** | State/territory trade promotion permits (NSW: authority required above $10K total prize pool) | ATO: some prizes taxable depending on context | Per-state permit system, keep prize pools under thresholds initially |
| **EU (general)** | Consumer protection, unfair commercial practices directive | Varies by country — generally taxable as "other income" | Non-random, achievement-based rewards, clear terms |
| **China** | Avoid cash-like rewards AND anything resembling virtual currency/crypto | Potentially taxable | Keep rewards purely in-app cosmetics/badges for China market |

### 9.3 Safe Default: Achievement-Based Rewards Only

To avoid gambling/sweepstakes classification globally:
1. **No element of chance** in reward earning — all rewards are deterministic (achieve X → earn Y)
2. **No purchase necessary** to earn rewards — free tier earns coins too (slower)
3. **Non-transferable** coins — cannot send to other users
4. **Explicit "no cash value"** language (following Greenlight's approach)
5. **Low individual value** — gift card redemptions capped at €25/month per user initially
6. **Age-gated** — only 18+ can redeem real-world rewards (under 18: cosmetics only)

---

## 10. Data Residency & Cross-Border

### 10.1 Requirements Per Territory

| Territory | Data Localization Required? | Cross-Border Transfer Rules | Recommendation |
|---|---|---|---|
| **EU/EEA** | No strict localization, but GDPR applies | Adequacy decisions, SCCs, or BCRs for non-EU transfers | Host in EU (Frankfurt or Dublin), SCCs for any non-EU processors |
| **UK** | No strict localization, UK GDPR applies | UK adequacy decisions, IDTA for non-UK transfers | EU hosting covers UK via EU-UK adequacy |
| **USA** | No federal data localization | No federal restriction; some state laws (CA CCPA, etc.) | Can serve from EU or US hosting |
| **Canada** | No prohibition on cross-border, but PIPEDA accountability applies | OPC guidance: accountability for foreign processing | EU or Canada hosting with DPAs |
| **Australia** | No strict localization | APP 8: "reasonable steps" for overseas disclosures | EU or AU hosting with DPAs |
| **Japan** | No strict localization | APPI Article 28: consent or adequacy for foreign transfers | EU hosting OK (EU-Japan adequacy decision exists) |
| **Brazil** | LGPD applies, no strict localization | Consent or adequacy for international transfers | Can serve from EU with adequate DPAs |
| **India** | DPDPA: government may restrict certain data categories | Cross-border transfers allowed except to restricted countries | Monitor government notifications on restricted countries |
| **China** | **YES — strong localization pressure** | PIPL cross-border transfer chapter: security assessment, standard contract, or certification required | **Mandatory local hosting** (AliCloud/Tencent Cloud), separate data partition |

### 10.2 Hosting Strategy

```
Primary: AWS eu-central-1 (Frankfurt)
├── Serves: EU/EEA, UK, Canada, Australia, Japan, Brazil, India
├── GDPR home base
└── Adequacy covers most territories

Secondary (Phase 5+): AWS us-east-1 (Virginia)
├── Serves: USA
├── Lower latency for US users
└── Data stays in US for US users only

Special: Alibaba Cloud cn-shanghai (Phase 7+)
├── Serves: China ONLY
├── Completely isolated data partition
├── Separate user database, no cross-border sync
└── Required by PIPL
```

---

## 11. Language & UI Localization

### 11.1 Language Priority

| Priority | Language | Covers | Locale Codes |
|---|---|---|---|
| P1 | English | UK, US, AU, CA (EN), India (EN), global fallback | en-GB, en-US, en-AU, en-CA, en-IN |
| P1 | Romanian | Romania | ro-RO |
| P2 | Polish | Poland | pl-PL |
| P2 | Hungarian | Hungary | hu-HU |
| P2 | Czech | Czech Republic | cs-CZ |
| P3 | German | Germany, Austria, Switzerland (DE) | de-DE, de-AT, de-CH |
| P3 | French | France, Canada (FR), Belgium (FR) | fr-FR, fr-CA, fr-BE |
| P3 | Spanish | Spain, Latin America | es-ES, es-MX |
| P3 | Italian | Italy | it-IT |
| P4 | Danish | Denmark | da-DK |
| P4 | Swedish | Sweden | sv-SE |
| P4 | Norwegian (Bokmål) | Norway | nb-NO |
| P4 | Finnish | Finland | fi-FI |
| P4 | Icelandic | Iceland | is-IS |
| P5 | Japanese | Japan | ja-JP |
| P5 | Portuguese (BR) | Brazil | pt-BR |
| P5 | Hindi | India | hi-IN |
| P6 | Chinese (Simplified) | China | zh-CN |

### 11.2 What Gets Translated vs What Doesn't

| Content Type | Translated? | Notes |
|---|---|---|
| UI strings (buttons, labels, navigation) | ✅ Yes | Standard l10n via react-i18next JSON files |
| Tutorial text | ✅ Yes | Region-specific examples |
| Decision card titles & descriptions | ✅ Yes | Some cards are region-specific (replaced, not translated) |
| Scenario narratives | ✅ Yes | Full narrative localization with cultural adaptation |
| Financial product names | ✅ Yes, use local names | "ISA" not "Individual Savings Account", "Livret A" not "Tax-free Savings" |
| Legal disclaimers | ✅ Yes | Must be legally accurate per territory |
| Badge names & descriptions | ✅ Yes | |
| Error messages | ✅ Yes | |
| Push notification text | ✅ Yes | |
| Currency amounts | 🔄 Formatted, not translated | Use CLDR formatting rules |
| API responses (data) | ❌ No | Backend returns locale-neutral data; client formats |
| Admin dashboard | ❌ English only (initially) | Internal tool, add translations later |

### 11.3 Cultural Adaptation Examples

| Scenario | English (UK) | Romanian | Japanese |
|---|---|---|---|
| "Pay your rent" | "Your landlord sent the monthly rent invoice for £850" | "Proprietarul a trimis factura de chirie: 3.200 lei" | "大家さんから家賃の請求書が届きました：¥85,000" |
| "Grocery shopping" | "Weekly shop at Tesco: £65.40" | "Cumpărături la Kaufland: 280,50 lei" | "イオンでの買い物：¥6,500" |
| "Got a raise" | "Annual review: 3% salary increase!" | "Evaluare anuală: mărire de salariu de 3%!" | "昇給おめでとう！給与が3%アップしました" |
| "Emergency" | "Your boiler broke down. Repair: £350" | "Centrala termică s-a stricat. Reparație: 1.500 lei" | "給湯器が故障しました。修理費：¥45,000" |

### 11.4 Right-to-Left (RTL) Considerations

None of the P1-P6 languages require RTL. If Arabic or Hebrew support is added later:
- Use React Native's built-in `I18nManager.forceRTL(true)` + `I18nManager.allowRTL(true)`
- Mirror all horizontal layouts (React Native handles most via `I18nManager`)
- Currency symbols may change position
- Charts read right-to-left

---

## 12. Regional Scenario Catalog

Each region gets 20-30 **unique scenarios** on top of the ~150 universal scenarios.

### 12.1 Romania-Specific Scenarios

| Scenario | Level | Category | Description |
|---|---|---|---|
| Prima Casă application | 5 | Housing | Apply for government-guaranteed mortgage, learn eligibility rules |
| Pillar II pension statement | 3 | Retirement | Review mandatory pension fund performance, understand contributions |
| Pillar III enrollment | 5 | Retirement | Optional tax-deductible pension — savings optimization |
| ROBOR rate increase | 6 | Macro | Variable mortgage rate jumps 2% — payment shock scenario |
| Cash vs card decision | 1 | Payments | Romania-specific: many places cash-only, learn about digital payments |
| PAD earthquake insurance | 4 | Insurance | Mandatory home insurance — understand coverage and premiums |
| RoPay instant transfer | 2 | Payments | Send money to friend instantly via RoPay |
| RON vs EUR savings | 4 | Savings | Compare RON and EUR deposit rates, learn about FX risk |
| Salary in hand vs gross | 1 | Income | Romanian salary negotiation: understand net vs gross (CAS, CASS, impozit) |
| Black Friday Romania | 3 | Shopping | eMAG/Altex sales — impulse buying vs planned purchasing |

### 12.2 UK-Specific Scenarios

| Scenario | Level | Category | Description |
|---|---|---|---|
| Open a Lifetime ISA | 4 | Savings | 25% government bonus, understand withdrawal penalties |
| Student loan repayment | 3 | Debt | Plan 2/5 comparison, threshold-based repayment |
| Council Tax band check | 2 | Housing | Understanding property-based local tax |
| Auto-enrolment pension opt-out? | 3 | Retirement | Employer pension — opt out or stay in? Employer match lesson |
| Energy price cap change | 5 | Bills | Ofgem cap adjustment, switching providers |
| NHS prescription cost | 2 | Health | Free vs paid prescriptions, prepayment certificate |
| Stamp duty calculation | 5 | Housing | First-time buyer relief, calculate tax on property purchase |
| NS&I Premium Bonds | 4 | Investment | Prize-linked savings — expected vs actual return |

### 12.3 USA-Specific Scenarios

| Scenario | Level | Category | Description |
|---|---|---|---|
| 401(k) employer match | 3 | Retirement | Maximize free money — employer matches up to 6% |
| FAFSA filing | 3 | Education | Financial aid application, EFC calculation |
| HSA triple tax advantage | 5 | Health | Health Savings Account optimization |
| Credit card balance transfer | 4 | Debt | 0% APR promotional offer, transfer fee math |
| Tax refund vs owe | 5 | Tax | W-4 withholding optimization |
| Tipping culture | 1 | Social | Restaurant bill with 15/18/20% tip calculation |
| Health insurance marketplace | 4 | Insurance | ACA plan comparison — Bronze/Silver/Gold/Platinum |
| Student loan refinancing | 5 | Debt | Federal vs private, losing protections |

---

## 13. Implementation: Region Config Schema

### 13.1 Config File Structure

```
packages/config/src/regions/
├── _base.json          # Default values (overridden by region)
├── ro.json             # Romania
├── gb.json             # UK
├── us.json             # USA
├── de.json             # Germany
├── fr.json             # France
├── es.json             # Spain
├── it.json             # Italy
├── pl.json             # Poland
├── hu.json             # Hungary
├── cz.json             # Czech Republic
├── dk.json             # Denmark
├── se.json             # Sweden
├── no.json             # Norway
├── fi.json             # Finland
├── is.json             # Iceland
├── ca.json             # Canada
├── au.json             # Australia
├── jp.json             # Japan
├── br.json             # Brazil
├── in.json             # India
└── cn.json             # China
```

### 13.2 Region Config Schema (TypeScript)

```typescript
interface RegionConfig {
  // Identity
  code: RegionCode;                   // "ro", "gb", "us", etc.
  name: string;                       // "Romania"
  flag_emoji: string;                 // "🇷🇴"
  languages: string[];                // ["ro"]
  default_locale: string;             // "ro-RO"

  // Currency
  currency: {
    code: CurrencyCode;              // "RON"
    name: string;                    // "Romanian Leu"
    symbol: string;                  // "lei"
    decimal_digits: number;          // 2
    smallest_unit_name: string;      // "ban"
    symbol_position: "before" | "after";
    symbol_separator: string;        // " " (space between amount and symbol)
    grouping_separator: string;      // "."
    decimal_separator: string;       // ","
    display_pattern: string;         // "{amount} {symbol}" → "1.234,56 lei"
  };

  // FX
  fx: {
    mode: "simulated" | "live_reference";
    official_source: string;         // "NBR"
    api_url: string | null;          // "https://www.bnr.ro/nbrfxrates.xml"
    api_format: "xml" | "json" | "csv";
    update_time_utc: string;         // "11:00" (13:00 EET)
    fallback_source: "ecb" | "commercial";
    simulated_rates: Record<CurrencyCode, number>; // Fixed rates for simulated mode
  };

  // Income
  income: {
    personas: {
      teen: { allowance: number; part_time_hourly: number; };
      student: { part_time_monthly: number; scholarship_semester: number; loan_semester: number; };
      young_adult: { starting_salary: number; salary_range: [number, number]; };
      parent: { starting_salary: number; salary_range: [number, number]; partner_income: number; };
    };
    payment_frequency: "monthly" | "biweekly" | "weekly";
    pay_day: number;                 // Day of month (25 for Romania)
  };

  // Tax
  tax: {
    type: "flat" | "progressive" | "progressive_formula";
    brackets: TaxBracket[];          // [{ from: 0, to: null, rate: 0.10 }] for Romania
    standard_deduction: number;
    social_contributions: {
      employee: SocialContribution[];
      employer: SocialContribution[];
    };
    filing_deadline_month: number;   // 5 (May for Romania)
    fiscal_year_start_month: number; // 1 (January) or 4 (April for UK) or 7 (July for AU)
    special_rules: string[];         // ["family_quotient"] for France
  };

  // Cost of Living (base prices, scaled by persona/difficulty)
  costs: {
    rent_1br_city: number;
    rent_1br_suburb: number;
    rent_2br_city: number;
    groceries_weekly_single: number;
    groceries_weekly_family: number;
    utilities_monthly: number;       // electricity + gas + water + internet
    phone_plan: number;
    public_transport_monthly: number;
    streaming_service: number;
    gym_membership: number;
    health_insurance_monthly: number | null; // null = included in social contributions
    car_insurance_monthly: number;
    gasoline_per_liter: number;
    restaurant_meal: number;
    coffee_shop: number;
    movie_ticket: number;
    university_tuition_semester: number; // 0 for free tuition countries
  };

  // Banking Products
  banking: {
    checking: {
      monthly_fee: number;           // 0 or amount
      fee_waiver_conditions: string | null;
      overdraft_limit: number;
      overdraft_apr: number;
    };
    savings: {
      base_apy: number;
      special_accounts: SpecialAccount[]; // ISA, Livret A, etc.
    };
    credit_card: {
      default_apr: number;
      min_payment_pct: number;
      min_payment_fixed: number;
      annual_fee_basic: number;
      annual_fee_rewards: number;
      contactless_limit: number;
    };
    loans: {
      personal_apr_range: [number, number];
      mortgage_apr_range: [number, number];
      student_loan: StudentLoanConfig | null;
      government_programs: GovernmentProgram[]; // Prima Casa, LISA, etc.
    };
    retirement: RetirementProduct[];
    investment: InvestmentProduct[];
    insurance: InsuranceProduct[];    // mandatory + optional types
  };

  // Payment Rails (for scenario realism)
  payments: {
    primary_card_scheme: string;     // "Visa/Mastercard", "CB", "JCB"
    domestic_debit: string | null;   // "Dankort", "Girocard", "EFTPOS"
    instant_a2a: string | null;      // "RoPay", "Faster Payments", "Zelle", "Pix"
    p2p_dominant: string | null;     // "Swish", "Bizum", "Vipps", "UPI"
    bill_payment: string;            // "Direct Debit", "BPAY", "Boleto", "Konbini"
    qr_payments: string | null;      // "RoPay QR", "PayPay", "Pix QR", "UPI QR"
    cash_usage_pct: number;          // 40 (Romania), 5 (Sweden), 15 (UK)
  };

  // Privacy & Compliance
  compliance: {
    data_protection_law: string;     // "GDPR", "PIPL", "LGPD", "APPI", "CCPA"
    consent_age: number;             // 16 (RO), 13 (DK/SE/FI), 14 (CN)
    data_localization_required: boolean;
    open_banking_standard: string | null; // "PSD2", "CDR", "Open Finance BR", "AA India"
    reward_restrictions: string[];   // ["no_cash_minors", "skill_based_only", "permit_required_above_10k"]
    aml_threshold: number | null;    // null = no threshold for simulation
  };

  // Inflation & Macro
  macro: {
    base_inflation_annual: number;   // 0.05 (5% for Romania), 0.02 (2% for Germany)
    central_bank_rate: number;       // reference rate for loans
    reference_rate_name: string;     // "ROBOR", "BoE Base Rate", "Fed Funds Rate"
    unemployment_rate: number;       // affects career scenarios
    housing_market: "hot" | "stable" | "cool"; // affects rent/mortgage scenarios
  };

  // Scenarios
  scenarios: {
    unique_scenario_ids: string[];   // Region-specific scenario IDs
    cultural_brands: {               // For scenario realism
      grocery_store: string;         // "Kaufland" (RO), "Tesco" (UK), "Walmart" (US)
      electronics: string;           // "eMAG" (RO), "Currys" (UK), "Best Buy" (US)
      clothing: string;
      coffee_shop: string;
      fast_food: string;
      bank_names: string[];          // ["BCR", "BRD", "ING", "BT"] for familiarity
      telecom: string[];             // ["Orange", "Vodafone", "Digi"]
    };
  };
}

interface TaxBracket {
  from: number;
  to: number | null;                 // null = unlimited
  rate: number;                      // 0.10 = 10%
}

interface SocialContribution {
  name: string;                      // "CAS" (Romania pension), "National Insurance" (UK)
  rate: number;
  cap: number | null;                // income cap above which no contribution
  description: string;
}

interface SpecialAccount {
  id: string;                        // "isa_cash", "livret_a", "pillar_iii"
  name: string;                      // "Cash ISA", "Livret A"
  type: "savings" | "investment" | "retirement";
  annual_limit: number | null;
  interest_rate: number | null;      // fixed (Livret A) or null (market-based)
  tax_treatment: string;             // "tax_free", "tax_deferred", "taxable"
  eligibility: string;               // "age_18_plus", "first_time_buyer", "all"
  government_bonus: number | null;   // 0.25 = 25% for LISA
  min_holding_period_months: number | null;
  penalty_early_withdrawal: number | null;
  description: string;
}

interface GovernmentProgram {
  id: string;
  name: string;                      // "Prima Casă", "Help to Buy"
  type: "mortgage" | "savings" | "grant";
  max_amount: number;
  subsidized_rate: number | null;
  eligibility: string;
  description: string;
}

interface RetirementProduct {
  id: string;
  name: string;                      // "401(k)", "Pillar II", "Workplace Pension"
  mandatory: boolean;
  contribution_rate_employee: number;
  contribution_rate_employer: number | null;
  annual_limit: number | null;
  tax_treatment: "pre_tax" | "post_tax" | "mixed";
  employer_match_pct: number | null;
  employer_match_cap: number | null;
  vesting_years: number | null;
  description: string;
}

interface InvestmentProduct {
  id: string;
  name: string;                      // "NISA", "PEA", "ISK"
  available_level: number;
  tax_treatment: string;
  annual_limit: number | null;
  description: string;
}

interface InsuranceProduct {
  id: string;
  name: string;
  mandatory: boolean;
  monthly_premium_range: [number, number];
  deductible_range: [number, number];
  coverage_description: string;
}
```

### 13.3 Example: Romania Config (Abbreviated)

```json
{
  "code": "ro",
  "name": "România",
  "flag_emoji": "🇷🇴",
  "languages": ["ro"],
  "default_locale": "ro-RO",
  "currency": {
    "code": "RON",
    "name": "Leu românesc",
    "symbol": "lei",
    "decimal_digits": 2,
    "smallest_unit_name": "ban",
    "symbol_position": "after",
    "symbol_separator": " ",
    "grouping_separator": ".",
    "decimal_separator": ","
  },
  "fx": {
    "mode": "simulated",
    "official_source": "NBR",
    "api_url": "https://www.bnr.ro/nbrfxrates.xml",
    "api_format": "xml",
    "update_time_utc": "11:00",
    "simulated_rates": {
      "EUR": 4.97,
      "USD": 4.58,
      "GBP": 5.78
    }
  },
  "income": {
    "personas": {
      "teen": { "allowance": 30000, "part_time_hourly": 2500 },
      "student": { "part_time_monthly": 250000, "scholarship_semester": 500000, "loan_semester": 0 },
      "young_adult": { "starting_salary": 500000, "salary_range": [350000, 800000] },
      "parent": { "starting_salary": 700000, "salary_range": [500000, 1200000], "partner_income": 500000 }
    },
    "payment_frequency": "monthly",
    "pay_day": 25
  },
  "tax": {
    "type": "flat",
    "brackets": [{ "from": 0, "to": null, "rate": 0.10 }],
    "standard_deduction": 0,
    "social_contributions": {
      "employee": [
        { "name": "CAS (pensie)", "rate": 0.25, "cap": null, "description": "Contribuția la asigurările sociale (pensie)" },
        { "name": "CASS (sănătate)", "rate": 0.10, "cap": null, "description": "Contribuția la asigurările sociale de sănătate" }
      ],
      "employer": [
        { "name": "CAM (muncă)", "rate": 0.0225, "cap": null, "description": "Contribuția asiguratorie pentru muncă" }
      ]
    },
    "filing_deadline_month": 5,
    "fiscal_year_start_month": 1,
    "special_rules": []
  },
  "costs": {
    "rent_1br_city": 200000,
    "rent_1br_suburb": 140000,
    "rent_2br_city": 300000,
    "groceries_weekly_single": 25000,
    "groceries_weekly_family": 60000,
    "utilities_monthly": 80000,
    "phone_plan": 5000,
    "public_transport_monthly": 12500,
    "streaming_service": 3500,
    "gym_membership": 15000,
    "health_insurance_monthly": null,
    "car_insurance_monthly": 15000,
    "gasoline_per_liter": 700,
    "restaurant_meal": 6000,
    "coffee_shop": 1500,
    "movie_ticket": 3500,
    "university_tuition_semester": 0
  },
  "macro": {
    "base_inflation_annual": 0.05,
    "central_bank_rate": 0.065,
    "reference_rate_name": "ROBOR 3M",
    "unemployment_rate": 0.055,
    "housing_market": "hot"
  },
  "compliance": {
    "data_protection_law": "GDPR",
    "consent_age": 16,
    "data_localization_required": false,
    "open_banking_standard": "PSD2",
    "reward_restrictions": ["no_cash_minors", "skill_based_only"],
    "aml_threshold": null
  }
}
```

---

## Appendix A — FX Rate Caching & Update Strategy

```
┌─────────────────────────────────────────────┐
│              FX Rate Service                 │
│                                              │
│  Schedule: Daily at 17:00 UTC                │
│  (after all central banks publish)           │
│                                              │
│  1. Fetch from primary source per currency   │
│  2. Validate: rate within ±10% of yesterday  │
│  3. Store in Redis: key = fx:{date}:{pair}   │
│  4. Store in Postgres: fx_rates table        │
│  5. Broadcast: Kafka event fx.rates.updated  │
│                                              │
│  Fallback chain:                             │
│  Primary (central bank) → ECB → Commercial   │
│  → Stale rate + "indicative" warning         │
│                                              │
│  TTL: Redis = 48h, Postgres = forever        │
│  Game engine queries: Redis first, then DB   │
└─────────────────────────────────────────────┘
```

## Appendix B — Localization Checklist for New Region

When adding a new region, complete all items:

- [ ] Create `config/regions/{code}.json` with all fields from schema
- [ ] Add i18n JSON file: `packages/ui-kit/src/i18n/locales/{lang}.json`
- [ ] Define 20+ unique regional scenarios in `scenarios/{code}/`
- [ ] Set cultural brand names (grocery stores, banks, telecoms)
- [ ] Verify currency formatting with edge cases (large amounts, zero-decimal)
- [ ] Set correct tax brackets and social contributions
- [ ] Configure banking products (local names, rates, limits)
- [ ] Define retirement products (mandatory + optional)
- [ ] Set compliance parameters (consent age, data law, restrictions)
- [ ] Set up FX source (API URL, format, update time)
- [ ] Add payment rail names for scenario realism
- [ ] Test full game loop (create → play 3 months → month-end) in new region
- [ ] Legal review: privacy policy update, terms update
- [ ] QA: verify all strings translated, no fallback to English
- [ ] QA: verify currency display in all screens (large numbers, negative, zero)
- [ ] App Store: update localized description and screenshots
