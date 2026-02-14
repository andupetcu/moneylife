INSERT INTO coin_shop_items (item_key, name, description, category, price, icon, effect_type, effect_duration_hours, max_owned, sort_order) VALUES
('streak_freeze', 'Streak Freeze', 'Protects your streak for 48 hours of inactivity', 'protection', 50, '🛡️', 'streak_freeze', 48, 3, 1),
('xp_boost_2x', '2x XP Boost', 'Double XP earnings for 24 hours', 'boost', 100, '⚡', 'xp_boost', 24, 1, 2),
('hint_token', 'Hint Token', 'Preview financial impact before choosing a decision card', 'utility', 30, '🔮', 'hint_token', NULL, 10, 3),
('card_mulligan', 'Card Mulligan', 'Redraw one decision card you don''t want', 'utility', 75, '🔄', 'card_mulligan', NULL, 5, 4),
('advisor_session', 'Extra AI Advisor', 'One extra AI advisor question beyond daily limit', 'utility', 100, '🤖', 'advisor_session', NULL, 3, 5),
('avatar_frame_gold', 'Gold Avatar Frame', 'Gold border on leaderboard profile', 'cosmetic', 200, '✨', 'avatar_frame', NULL, 1, 6),
('avatar_frame_diamond', 'Diamond Avatar Frame', 'Diamond border on leaderboard profile', 'cosmetic', 500, '💎', 'avatar_frame', NULL, 1, 7),
('leaderboard_highlight', 'Leaderboard Spotlight', 'Your name glows on the leaderboard for 7 days', 'cosmetic', 150, '🌟', 'leaderboard_highlight', 168, 1, 8)
ON CONFLICT (item_key) DO NOTHING;
