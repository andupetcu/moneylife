-- Migration: 002_game_tables
-- Up

CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  persona VARCHAR(20) NOT NULL CHECK (persona IN ('teen', 'student', 'young_adult', 'parent')),
  difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('easy', 'normal', 'hard')),
  region VARCHAR(5) NOT NULL,
  currency_code VARCHAR(5) NOT NULL,
  ppp_factor DECIMAL(10, 4) NOT NULL DEFAULT 1.0,
  current_game_date DATE NOT NULL,
  current_level INT NOT NULL DEFAULT 1,
  total_xp INT NOT NULL DEFAULT 0,
  level_xp INT NOT NULL DEFAULT 0,
  total_coins INT NOT NULL DEFAULT 0,
  happiness INT NOT NULL DEFAULT 60 CHECK (happiness BETWEEN 0 AND 100),
  streak_current INT NOT NULL DEFAULT 0,
  streak_longest INT NOT NULL DEFAULT 0,
  streak_last_action_date DATE,
  chi_score INT NOT NULL DEFAULT 650 CHECK (chi_score BETWEEN 300 AND 850),
  chi_payment_history INT NOT NULL DEFAULT 70 CHECK (chi_payment_history BETWEEN 0 AND 100),
  chi_utilization INT NOT NULL DEFAULT 80 CHECK (chi_utilization BETWEEN 0 AND 100),
  chi_credit_age INT NOT NULL DEFAULT 30 CHECK (chi_credit_age BETWEEN 0 AND 100),
  chi_credit_mix INT NOT NULL DEFAULT 30 CHECK (chi_credit_mix BETWEEN 0 AND 100),
  chi_new_inquiries INT NOT NULL DEFAULT 100 CHECK (chi_new_inquiries BETWEEN 0 AND 100),
  budget_score INT NOT NULL DEFAULT 50 CHECK (budget_score BETWEEN 0 AND 100),
  net_worth BIGINT NOT NULL DEFAULT 0,
  monthly_income BIGINT NOT NULL DEFAULT 0,
  inflation_cumulative DECIMAL(10, 6) NOT NULL DEFAULT 1.0,
  bankruptcy_count INT NOT NULL DEFAULT 0,
  bankruptcy_active BOOLEAN NOT NULL DEFAULT false,
  bankruptcy_end_date DATE,
  state_version BIGINT NOT NULL DEFAULT 1,
  random_seed BIGINT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'bankrupt', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id);
CREATE INDEX IF NOT EXISTS idx_games_partner_id ON games(partner_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_games_user_status ON games(user_id, status) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS game_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN (
    'checking', 'savings', 'credit_card', 'student_loan', 'auto_loan',
    'mortgage', 'personal_loan', 'bnpl', 'investment_brokerage',
    'investment_retirement', 'insurance', 'prepaid'
  )),
  name VARCHAR(100) NOT NULL,
  balance BIGINT NOT NULL DEFAULT 0,
  credit_limit BIGINT,
  interest_rate DECIMAL(8, 6) NOT NULL DEFAULT 0,
  principal BIGINT,
  remaining_principal BIGINT,
  monthly_payment BIGINT,
  term_months INT,
  months_paid INT DEFAULT 0,
  auto_pay_setting VARCHAR(10) NOT NULL DEFAULT 'none' CHECK (auto_pay_setting IN ('none', 'minimum', 'full')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'frozen', 'defaulted')),
  opened_game_date DATE NOT NULL,
  consecutive_missed_payments INT NOT NULL DEFAULT 0,
  pending_interest BIGINT NOT NULL DEFAULT 0,
  withdrawal_count_this_month INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_accounts_game_id ON game_accounts(game_id);
