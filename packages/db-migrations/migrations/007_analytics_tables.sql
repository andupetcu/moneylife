-- Migration: 007_analytics_tables
-- Up

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  session_id UUID,
  device_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_partner_id ON analytics_events(partner_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id) WHERE session_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS experiment_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  experiment_name VARCHAR(100) NOT NULL,
  variant VARCHAR(50) NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_experiment_assignments_unique ON experiment_assignments(user_id, experiment_name);
CREATE INDEX IF NOT EXISTS idx_experiment_assignments_experiment ON experiment_assignments(experiment_name, variant);
CREATE INDEX IF NOT EXISTS idx_experiment_assignments_partner_id ON experiment_assignments(partner_id);

CREATE TABLE IF NOT EXISTS daily_aggregates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(20, 4) NOT NULL,
  dimensions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_aggregates_date ON daily_aggregates(date, metric_name);
CREATE INDEX IF NOT EXISTS idx_daily_aggregates_metric ON daily_aggregates(metric_name);
CREATE INDEX IF NOT EXISTS idx_daily_aggregates_partner_id ON daily_aggregates(partner_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_aggregates_unique ON daily_aggregates(date, metric_name, dimensions);

-- Down

DROP TABLE IF EXISTS daily_aggregates;
DROP TABLE IF EXISTS experiment_assignments;
DROP TABLE IF EXISTS analytics_events;
