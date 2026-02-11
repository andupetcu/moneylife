-- Migration: 003_rewards_tables
-- Up

CREATE TABLE IF NOT EXISTS xp_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  amount INT NOT NULL,
  balance_after INT NOT NULL,
  reason VARCHAR(100) NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_ledger_user_id ON xp_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_game_id ON xp_ledger(game_id);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_partner_id ON xp_ledger(partner_id);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_created ON xp_ledger(user_id, created_at);

CREATE TABLE IF NOT EXISTS coin_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  amount INT NOT NULL,
  balance_after INT NOT NULL,
  reason VARCHAR(100) NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coin_ledger_user_id ON coin_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_ledger_partner_id ON coin_ledger(partner_id);
CREATE INDEX IF NOT EXISTS idx_coin_ledger_created ON coin_ledger(user_id, created_at);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  badge_id VARCHAR(100) NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  difficulty VARCHAR(10)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_badges_unique ON user_badges(user_id, badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_partner_id ON user_badges(partner_id);

CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_activity_date DATE,
  grace_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_streaks_user ON streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_partner_id ON streaks(partner_id);

CREATE TABLE IF NOT EXISTS reward_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  category VARCHAR(50) NOT NULL,
  coin_cost INT NOT NULL CHECK (coin_cost > 0),
  face_value_cents INT,
  stock INT NOT NULL DEFAULT -1,
  fulfillment_type VARCHAR(20) NOT NULL CHECK (fulfillment_type IN ('instant_digital', 'async_digital', 'physical')),
  provider VARCHAR(100),
  provider_item_id VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'removed')),
  regions VARCHAR(5)[] NOT NULL DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reward_catalog_partner_id ON reward_catalog(partner_id);
CREATE INDEX IF NOT EXISTS idx_reward_catalog_status ON reward_catalog(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_reward_catalog_category ON reward_catalog(category);

CREATE TABLE IF NOT EXISTS redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  catalog_item_id UUID NOT NULL REFERENCES reward_catalog(id) ON DELETE RESTRICT,
  coin_cost INT NOT NULL,
  idempotency_key UUID NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'fulfilled', 'confirmed', 'failed', 'refunded', 'disputed', 'resolved'
  )),
  fulfillment_details JSONB,
  partner_redemption_id VARCHAR(255),
  delivery_email VARCHAR(255),
  delivery_address JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_redemptions_user_id ON redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_partner_id ON redemptions(partner_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON redemptions(status);
CREATE INDEX IF NOT EXISTS idx_redemptions_idempotency ON redemptions(idempotency_key);

-- Down

DROP TABLE IF EXISTS redemptions;
DROP TABLE IF EXISTS reward_catalog;
DROP TABLE IF EXISTS streaks;
DROP TABLE IF EXISTS user_badges;
DROP TABLE IF EXISTS coin_ledger;
DROP TABLE IF EXISTS xp_ledger;
