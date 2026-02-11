-- Seed: dev_scenarios (decision cards)

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences) VALUES
('DC-YA-FOOD-001', 'groceries', 'meal_planning', 'Meal Prep Sunday',
 'You have time this Sunday to plan your meals for the week. What do you do?',
 ARRAY['young_adult', 'student'], 1, 8, 3,
 '[{"id":"A","label":"Meal prep for the week","cost":3500,"xp":15,"coins":8,"happiness_delta":3},{"id":"B","label":"Just wing it day by day","cost":0,"xp":5,"coins":2,"happiness_delta":0},{"id":"C","label":"Order meal kit delivery","cost":7500,"xp":10,"coins":5,"happiness_delta":5}]',
 '{}'),

('DC-YA-FOOD-042', 'groceries', 'social', 'Friday Night with Friends',
 'Your friends want to go to a trendy new restaurant downtown. The average meal is about 55 CU.',
 ARRAY['young_adult', 'student'], 2, 8, 3,
 '[{"id":"A","label":"Go and enjoy the full experience","cost":5500,"xp":5,"coins":2,"happiness_delta":8},{"id":"B","label":"Go but stick to appetizers","cost":1800,"xp":10,"coins":5,"happiness_delta":4},{"id":"C","label":"Suggest a potluck instead","cost":1500,"xp":15,"coins":8,"happiness_delta":6},{"id":"D","label":"Skip it — stay home","cost":0,"xp":8,"coins":3,"happiness_delta":-3}]',
 '{}'),

('DC-YA-EMRG-001', 'emergency', 'car', 'Car Trouble',
 'Your car is making a strange noise. The mechanic says it needs repairs.',
 ARRAY['young_adult', 'parent'], 3, 8, 2,
 '[{"id":"A","label":"Full repair now","cost":45000,"xp":20,"coins":10,"happiness_delta":-2},{"id":"B","label":"Quick fix only","cost":15000,"xp":10,"coins":5,"happiness_delta":-5},{"id":"C","label":"Ignore it for now","cost":0,"xp":5,"coins":2,"happiness_delta":-1}]',
 '{"C":{"follow_up":"DC-YA-EMRG-001C","delay_min":30,"delay_max":90,"probability":0.6}}'),

('DC-TEEN-SHOP-001', 'shopping', 'electronics', 'New Phone Temptation',
 'A new phone just dropped and all your friends are getting it.',
 ARRAY['teen', 'student'], 1, 5, 2,
 '[{"id":"A","label":"Buy the latest model","cost":99900,"xp":5,"coins":2,"happiness_delta":10},{"id":"B","label":"Get last years model","cost":49900,"xp":15,"coins":8,"happiness_delta":5},{"id":"C","label":"Keep your current phone","cost":0,"xp":20,"coins":10,"happiness_delta":-3}]',
 '{}'),

('DC-PAR-FAM-001', 'housing', 'repair', 'Leaky Roof',
 'You notice water stains on the ceiling. The roof might be leaking.',
 ARRAY['parent'], 5, 8, 2,
 '[{"id":"A","label":"Full roof inspection + repair","cost":250000,"xp":25,"coins":15,"happiness_delta":-5},{"id":"B","label":"Patch it yourself","cost":5000,"xp":15,"coins":8,"happiness_delta":-3},{"id":"C","label":"Wait and see","cost":0,"xp":5,"coins":2,"happiness_delta":0}]',
 '{"C":{"follow_up":"DC-PAR-FAM-001C","delay_min":30,"delay_max":60,"probability":0.7}}')

ON CONFLICT (id) DO NOTHING;
