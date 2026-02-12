-- Seed: all scenarios (auto-generated)

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-001', 'groceries', 'weekly', 'Weekly Grocery Run', 'Time to stock up on groceries for the week.', ARRAY['teen','student','young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"Buy premium organic","cost":8000,"xp":5,"coins":2},{"id":"B","label":"Regular store brands","cost":4000,"xp":10,"coins":5},{"id":"C","label":"Budget basics only","cost":2500,"xp":15,"coins":8},{"id":"D","label":"Skip and eat out instead","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-002', 'groceries', 'weekly', 'Meal Prep Sunday', 'Plan and prep meals for the week.', ARRAY['student','young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"Full meal prep with variety","cost":6000,"xp":15,"coins":8},{"id":"B","label":"Simple prep, basic recipes","cost":3500,"xp":10,"coins":5},{"id":"C","label":"Skip prep, wing it","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-003', 'groceries', 'shopping', 'Farmers Market Visit', 'The local farmers market is open today.', ARRAY['young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Go all out on fresh produce","cost":7500,"xp":8,"coins":3},{"id":"B","label":"Pick up a few essentials","cost":3000,"xp":12,"coins":6},{"id":"C","label":"Skip it","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-004', 'groceries', 'bulk', 'Bulk Warehouse Trip', 'Warehouse club has good deals on bulk items.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Big stock-up trip","cost":15000,"xp":10,"coins":5},{"id":"B","label":"Just a few bulk essentials","cost":8000,"xp":12,"coins":6},{"id":"C","label":"Not worth the trip","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-005', 'groceries', 'special', 'Holiday Dinner Prep', 'A holiday is coming and you need supplies for a special dinner.', ARRAY['student','young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Full spread, impress everyone","cost":12000,"xp":8,"coins":3},{"id":"B","label":"Potluck — just bring one dish","cost":3000,"xp":12,"coins":6},{"id":"C","label":"Skip the dinner","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-006', 'groceries', 'delivery', 'Grocery Delivery Temptation', 'Too tired to go to the store. Delivery is an option.', ARRAY['student','young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"Order delivery with premium items","cost":7000,"xp":5,"coins":2},{"id":"B","label":"Order delivery, basics only","cost":5000,"xp":8,"coins":4},{"id":"C","label":"Go to the store yourself","cost":3500,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-007', 'groceries', 'waste', 'Food Going Bad', 'Some food in your fridge is about to expire.', ARRAY['teen','student','young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"Cook everything tonight","cost":500,"xp":10,"coins":5},{"id":"B","label":"Toss it and buy fresh","cost":4000,"xp":3,"coins":1},{"id":"C","label":"Eat what you can, compost the rest","cost":200,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-008', 'groceries', 'splurge', 'Specialty Item Craving', 'You really want that imported cheese / special ingredient.', ARRAY['young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Treat yourself","cost":3500,"xp":5,"coins":2},{"id":"B","label":"Find a cheaper alternative","cost":1500,"xp":10,"coins":5},{"id":"C","label":"Resist the craving","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-009', 'groceries', 'cooking', 'Cooking Class Opportunity', 'A local cooking class could save you money long-term.', ARRAY['student','young_adult'], 2, 6, 3, '[{"id":"A","label":"Sign up for the full course","cost":8000,"xp":20,"coins":10},{"id":"B","label":"Watch free YouTube tutorials","cost":0,"xp":12,"coins":5},{"id":"C","label":"Not interested","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-010', 'groceries', 'diet', 'New Diet Plan', 'You want to start eating healthier.', ARRAY['teen','student','young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"Premium health food plan","cost":9000,"xp":8,"coins":3},{"id":"B","label":"Budget-friendly healthy eating","cost":5000,"xp":15,"coins":8},{"id":"C","label":"Stick with current habits","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-011', 'dining', 'social', 'Friday Night with Friends', 'Your friends want to go to a trendy new restaurant.', ARRAY['student','young_adult'], 2, 8, 3, '[{"id":"A","label":"Go and enjoy the full experience","cost":5500,"xp":5,"coins":2},{"id":"B","label":"Go but stick to appetizers","cost":1800,"xp":10,"coins":5},{"id":"C","label":"Suggest a potluck instead","cost":1500,"xp":15,"coins":8},{"id":"D","label":"Skip it — stay home","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-012', 'dining', 'work', 'Coworker Birthday Lunch', 'The office is collecting for a group lunch.', ARRAY['young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Join and split equally","cost":3500,"xp":8,"coins":3},{"id":"B","label":"Join but order light","cost":2000,"xp":10,"coins":5},{"id":"C","label":"Politely decline","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-013', 'dining', 'date', 'Date Night', 'Planning a nice evening out.', ARRAY['student','young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Upscale restaurant","cost":8000,"xp":5,"coins":2},{"id":"B","label":"Nice but reasonable place","cost":4000,"xp":10,"coins":5},{"id":"C","label":"Cook at home date night","cost":2000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-014', 'dining', 'delivery', 'Late Night Food Delivery', 'It is late and you are hungry. Food delivery apps are calling.', ARRAY['teen','student','young_adult'], 1, 8, 3, '[{"id":"A","label":"Order a full meal","cost":3500,"xp":3,"coins":1},{"id":"B","label":"Order something small","cost":1500,"xp":5,"coins":2},{"id":"C","label":"Make something from what you have","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-015', 'dining', 'coffee', 'Daily Coffee Habit', 'Your daily coffee shop visit adds up.', ARRAY['student','young_adult'], 1, 8, 3, '[{"id":"A","label":"Keep the daily latte","cost":500,"xp":3,"coins":1},{"id":"B","label":"Switch to 2x per week","cost":200,"xp":10,"coins":5},{"id":"C","label":"Make coffee at home","cost":50,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-016', 'dining', 'social', 'Family Dinner Out', 'The family wants to eat out this weekend.', ARRAY['parent'], 1, 8, 3, '[{"id":"A","label":"Nice family restaurant","cost":10000,"xp":5,"coins":2},{"id":"B","label":"Fast casual place","cost":4000,"xp":10,"coins":5},{"id":"C","label":"Cook a special meal at home","cost":3000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-017', 'dining', 'work', 'Business Lunch', 'A potential client wants to meet over lunch.', ARRAY['young_adult','parent'], 4, 8, 3, '[{"id":"A","label":"Pick up the tab at a nice place","cost":8000,"xp":20,"coins":10},{"id":"B","label":"Suggest a moderate restaurant, split","cost":3000,"xp":12,"coins":5},{"id":"C","label":"Suggest a coffee meeting instead","cost":500,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-018', 'dining', 'celebration', 'Celebration Dinner', 'You achieved something worth celebrating!', ARRAY['student','young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Splurge on a fancy dinner","cost":10000,"xp":5,"coins":3},{"id":"B","label":"Nice dinner within budget","cost":5000,"xp":10,"coins":5},{"id":"C","label":"Celebrate at home","cost":2000,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-019', 'dining', 'social', 'Brunch Invitation', 'Friends invite you to a trendy brunch spot.', ARRAY['student','young_adult'], 2, 8, 3, '[{"id":"A","label":"Full brunch experience","cost":4000,"xp":5,"coins":2},{"id":"B","label":"Just coffee and a small plate","cost":1500,"xp":10,"coins":5},{"id":"C","label":"Skip it","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-020', 'dining', 'ordering', 'Lunch at Work', 'Deciding what to do for lunch today.', ARRAY['young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"Order from a restaurant","cost":2000,"xp":3,"coins":1},{"id":"B","label":"Cafeteria meal","cost":800,"xp":8,"coins":4},{"id":"C","label":"Packed lunch from home","cost":200,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-021', 'shopping', 'clothing', 'New Season Wardrobe', 'The new season collection is out.', ARRAY['teen','student','young_adult'], 1, 8, 3, '[{"id":"A","label":"Full wardrobe refresh","cost":25000,"xp":3,"coins":1},{"id":"B","label":"A few key pieces","cost":8000,"xp":8,"coins":4},{"id":"C","label":"Thrift store finds","cost":2000,"xp":15,"coins":8},{"id":"D","label":"Skip — clothes are fine","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-022', 'shopping', 'electronics', 'Flash Sale on Headphones', 'Great deal on premium headphones.', ARRAY['teen','student','young_adult'], 1, 8, 3, '[{"id":"A","label":"Buy the premium pair","cost":15000,"xp":5,"coins":2},{"id":"B","label":"Get a budget alternative","cost":4000,"xp":10,"coins":5},{"id":"C","label":"Skip it","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-023', 'shopping', 'gifts', 'Friend''s Wedding Gift', 'Your friend is getting married.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Generous gift from registry","cost":10000,"xp":8,"coins":3},{"id":"B","label":"Modest but thoughtful gift","cost":4000,"xp":12,"coins":6},{"id":"C","label":"Handmade/personal gift","cost":1000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-024', 'shopping', 'electronics', 'New Phone Temptation', 'Your phone works fine but the new model is out.', ARRAY['teen','student','young_adult'], 1, 8, 3, '[{"id":"A","label":"Upgrade to latest model","cost":80000,"xp":3,"coins":1},{"id":"B","label":"Get last years model","cost":40000,"xp":8,"coins":4},{"id":"C","label":"Keep current phone","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-025', 'shopping', 'home', 'Furniture Upgrade', 'Your furniture is looking worn.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Buy new quality furniture","cost":30000,"xp":5,"coins":2},{"id":"B","label":"Refurbish what you have","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Live with it","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-026', 'shopping', 'impulse', 'Online Shopping Cart', 'Youve been browsing online and your cart has items.', ARRAY['teen','student','young_adult'], 1, 8, 3, '[{"id":"A","label":"Buy everything in cart","cost":12000,"xp":3,"coins":1},{"id":"B","label":"Remove non-essentials","cost":3000,"xp":10,"coins":5},{"id":"C","label":"Close the tab","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-027', 'shopping', 'gifts', 'Birthday Gift for Partner', 'Your partners birthday is coming up.', ARRAY['young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Expensive surprise","cost":15000,"xp":5,"coins":2},{"id":"B","label":"Thoughtful mid-range gift","cost":5000,"xp":10,"coins":5},{"id":"C","label":"Experience gift (free or cheap)","cost":1000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-028', 'shopping', 'clothing', 'Work Wardrobe Need', 'You need professional clothes for work.', ARRAY['young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"High-end professional wear","cost":20000,"xp":5,"coins":2},{"id":"B","label":"Affordable professional basics","cost":6000,"xp":12,"coins":6},{"id":"C","label":"Mix and match existing wardrobe","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-029', 'shopping', 'electronics', 'Laptop Dying', 'Your laptop is on its last legs.', ARRAY['student','young_adult'], 2, 8, 3, '[{"id":"A","label":"Top-of-the-line replacement","cost":100000,"xp":5,"coins":2},{"id":"B","label":"Solid mid-range option","cost":45000,"xp":12,"coins":6},{"id":"C","label":"Refurbished budget option","cost":20000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-030', 'shopping', 'home', 'Kitchen Appliance', 'A useful kitchen appliance is on sale.', ARRAY['young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Buy the premium version","cost":15000,"xp":5,"coins":2},{"id":"B","label":"Buy the basic model","cost":5000,"xp":10,"coins":5},{"id":"C","label":"You dont need it","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-031', 'shopping', 'gifts', 'Holiday Gift Shopping', 'The holiday season means gift shopping.', ARRAY['teen','student','young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Generous gifts for everyone","cost":20000,"xp":5,"coins":2},{"id":"B","label":"Thoughtful budget gifts","cost":8000,"xp":10,"coins":5},{"id":"C","label":"Handmade gifts","cost":2000,"xp":15,"coins":8},{"id":"D","label":"Suggest no-gift policy","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-032', 'shopping', 'personal', 'Hobby Equipment', 'New gear for your hobby.', ARRAY['teen','student','young_adult'], 2, 8, 3, '[{"id":"A","label":"Top-tier equipment","cost":20000,"xp":5,"coins":2},{"id":"B","label":"Good enough gear","cost":7000,"xp":10,"coins":5},{"id":"C","label":"Borrow or share","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-033', 'shopping', 'pet', 'Pet Supplies', 'Your pet needs supplies and maybe a vet visit.', ARRAY['young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Premium pet care","cost":8000,"xp":5,"coins":2},{"id":"B","label":"Standard supplies","cost":3000,"xp":10,"coins":5},{"id":"C","label":"Bare minimum","cost":1500,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-034', 'shopping', 'home', 'Smart Home Devices', 'Smart home devices are on sale.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Full smart home setup","cost":25000,"xp":5,"coins":2},{"id":"B","label":"Just a smart speaker","cost":5000,"xp":10,"coins":5},{"id":"C","label":"Not interested","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-035', 'shopping', 'personal', 'Fitness Equipment', 'Want to set up a home gym.', ARRAY['young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Full home gym setup","cost":40000,"xp":5,"coins":2},{"id":"B","label":"Basic weights and mat","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Use free outdoor exercise","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-036', 'shopping', 'seasonal', 'Black Friday Deals', 'Incredible deals but do you need any of it?', ARRAY['teen','student','young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Stock up on deals","cost":18000,"xp":3,"coins":1},{"id":"B","label":"Only buy what you planned","cost":5000,"xp":15,"coins":8},{"id":"C","label":"Avoid the temptation entirely","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-037', 'housing', 'rent', 'Rent Increase Notice', 'Your landlord is raising rent by 10% next month.', ARRAY['student','young_adult'], 2, 8, 3, '[{"id":"A","label":"Accept and stay","cost":0,"xp":5,"coins":2},{"id":"B","label":"Negotiate with landlord","cost":0,"xp":15,"coins":8},{"id":"C","label":"Look for a cheaper place (moving costs)","cost":15000,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-038', 'housing', 'repair', 'Leaky Faucet', 'The kitchen faucet is dripping constantly.', ARRAY['young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Call a plumber","cost":8000,"xp":8,"coins":3},{"id":"B","label":"DIY repair","cost":1500,"xp":15,"coins":8},{"id":"C","label":"Ignore it for now","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-039', 'housing', 'utilities', 'Heating Bill Spike', 'Winter heating costs are much higher than expected.', ARRAY['student','young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Pay full amount","cost":12000,"xp":8,"coins":3},{"id":"B","label":"Lower thermostat to save","cost":8000,"xp":12,"coins":6},{"id":"C","label":"Set up a payment plan","cost":12000,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-040', 'housing', 'repair', 'AC Unit Broke', 'Your air conditioning stopped working in summer.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Replace with new unit","cost":30000,"xp":5,"coins":2},{"id":"B","label":"Repair the old unit","cost":8000,"xp":12,"coins":6},{"id":"C","label":"Use fans and tough it out","cost":500,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-041', 'housing', 'upgrade', 'Better Apartment Available', 'A nicer apartment opened up but costs more.', ARRAY['student','young_adult'], 3, 8, 3, '[{"id":"A","label":"Upgrade (+20000/mo)","cost":15000,"xp":5,"coins":2},{"id":"B","label":"Stay where you are","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-042', 'housing', 'roommate', 'Roommate Moving Out', 'Your roommate is leaving. Rent goes up unless you find a replacement.', ARRAY['student','young_adult'], 2, 6, 3, '[{"id":"A","label":"Find a new roommate","cost":2000,"xp":10,"coins":5},{"id":"B","label":"Cover full rent yourself","cost":0,"xp":5,"coins":2},{"id":"C","label":"Move to a cheaper solo place","cost":15000,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-043', 'housing', 'internet', 'Internet Plan Upgrade', 'Your ISP offers a faster plan.', ARRAY['teen','student','young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"Upgrade to fastest plan","cost":6000,"xp":3,"coins":1},{"id":"B","label":"Modest upgrade","cost":4000,"xp":8,"coins":4},{"id":"C","label":"Keep current plan","cost":2500,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-044', 'housing', 'security', 'Home Security System', 'A security company is offering a deal.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Full security package","cost":15000,"xp":5,"coins":2},{"id":"B","label":"Basic camera system (DIY)","cost":3000,"xp":12,"coins":6},{"id":"C","label":"Not needed","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-045', 'housing', 'maintenance', 'Annual Deep Clean', 'Time for annual home maintenance.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Hire professional cleaners","cost":8000,"xp":5,"coins":2},{"id":"B","label":"DIY deep clean","cost":500,"xp":15,"coins":8},{"id":"C","label":"Skip this year","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-046', 'housing', 'decor', 'Home Decoration', 'Your place could use some sprucing up.', ARRAY['young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Professional interior design","cost":20000,"xp":5,"coins":2},{"id":"B","label":"DIY with affordable pieces","cost":5000,"xp":10,"coins":5},{"id":"C","label":"Good enough as is","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-047', 'transport', 'maintenance', 'Car Oil Change Due', 'Your car needs an oil change.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Dealership service","cost":8000,"xp":5,"coins":2},{"id":"B","label":"Quick lube shop","cost":4000,"xp":10,"coins":5},{"id":"C","label":"DIY oil change","cost":1500,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-048', 'transport', 'repair', 'Flat Tire', 'You got a flat tire.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"New premium tires (all 4)","cost":40000,"xp":8,"coins":3},{"id":"B","label":"Replace just the damaged tire","cost":8000,"xp":12,"coins":6},{"id":"C","label":"Plug the tire temporarily","cost":2000,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-049', 'transport', 'commute', 'Monthly Transit Pass', 'Deciding between transit pass and driving.', ARRAY['student','young_adult'], 2, 8, 3, '[{"id":"A","label":"Monthly transit pass","cost":7500,"xp":12,"coins":6},{"id":"B","label":"Drive and pay for gas/parking","cost":15000,"xp":5,"coins":2},{"id":"C","label":"Bike to work/school","cost":500,"xp":20,"coins":10}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-050', 'transport', 'purchase', 'Car Upgrade Opportunity', 'A good deal on a reliable used car.', ARRAY['young_adult','parent'], 4, 8, 3, '[{"id":"A","label":"Buy it (financing)","cost":2500000,"xp":5,"coins":2},{"id":"B","label":"Keep current car","cost":500,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-051', 'transport', 'repair', 'Check Engine Light', 'The check engine light came on.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Go to mechanic immediately","cost":5000,"xp":10,"coins":5},{"id":"B","label":"Use OBD scanner first","cost":500,"xp":15,"coins":8},{"id":"C","label":"Ignore it for now","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-052', 'transport', 'rideshare', 'Rideshare vs Own Car', 'Considering switching to rideshare only.', ARRAY['student','young_adult'], 2, 6, 3, '[{"id":"A","label":"Sell car, go rideshare","cost":0,"xp":15,"coins":8},{"id":"B","label":"Keep car for flexibility","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-053', 'transport', 'insurance', 'Car Insurance Renewal', 'Time to renew car insurance.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Same comprehensive plan","cost":8000,"xp":5,"coins":2},{"id":"B","label":"Shop around for better rate","cost":6000,"xp":15,"coins":8},{"id":"C","label":"Minimum coverage only","cost":3000,"xp":8,"coins":4}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-054', 'transport', 'parking', 'Parking Ticket', 'You got a parking ticket.', ARRAY['student','young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Pay it immediately","cost":5000,"xp":10,"coins":5},{"id":"B","label":"Contest the ticket","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-055', 'transport', 'gas', 'Gas Prices Surge', 'Gas prices jumped 30% this month.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Keep driving as usual","cost":6000,"xp":3,"coins":1},{"id":"B","label":"Reduce trips and carpool","cost":3000,"xp":12,"coins":6},{"id":"C","label":"Take public transit this month","cost":2000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-056', 'transport', 'maintenance', 'Annual Car Inspection', 'Time for annual vehicle inspection.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Full inspection and tune-up","cost":10000,"xp":10,"coins":5},{"id":"B","label":"Basic state inspection only","cost":3000,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-057', 'health', 'medical', 'Annual Checkup', 'Time for your annual health checkup.', ARRAY['student','young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Full checkup with extras","cost":15000,"xp":15,"coins":8},{"id":"B","label":"Basic checkup only","cost":5000,"xp":10,"coins":5},{"id":"C","label":"Skip it this year","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-058', 'health', 'dental', 'Dentist Visit Due', '6-month dental checkup is due.', ARRAY['teen','student','young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Full cleaning and checkup","cost":10000,"xp":12,"coins":6},{"id":"B","label":"Basic cleaning only","cost":5000,"xp":10,"coins":5},{"id":"C","label":"Postpone it","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-059', 'health', 'fitness', 'Gym Membership Renewal', 'Your gym membership is expiring.', ARRAY['student','young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Renew premium membership","cost":5000,"xp":8,"coins":3},{"id":"B","label":"Switch to basic plan","cost":2500,"xp":10,"coins":5},{"id":"C","label":"Cancel and workout at home","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-060', 'health', 'mental', 'Therapy Consideration', 'Youve been stressed. Therapy could help.', ARRAY['student','young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Start weekly sessions","cost":12000,"xp":20,"coins":10},{"id":"B","label":"Try a meditation app","cost":1000,"xp":12,"coins":6},{"id":"C","label":"Push through on your own","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-061', 'health', 'emergency', 'Sudden Illness', 'You fell ill and need to see a doctor urgently.', ARRAY['teen','student','young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"Urgent care visit","cost":10000,"xp":10,"coins":5},{"id":"B","label":"Telehealth appointment","cost":3000,"xp":12,"coins":6},{"id":"C","label":"Try over-the-counter remedies","cost":1500,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-062', 'health', 'vision', 'Eye Exam and Glasses', 'Your vision has changed. Need new glasses.', ARRAY['teen','student','young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Designer frames and exam","cost":25000,"xp":5,"coins":2},{"id":"B","label":"Standard frames and exam","cost":8000,"xp":10,"coins":5},{"id":"C","label":"Budget online glasses","cost":3000,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-063', 'health', 'fitness', 'Running Shoes', 'Your running shoes are worn out.', ARRAY['student','young_adult'], 1, 8, 3, '[{"id":"A","label":"Premium running shoes","cost":12000,"xp":5,"coins":2},{"id":"B","label":"Good mid-range shoes","cost":6000,"xp":10,"coins":5},{"id":"C","label":"Budget shoes on sale","cost":2500,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-064', 'health', 'medical', 'Prescription Refill', 'Monthly prescription needs refilling.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Name brand","cost":5000,"xp":3,"coins":1},{"id":"B","label":"Generic equivalent","cost":1500,"xp":12,"coins":6},{"id":"C","label":"Ask doctor about alternatives","cost":500,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-065', 'health', 'fitness', 'Sports League', 'Friends want you to join a recreational sports league.', ARRAY['student','young_adult'], 2, 8, 3, '[{"id":"A","label":"Join the league","cost":8000,"xp":10,"coins":5},{"id":"B","label":"Play pickup games for free instead","cost":0,"xp":8,"coins":4},{"id":"C","label":"Not interested","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-066', 'health', 'medical', 'Health Insurance Decision', 'Open enrollment for health insurance.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Comprehensive plan","cost":20000,"xp":10,"coins":5},{"id":"B","label":"Basic plan","cost":10000,"xp":12,"coins":6},{"id":"C","label":"High-deductible with HSA","cost":8000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-067', 'entertainment', 'streaming', 'New Streaming Service', 'An exciting new streaming platform launched.', ARRAY['teen','student','young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"Subscribe immediately","cost":1200,"xp":5,"coins":2},{"id":"B","label":"Wait for free trial","cost":0,"xp":10,"coins":5},{"id":"C","label":"Stick with current services","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-068', 'entertainment', 'events', 'Concert Tickets', 'Your favorite artist is coming to town.', ARRAY['teen','student','young_adult'], 1, 8, 3, '[{"id":"A","label":"VIP tickets","cost":15000,"xp":5,"coins":2},{"id":"B","label":"Regular tickets","cost":5000,"xp":8,"coins":3},{"id":"C","label":"Skip it","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-069', 'entertainment', 'gaming', 'New Video Game Release', 'A highly anticipated game just came out.', ARRAY['teen','student'], 1, 8, 3, '[{"id":"A","label":"Buy on release day","cost":6000,"xp":3,"coins":1},{"id":"B","label":"Wait for a sale","cost":0,"xp":10,"coins":5},{"id":"C","label":"Watch streamers play it instead","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-070', 'entertainment', 'travel', 'Weekend Getaway', 'You could use a weekend trip.', ARRAY['student','young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Book a nice hotel trip","cost":25000,"xp":5,"coins":2},{"id":"B","label":"Budget camping trip","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Staycation at home","cost":500,"xp":10,"coins":5},{"id":"D","label":"Skip it","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-071', 'entertainment', 'hobby', 'New Hobby Opportunity', 'You discovered an interesting new hobby.', ARRAY['teen','student','young_adult'], 1, 8, 3, '[{"id":"A","label":"Buy all the starter gear","cost":15000,"xp":5,"coins":2},{"id":"B","label":"Start with minimal equipment","cost":3000,"xp":12,"coins":6},{"id":"C","label":"Try it for free first","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-072', 'entertainment', 'social', 'House Party', 'Hosting a party at your place.', ARRAY['student','young_adult'], 2, 8, 3, '[{"id":"A","label":"Go all out","cost":8000,"xp":5,"coins":3},{"id":"B","label":"Potluck style","cost":2000,"xp":12,"coins":6},{"id":"C","label":"Skip hosting","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-073', 'entertainment', 'subscription', 'Subscription Audit', 'You have 5 active subscriptions. Review time.', ARRAY['teen','student','young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Keep them all","cost":6000,"xp":3,"coins":1},{"id":"B","label":"Cancel 2 unused ones","cost":3600,"xp":15,"coins":8},{"id":"C","label":"Cancel all but one","cost":1200,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-074', 'entertainment', 'travel', 'International Trip Plan', 'Friends are planning an international trip.', ARRAY['young_adult'], 4, 8, 3, '[{"id":"A","label":"Join the trip","cost":100000,"xp":5,"coins":2},{"id":"B","label":"Suggest a cheaper destination","cost":40000,"xp":10,"coins":5},{"id":"C","label":"Skip this one","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-075', 'entertainment', 'events', 'Sports Event', 'Tickets to a big sports game.', ARRAY['teen','student','young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"Premium seats","cost":10000,"xp":5,"coins":2},{"id":"B","label":"Regular seats","cost":4000,"xp":8,"coins":3},{"id":"C","label":"Watch at home/bar","cost":500,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-076', 'entertainment', 'books', 'Book Purchase', 'A stack of interesting books to read.', ARRAY['teen','student','young_adult'], 1, 8, 3, '[{"id":"A","label":"Buy all new","cost":4000,"xp":5,"coins":2},{"id":"B","label":"Library card","cost":500,"xp":15,"coins":8},{"id":"C","label":"E-book or audiobook subscription","cost":1200,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-077', 'education', 'course', 'Online Course', 'A popular online course in your field of interest.', ARRAY['student','young_adult'], 2, 8, 3, '[{"id":"A","label":"Premium course with certificate","cost":20000,"xp":20,"coins":10},{"id":"B","label":"Free course without certificate","cost":0,"xp":12,"coins":5},{"id":"C","label":"Not interested right now","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-078', 'education', 'certification', 'Professional Certification', 'A certification could boost your career.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Enroll in certification program","cost":30000,"xp":25,"coins":12},{"id":"B","label":"Self-study for the exam","cost":5000,"xp":18,"coins":8},{"id":"C","label":"Not right now","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-079', 'education', 'books', 'Textbook Purchase', 'New semester requires expensive textbooks.', ARRAY['student'], 1, 5, 3, '[{"id":"A","label":"Buy new from bookstore","cost":20000,"xp":5,"coins":2},{"id":"B","label":"Buy used or rent","cost":8000,"xp":12,"coins":6},{"id":"C","label":"Find PDFs and library copies","cost":500,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-080', 'education', 'conference', 'Industry Conference', 'A relevant conference is coming up.', ARRAY['young_adult','parent'], 4, 8, 3, '[{"id":"A","label":"Full conference pass + travel","cost":40000,"xp":20,"coins":10},{"id":"B","label":"Virtual attendance","cost":5000,"xp":12,"coins":5},{"id":"C","label":"Skip it","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-081', 'education', 'tutoring', 'Tutoring Opportunity', 'Offer to tutor others for extra income.', ARRAY['student','young_adult'], 2, 6, 3, '[{"id":"A","label":"Start tutoring (earn 5000/mo)","cost":0,"xp":15,"coins":8},{"id":"B","label":"Not enough time","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-082', 'education', 'skills', 'Language Course', 'Learning a new language could be beneficial.', ARRAY['teen','student','young_adult'], 1, 8, 3, '[{"id":"A","label":"Premium language app","cost":8000,"xp":12,"coins":6},{"id":"B","label":"Free resources","cost":0,"xp":10,"coins":5},{"id":"C","label":"Not interested","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-083', 'education', 'workshop', 'Financial Workshop', 'Free financial literacy workshop in your area.', ARRAY['teen','student','young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"Attend the workshop","cost":0,"xp":20,"coins":10},{"id":"B","label":"Skip it","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-084', 'education', 'degree', 'Graduate School Consideration', 'Thinking about going back to school.', ARRAY['young_adult'], 4, 8, 3, '[{"id":"A","label":"Enroll full-time","cost":200000,"xp":15,"coins":5},{"id":"B","label":"Part-time while working","cost":80000,"xp":20,"coins":10},{"id":"C","label":"Not worth it right now","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-085', 'career', 'networking', 'Networking Event', 'A professional networking event this evening.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Attend and pay for drinks/dinner","cost":5000,"xp":15,"coins":8},{"id":"B","label":"Attend but be frugal","cost":1000,"xp":12,"coins":6},{"id":"C","label":"Skip it","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-086', 'career', 'tools', 'Work Equipment Upgrade', 'Your work tools/equipment need upgrading.', ARRAY['young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Top-tier equipment","cost":30000,"xp":10,"coins":5},{"id":"B","label":"Adequate upgrade","cost":12000,"xp":12,"coins":6},{"id":"C","label":"Make do with current tools","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-087', 'career', 'sidehustle', 'Freelance Opportunity', 'A freelance gig could earn you extra money.', ARRAY['student','young_adult'], 2, 8, 3, '[{"id":"A","label":"Take the gig (invest time)","cost":5000,"xp":20,"coins":10},{"id":"B","label":"Pass on this one","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-088', 'career', 'raise', 'Salary Negotiation', 'Performance review coming up.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Ask for a significant raise","cost":0,"xp":20,"coins":10},{"id":"B","label":"Modest raise request","cost":0,"xp":15,"coins":8},{"id":"C","label":"Dont rock the boat","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-089', 'career', 'clothes', 'Professional Attire', 'Important meeting requires professional attire.', ARRAY['young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Buy a new outfit","cost":15000,"xp":5,"coins":2},{"id":"B","label":"Borrow something","cost":0,"xp":10,"coins":5},{"id":"C","label":"Wear your best existing outfit","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-090', 'career', 'commute', 'Commute Optimization', 'Your commute is eating time and money.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Move closer to work","cost":20000,"xp":10,"coins":5},{"id":"B","label":"Switch to public transit","cost":5000,"xp":15,"coins":8},{"id":"C","label":"Keep current commute","cost":10000,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-091', 'career', 'opportunity', 'Job Offer', 'Another company offers you a job.', ARRAY['young_adult','parent'], 4, 8, 3, '[{"id":"A","label":"Accept new job (+15% salary, new city)","cost":25000,"xp":20,"coins":10},{"id":"B","label":"Use offer to negotiate current raise","cost":0,"xp":18,"coins":8},{"id":"C","label":"Stay comfortable where you are","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-092', 'career', 'training', 'Company Training', 'Employer offers optional paid training.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Take the training","cost":0,"xp":15,"coins":8},{"id":"B","label":"Skip it","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-093', 'career', 'startup', 'Friend Startup Investment', 'A friend asks you to invest in their startup.', ARRAY['young_adult','parent'], 4, 8, 3, '[{"id":"A","label":"Invest 50000","cost":50000,"xp":10,"coins":5},{"id":"B","label":"Invest 10000","cost":10000,"xp":12,"coins":6},{"id":"C","label":"Politely decline","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-094', 'career', 'remote', 'Remote Work Setup', 'Your company allows remote work. Need a home office.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Full home office setup","cost":20000,"xp":10,"coins":5},{"id":"B","label":"Basic desk and chair","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Work from couch/kitchen","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-095', 'emergency', 'medical', 'Medical Emergency', 'A sudden health issue requires immediate attention.', ARRAY['student','young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Go to ER","cost":50000,"xp":10,"coins":5},{"id":"B","label":"Visit urgent care","cost":15000,"xp":12,"coins":6},{"id":"C","label":"Try to wait it out","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-096', 'emergency', 'car', 'Car Breakdown', 'Your car broke down on the highway.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Tow and full repair","cost":15000,"xp":10,"coins":5},{"id":"B","label":"Tow and minimum fix","cost":8000,"xp":12,"coins":6},{"id":"C","label":"Sell it for parts","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-097', 'emergency', 'home', 'Water Heater Burst', 'Your water heater just failed.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Emergency replacement","cost":30000,"xp":10,"coins":5},{"id":"B","label":"Basic replacement","cost":15000,"xp":12,"coins":6},{"id":"C","label":"Cold showers until payday","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-098', 'emergency', 'job', 'Layoff Notice', 'Your company is laying people off. You might be affected.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Start job hunting immediately","cost":2000,"xp":20,"coins":10},{"id":"B","label":"Wait and see","cost":0,"xp":8,"coins":3},{"id":"C","label":"Ask about severance package","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-099', 'emergency', 'theft', 'Identity Theft', 'Someone used your info for fraudulent purchases.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Hire identity protection service","cost":10000,"xp":10,"coins":5},{"id":"B","label":"Handle it yourself (time-consuming)","cost":500,"xp":15,"coins":8},{"id":"C","label":"Ignore and hope for the best","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-100', 'emergency', 'natural', 'Storm Damage', 'A severe storm damaged your property.', ARRAY['young_adult','parent'], 4, 8, 3, '[{"id":"A","label":"Professional repair","cost":20000,"xp":10,"coins":5},{"id":"B","label":"DIY repair","cost":5000,"xp":12,"coins":6},{"id":"C","label":"File insurance claim","cost":2000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-101', 'emergency', 'pet', 'Pet Emergency', 'Your pet needs emergency vet care.', ARRAY['young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Full treatment","cost":15000,"xp":10,"coins":5},{"id":"B","label":"Basic treatment only","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Explore payment plans","cost":5000,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-102', 'emergency', 'phone', 'Phone Screen Cracked', 'You dropped your phone and the screen cracked.', ARRAY['teen','student','young_adult'], 1, 8, 3, '[{"id":"A","label":"Replace the phone","cost":40000,"xp":3,"coins":1},{"id":"B","label":"Screen repair","cost":8000,"xp":10,"coins":5},{"id":"C","label":"Use it cracked","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-103', 'emergency', 'plumbing', 'Burst Pipe', 'A pipe burst in your home.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Emergency plumber","cost":12000,"xp":10,"coins":5},{"id":"B","label":"Shut off water and DIY","cost":2000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-104', 'emergency', 'appliance', 'Fridge Died', 'Your refrigerator stopped working.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Buy new fridge","cost":50000,"xp":5,"coins":2},{"id":"B","label":"Buy a used one","cost":15000,"xp":12,"coins":6},{"id":"C","label":"Use a cooler temporarily","cost":500,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-105', 'investment', 'start', 'First Investment Decision', 'You have some savings. Time to consider investing.', ARRAY['young_adult','parent'], 4, 8, 3, '[{"id":"A","label":"Index fund (diversified)","cost":10000,"xp":20,"coins":10},{"id":"B","label":"Individual stocks (risky)","cost":10000,"xp":12,"coins":5},{"id":"C","label":"Keep it all in savings","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-106', 'investment', 'opportunity', 'Hot Stock Tip', 'A friend swears this stock will double.', ARRAY['young_adult','parent'], 4, 8, 3, '[{"id":"A","label":"Invest heavily","cost":50000,"xp":5,"coins":2},{"id":"B","label":"Small speculative amount","cost":10000,"xp":10,"coins":5},{"id":"C","label":"Stick to index funds","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-107', 'investment', 'rebalance', 'Portfolio Rebalance', 'Your portfolio drifted from target allocation.', ARRAY['young_adult','parent'], 5, 8, 3, '[{"id":"A","label":"Rebalance to targets","cost":0,"xp":15,"coins":8},{"id":"B","label":"Leave it as is","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-108', 'investment', 'retirement', 'Retirement Contribution Increase', 'You could increase retirement contributions.', ARRAY['young_adult','parent'], 5, 8, 3, '[{"id":"A","label":"Max it out","cost":50000,"xp":20,"coins":10},{"id":"B","label":"Modest increase","cost":25000,"xp":15,"coins":8},{"id":"C","label":"Keep current level","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-109', 'investment', 'dividend', 'Dividend Reinvestment', 'Dividends came in. Reinvest or take cash?', ARRAY['young_adult','parent'], 5, 8, 3, '[{"id":"A","label":"Reinvest dividends","cost":0,"xp":15,"coins":8},{"id":"B","label":"Take as cash","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-110', 'investment', 'bonds', 'Bond Opportunity', 'Government bonds offering good yields.', ARRAY['young_adult','parent'], 4, 8, 3, '[{"id":"A","label":"Buy bonds","cost":20000,"xp":15,"coins":8},{"id":"B","label":"Prefer stocks","cost":0,"xp":8,"coins":3},{"id":"C","label":"Not ready to invest more","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-111', 'investment', 'crypto', 'Crypto Temptation', 'Everyone is talking about crypto gains.', ARRAY['young_adult'], 7, 8, 3, '[{"id":"A","label":"Invest 10% of savings","cost":0,"xp":8,"coins":3},{"id":"B","label":"Tiny speculative amount","cost":5000,"xp":10,"coins":5},{"id":"C","label":"Stay away","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-112', 'investment', 'property', 'Rental Property Opportunity', 'A rental property investment opportunity.', ARRAY['parent'], 6, 8, 3, '[{"id":"A","label":"Invest in the property","cost":200000,"xp":15,"coins":8},{"id":"B","label":"Too risky right now","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-113', 'insurance', 'decision', 'Insurance Comparison', 'Time to review your insurance coverage.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Comprehensive coverage","cost":12000,"xp":10,"coins":5},{"id":"B","label":"Standard coverage","cost":7000,"xp":12,"coins":6},{"id":"C","label":"Minimum required only","cost":3000,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-114', 'insurance', 'claim', 'File Insurance Claim?', 'Minor damage occurred. Should you file?', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"File the claim","cost":500,"xp":10,"coins":5},{"id":"B","label":"Pay out of pocket (avoid premium hike)","cost":5000,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-115', 'insurance', 'life', 'Life Insurance Offer', 'An agent offers life insurance.', ARRAY['young_adult','parent'], 4, 8, 3, '[{"id":"A","label":"Comprehensive policy","cost":5000,"xp":10,"coins":5},{"id":"B","label":"Basic term life","cost":2000,"xp":12,"coins":6},{"id":"C","label":"Not needed yet","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-116', 'insurance', 'health', 'Health Plan Upgrade', 'Open enrollment: upgrade your health plan?', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Premium plan (lower deductible)","cost":15000,"xp":8,"coins":3},{"id":"B","label":"Keep current plan","cost":10000,"xp":10,"coins":5},{"id":"C","label":"High-deductible + HSA","cost":7000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-117', 'insurance', 'renters', 'Renters Insurance', 'Landlord recommends renters insurance.', ARRAY['student','young_adult'], 2, 6, 3, '[{"id":"A","label":"Get a policy","cost":1500,"xp":12,"coins":6},{"id":"B","label":"Skip it","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-118', 'insurance', 'umbrella', 'Umbrella Policy', 'Financial advisor suggests umbrella insurance.', ARRAY['parent'], 6, 8, 3, '[{"id":"A","label":"Get umbrella policy","cost":3000,"xp":15,"coins":8},{"id":"B","label":"Not necessary","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-119', 'insurance', 'disability', 'Disability Insurance', 'Consider disability insurance for income protection.', ARRAY['young_adult','parent'], 5, 8, 3, '[{"id":"A","label":"Get coverage","cost":4000,"xp":15,"coins":8},{"id":"B","label":"Employer coverage is enough","cost":0,"xp":8,"coins":3},{"id":"C","label":"Too expensive right now","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-120', 'social', 'charity', 'Charity Donation Drive', 'Local charity is having a fundraiser.', ARRAY['teen','student','young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"Generous donation","cost":5000,"xp":15,"coins":8},{"id":"B","label":"Small donation","cost":1000,"xp":10,"coins":5},{"id":"C","label":"Volunteer time instead","cost":0,"xp":12,"coins":6},{"id":"D","label":"Pass","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-121', 'social', 'gift', 'Coworker Baby Shower', 'Office collection for a coworker.', ARRAY['young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Contribute generously","cost":5000,"xp":8,"coins":3},{"id":"B","label":"Standard contribution","cost":2000,"xp":10,"coins":5},{"id":"C","label":"Minimum socially acceptable","cost":500,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-122', 'social', 'lending', 'Friend Asks to Borrow Money', 'A friend needs 20000 CU urgently.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Lend the full amount","cost":20000,"xp":10,"coins":5},{"id":"B","label":"Lend half","cost":10000,"xp":10,"coins":5},{"id":"C","label":"Offer help in other ways","cost":0,"xp":12,"coins":6},{"id":"D","label":"Decline","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-123', 'social', 'dating', 'Dating Expenses', 'Dating can get expensive.', ARRAY['student','young_adult'], 2, 8, 3, '[{"id":"A","label":"Fancy dates","cost":8000,"xp":5,"coins":2},{"id":"B","label":"Creative budget dates","cost":2000,"xp":12,"coins":6},{"id":"C","label":"Free activities","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-124', 'social', 'community', 'Community Event', 'Your neighborhood is organizing a community event.', ARRAY['young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Sponsor and participate","cost":5000,"xp":15,"coins":8},{"id":"B","label":"Just attend","cost":500,"xp":10,"coins":5},{"id":"C","label":"Skip it","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-125', 'social', 'family', 'Family Financial Help', 'A family member is struggling financially.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Help with a significant amount","cost":30000,"xp":10,"coins":5},{"id":"B","label":"Help with a small amount","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Help non-financially","cost":0,"xp":10,"coins":5},{"id":"D","label":"Unable to help right now","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-126', 'social', 'wedding', 'Wedding Attendance', 'Invited to an out-of-town wedding.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Full attendance + generous gift","cost":20000,"xp":5,"coins":2},{"id":"B","label":"Attend with modest gift","cost":8000,"xp":10,"coins":5},{"id":"C","label":"Send gift, skip travel","cost":3000,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-127', 'debt', 'payoff', 'Extra Debt Payment', 'You have extra money this month. Pay down debt faster?', ARRAY['student','young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Big extra payment","cost":20000,"xp":15,"coins":8},{"id":"B","label":"Small extra payment","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Save it instead","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-128', 'debt', 'consolidation', 'Debt Consolidation Offer', 'A bank offers debt consolidation at lower rate.', ARRAY['young_adult','parent'], 4, 8, 3, '[{"id":"A","label":"Consolidate all debts","cost":0,"xp":15,"coins":8},{"id":"B","label":"Keep current arrangement","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-129', 'debt', 'refinance', 'Student Loan Refinancing', 'You qualify for a lower rate on student loans.', ARRAY['young_adult'], 4, 8, 3, '[{"id":"A","label":"Refinance for lower rate","cost":2000,"xp":15,"coins":8},{"id":"B","label":"Keep federal loan benefits","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-130', 'debt', 'bnpl', 'Buy Now Pay Later Temptation', 'BNPL option on a purchase you want.', ARRAY['student','young_adult'], 3, 8, 3, '[{"id":"A","label":"Use BNPL","cost":0,"xp":3,"coins":1},{"id":"B","label":"Pay full now","cost":0,"xp":12,"coins":6},{"id":"C","label":"Dont buy it","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-131', 'debt', 'balance', 'Balance Transfer Offer', '0% APR balance transfer for 12 months.', ARRAY['young_adult','parent'], 4, 8, 3, '[{"id":"A","label":"Transfer balances","cost":3000,"xp":15,"coins":8},{"id":"B","label":"Keep current arrangement","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-132', 'debt', 'strategy', 'Debt Strategy Review', 'Reviewing your debt payoff strategy.', ARRAY['young_adult','parent'], 3, 8, 3, '[{"id":"A","label":"Avalanche method (highest interest first)","cost":0,"xp":15,"coins":8},{"id":"B","label":"Snowball method (smallest balance first)","cost":0,"xp":12,"coins":6},{"id":"C","label":"Keep paying minimums","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-133', 'savings', 'emergency', 'Emergency Fund Contribution', 'Time to add to your emergency fund.', ARRAY['student','young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Large contribution","cost":20000,"xp":15,"coins":8},{"id":"B","label":"Moderate contribution","cost":10000,"xp":12,"coins":6},{"id":"C","label":"Small contribution","cost":5000,"xp":10,"coins":5},{"id":"D","label":"Skip this month","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-134', 'savings', 'goal', 'New Savings Goal', 'Set a new savings target.', ARRAY['teen','student','young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"Ambitious goal","cost":0,"xp":15,"coins":8},{"id":"B","label":"Moderate goal","cost":0,"xp":12,"coins":6},{"id":"C","label":"Not right now","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-135', 'savings', 'windfall', 'Unexpected Money', 'You received an unexpected amount of money.', ARRAY['teen','student','young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"Save all of it","cost":0,"xp":20,"coins":10},{"id":"B","label":"Save half, spend half","cost":0,"xp":15,"coins":8},{"id":"C","label":"Spend it all","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-136', 'savings', 'account', 'High-Yield Savings Account', 'A bank offers a high-yield savings account.', ARRAY['young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Open and transfer savings","cost":0,"xp":15,"coins":8},{"id":"B","label":"Keep current account","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-137', 'savings', 'automation', 'Automate Savings', 'Set up automatic savings transfers.', ARRAY['student','young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Automate 20% of income","cost":0,"xp":20,"coins":10},{"id":"B","label":"Automate 10% of income","cost":0,"xp":15,"coins":8},{"id":"C","label":"Manual savings only","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-138', 'tax', 'filing', 'Tax Filing Season', 'Time to file your taxes.', ARRAY['young_adult','parent'], 5, 8, 3, '[{"id":"A","label":"Hire an accountant","cost":15000,"xp":15,"coins":8},{"id":"B","label":"Use tax software","cost":5000,"xp":12,"coins":6},{"id":"C","label":"File yourself for free","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-139', 'tax', 'deduction', 'Tax Deduction Opportunity', 'You may qualify for additional deductions.', ARRAY['young_adult','parent'], 5, 8, 3, '[{"id":"A","label":"Maximize all deductions","cost":2000,"xp":20,"coins":10},{"id":"B","label":"Take standard deduction","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-140', 'tax', 'withholding', 'Adjust Tax Withholding', 'You could adjust your paycheck withholding.', ARRAY['young_adult','parent'], 5, 8, 3, '[{"id":"A","label":"Reduce withholding (more now)","cost":0,"xp":10,"coins":5},{"id":"B","label":"Keep current (bigger refund)","cost":0,"xp":10,"coins":5},{"id":"C","label":"Increase withholding (play safe)","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-141', 'tax', 'quarterly', 'Quarterly Tax Payment', 'Side income means estimated tax payments.', ARRAY['young_adult','parent'], 5, 8, 3, '[{"id":"A","label":"Pay estimated taxes","cost":15000,"xp":15,"coins":8},{"id":"B","label":"Wait until filing","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-142', 'tax', 'charity', 'Charitable Tax Deduction', 'End of year charitable giving for tax benefits.', ARRAY['young_adult','parent'], 5, 8, 3, '[{"id":"A","label":"Donate for tax benefit","cost":10000,"xp":15,"coins":8},{"id":"B","label":"Smaller donation","cost":3000,"xp":10,"coins":5},{"id":"C","label":"Not this year","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-143', 'family', 'child', 'Child School Supplies', 'Back to school shopping time.', ARRAY['parent'], 1, 8, 3, '[{"id":"A","label":"All new supplies and gadgets","cost":15000,"xp":5,"coins":2},{"id":"B","label":"Mix of new and reused","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Bare minimum only","cost":2000,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-144', 'family', 'child', 'Extracurricular Activities', 'Your child wants to join activities.', ARRAY['parent'], 1, 8, 3, '[{"id":"A","label":"Multiple activities","cost":15000,"xp":8,"coins":3},{"id":"B","label":"One activity","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Free community programs","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-145', 'family', 'medical', 'Child Needs Braces', 'The dentist recommends braces for your child.', ARRAY['parent'], 3, 8, 3, '[{"id":"A","label":"Full orthodontic treatment","cost":300000,"xp":10,"coins":5},{"id":"B","label":"Payment plan","cost":300000,"xp":12,"coins":6},{"id":"C","label":"Wait and see","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-146', 'family', 'vacation', 'Family Vacation', 'Planning the annual family vacation.', ARRAY['parent'], 2, 8, 3, '[{"id":"A","label":"All-inclusive resort","cost":100000,"xp":5,"coins":2},{"id":"B","label":"Budget road trip","cost":20000,"xp":12,"coins":6},{"id":"C","label":"Staycation with day trips","cost":5000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-147', 'family', 'education', 'Tutoring for Child', 'Your child is struggling in school.', ARRAY['parent'], 2, 8, 3, '[{"id":"A","label":"Private tutor","cost":10000,"xp":10,"coins":5},{"id":"B","label":"Group tutoring","cost":3000,"xp":12,"coins":6},{"id":"C","label":"Help them yourself","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-148', 'family', 'household', 'Household Repair', 'Something in the house needs fixing.', ARRAY['parent'], 2, 8, 3, '[{"id":"A","label":"Hire a professional","cost":10000,"xp":5,"coins":2},{"id":"B","label":"DIY repair","cost":2000,"xp":15,"coins":8},{"id":"C","label":"Temporary fix","cost":500,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-149', 'family', 'childcare', 'Childcare Cost Increase', 'Your daycare raised prices.', ARRAY['parent'], 2, 8, 3, '[{"id":"A","label":"Accept the increase","cost":0,"xp":5,"coins":2},{"id":"B","label":"Find alternative cheaper care","cost":0,"xp":12,"coins":6},{"id":"C","label":"Adjust work schedule to reduce hours needed","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-150', 'family', 'partner', 'Partner Job Loss', 'Your partner lost their job.', ARRAY['parent'], 3, 8, 3, '[{"id":"A","label":"Cut expenses aggressively","cost":0,"xp":15,"coins":8},{"id":"B","label":"Dip into savings","cost":0,"xp":8,"coins":3},{"id":"C","label":"Take on extra work yourself","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-151', 'family', 'college', 'College Fund Decision', 'Starting a college savings fund.', ARRAY['parent'], 2, 8, 3, '[{"id":"A","label":"Start aggressive savings plan","cost":20000,"xp":20,"coins":10},{"id":"B","label":"Moderate monthly contribution","cost":10000,"xp":15,"coins":8},{"id":"C","label":"Wait until child is older","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-152', 'family', 'activities', 'Weekend Family Activity', 'Planning something fun for the family.', ARRAY['parent'], 1, 8, 3, '[{"id":"A","label":"Theme park adventure","cost":15000,"xp":5,"coins":2},{"id":"B","label":"Movie and dinner","cost":5000,"xp":8,"coins":3},{"id":"C","label":"Park and picnic","cost":1000,"xp":12,"coins":6},{"id":"D","label":"Game night at home","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-153', 'subscription', 'new', 'New App Subscription', 'A productivity app that could help.', ARRAY['teen','student','young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"Annual subscription (save 40%)","cost":6000,"xp":10,"coins":5},{"id":"B","label":"Monthly subscription","cost":1000,"xp":8,"coins":3},{"id":"C","label":"Use the free version","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-154', 'subscription', 'cancel', 'Unused Subscription Found', 'You found a subscription you forgot about.', ARRAY['student','young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"Cancel immediately","cost":0,"xp":15,"coins":8},{"id":"B","label":"Keep it another month","cost":1500,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-155', 'subscription', 'upgrade', 'Premium Upgrade Offer', 'Your music app offers premium at 50% off.', ARRAY['teen','student','young_adult'], 1, 8, 3, '[{"id":"A","label":"Upgrade to premium","cost":500,"xp":5,"coins":2},{"id":"B","label":"Stay free with ads","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-156', 'subscription', 'bundle', 'Service Bundle Deal', 'Bundle internet + TV + phone for savings.', ARRAY['young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Get the bundle","cost":8000,"xp":8,"coins":3},{"id":"B","label":"Keep separate services","cost":10000,"xp":5,"coins":2},{"id":"C","label":"Cut TV, keep internet and phone","cost":6000,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-157', 'subscription', 'review', 'Annual Subscription Review', 'Review all your recurring subscriptions.', ARRAY['student','young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Keep all, theyre worth it","cost":8000,"xp":3,"coins":1},{"id":"B","label":"Cut unnecessary ones (save 40%)","cost":4800,"xp":15,"coins":8},{"id":"C","label":"Switch to free alternatives where possible","cost":2000,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-158', 'groceries', 'special', 'Organic vs Regular', 'Organic produce costs double. Is it worth it?', ARRAY['young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"Go all organic","cost":8000,"xp":5,"coins":2},{"id":"B","label":"Mix of organic and regular","cost":5000,"xp":10,"coins":5},{"id":"C","label":"All regular","cost":3000,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-159', 'groceries', 'meal', 'Meal Kit Subscription', 'A meal kit service delivers ingredients weekly.', ARRAY['young_adult','parent'], 2, 8, 2, '[{"id":"A","label":"Subscribe monthly","cost":6000,"xp":5,"coins":2},{"id":"B","label":"Try a free trial","cost":0,"xp":8,"coins":3},{"id":"C","label":"Cook from scratch instead","cost":3000,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-160', 'entertainment', 'gaming', 'Gaming Console Release', 'The new gaming console just dropped.', ARRAY['teen','student'], 1, 8, 2, '[{"id":"A","label":"Buy on launch day","cost":50000,"xp":3,"coins":1},{"id":"B","label":"Wait for a price drop","cost":0,"xp":12,"coins":6},{"id":"C","label":"Upgrade your current system","cost":10000,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-161', 'entertainment', 'music', 'Music Festival', 'An amazing music festival with your favorite artists.', ARRAY['teen','student','young_adult'], 1, 8, 2, '[{"id":"A","label":"VIP weekend pass","cost":25000,"xp":5,"coins":2},{"id":"B","label":"Single day general admission","cost":8000,"xp":8,"coins":3},{"id":"C","label":"Watch the livestream","cost":1500,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-162', 'entertainment', 'movies', 'Movie Night Decision', 'New blockbuster in theaters.', ARRAY['teen','student','young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"IMAX experience","cost":2500,"xp":5,"coins":2},{"id":"B","label":"Regular showing","cost":1200,"xp":8,"coins":3},{"id":"C","label":"Wait for streaming","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-163', 'shopping', 'personal', 'Skincare Routine', 'Upgrade your skincare products?', ARRAY['teen','student','young_adult'], 1, 8, 2, '[{"id":"A","label":"Premium skincare line","cost":8000,"xp":3,"coins":1},{"id":"B","label":"Drugstore alternatives","cost":2000,"xp":10,"coins":5},{"id":"C","label":"DIY natural skincare","cost":500,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-164', 'shopping', 'tech', 'Smart Watch', 'A smart watch could track your fitness.', ARRAY['teen','student','young_adult'], 1, 8, 2, '[{"id":"A","label":"Premium smart watch","cost":35000,"xp":3,"coins":1},{"id":"B","label":"Budget fitness tracker","cost":5000,"xp":10,"coins":5},{"id":"C","label":"Use your phone","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-165', 'shopping', 'home', 'New Mattress', 'Your mattress is old and uncomfortable.', ARRAY['young_adult','parent'], 2, 8, 2, '[{"id":"A","label":"Premium mattress","cost":80000,"xp":5,"coins":2},{"id":"B","label":"Mid-range mattress","cost":30000,"xp":10,"coins":5},{"id":"C","label":"Add a mattress topper","cost":5000,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-166', 'health', 'wellness', 'Wellness Retreat', 'A weekend wellness retreat for stress relief.', ARRAY['young_adult','parent'], 3, 8, 2, '[{"id":"A","label":"Full retreat package","cost":30000,"xp":8,"coins":3},{"id":"B","label":"Day spa visit instead","cost":8000,"xp":10,"coins":5},{"id":"C","label":"Home self-care day","cost":500,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-167', 'health', 'dental', 'Wisdom Teeth', 'Your wisdom teeth need to come out.', ARRAY['student','young_adult'], 2, 6, 1, '[{"id":"A","label":"Oral surgeon (all 4)","cost":30000,"xp":10,"coins":5},{"id":"B","label":"Regular dentist (2 at a time)","cost":15000,"xp":12,"coins":6},{"id":"C","label":"Wait unless painful","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-168', 'career', 'startup', 'Side Business Idea', 'You have an idea for a small business.', ARRAY['young_adult','parent'], 4, 8, 2, '[{"id":"A","label":"Invest and launch","cost":50000,"xp":20,"coins":10},{"id":"B","label":"Start small (minimal investment)","cost":10000,"xp":15,"coins":8},{"id":"C","label":"Keep it as a hobby","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-169', 'career', 'skill', 'Learn to Code', 'A coding bootcamp could boost your career.', ARRAY['student','young_adult'], 2, 6, 2, '[{"id":"A","label":"Full bootcamp","cost":80000,"xp":25,"coins":12},{"id":"B","label":"Online self-paced course","cost":5000,"xp":15,"coins":8},{"id":"C","label":"Free tutorials","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-170', 'housing', 'solar', 'Solar Panel Offer', 'A solar company offers to install panels.', ARRAY['parent'], 5, 8, 1, '[{"id":"A","label":"Buy outright (saves long-term)","cost":150000,"xp":15,"coins":8},{"id":"B","label":"Lease (lower upfront)","cost":10000,"xp":10,"coins":5},{"id":"C","label":"Not interested","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-171', 'housing', 'garden', 'Garden or Lawn Care', 'Your yard needs work.', ARRAY['parent'], 3, 8, 2, '[{"id":"A","label":"Hire landscaper","cost":10000,"xp":5,"coins":2},{"id":"B","label":"DIY gardening","cost":2000,"xp":12,"coins":6},{"id":"C","label":"Let it go natural","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-172', 'transport', 'ev', 'Electric Vehicle Consideration', 'Time to consider an EV?', ARRAY['young_adult','parent'], 5, 8, 1, '[{"id":"A","label":"Buy new EV","cost":3000000,"xp":15,"coins":8},{"id":"B","label":"Used hybrid","cost":1500000,"xp":12,"coins":6},{"id":"C","label":"Keep current gas car","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-173', 'transport', 'bike', 'Bike Commute Setup', 'Considering biking to work.', ARRAY['student','young_adult'], 1, 8, 2, '[{"id":"A","label":"Quality commuter bike + gear","cost":50000,"xp":15,"coins":8},{"id":"B","label":"Basic used bike","cost":10000,"xp":12,"coins":6},{"id":"C","label":"Stick with current transport","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-174', 'emergency', 'tech', 'Computer Crashed', 'Your main computer died. Need it for work.', ARRAY['student','young_adult','parent'], 2, 8, 2, '[{"id":"A","label":"Emergency replacement","cost":60000,"xp":8,"coins":3},{"id":"B","label":"Repair attempt","cost":10000,"xp":12,"coins":6},{"id":"C","label":"Borrow one temporarily","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-175', 'emergency', 'legal', 'Traffic Accident (Minor)', 'Minor fender bender, other driver is aggressive.', ARRAY['young_adult','parent'], 3, 8, 1, '[{"id":"A","label":"Hire a lawyer","cost":15000,"xp":10,"coins":5},{"id":"B","label":"Handle through insurance","cost":2500,"xp":15,"coins":8},{"id":"C","label":"Settle privately","cost":10000,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-176', 'social', 'reunion', 'Class Reunion', 'Your high school/college reunion is happening.', ARRAY['young_adult','parent'], 3, 8, 1, '[{"id":"A","label":"Go with new outfit and travel","cost":15000,"xp":5,"coins":2},{"id":"B","label":"Attend casually","cost":3000,"xp":10,"coins":5},{"id":"C","label":"Skip it","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-177', 'social', 'volunteering', 'Volunteer Opportunity', 'A local organization needs weekend volunteers.', ARRAY['teen','student','young_adult','parent'], 1, 8, 2, '[{"id":"A","label":"Volunteer regularly","cost":0,"xp":15,"coins":8},{"id":"B","label":"One-time volunteer day","cost":0,"xp":10,"coins":5},{"id":"C","label":"Donate money instead","cost":3000,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-178', 'investment', 'etf', 'New ETF Opportunity', 'A new thematic ETF in a growing sector.', ARRAY['young_adult','parent'], 4, 8, 2, '[{"id":"A","label":"Invest significantly","cost":30000,"xp":10,"coins":5},{"id":"B","label":"Small exploratory position","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Stick with current holdings","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-179', 'investment', 'education', 'Investment Course', 'A course on advanced investing strategies.', ARRAY['young_adult','parent'], 4, 8, 2, '[{"id":"A","label":"Enroll in the course","cost":15000,"xp":20,"coins":10},{"id":"B","label":"Read free materials","cost":0,"xp":12,"coins":5},{"id":"C","label":"Not interested","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-180', 'debt', 'credit', 'Credit Card Upgrade Offer', 'Your bank offers a rewards credit card.', ARRAY['young_adult','parent'], 3, 8, 2, '[{"id":"A","label":"Upgrade (annual fee for rewards)","cost":9500,"xp":8,"coins":3},{"id":"B","label":"Keep no-fee card","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-181', 'debt', 'mortgage', 'Mortgage Refinancing', 'Interest rates dropped. Refinance your mortgage?', ARRAY['parent'], 5, 8, 1, '[{"id":"A","label":"Refinance (closing costs now, savings long-term)","cost":20000,"xp":15,"coins":8},{"id":"B","label":"Keep current mortgage","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-182', 'savings', 'cd', 'Certificate of Deposit Offer', 'Bank offers a 12-month CD at good rates.', ARRAY['young_adult','parent'], 3, 8, 2, '[{"id":"A","label":"Lock in a CD","cost":50000,"xp":12,"coins":6},{"id":"B","label":"Keep in liquid savings","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-183', 'savings', 'challenge', 'No-Spend Challenge', 'Try a no-spend week?', ARRAY['teen','student','young_adult','parent'], 1, 8, 2, '[{"id":"A","label":"Accept the challenge","cost":0,"xp":20,"coins":10},{"id":"B","label":"Modified challenge (essentials only)","cost":0,"xp":15,"coins":8},{"id":"C","label":"Not this week","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-184', 'family', 'birthday', 'Childs Birthday Party', 'Your child wants a big birthday party.', ARRAY['parent'], 1, 8, 2, '[{"id":"A","label":"Party venue with all the extras","cost":20000,"xp":5,"coins":2},{"id":"B","label":"Home party with friends","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Small family celebration","cost":2000,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-185', 'family', 'pet', 'Family Wants a Pet', 'The kids really want a dog.', ARRAY['parent'], 2, 8, 1, '[{"id":"A","label":"Get a puppy (ongoing costs)","cost":20000,"xp":8,"coins":3},{"id":"B","label":"Adopt from shelter","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Start with a fish","cost":500,"xp":8,"coins":3},{"id":"D","label":"Not right now","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-186', 'education', 'supplies', 'School Supplies', 'New semester needs new supplies.', ARRAY['teen'], 1, 4, 3, '[{"id":"A","label":"All new branded supplies","cost":5000,"xp":3,"coins":1},{"id":"B","label":"Mix of new and reused","cost":2000,"xp":10,"coins":5},{"id":"C","label":"Use what you have","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-187', 'social', 'teen', 'School Dance', 'The school dance is coming up.', ARRAY['teen'], 1, 4, 2, '[{"id":"A","label":"New outfit, photos, dinner","cost":8000,"xp":5,"coins":2},{"id":"B","label":"Budget outfit, skip dinner","cost":2000,"xp":10,"coins":5},{"id":"C","label":"Skip the dance","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-188', 'entertainment', 'teen', 'Video Game Microtransactions', 'Your favorite game has a limited-time offer.', ARRAY['teen'], 1, 4, 3, '[{"id":"A","label":"Buy the premium pack","cost":3000,"xp":3,"coins":1},{"id":"B","label":"Small purchase","cost":500,"xp":5,"coins":2},{"id":"C","label":"Play free and earn it","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-189', 'career', 'teen', 'Part-Time Job Offer', 'A local shop is hiring part-time.', ARRAY['teen'], 2, 4, 2, '[{"id":"A","label":"Accept the job","cost":0,"xp":20,"coins":10},{"id":"B","label":"Focus on school","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-190', 'savings', 'teen', 'Birthday Money', 'You received money for your birthday!', ARRAY['teen'], 1, 4, 2, '[{"id":"A","label":"Save it all","cost":0,"xp":15,"coins":8},{"id":"B","label":"Save half, spend half","cost":0,"xp":12,"coins":6},{"id":"C","label":"Spend it all","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-191', 'education', 'semester', 'Tuition Payment Due', 'Semester tuition is due. How to pay?', ARRAY['student'], 1, 5, 2, '[{"id":"A","label":"Pay from savings","cost":200000,"xp":10,"coins":5},{"id":"B","label":"Student loan","cost":0,"xp":8,"coins":3},{"id":"C","label":"Scholarship application","cost":0,"xp":20,"coins":10}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-192', 'entertainment', 'student', 'Spring Break Trip', 'Friends planning a spring break trip.', ARRAY['student'], 1, 5, 2, '[{"id":"A","label":"Join the full trip","cost":50000,"xp":5,"coins":2},{"id":"B","label":"Budget version","cost":15000,"xp":10,"coins":5},{"id":"C","label":"Stay home and work","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-193', 'housing', 'student', 'Campus vs Off-Campus', 'Next year: stay on campus or rent off-campus?', ARRAY['student'], 1, 5, 1, '[{"id":"A","label":"Stay on campus (convenient)","cost":60000,"xp":5,"coins":2},{"id":"B","label":"Off-campus with roommates (cheaper)","cost":35000,"xp":12,"coins":6},{"id":"C","label":"Off-campus alone (expensive)","cost":80000,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-194', 'shopping', 'seasonal', 'Winter Coat', 'Your winter coat is falling apart.', ARRAY['student','young_adult','parent'], 1, 8, 2, '[{"id":"A","label":"Quality winter coat","cost":15000,"xp":8,"coins":3},{"id":"B","label":"Thrift store find","cost":3000,"xp":12,"coins":6},{"id":"C","label":"Layer up with what you have","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-195', 'health', 'vitamins', 'Supplements and Vitamins', 'Should you start taking supplements?', ARRAY['young_adult','parent'], 2, 8, 2, '[{"id":"A","label":"Premium supplement stack","cost":5000,"xp":3,"coins":1},{"id":"B","label":"Basic multivitamin","cost":1000,"xp":8,"coins":3},{"id":"C","label":"Eat better instead","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-196', 'career', 'mentoring', 'Mentorship Program', 'A mentorship program could advance your career.', ARRAY['young_adult'], 3, 7, 2, '[{"id":"A","label":"Join paid mentorship","cost":10000,"xp":15,"coins":8},{"id":"B","label":"Find a free mentor","cost":0,"xp":12,"coins":6},{"id":"C","label":"Self-guided development","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-197', 'emergency', 'family', 'Family Member Health Crisis', 'A close family member has a health emergency.', ARRAY['young_adult','parent'], 3, 8, 1, '[{"id":"A","label":"Fly out immediately + help financially","cost":30000,"xp":10,"coins":5},{"id":"B","label":"Send money only","cost":15000,"xp":8,"coins":3},{"id":"C","label":"Offer emotional support","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-198', 'investment', 'gold', 'Gold Investment', 'Gold prices are favorable for buying.', ARRAY['young_adult','parent'], 5, 8, 1, '[{"id":"A","label":"Invest in gold ETF","cost":20000,"xp":12,"coins":6},{"id":"B","label":"Small gold allocation","cost":5000,"xp":10,"coins":5},{"id":"C","label":"Stick with current strategy","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-199', 'housing', 'energy', 'Energy Efficiency Upgrades', 'Upgrade insulation and windows to save on energy.', ARRAY['parent'], 5, 8, 1, '[{"id":"A","label":"Full energy retrofit","cost":60000,"xp":15,"coins":8},{"id":"B","label":"Basic weatherstripping","cost":3000,"xp":12,"coins":6},{"id":"C","label":"Leave it for next year","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-200', 'social', 'neighborhood', 'Neighborhood Block Party', 'Help organize the annual block party.', ARRAY['young_adult','parent'], 2, 8, 2, '[{"id":"A","label":"Co-organize and contribute","cost":5000,"xp":15,"coins":8},{"id":"B","label":"Just attend","cost":1000,"xp":8,"coins":3},{"id":"C","label":"Skip it","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-201', 'shopping', 'appliance', 'Washing Machine Decision', 'Your washing machine broke. Laundromat or buy new?', ARRAY['young_adult','parent'], 3, 8, 1, '[{"id":"A","label":"Buy new energy-efficient model","cost":50000,"xp":8,"coins":3},{"id":"B","label":"Buy refurbished","cost":20000,"xp":12,"coins":6},{"id":"C","label":"Use laundromat for now","cost":2000,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-202', 'entertainment', 'art', 'Art Class', 'A local art studio offers evening classes.', ARRAY['teen','student','young_adult'], 1, 8, 2, '[{"id":"A","label":"Sign up for the course","cost":10000,"xp":10,"coins":5},{"id":"B","label":"Try one drop-in session","cost":2000,"xp":8,"coins":3},{"id":"C","label":"YouTube tutorials","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-101', 'housing', 'roommate', 'Roommate Leaves Dirty Dishes', 'Your roommate never cleans up. You could hire a cleaning service or handle it yourself.', ARRAY['student','young_adult'], 1, 5, 2, '[{"id":"A","label":"Hire a weekly cleaner","cost":6000,"xp":5,"coins":2},{"id":"B","label":"Buy cleaning supplies, do it yourself","cost":1500,"xp":12,"coins":6},{"id":"C","label":"Ignore it","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-102', 'housing', 'repair', 'Water Heater Issues', 'Hot water is running out fast. The water heater needs attention.', ARRAY['young_adult','parent'], 3, 8, 2, '[{"id":"A","label":"Replace with new tankless unit","cost":50000,"xp":8,"coins":3},{"id":"B","label":"Repair the current unit","cost":15000,"xp":12,"coins":6},{"id":"C","label":"Cold showers for now","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-103', 'housing', 'lease', 'Lease Renewal Decision', 'Your lease is up. Renew at current rate or look for something better?', ARRAY['student','young_adult'], 2, 7, 2, '[{"id":"A","label":"Renew lease as-is","cost":0,"xp":8,"coins":3},{"id":"B","label":"Negotiate lower rent","cost":0,"xp":15,"coins":8},{"id":"C","label":"Move to a new place (moving costs)","cost":20000,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-104', 'housing', 'moving', 'Job Relocation Offer', 'Your company offers relocation to a new city with a raise.', ARRAY['young_adult','parent'], 4, 8, 1, '[{"id":"A","label":"Accept and move (get partial relo package)","cost":30000,"xp":20,"coins":10},{"id":"B","label":"Negotiate remote work instead","cost":0,"xp":15,"coins":8},{"id":"C","label":"Decline the offer","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-105', 'career', 'raise', 'Annual Performance Review', 'Your performance review is coming up. Time to ask for a raise?', ARRAY['young_adult','parent'], 3, 8, 2, '[{"id":"A","label":"Ask for a significant raise","cost":0,"xp":15,"coins":8},{"id":"B","label":"Ask for a modest raise","cost":0,"xp":10,"coins":5},{"id":"C","label":"Don''t rock the boat","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-106', 'career', 'side_hustle', 'Freelance Opportunity', 'A friend needs help with a project. You could earn extra money on the side.', ARRAY['student','young_adult'], 2, 7, 2, '[{"id":"A","label":"Take the gig (time investment)","cost":500,"xp":18,"coins":10},{"id":"B","label":"Do a smaller portion","cost":0,"xp":10,"coins":5},{"id":"C","label":"Pass on it","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-107', 'career', 'overtime', 'Weekend Overtime Available', 'Your boss asks if you can work this weekend for overtime pay.', ARRAY['young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Work the full weekend","cost":0,"xp":12,"coins":6},{"id":"B","label":"Work one day only","cost":0,"xp":8,"coins":4},{"id":"C","label":"Decline — enjoy the weekend","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-108', 'career', 'job_offer', 'Competing Job Offer', 'A recruiter reaches out with a job offer paying 15% more.', ARRAY['young_adult','parent'], 4, 8, 1, '[{"id":"A","label":"Accept the new job","cost":5000,"xp":20,"coins":10},{"id":"B","label":"Use it to negotiate current salary","cost":0,"xp":15,"coins":8},{"id":"C","label":"Politely decline","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-109', 'career', 'networking', 'Industry Conference', 'A professional conference is happening in your field.', ARRAY['student','young_adult','parent'], 3, 8, 2, '[{"id":"A","label":"Full conference pass + travel","cost":25000,"xp":20,"coins":10},{"id":"B","label":"Day pass only","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Watch the free livestream","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-110', 'career', 'side_hustle', 'Start a Small Online Business', 'You have an idea for a small online business selling crafts or services.', ARRAY['student','young_adult'], 3, 8, 1, '[{"id":"A","label":"Invest in proper setup","cost":15000,"xp":18,"coins":10},{"id":"B","label":"Start small with minimal investment","cost":3000,"xp":12,"coins":6},{"id":"C","label":"Not ready yet","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-111', 'health', 'gym', 'Gym Membership Renewal', 'Your gym membership is expiring. Renew or find alternatives?', ARRAY['student','young_adult','parent'], 2, 8, 2, '[{"id":"A","label":"Premium gym with classes","cost":8000,"xp":8,"coins":3},{"id":"B","label":"Basic budget gym","cost":2500,"xp":12,"coins":6},{"id":"C","label":"Work out at home/outdoors","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-112', 'health', 'doctor', 'Annual Check-Up', 'Time for your annual physical exam.', ARRAY['teen','student','young_adult','parent'], 1, 8, 2, '[{"id":"A","label":"Full comprehensive check-up","cost":15000,"xp":15,"coins":8},{"id":"B","label":"Basic check-up only","cost":5000,"xp":10,"coins":5},{"id":"C","label":"Skip it this year","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-113', 'health', 'emergency', 'Sudden Illness', 'You wake up feeling terrible. Might need medical attention.', ARRAY['teen','student','young_adult','parent'], 1, 8, 2, '[{"id":"A","label":"Go to urgent care","cost":10000,"xp":10,"coins":5},{"id":"B","label":"Telehealth appointment","cost":3000,"xp":12,"coins":6},{"id":"C","label":"Rest and take OTC medicine","cost":1500,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-114', 'health', 'dental', 'Dental Work Needed', 'Your dentist found a cavity that needs filling.', ARRAY['teen','student','young_adult','parent'], 2, 8, 2, '[{"id":"A","label":"Get it done now with premium filling","cost":20000,"xp":10,"coins":5},{"id":"B","label":"Standard filling","cost":8000,"xp":12,"coins":6},{"id":"C","label":"Postpone treatment","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-115', 'health', 'mental', 'Stress Management', 'Work and life stress is building up. How do you cope?', ARRAY['student','young_adult','parent'], 2, 8, 2, '[{"id":"A","label":"Book therapy sessions","cost":12000,"xp":15,"coins":8},{"id":"B","label":"Try meditation apps","cost":1000,"xp":10,"coins":5},{"id":"C","label":"Push through it","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-116', 'health', 'vision', 'Eye Exam and Glasses', 'Your vision has been blurry. Time for an eye exam.', ARRAY['teen','student','young_adult','parent'], 1, 8, 1, '[{"id":"A","label":"Designer frames","cost":25000,"xp":5,"coins":2},{"id":"B","label":"Affordable glasses","cost":8000,"xp":12,"coins":6},{"id":"C","label":"Online budget glasses","cost":3000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-117', 'transport', 'repair', 'Check Engine Light On', 'The check engine light came on. Could be serious.', ARRAY['young_adult','parent'], 3, 8, 2, '[{"id":"A","label":"Take to dealership immediately","cost":20000,"xp":8,"coins":3},{"id":"B","label":"Independent mechanic","cost":8000,"xp":12,"coins":6},{"id":"C","label":"Buy OBD reader and diagnose yourself","cost":3000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-118', 'transport', 'transit', 'Bike vs Car Commute', 'Good weather ahead. Consider biking to save on gas.', ARRAY['student','young_adult'], 1, 6, 3, '[{"id":"A","label":"Buy a decent bike","cost":15000,"xp":12,"coins":6},{"id":"B","label":"Used bike from classifieds","cost":5000,"xp":15,"coins":8},{"id":"C","label":"Stick with current commute","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-119', 'transport', 'ticket', 'Parking Ticket', 'You got a parking ticket downtown.', ARRAY['student','young_adult','parent'], 2, 8, 2, '[{"id":"A","label":"Pay immediately (avoid late fees)","cost":5000,"xp":10,"coins":5},{"id":"B","label":"Contest the ticket","cost":1000,"xp":12,"coins":6},{"id":"C","label":"Ignore it (risk late penalty)","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-120', 'transport', 'insurance', 'Car Insurance Renewal', 'Your car insurance is up for renewal. Shop around?', ARRAY['young_adult','parent'], 3, 8, 2, '[{"id":"A","label":"Full coverage premium","cost":15000,"xp":8,"coins":3},{"id":"B","label":"Compare and switch to cheaper","cost":10000,"xp":15,"coins":8},{"id":"C","label":"Minimum required coverage","cost":6000,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-121', 'transport', 'rideshare', 'Ride Share vs Taxi', 'You need a ride home late at night.', ARRAY['teen','student','young_adult'], 1, 6, 3, '[{"id":"A","label":"Premium ride service","cost":3500,"xp":3,"coins":1},{"id":"B","label":"Standard rideshare","cost":1500,"xp":8,"coins":4},{"id":"C","label":"Take the bus/walk","cost":200,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-122', 'transport', 'fuel', 'Gas Prices Spike', 'Gas prices jumped 20%. Adjust your driving habits?', ARRAY['young_adult','parent'], 3, 8, 2, '[{"id":"A","label":"No changes, fill up as usual","cost":7000,"xp":3,"coins":1},{"id":"B","label":"Carpool with coworkers","cost":3000,"xp":12,"coins":6},{"id":"C","label":"Work from home more","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-123', 'shopping', 'impulse', 'Social Media Ad Temptation', 'An Instagram ad shows exactly what you want. 50% off for 2 hours!', ARRAY['teen','student','young_adult'], 1, 6, 3, '[{"id":"A","label":"Buy it immediately","cost":5000,"xp":3,"coins":1},{"id":"B","label":"Save it and think for 24 hours","cost":0,"xp":15,"coins":8},{"id":"C","label":"Unfollow the account","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-124', 'shopping', 'subscription', 'Subscription Audit', 'You realize you''re paying for 5 subscription services. Time to review?', ARRAY['student','young_adult','parent'], 2, 8, 2, '[{"id":"A","label":"Keep all subscriptions","cost":5000,"xp":3,"coins":1},{"id":"B","label":"Cancel 2-3 unused ones","cost":2000,"xp":15,"coins":8},{"id":"C","label":"Cancel everything, go free-only","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-125', 'food', 'cooking', 'Meal Kit Delivery Service', 'A meal kit service is offering a free trial week.', ARRAY['young_adult','parent'], 2, 7, 2, '[{"id":"A","label":"Subscribe (auto-renews at $60/wk)","cost":0,"xp":5,"coins":2},{"id":"B","label":"Try the free week then cancel","cost":0,"xp":12,"coins":6},{"id":"C","label":"Skip — cook from scratch","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-126', 'food', 'groceries', 'Store Loyalty Card', 'Your grocery store offers a loyalty program with discounts.', ARRAY['teen','student','young_adult','parent'], 1, 8, 2, '[{"id":"A","label":"Premium membership ($50/yr)","cost":5000,"xp":10,"coins":5},{"id":"B","label":"Free basic membership","cost":0,"xp":12,"coins":6},{"id":"C","label":"Not interested","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-127', 'food', 'meal_prep', 'Batch Cooking Weekend', 'Spend a Sunday cooking meals for the whole week?', ARRAY['student','young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"Full week prep with variety","cost":5000,"xp":15,"coins":8},{"id":"B","label":"Prep lunches only","cost":2500,"xp":10,"coins":5},{"id":"C","label":"Wing it day by day","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-128', 'emergency', 'unexpected', 'Washing Machine Breaks', 'Your washing machine just died. Laundromat it is... unless you replace it.', ARRAY['young_adult','parent'], 3, 8, 2, '[{"id":"A","label":"Buy new washer","cost":35000,"xp":8,"coins":3},{"id":"B","label":"Buy used from classifieds","cost":12000,"xp":12,"coins":6},{"id":"C","label":"Use laundromat for now","cost":2000,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-129', 'emergency', 'family', 'Family Member Needs Help', 'A close family member asks to borrow money for an emergency.', ARRAY['young_adult','parent'], 3, 8, 1, '[{"id":"A","label":"Lend the full amount","cost":50000,"xp":10,"coins":5},{"id":"B","label":"Help with a smaller amount","cost":15000,"xp":12,"coins":6},{"id":"C","label":"Offer non-financial help","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-130', 'emergency', 'pet', 'Pet Emergency Vet Visit', 'Your pet is acting strange and might need emergency vet care.', ARRAY['young_adult','parent'], 2, 8, 1, '[{"id":"A","label":"Emergency vet immediately","cost":30000,"xp":10,"coins":5},{"id":"B","label":"Call vet hotline first","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Monitor and wait till morning","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-131', 'emergency', 'theft', 'Phone Stolen', 'Your phone was stolen. You need a replacement ASAP.', ARRAY['teen','student','young_adult'], 1, 8, 1, '[{"id":"A","label":"Buy the latest model","cost":80000,"xp":3,"coins":1},{"id":"B","label":"Affordable replacement","cost":25000,"xp":10,"coins":5},{"id":"C","label":"Used phone from friend","cost":8000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-132', 'emergency', 'medical', 'ER Visit', 'A sports injury lands you in the ER.', ARRAY['teen','student','young_adult'], 2, 8, 1, '[{"id":"A","label":"Full treatment at ER","cost":50000,"xp":10,"coins":5},{"id":"B","label":"Urgent care instead","cost":15000,"xp":12,"coins":6},{"id":"C","label":"Home treatment (risky)","cost":1000,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-133', 'education', 'course', 'Online Course Opportunity', 'A highly-rated online course in your field is on sale.', ARRAY['student','young_adult'], 2, 8, 2, '[{"id":"A","label":"Buy the premium course bundle","cost":15000,"xp":20,"coins":10},{"id":"B","label":"Single course only","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Find free alternatives","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-134', 'education', 'certification', 'Professional Certification', 'A certification could boost your career prospects.', ARRAY['young_adult','parent'], 3, 8, 1, '[{"id":"A","label":"Full prep course + exam fee","cost":30000,"xp":25,"coins":12},{"id":"B","label":"Self-study + exam fee only","cost":10000,"xp":18,"coins":8},{"id":"C","label":"Postpone for later","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-135', 'education', 'books', 'Book Shopping', 'New books in your area of interest are out.', ARRAY['teen','student','young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"Buy the whole reading list","cost":8000,"xp":10,"coins":5},{"id":"B","label":"Library card instead","cost":0,"xp":15,"coins":8},{"id":"C","label":"E-book on sale","cost":1500,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-136', 'education', 'workshop', 'Weekend Workshop', 'A hands-on workshop for a new skill you''ve been wanting to learn.', ARRAY['student','young_adult'], 2, 7, 2, '[{"id":"A","label":"Sign up for the workshop","cost":10000,"xp":18,"coins":8},{"id":"B","label":"Watch YouTube tutorials","cost":0,"xp":10,"coins":5},{"id":"C","label":"Not interested right now","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-137', 'social', 'birthday', 'Best Friend''s Birthday', 'Your best friend''s birthday is coming up.', ARRAY['teen','student','young_adult','parent'], 1, 8, 2, '[{"id":"A","label":"Throw a surprise party","cost":15000,"xp":10,"coins":5},{"id":"B","label":"Dinner out, your treat","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Thoughtful handmade gift","cost":1000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-138', 'social', 'wedding', 'Wedding Invitation', 'You''re invited to a destination wedding.', ARRAY['young_adult','parent'], 4, 8, 1, '[{"id":"A","label":"Attend (travel + gift + outfit)","cost":60000,"xp":10,"coins":5},{"id":"B","label":"Attend locally, skip destination events","cost":20000,"xp":8,"coins":4},{"id":"C","label":"Send a gift and regrets","cost":5000,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-139', 'social', 'vacation', 'Group Trip Planning', 'Friends are planning a group vacation.', ARRAY['student','young_adult'], 2, 8, 2, '[{"id":"A","label":"All-in luxury trip","cost":80000,"xp":8,"coins":3},{"id":"B","label":"Budget-friendly version","cost":30000,"xp":12,"coins":6},{"id":"C","label":"Can''t afford it this time","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-140', 'social', 'charity', 'Charity Fundraiser', 'A cause you care about is doing a fundraiser.', ARRAY['teen','student','young_adult','parent'], 1, 8, 2, '[{"id":"A","label":"Make a generous donation","cost":10000,"xp":15,"coins":8},{"id":"B","label":"Modest donation","cost":2500,"xp":10,"coins":5},{"id":"C","label":"Volunteer time instead","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-141', 'social', 'holiday', 'Holiday Travel Plans', 'Holiday season means visiting family.', ARRAY['student','young_adult','parent'], 2, 8, 2, '[{"id":"A","label":"Fly home (peak season prices)","cost":35000,"xp":8,"coins":3},{"id":"B","label":"Drive or bus","cost":10000,"xp":12,"coins":6},{"id":"C","label":"Video call celebration","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-142', 'social', 'event', 'Concert Tickets', 'Your favorite artist is performing nearby.', ARRAY['teen','student','young_adult'], 1, 8, 3, '[{"id":"A","label":"VIP tickets","cost":20000,"xp":5,"coins":2},{"id":"B","label":"General admission","cost":6000,"xp":8,"coins":4},{"id":"C","label":"Watch the livestream","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-143', 'finance', 'investment', 'Friend''s Investment Tip', 'A friend says they made big returns on a new investment opportunity.', ARRAY['young_adult','parent'], 4, 8, 2, '[{"id":"A","label":"Invest heavily","cost":50000,"xp":8,"coins":3},{"id":"B","label":"Small experimental investment","cost":10000,"xp":12,"coins":6},{"id":"C","label":"Research first, skip for now","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-144', 'finance', 'credit_card', 'Credit Card Offer', 'A bank is offering a credit card with a sign-up bonus.', ARRAY['student','young_adult','parent'], 2, 8, 2, '[{"id":"A","label":"Apply for the premium card","cost":10000,"xp":10,"coins":5},{"id":"B","label":"Apply for no-fee card","cost":0,"xp":12,"coins":6},{"id":"C","label":"Don''t need another card","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-145', 'finance', 'loan', 'Loan Refinancing Offer', 'You can refinance your loan at a lower rate.', ARRAY['young_adult','parent'], 4, 8, 1, '[{"id":"A","label":"Refinance (closing costs apply)","cost":15000,"xp":15,"coins":8},{"id":"B","label":"Make extra payments instead","cost":20000,"xp":12,"coins":6},{"id":"C","label":"Keep current terms","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-146', 'finance', 'savings', 'High-Yield Savings Account', 'A new bank offers 4.5% APY on savings.', ARRAY['student','young_adult','parent'], 2, 8, 2, '[{"id":"A","label":"Open account and transfer savings","cost":0,"xp":15,"coins":8},{"id":"B","label":"Keep current bank (convenience)","cost":0,"xp":5,"coins":2},{"id":"C","label":"Invest the money instead","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-147', 'finance', 'tax', 'Tax Filing Season', 'Tax season is here. How do you handle your taxes?', ARRAY['young_adult','parent'], 3, 8, 1, '[{"id":"A","label":"Hire an accountant","cost":20000,"xp":12,"coins":6},{"id":"B","label":"Use tax software","cost":3000,"xp":15,"coins":8},{"id":"C","label":"Free filing tools","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-148', 'finance', 'emergency_fund', 'Emergency Fund Goal', 'Financial advisors say you need 3-6 months of expenses saved.', ARRAY['young_adult','parent'], 3, 8, 2, '[{"id":"A","label":"Set aside 20% of paycheck","cost":0,"xp":15,"coins":8},{"id":"B","label":"Set aside 10% of paycheck","cost":0,"xp":10,"coins":5},{"id":"C","label":"Deal with it later","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-149', 'finance', 'retirement', '401k Enrollment', 'Your company offers 401k matching up to 5%.', ARRAY['young_adult','parent'], 4, 8, 1, '[{"id":"A","label":"Max out the match (5%)","cost":0,"xp":20,"coins":10},{"id":"B","label":"Contribute 3%","cost":0,"xp":12,"coins":6},{"id":"C","label":"Skip for now","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-150', 'finance', 'debt', 'Debt Snowball vs Avalanche', 'You have multiple debts. Which strategy to tackle them?', ARRAY['young_adult','parent'], 4, 8, 1, '[{"id":"A","label":"Avalanche (highest interest first)","cost":0,"xp":15,"coins":8},{"id":"B","label":"Snowball (smallest balance first)","cost":0,"xp":12,"coins":6},{"id":"C","label":"Just pay minimums","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-151', 'entertainment', 'gaming', 'New Game Release', 'A highly anticipated game just dropped.', ARRAY['teen','student','young_adult'], 1, 6, 3, '[{"id":"A","label":"Buy deluxe edition at launch","cost":7000,"xp":3,"coins":1},{"id":"B","label":"Wait for a sale","cost":0,"xp":12,"coins":6},{"id":"C","label":"Play free-to-play games","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-152', 'entertainment', 'movie', 'Movie Night Options', 'New blockbuster in theaters. How do you watch?', ARRAY['teen','student','young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"IMAX experience","cost":2500,"xp":5,"coins":2},{"id":"B","label":"Regular showing","cost":1200,"xp":8,"coins":4},{"id":"C","label":"Wait for streaming","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-153', 'entertainment', 'sports', 'Sporting Event Tickets', 'Your team is playing a big game this weekend.', ARRAY['teen','student','young_adult','parent'], 1, 8, 2, '[{"id":"A","label":"Great seats","cost":15000,"xp":5,"coins":2},{"id":"B","label":"Nosebleed section","cost":4000,"xp":8,"coins":4},{"id":"C","label":"Watch at a sports bar","cost":2000,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-154', 'entertainment', 'hobby', 'New Hobby Discovery', 'You discovered a new hobby you''re excited about.', ARRAY['teen','student','young_adult'], 1, 8, 2, '[{"id":"A","label":"Go all in with equipment","cost":20000,"xp":8,"coins":3},{"id":"B","label":"Start with the basics","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Try before you buy","cost":500,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-155', 'housing', 'pest', 'Pest Problem', 'You spotted pests in your apartment. This needs handling.', ARRAY['student','young_adult','parent'], 2, 8, 2, '[{"id":"A","label":"Professional exterminator","cost":15000,"xp":10,"coins":5},{"id":"B","label":"DIY traps and sprays","cost":3000,"xp":12,"coins":6},{"id":"C","label":"Complain to landlord","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-156', 'housing', 'moving', 'Downsizing Option', 'You could save money by moving to a smaller place.', ARRAY['young_adult'], 3, 7, 1, '[{"id":"A","label":"Move to smaller place (save on rent)","cost":15000,"xp":15,"coins":8},{"id":"B","label":"Get a roommate instead","cost":2000,"xp":10,"coins":5},{"id":"C","label":"Stay put","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-157', 'career', 'training', 'Company Training Opportunity', 'Your company offers a training program but requires weekend commitment.', ARRAY['young_adult','parent'], 2, 8, 2, '[{"id":"A","label":"Commit to full training","cost":0,"xp":18,"coins":8},{"id":"B","label":"Partial attendance","cost":0,"xp":10,"coins":5},{"id":"C","label":"Skip — value your weekends","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-158', 'career', 'commute', 'Office vs Remote Work', 'Your company is offering hybrid work options.', ARRAY['young_adult','parent'], 3, 8, 2, '[{"id":"A","label":"Full office (networking benefits)","cost":5000,"xp":8,"coins":3},{"id":"B","label":"Hybrid (3 days office)","cost":3000,"xp":12,"coins":6},{"id":"C","label":"Full remote (save on commute)","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-159', 'health', 'fitness', 'Running Shoes', 'Your running shoes are worn out.', ARRAY['teen','student','young_adult'], 1, 8, 2, '[{"id":"A","label":"Premium running shoes","cost":15000,"xp":5,"coins":2},{"id":"B","label":"Mid-range shoes on sale","cost":6000,"xp":10,"coins":5},{"id":"C","label":"Budget shoes","cost":3000,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-160', 'health', 'nutrition', 'Vitamins and Supplements', 'Should you start taking daily vitamins?', ARRAY['teen','student','young_adult','parent'], 1, 8, 2, '[{"id":"A","label":"Premium brand vitamins","cost":5000,"xp":8,"coins":3},{"id":"B","label":"Store brand basics","cost":1500,"xp":10,"coins":5},{"id":"C","label":"Focus on diet instead","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-161', 'transport', 'maintenance', 'Car Wash Decision', 'Your car desperately needs cleaning.', ARRAY['young_adult','parent'], 2, 8, 3, '[{"id":"A","label":"Full detail service","cost":8000,"xp":5,"coins":2},{"id":"B","label":"Drive-through car wash","cost":1500,"xp":8,"coins":4},{"id":"C","label":"Wash it yourself","cost":500,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-162', 'transport', 'upgrade', 'Electric Vehicle Consideration', 'Electric vehicles are getting cheaper. Worth switching?', ARRAY['young_adult','parent'], 5, 8, 1, '[{"id":"A","label":"Lease an EV","cost":30000,"xp":12,"coins":6},{"id":"B","label":"Buy used hybrid","cost":50000,"xp":10,"coins":5},{"id":"C","label":"Keep current car","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-163', 'social', 'gift', 'Baby Shower Gift', 'A coworker is having a baby shower.', ARRAY['young_adult','parent'], 3, 8, 2, '[{"id":"A","label":"Expensive gift from registry","cost":8000,"xp":8,"coins":3},{"id":"B","label":"Group gift contribution","cost":2500,"xp":10,"coins":5},{"id":"C","label":"Handmade something special","cost":500,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-164', 'social', 'dating', 'First Date Planning', 'You''ve got a first date. Where to go?', ARRAY['student','young_adult'], 2, 7, 2, '[{"id":"A","label":"Fancy restaurant","cost":8000,"xp":5,"coins":2},{"id":"B","label":"Casual coffee date","cost":1000,"xp":12,"coins":6},{"id":"C","label":"Free outdoor activity","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-165', 'social', 'party', 'House Party Decision', 'You want to throw a party at your place.', ARRAY['student','young_adult'], 1, 6, 2, '[{"id":"A","label":"Full catered party","cost":15000,"xp":5,"coins":2},{"id":"B","label":"BYOB with simple snacks","cost":3000,"xp":10,"coins":5},{"id":"C","label":"Small gathering, homemade food","cost":1500,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-166', 'education', 'tutoring', 'Tutoring for Tough Class', 'You''re struggling with a subject. Tutoring might help.', ARRAY['teen','student'], 1, 4, 2, '[{"id":"A","label":"Hire a professional tutor","cost":8000,"xp":15,"coins":8},{"id":"B","label":"Study group with classmates","cost":0,"xp":12,"coins":6},{"id":"C","label":"Figure it out yourself","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-167', 'education', 'conference', 'Academic Conference', 'Submit a paper to a student conference?', ARRAY['student'], 2, 5, 1, '[{"id":"A","label":"Submit and attend ($200 fee)","cost":20000,"xp":20,"coins":10},{"id":"B","label":"Attend as audience only","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Skip it","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-168', 'emergency', 'car', 'Car Accident (Minor)', 'Fender bender in a parking lot. Some damage to fix.', ARRAY['young_adult','parent'], 3, 8, 1, '[{"id":"A","label":"File insurance claim","cost":10000,"xp":10,"coins":5},{"id":"B","label":"Pay out of pocket for repair","cost":25000,"xp":12,"coins":6},{"id":"C","label":"Live with cosmetic damage","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-169', 'emergency', 'weather', 'Storm Damage', 'A bad storm damaged some of your belongings.', ARRAY['young_adult','parent'], 3, 8, 1, '[{"id":"A","label":"Replace everything new","cost":30000,"xp":5,"coins":2},{"id":"B","label":"File renter''s insurance claim","cost":5000,"xp":15,"coins":8},{"id":"C","label":"Replace only essentials","cost":10000,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-170', 'emergency', 'identity', 'Identity Theft Scare', 'You got an alert about suspicious activity on your accounts.', ARRAY['student','young_adult','parent'], 2, 8, 1, '[{"id":"A","label":"Subscribe to identity protection service","cost":15000,"xp":12,"coins":6},{"id":"B","label":"Freeze credit and monitor yourself","cost":0,"xp":15,"coins":8},{"id":"C","label":"Change passwords and hope for the best","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-171', 'shopping', 'tech', 'Tablet or E-Reader', 'You''ve been thinking about getting a tablet for reading and browsing.', ARRAY['teen','student','young_adult'], 1, 7, 2, '[{"id":"A","label":"Premium tablet","cost":40000,"xp":5,"coins":2},{"id":"B","label":"Basic e-reader","cost":8000,"xp":10,"coins":5},{"id":"C","label":"Use your phone","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-172', 'shopping', 'fashion', 'Sneaker Drop', 'Limited edition sneakers just dropped.', ARRAY['teen','student','young_adult'], 1, 5, 2, '[{"id":"A","label":"Buy at retail price","cost":18000,"xp":3,"coins":1},{"id":"B","label":"Wait for restocks or alternatives","cost":0,"xp":12,"coins":6},{"id":"C","label":"Not worth the hype","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-173', 'food', 'treat', 'Fancy Coffee Machine', 'You could save money long-term with a good coffee machine.', ARRAY['student','young_adult','parent'], 2, 8, 2, '[{"id":"A","label":"Premium espresso machine","cost":30000,"xp":8,"coins":3},{"id":"B","label":"Basic drip coffee maker","cost":3000,"xp":12,"coins":6},{"id":"C","label":"Stick with instant coffee","cost":500,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-174', 'health', 'wellness', 'Spa Day Temptation', 'You''ve been working hard. A spa day sounds amazing.', ARRAY['young_adult','parent'], 2, 8, 2, '[{"id":"A","label":"Full spa package","cost":15000,"xp":5,"coins":2},{"id":"B","label":"Just a massage","cost":6000,"xp":8,"coins":4},{"id":"C","label":"DIY self-care at home","cost":1000,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-175', 'finance', 'banking', 'Bank Fee Frustration', 'Your bank charged unexpected maintenance fees.', ARRAY['teen','student','young_adult'], 1, 6, 2, '[{"id":"A","label":"Call and contest the fee","cost":0,"xp":15,"coins":8},{"id":"B","label":"Switch to a no-fee bank","cost":0,"xp":12,"coins":6},{"id":"C","label":"Just pay it","cost":2000,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-176', 'social', 'peer_pressure', 'Expensive Group Activity', 'Friends want to go skiing. It''s pricey.', ARRAY['student','young_adult'], 2, 7, 2, '[{"id":"A","label":"Go all in","cost":25000,"xp":5,"coins":2},{"id":"B","label":"Suggest a cheaper alternative","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Sit this one out","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-177', 'housing', 'insurance', 'Renter''s Insurance', 'Your landlord recommends renter''s insurance.', ARRAY['student','young_adult'], 2, 6, 1, '[{"id":"A","label":"Comprehensive policy","cost":3000,"xp":12,"coins":6},{"id":"B","label":"Basic coverage","cost":1500,"xp":10,"coins":5},{"id":"C","label":"Skip it","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-178', 'transport', 'registration', 'Vehicle Registration Due', 'Your vehicle registration is expiring.', ARRAY['young_adult','parent'], 3, 8, 2, '[{"id":"A","label":"Renew immediately online","cost":10000,"xp":10,"coins":5},{"id":"B","label":"Wait till last minute","cost":10000,"xp":5,"coins":2},{"id":"C","label":"Risk driving unregistered (bad idea)","cost":0,"xp":2,"coins":0}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-179', 'career', 'education', 'MBA Program Consideration', 'An MBA could boost your career but it''s expensive.', ARRAY['young_adult'], 5, 8, 1, '[{"id":"A","label":"Apply for full-time MBA","cost":100000,"xp":25,"coins":12},{"id":"B","label":"Part-time evening MBA","cost":50000,"xp":18,"coins":8},{"id":"C","label":"Focus on work experience instead","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-180', 'emergency', 'plumbing', 'Burst Pipe Emergency', 'A pipe burst in your home causing water damage.', ARRAY['young_adult','parent'], 3, 8, 1, '[{"id":"A","label":"Emergency plumber (24/7 rates)","cost":25000,"xp":10,"coins":5},{"id":"B","label":"Shut off water, fix tomorrow","cost":12000,"xp":12,"coins":6},{"id":"C","label":"Call landlord (if renting)","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-181', 'shopping', 'second_hand', 'Thrift Store Haul', 'A huge thrift store sale is happening.', ARRAY['teen','student','young_adult'], 1, 6, 3, '[{"id":"A","label":"Browse and buy lots","cost":5000,"xp":8,"coins":4},{"id":"B","label":"Just look for one specific item","cost":1500,"xp":12,"coins":6},{"id":"C","label":"Don''t need anything","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-182', 'food', 'eating_out', 'Food Truck Festival', 'A food truck festival is in town!', ARRAY['teen','student','young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"Try multiple trucks","cost":4000,"xp":5,"coins":2},{"id":"B","label":"One meal only","cost":1500,"xp":8,"coins":4},{"id":"C","label":"Eat before going (just enjoy the vibe)","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-183', 'education', 'language', 'Language Learning App', 'You want to learn a new language.', ARRAY['teen','student','young_adult','parent'], 1, 8, 2, '[{"id":"A","label":"Premium app subscription ($100/yr)","cost":10000,"xp":12,"coins":6},{"id":"B","label":"Free app with ads","cost":0,"xp":10,"coins":5},{"id":"C","label":"Free YouTube lessons","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-184', 'finance', 'crypto', 'Crypto Buzz', 'Everyone''s talking about a new cryptocurrency.', ARRAY['student','young_adult'], 4, 8, 2, '[{"id":"A","label":"Invest significantly","cost":30000,"xp":5,"coins":2},{"id":"B","label":"Small amount you can afford to lose","cost":5000,"xp":10,"coins":5},{"id":"C","label":"Stay away from crypto","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-185', 'housing', 'furniture', 'IKEA Run', 'You need some basic furniture items.', ARRAY['student','young_adult'], 1, 6, 2, '[{"id":"A","label":"Full room makeover","cost":20000,"xp":5,"coins":2},{"id":"B","label":"Just the essentials","cost":5000,"xp":10,"coins":5},{"id":"C","label":"Check Facebook Marketplace first","cost":2000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-186', 'career', 'mentorship', 'Mentorship Program', 'A senior colleague offers to mentor you.', ARRAY['student','young_adult'], 2, 6, 2, '[{"id":"A","label":"Accept and commit fully","cost":0,"xp":18,"coins":8},{"id":"B","label":"Casual coffee chats occasionally","cost":500,"xp":10,"coins":5},{"id":"C","label":"Too busy right now","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-187', 'health', 'prescription', 'Prescription Costs', 'You need a prescription filled. Brand vs generic?', ARRAY['young_adult','parent'], 2, 8, 2, '[{"id":"A","label":"Brand name","cost":8000,"xp":3,"coins":1},{"id":"B","label":"Generic equivalent","cost":2000,"xp":12,"coins":6},{"id":"C","label":"Shop around pharmacies","cost":1500,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-188', 'social', 'community', 'Neighborhood Volunteer Day', 'Your neighborhood is organizing a community clean-up.', ARRAY['teen','student','young_adult','parent'], 1, 8, 2, '[{"id":"A","label":"Volunteer and bring supplies","cost":2000,"xp":15,"coins":8},{"id":"B","label":"Just show up and help","cost":0,"xp":12,"coins":6},{"id":"C","label":"Can''t make it","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-189', 'emergency', 'tech', 'Laptop Screen Cracked', 'You dropped your laptop and cracked the screen.', ARRAY['teen','student','young_adult'], 1, 7, 1, '[{"id":"A","label":"Official repair service","cost":25000,"xp":8,"coins":3},{"id":"B","label":"Third-party repair shop","cost":10000,"xp":12,"coins":6},{"id":"C","label":"Use external monitor for now","cost":5000,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-190', 'shopping', 'beauty', 'Skincare Products', 'Your skincare routine needs an update.', ARRAY['teen','student','young_adult'], 1, 7, 2, '[{"id":"A","label":"Premium brand set","cost":10000,"xp":5,"coins":2},{"id":"B","label":"Drugstore alternatives","cost":2500,"xp":12,"coins":6},{"id":"C","label":"Minimal routine only","cost":500,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-191', 'finance', 'budgeting', 'Budgeting App Subscription', 'A popular budgeting app could help you track spending.', ARRAY['teen','student','young_adult','parent'], 1, 8, 2, '[{"id":"A","label":"Premium plan ($8/mo)","cost":800,"xp":12,"coins":6},{"id":"B","label":"Free tier","cost":0,"xp":10,"coins":5},{"id":"C","label":"Spreadsheet it yourself","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-192', 'social', 'graduation', 'Graduation Expenses', 'Graduation is coming with cap, gown, photos, and celebration.', ARRAY['teen','student'], 1, 4, 1, '[{"id":"A","label":"Full package (photos, party, outfit)","cost":20000,"xp":8,"coins":3},{"id":"B","label":"Just the essentials","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Low-key celebration","cost":1500,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-193', 'housing', 'energy', 'Energy Efficiency Upgrades', 'LED bulbs and smart thermostat could save on bills.', ARRAY['young_adult','parent'], 3, 8, 2, '[{"id":"A","label":"Full smart home energy kit","cost":15000,"xp":12,"coins":6},{"id":"B","label":"Just LED bulbs","cost":2000,"xp":10,"coins":5},{"id":"C","label":"Not worth the upfront cost","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-194', 'career', 'interview', 'Interview Outfit', 'You have a big interview. Need to look sharp.', ARRAY['student','young_adult'], 2, 6, 2, '[{"id":"A","label":"New professional outfit","cost":15000,"xp":10,"coins":5},{"id":"B","label":"Borrow from a friend","cost":0,"xp":12,"coins":6},{"id":"C","label":"Wear your best existing clothes","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-195', 'emergency', 'legal', 'Legal Issue', 'A minor legal issue requires attention. Maybe a lawyer?', ARRAY['young_adult','parent'], 4, 8, 1, '[{"id":"A","label":"Hire a lawyer","cost":30000,"xp":12,"coins":6},{"id":"B","label":"Legal aid / free consultation","cost":0,"xp":15,"coins":8},{"id":"C","label":"Handle it yourself","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-196', 'shopping', 'home', 'Mattress Replacement', 'Your mattress is old and your back hurts.', ARRAY['student','young_adult','parent'], 2, 8, 1, '[{"id":"A","label":"Premium memory foam","cost":80000,"xp":5,"coins":2},{"id":"B","label":"Mid-range bed-in-a-box","cost":30000,"xp":10,"coins":5},{"id":"C","label":"Mattress topper","cost":5000,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-197', 'food', 'special_diet', 'Organic vs Conventional', 'You''re debating whether to switch to all organic groceries.', ARRAY['young_adult','parent'], 2, 8, 2, '[{"id":"A","label":"Go fully organic","cost":8000,"xp":8,"coins":3},{"id":"B","label":"Dirty dozen organic, rest conventional","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Conventional is fine","cost":3000,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-198', 'finance', 'insurance', 'Life Insurance Consideration', 'You''re thinking about getting life insurance.', ARRAY['parent'], 5, 8, 1, '[{"id":"A","label":"Whole life policy","cost":15000,"xp":10,"coins":5},{"id":"B","label":"Term life (much cheaper)","cost":5000,"xp":15,"coins":8},{"id":"C","label":"Research more first","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-199', 'social', 'family', 'Family Reunion Planning', 'Your family is planning a reunion. Everyone''s chipping in.', ARRAY['young_adult','parent'], 3, 8, 1, '[{"id":"A","label":"Contribute generously + travel","cost":25000,"xp":10,"coins":5},{"id":"B","label":"Basic contribution","cost":8000,"xp":12,"coins":6},{"id":"C","label":"Can''t attend, send a message","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-200', 'career', 'workspace', 'Home Office Setup', 'Working from home means you need a proper workspace.', ARRAY['young_adult','parent'], 3, 8, 2, '[{"id":"A","label":"Ergonomic desk + chair + monitor","cost":50000,"xp":10,"coins":5},{"id":"B","label":"Basic desk setup","cost":15000,"xp":12,"coins":6},{"id":"C","label":"Work from the couch/kitchen","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-201', 'teen', 'school', 'School Dance', 'The school dance is coming up!', ARRAY['teen'], 1, 3, 2, '[{"id":"A","label":"New outfit + tickets + dinner","cost":10000,"xp":5,"coins":2},{"id":"B","label":"Just tickets, wear what you have","cost":2000,"xp":12,"coins":6},{"id":"C","label":"Skip it","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-202', 'teen', 'part_time', 'Part-Time Job Offer', 'A local shop offers you a part-time job on weekends.', ARRAY['teen'], 1, 3, 2, '[{"id":"A","label":"Accept — earn extra money","cost":0,"xp":18,"coins":10},{"id":"B","label":"Negotiate fewer hours","cost":0,"xp":12,"coins":6},{"id":"C","label":"Focus on school","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-203', 'teen', 'saving', 'Save for New Console', 'A new gaming console is out. You need to save up.', ARRAY['teen'], 1, 3, 2, '[{"id":"A","label":"Start a savings plan","cost":0,"xp":15,"coins":8},{"id":"B","label":"Ask parents to help","cost":0,"xp":5,"coins":2},{"id":"C","label":"It can wait","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-204', 'parent', 'childcare', 'Childcare Options', 'You need to find childcare while you work.', ARRAY['parent'], 4, 8, 2, '[{"id":"A","label":"Premium daycare center","cost":100000,"xp":8,"coins":3},{"id":"B","label":"In-home daycare","cost":60000,"xp":12,"coins":6},{"id":"C","label":"Family member helps out","cost":10000,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-205', 'parent', 'school', 'Kid''s Extracurricular', 'Your child wants to join soccer/dance/music classes.', ARRAY['parent'], 4, 8, 2, '[{"id":"A","label":"Sign up with full gear","cost":15000,"xp":10,"coins":5},{"id":"B","label":"Budget option (community program)","cost":3000,"xp":12,"coins":6},{"id":"C","label":"Maybe next semester","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-206', 'parent', 'education', '529 College Savings Plan', 'It''s never too early to save for college.', ARRAY['parent'], 5, 8, 1, '[{"id":"A","label":"Start with $200/month","cost":20000,"xp":18,"coins":10},{"id":"B","label":"Start with $50/month","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Deal with it later","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-207', 'entertainment', 'streaming', 'New Streaming Service', 'Yet another streaming service launched with must-watch content.', ARRAY['teen','student','young_adult','parent'], 1, 8, 3, '[{"id":"A","label":"Subscribe immediately","cost":1500,"xp":3,"coins":1},{"id":"B","label":"Wait for free trial","cost":0,"xp":10,"coins":5},{"id":"C","label":"You have enough subscriptions","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-208', 'housing', 'garden', 'Start a Garden', 'Growing your own herbs and veggies could save money.', ARRAY['young_adult','parent'], 2, 8, 2, '[{"id":"A","label":"Full garden setup (raised beds, tools)","cost":10000,"xp":12,"coins":6},{"id":"B","label":"Window box herbs","cost":2000,"xp":10,"coins":5},{"id":"C","label":"No green thumb here","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

