-- Sprint 3: Social & Competition tables
-- Friend challenges / duels
CREATE TABLE IF NOT EXISTS friend_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenger_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opponent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenger_game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  opponent_game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  challenge_type VARCHAR(50) NOT NULL DEFAULT 'savings_rate', -- savings_rate, net_worth_growth, xp_earned
  duration_days INT NOT NULL DEFAULT 7,
  start_game_date DATE,
  end_game_date DATE,
  challenger_score NUMERIC(12,2) DEFAULT 0,
  opponent_score NUMERIC(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, completed, declined, expired
  winner_id UUID REFERENCES users(id),
  reward_xp INT DEFAULT 50,
  reward_coins INT DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_friend_challenges_users ON friend_challenges(challenger_id, opponent_id, status);

-- Coin shop items
CREATE TABLE IF NOT EXISTS coin_shop_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- boost, protection, cosmetic, utility
  price INT NOT NULL,
  icon VARCHAR(10) DEFAULT '🛒',
  effect_type VARCHAR(50), -- streak_freeze, xp_boost, hint_token, avatar_frame, card_mulligan
  effect_duration_hours INT, -- NULL = permanent/one-use
  max_owned INT DEFAULT -1, -- -1 = unlimited
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User purchased items
CREATE TABLE IF NOT EXISTS user_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES coin_shop_items(id),
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  quantity INT DEFAULT 1,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_items_user ON user_items(user_id, item_id);

-- Achievement share tracking
CREATE TABLE IF NOT EXISTS achievement_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id VARCHAR(100),
  share_type VARCHAR(50) NOT NULL, -- badge, level_up, streak_milestone, net_worth_milestone
  share_platform VARCHAR(50), -- twitter, whatsapp, clipboard
  share_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
