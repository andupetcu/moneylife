-- Migration 008: Daily Engagement Loop
-- Tables for daily tips, daily challenges, and login rewards

-- Daily tips shown to users
CREATE TABLE IF NOT EXISTS daily_tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL, -- budgeting, saving, credit, investing, insurance, general
  persona VARCHAR(50), -- NULL = all personas, or teen/student/young_adult/parent
  min_level INT DEFAULT 1,
  tip_text TEXT NOT NULL,
  tip_source VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track which tips users have seen
CREATE TABLE IF NOT EXISTS user_tip_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  tip_id UUID NOT NULL REFERENCES daily_tips(id),
  seen_at TIMESTAMPTZ DEFAULT NOW(),
  marked_useful BOOLEAN DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_user_tip_history_user ON user_tip_history(user_id, game_id);

-- Daily challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_type VARCHAR(50) NOT NULL, -- savings, spending_freeze, quiz, budget, social
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  persona VARCHAR(50), -- NULL = all
  min_level INT DEFAULT 1,
  reward_xp INT NOT NULL DEFAULT 15,
  reward_coins INT NOT NULL DEFAULT 10,
  check_type VARCHAR(50) NOT NULL, -- manual_claim, auto_savings, auto_no_spending, auto_budget
  check_params JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track user daily challenge progress
CREATE TABLE IF NOT EXISTS user_daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES daily_challenges(id),
  game_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, completed, expired
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_daily_challenge_unique ON user_daily_challenges(user_id, game_id, game_date);
CREATE INDEX IF NOT EXISTS idx_user_daily_challenge_lookup ON user_daily_challenges(user_id, game_id, status);

-- Login calendar / daily rewards
CREATE TABLE IF NOT EXISTS login_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  game_date DATE NOT NULL,
  reward_coins INT DEFAULT 0,
  streak_day INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_login_rewards_unique ON login_rewards(user_id, game_id, game_date);
