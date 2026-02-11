-- Migration: 004_social_tables
-- Up

CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id_a UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id_b UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  initiated_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT friendships_ordered CHECK (user_id_a < user_id_b)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_friendships_pair ON friendships(user_id_a, user_id_b);
CREATE INDEX IF NOT EXISTS idx_friendships_user_a ON friendships(user_id_a);
CREATE INDEX IF NOT EXISTS idx_friendships_user_b ON friendships(user_id_b);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_friendships_partner_id ON friendships(partner_id);

CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_friend_requests_to ON friend_requests(to_user_id, status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_from ON friend_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_partner_id ON friend_requests(partner_id);

CREATE TABLE IF NOT EXISTS classrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  join_code VARCHAR(20) NOT NULL UNIQUE,
  config JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classrooms_teacher_id ON classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_join_code ON classrooms(join_code);
CREATE INDEX IF NOT EXISTS idx_classrooms_partner_id ON classrooms(partner_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_status ON classrooms(status) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS classroom_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  team_id VARCHAR(50),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'removed'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_classroom_members_unique ON classroom_members(classroom_id, user_id);
CREATE INDEX IF NOT EXISTS idx_classroom_members_classroom ON classroom_members(classroom_id);
CREATE INDEX IF NOT EXISTS idx_classroom_members_user ON classroom_members(user_id);
CREATE INDEX IF NOT EXISTS idx_classroom_members_partner_id ON classroom_members(partner_id);

CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  leaderboard_type VARCHAR(50) NOT NULL,
  scope_id UUID,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  entries JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_snapshots_type ON leaderboard_snapshots(leaderboard_type, period_start);
CREATE INDEX IF NOT EXISTS idx_leaderboard_snapshots_scope ON leaderboard_snapshots(scope_id) WHERE scope_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leaderboard_snapshots_partner_id ON leaderboard_snapshots(partner_id);

-- Down

DROP TABLE IF EXISTS leaderboard_snapshots;
DROP TABLE IF EXISTS classroom_members;
DROP TABLE IF EXISTS classrooms;
DROP TABLE IF EXISTS friend_requests;
DROP TABLE IF EXISTS friendships;
