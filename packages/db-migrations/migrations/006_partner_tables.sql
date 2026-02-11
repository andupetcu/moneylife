-- Migration: 006_partner_tables
-- Up

CREATE TABLE IF NOT EXISTS partner_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  primary_color VARCHAR(20),
  secondary_color VARCHAR(20),
  accent_color VARCHAR(20),
  font_family VARCHAR(100),
  logo_light_url VARCHAR(500),
  logo_dark_url VARCHAR(500),
  custom_css TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_themes_partner_id ON partner_themes(partner_id);

CREATE TABLE IF NOT EXISTS partner_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  feature_flag VARCHAR(100) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_partner_features_unique ON partner_features(partner_id, feature_flag);
CREATE INDEX IF NOT EXISTS idx_partner_features_partner ON partner_features(partner_id);

CREATE TABLE IF NOT EXISTS partner_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  catalog_item_id UUID NOT NULL REFERENCES reward_catalog(id) ON DELETE CASCADE,
  custom_name VARCHAR(200),
  custom_description TEXT,
  custom_image_url VARCHAR(500),
  custom_coin_cost INT,
  is_exclusive BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_rewards_partner ON partner_rewards(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_rewards_catalog ON partner_rewards(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_partner_rewards_status ON partner_rewards(partner_id, status);

CREATE TABLE IF NOT EXISTS partner_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  scopes VARCHAR(50)[] NOT NULL DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_api_keys_partner ON partner_api_keys(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_api_keys_hash ON partner_api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_partner_api_keys_prefix ON partner_api_keys(key_prefix);

-- Down

DROP TABLE IF EXISTS partner_api_keys;
DROP TABLE IF EXISTS partner_rewards;
DROP TABLE IF EXISTS partner_features;
DROP TABLE IF EXISTS partner_themes;
