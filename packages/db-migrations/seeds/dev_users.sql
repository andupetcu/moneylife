-- Seed: dev_users
-- Development seed data for users

INSERT INTO partners (id, name, slug, status) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'MoneyLife Default', 'default', 'active'),
  ('a0000000-0000-0000-0000-000000000002', 'Test Bank Partner', 'test-bank', 'active')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO users (id, email, password_hash, display_name, date_of_birth, role, partner_id) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'player@test.com',
   '$2b$12$LJ3m4ys2Ot0YJK8vGxPfHeINQ2HzBmSgG0s1BFXM8v0VBKbC3GJm', -- password: "testpass123"
   'Test Player', '2000-01-15', 'player', NULL),
  ('b0000000-0000-0000-0000-000000000002', 'teacher@test.com',
   '$2b$12$LJ3m4ys2Ot0YJK8vGxPfHeINQ2HzBmSgG0s1BFXM8v0VBKbC3GJm',
   'Test Teacher', '1985-06-20', 'teacher', NULL),
  ('b0000000-0000-0000-0000-000000000003', 'admin@test.com',
   '$2b$12$LJ3m4ys2Ot0YJK8vGxPfHeINQ2HzBmSgG0s1BFXM8v0VBKbC3GJm',
   'Test Admin', '1990-03-10', 'system_admin', NULL),
  ('b0000000-0000-0000-0000-000000000004', 'partner@test.com',
   '$2b$12$LJ3m4ys2Ot0YJK8vGxPfHeINQ2HzBmSgG0s1BFXM8v0VBKbC3GJm',
   'Partner User', '1988-11-25', 'partner_admin', 'a0000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;
