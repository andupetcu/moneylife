-- Seed: dev_badges

INSERT INTO reward_catalog (id, partner_id, name, description, category, coin_cost, fulfillment_type, provider, status, regions) VALUES
  ('c0000000-0000-0000-0000-000000000001', NULL, '$5 Gift Card', 'A $5 digital gift card', 'gift_card', 500, 'instant_digital', 'tremendous', 'active', ARRAY['us', 'gb']),
  ('c0000000-0000-0000-0000-000000000002', NULL, '$10 Gift Card', 'A $10 digital gift card', 'gift_card', 1000, 'instant_digital', 'tremendous', 'active', ARRAY['us', 'gb']),
  ('c0000000-0000-0000-0000-000000000003', NULL, 'Custom Avatar Frame', 'A special avatar frame', 'cosmetic', 200, 'instant_digital', 'internal', 'active', ARRAY[]::VARCHAR[])
ON CONFLICT DO NOTHING;

-- Note: Badge definitions are in packages/config/src/badges.json
-- These are just reward catalog items. Actual badge metadata (conditions, etc.)
-- lives in application config, not in the database.
