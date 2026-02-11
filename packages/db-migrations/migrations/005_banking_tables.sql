-- Migration: 005_banking_tables
-- Up

CREATE TABLE IF NOT EXISTS linked_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('plaid', 'truelayer', 'saltedge')),
  provider_connection_id VARCHAR(255) NOT NULL,
  institution_name VARCHAR(200),
  access_token_encrypted TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disconnected', 'error', 'revoked')),
  consent_granted_at TIMESTAMPTZ,
  consent_expires_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  error_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_linked_accounts_user_id ON linked_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_linked_accounts_partner_id ON linked_accounts(partner_id);
CREATE INDEX IF NOT EXISTS idx_linked_accounts_status ON linked_accounts(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_linked_accounts_provider ON linked_accounts(provider, provider_connection_id);

CREATE TABLE IF NOT EXISTS synced_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  linked_account_id UUID NOT NULL REFERENCES linked_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  provider_transaction_id VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  amount BIGINT NOT NULL,
  currency VARCHAR(5) NOT NULL,
  description VARCHAR(500),
  category VARCHAR(50),
  category_source VARCHAR(20) CHECK (category_source IN ('rule', 'ml', 'vendor')),
  merchant_name VARCHAR(200),
  is_pending BOOLEAN NOT NULL DEFAULT false,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_synced_transactions_linked ON synced_transactions(linked_account_id);
CREATE INDEX IF NOT EXISTS idx_synced_transactions_user ON synced_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_synced_transactions_partner_id ON synced_transactions(partner_id);
CREATE INDEX IF NOT EXISTS idx_synced_transactions_date ON synced_transactions(user_id, date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_synced_transactions_provider ON synced_transactions(linked_account_id, provider_transaction_id);

CREATE TABLE IF NOT EXISTS mirror_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  game_spending JSONB NOT NULL DEFAULT '{}',
  real_spending JSONB NOT NULL DEFAULT '{}',
  insights JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mirror_comparisons_user ON mirror_comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_mirror_comparisons_game ON mirror_comparisons(game_id);
CREATE INDEX IF NOT EXISTS idx_mirror_comparisons_partner_id ON mirror_comparisons(partner_id);
CREATE INDEX IF NOT EXISTS idx_mirror_comparisons_period ON mirror_comparisons(user_id, period_start);

-- Down

DROP TABLE IF EXISTS mirror_comparisons;
DROP TABLE IF EXISTS synced_transactions;
DROP TABLE IF EXISTS linked_accounts;