CREATE INDEX IF NOT EXISTS idx_game_accounts_type ON game_accounts(game_id, type);
CREATE INDEX IF NOT EXISTS idx_game_accounts_status ON game_accounts(status) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES game_accounts(id) ON DELETE CASCADE,
  game_date DATE NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN (
    'income', 'expense', 'transfer', 'interest_credit', 'interest_debit',
    'fee', 'loan_payment', 'loan_disbursement', 'investment_buy',
    'investment_sell', 'dividend', 'insurance_premium', 'insurance_claim',
    'tax_payment', 'bnpl_purchase', 'bnpl_installment', 'refund'
  )),
  category VARCHAR(50),
  subcategory VARCHAR(50),
  amount BIGINT NOT NULL,
  balance_after BIGINT NOT NULL,
  description VARCHAR(500) NOT NULL,
  card_id VARCHAR(100),
  is_automated BOOLEAN NOT NULL DEFAULT false,
  idempotency_key UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_game_id ON transactions(game_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_game_date ON transactions(game_id, game_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(game_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_idempotency ON transactions(idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS scheduled_bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  amount BIGINT NOT NULL,
  category VARCHAR(50) NOT NULL,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually')),
  next_due_date DATE NOT NULL,
  auto_pay BOOLEAN NOT NULL DEFAULT false,
  source_account_id UUID REFERENCES game_accounts(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_bills_game_id ON scheduled_bills(game_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_bills_due ON scheduled_bills(next_due_date) WHERE is_active = true;

CREATE TABLE IF NOT EXISTS game_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  game_date DATE NOT NULL,
  description TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_events_game_id ON game_events(game_id);
CREATE INDEX IF NOT EXISTS idx_game_events_game_date ON game_events(game_id, game_date);
CREATE INDEX IF NOT EXISTS idx_game_events_type ON game_events(game_id, type);

CREATE TABLE IF NOT EXISTS decision_cards (
  id VARCHAR(100) PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  persona_tags VARCHAR(20)[] NOT NULL DEFAULT '{}',
  level_range_min INT NOT NULL DEFAULT 1,
  level_range_max INT NOT NULL DEFAULT 8,
  frequency_weight INT NOT NULL DEFAULT 1,
  options JSONB NOT NULL,
  consequences JSONB NOT NULL DEFAULT '{}',
  seasonal_event_id UUID,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decision_cards_category ON decision_cards(category);
CREATE INDEX IF NOT EXISTS idx_decision_cards_partner_id ON decision_cards(partner_id);
CREATE INDEX IF NOT EXISTS idx_decision_cards_active ON decision_cards(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_decision_cards_level ON decision_cards(level_range_min, level_range_max);

CREATE TABLE IF NOT EXISTS game_pending_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  card_id VARCHAR(100) NOT NULL REFERENCES decision_cards(id) ON DELETE CASCADE,
  presented_game_date DATE NOT NULL,
  expires_game_date DATE NOT NULL,
  selected_option_id VARCHAR(20),
  resolved_at TIMESTAMPTZ,
  xp_awarded INT,
  coins_awarded INT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_pending_cards_game_id ON game_pending_cards(game_id);
CREATE INDEX IF NOT EXISTS idx_game_pending_cards_status ON game_pending_cards(game_id, status);

CREATE TABLE IF NOT EXISTS monthly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  game_month DATE NOT NULL,
  income_total BIGINT NOT NULL DEFAULT 0,
  expense_total BIGINT NOT NULL DEFAULT 0,
  savings_change BIGINT NOT NULL DEFAULT 0,
  investment_change BIGINT NOT NULL DEFAULT 0,
  debt_change BIGINT NOT NULL DEFAULT 0,
  net_worth BIGINT NOT NULL DEFAULT 0,
  chi_score INT NOT NULL DEFAULT 650,
  budget_score INT NOT NULL DEFAULT 50,
  xp_earned INT NOT NULL DEFAULT 0,
  coins_earned INT NOT NULL DEFAULT 0,
  highlights JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_monthly_reports_game_month ON monthly_reports(game_id, game_month);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  key UUID PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_game ON idempotency_keys(game_id);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires ON idempotency_keys(expires_at);

-- Down

DROP TABLE IF EXISTS idempotency_keys;
DROP TABLE IF EXISTS monthly_reports;
DROP TABLE IF EXISTS game_pending_cards;
DROP TABLE IF EXISTS decision_cards;
DROP TABLE IF EXISTS game_events;
DROP TABLE IF EXISTS scheduled_bills;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS game_accounts;
DROP TABLE IF EXISTS games;
