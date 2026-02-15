
-- ============================================================
-- YOUNG ADULT CARDS (DC-281 to DC-350) — persona: young_adult, levels 3-8
-- ============================================================

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-281', 'housing', 'apartment', 'First Apartment Hunt', 'Time to find your own place. Location vs price vs space.', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"Trendy neighborhood, small studio","cost":60000,"xp":5,"coins":2},{"id":"B","label":"Affordable area, decent space","cost":35000,"xp":12,"coins":6},{"id":"C","label":"Roommates to split costs","cost":20000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-282', 'career', 'salary', 'Salary Negotiation', 'You got a job offer but the salary seems low. Negotiate?', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"Negotiate aggressively","cost":0,"xp":18,"coins":10},{"id":"B","label":"Ask for a modest bump","cost":0,"xp":12,"coins":6},{"id":"C","label":"Accept as-is to avoid conflict","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-283', 'social', 'wedding', 'Wedding Season Guest', 'Three weddings this summer. Each one costs money.', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"Go to all three, full gifts","cost":30000,"xp":5,"coins":2},{"id":"B","label":"Pick two, modest gifts","cost":15000,"xp":10,"coins":5},{"id":"C","label":"Attend one, send cards to others","cost":8000,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-284', 'shopping', 'pet', 'Pet Adoption Decision', 'You''ve always wanted a pet. The shelter has the perfect one.', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"Adopt + premium supplies + insurance","cost":20000,"xp":10,"coins":5},{"id":"B","label":"Adopt + basic essentials only","cost":8000,"xp":12,"coins":6},{"id":"C","label":"Wait until finances are more stable","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-285', 'career', 'side_hustle', 'Side Hustle Investment', 'You have a side business idea but it needs startup money.', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"Invest savings into the idea","cost":25000,"xp":15,"coins":8},{"id":"B","label":"Start small, bootstrap","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Keep the day job, skip the risk","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-286', 'social', 'dating', 'Date Night Frequency', 'Your partner expects regular date nights. They add up.', ARRAY['young_adult'], 3, 6, 3, '[{"id":"A","label":"Fancy dinner out weekly","cost":5000,"xp":3,"coins":1},{"id":"B","label":"Mix of out and home dates","cost":2000,"xp":12,"coins":6},{"id":"C","label":"Creative free date ideas","cost":500,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-287', 'transport', 'car', 'Car Trouble Decision', 'Your car needs $2,000 in repairs. It''s worth $5,000.', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"Buy a new car","cost":150000,"xp":5,"coins":2},{"id":"B","label":"Fix the old car","cost":20000,"xp":12,"coins":6},{"id":"C","label":"Sell it and use transit","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-288', 'finance', 'retirement', '401k Enrollment', 'Your company offers a 401k with employer match. Free money if you contribute.', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"Max out employer match (6%)","cost":15000,"xp":20,"coins":10},{"id":"B","label":"Contribute minimum (3%)","cost":7500,"xp":15,"coins":8},{"id":"C","label":"Skip it — need the cash now","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-289', 'shopping', 'furniture', 'Furnishing Your Place', 'Your apartment is empty. Time to make it a home.', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"All new from furniture stores","cost":50000,"xp":5,"coins":2},{"id":"B","label":"Mix of new and secondhand","cost":20000,"xp":12,"coins":6},{"id":"C","label":"Marketplace and thrift finds","cost":5000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-290', 'housing', 'utilities', 'First Utility Bills', 'Electric, gas, water, internet — bills you never had before.', ARRAY['young_adult'], 3, 6, 3, '[{"id":"A","label":"Premium everything (fast internet, AC blast)","cost":15000,"xp":3,"coins":1},{"id":"B","label":"Reasonable usage, mid-tier internet","cost":8000,"xp":10,"coins":5},{"id":"C","label":"Minimize usage, basic internet","cost":5000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-291', 'career', 'freelance', 'Freelance Opportunity', 'A freelance project could earn extra money but takes evenings.', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Take it — hustle hard","cost":0,"xp":15,"coins":10},{"id":"B","label":"Negotiate a smaller scope","cost":0,"xp":10,"coins":6},{"id":"C","label":"Protect your free time","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-292', 'career', 'raise', 'Ask for a Raise', 'You''ve been at your job a year. You deserve more. Or do you?', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"Ask for a significant raise with data","cost":0,"xp":18,"coins":10},{"id":"B","label":"Ask for a modest cost-of-living bump","cost":0,"xp":10,"coins":5},{"id":"C","label":"Wait for annual review","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-293', 'education', 'professional', 'Professional Development Course', 'An industry certification could boost your career.', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"Premium bootcamp ($2000)","cost":200000,"xp":20,"coins":10},{"id":"B","label":"Online self-paced course","cost":15000,"xp":15,"coins":8},{"id":"C","label":"Free resources and YouTube","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-294', 'shopping', 'clothing', 'Professional Wardrobe', 'Your job requires a more professional look.', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Designer pieces","cost":30000,"xp":5,"coins":2},{"id":"B","label":"Smart mid-range basics","cost":10000,"xp":12,"coins":6},{"id":"C","label":"Thrift and outlet finds","cost":3000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-295', 'social', 'networking', 'Networking Event', 'Industry mixer tonight. Drinks and snacks aren''t free.', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Go, buy drinks, tip well","cost":5000,"xp":12,"coins":6},{"id":"B","label":"Go, stick to one drink","cost":1500,"xp":10,"coins":5},{"id":"C","label":"Network online instead","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-296', 'career', 'change', 'Career Change Consideration', 'You hate your job but it pays well. A passion job pays 30% less.', ARRAY['young_adult'], 4, 8, 1, '[{"id":"A","label":"Make the leap — follow your passion","cost":0,"xp":15,"coins":8},{"id":"B","label":"Transition slowly — moonlight first","cost":0,"xp":12,"coins":6},{"id":"C","label":"Stay — money matters more now","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-297', 'housing', 'workspace', 'Remote Work Setup', 'Working from home needs a proper setup.', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"Standing desk + ergonomic chair + monitor","cost":50000,"xp":12,"coins":6},{"id":"B","label":"Basic desk and chair","cost":15000,"xp":10,"coins":5},{"id":"C","label":"Kitchen table works fine","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-298', 'career', 'business', 'Starting a Side Business', 'Your side project could become a real business.', ARRAY['young_adult'], 4, 8, 1, '[{"id":"A","label":"Invest in LLC, website, marketing","cost":30000,"xp":15,"coins":8},{"id":"B","label":"Start lean — social media only","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Keep it as a hobby for now","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-299', 'housing', 'workspace', 'Coworking Space', 'Working from home is lonely. A coworking space costs money.', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Premium coworking membership","cost":20000,"xp":8,"coins":4},{"id":"B","label":"Part-time/day pass","cost":5000,"xp":10,"coins":5},{"id":"C","label":"Work from cafes occasionally","cost":2000,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-300', 'finance', 'emergency', 'Emergency Fund Decision', 'You have no emergency fund. Experts say save 3-6 months of expenses.', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Automate 20% of paycheck to savings","cost":10000,"xp":18,"coins":10},{"id":"B","label":"Save $100/month to start","cost":10000,"xp":12,"coins":6},{"id":"C","label":"Deal with emergencies as they come","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-301', 'finance', 'credit', 'Credit Card Payment Strategy', 'Your credit card bill arrived. You can''t pay it all.', ARRAY['young_adult'], 3, 6, 3, '[{"id":"A","label":"Pay full balance — sacrifice this month","cost":15000,"xp":18,"coins":10},{"id":"B","label":"Pay more than minimum","cost":8000,"xp":10,"coins":5},{"id":"C","label":"Pay minimum only","cost":3000,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-302', 'finance', 'investing', 'Investment Starter', 'You have $500 saved. Where to put it?', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"Index fund (long-term growth)","cost":50000,"xp":18,"coins":10},{"id":"B","label":"High-yield savings account","cost":50000,"xp":12,"coins":6},{"id":"C","label":"Keep it in checking","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-303', 'finance', 'insurance', 'Health Insurance Choice', 'Open enrollment. Which plan do you pick?', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"PPO — high premium, low deductible","cost":15000,"xp":10,"coins":5},{"id":"B","label":"HDHP with HSA — save pre-tax","cost":8000,"xp":18,"coins":10},{"id":"C","label":"Cheapest plan available","cost":3000,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-304', 'finance', 'taxes', 'Tax Season', 'Tax filing deadline approaching. How do you handle it?', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Hire a CPA","cost":15000,"xp":8,"coins":3},{"id":"B","label":"Use tax software","cost":5000,"xp":12,"coins":6},{"id":"C","label":"File for free through IRS site","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-305', 'finance', 'debt', 'Debt Repayment Strategy', 'You have student loans and credit card debt. Which to tackle first?', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"Avalanche — highest interest first","cost":0,"xp":18,"coins":10},{"id":"B","label":"Snowball — smallest balance first","cost":0,"xp":15,"coins":8},{"id":"C","label":"Just pay minimums on everything","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-306', 'finance', 'budgeting', 'Budget Allocation', 'Time to set up a real budget. The 50/30/20 rule?', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Follow 50/30/20 strictly","cost":0,"xp":18,"coins":10},{"id":"B","label":"Track spending casually","cost":0,"xp":10,"coins":5},{"id":"C","label":"Wing it like always","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-307', 'shopping', 'subscriptions', 'Subscription Audit', 'You''re paying for 8 subscriptions. Do you need them all?', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Keep them all — you use them","cost":8000,"xp":3,"coins":1},{"id":"B","label":"Cancel half, rotate monthly","cost":4000,"xp":12,"coins":6},{"id":"C","label":"Cancel everything except one","cost":1500,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-308', 'finance', 'crypto', 'Cryptocurrency FOMO', 'Everyone at work is talking about crypto gains. Jump in?', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"Invest a chunk of savings","cost":50000,"xp":5,"coins":2},{"id":"B","label":"Small amount you can afford to lose","cost":5000,"xp":10,"coins":5},{"id":"C","label":"Stick to traditional investments","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-309', 'shopping', 'bnpl', 'Buy Now Pay Later', 'That jacket costs $200 but you can split into 4 payments.', ARRAY['young_adult'], 3, 6, 3, '[{"id":"A","label":"Use BNPL — get it now","cost":20000,"xp":3,"coins":1},{"id":"B","label":"Save up and buy it later","cost":0,"xp":15,"coins":8},{"id":"C","label":"Find a cheaper alternative","cost":5000,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-310', 'dining', 'delivery', 'Food Delivery vs Cooking', 'It''s been a long day. Cooking feels impossible.', ARRAY['young_adult'], 3, 6, 4, '[{"id":"A","label":"Order delivery + dessert","cost":3500,"xp":3,"coins":1},{"id":"B","label":"Quick pickup, no delivery fee","cost":2000,"xp":5,"coins":2},{"id":"C","label":"15-minute pantry meal","cost":500,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-311', 'transport', 'ev', 'Electric vs Gas Car', 'Your lease is up. Electric cars are tempting but pricey upfront.', ARRAY['young_adult'], 4, 8, 1, '[{"id":"A","label":"New electric vehicle","cost":200000,"xp":12,"coins":6},{"id":"B","label":"Reliable used gas car","cost":80000,"xp":10,"coins":5},{"id":"C","label":"Go car-free, use transit","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-312', 'housing', 'solar', 'Solar Panel Pitch', 'A solar company says panels will pay for themselves in 7 years.', ARRAY['young_adult'], 5, 8, 1, '[{"id":"A","label":"Full solar installation","cost":150000,"xp":15,"coins":8},{"id":"B","label":"Lease panels (lower upfront)","cost":30000,"xp":10,"coins":5},{"id":"C","label":"Not ready for that commitment","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-313', 'social', 'engagement', 'Engagement Ring Budget', 'You''re ready to propose. Society says spend 3 months salary.', ARRAY['young_adult'], 4, 8, 1, '[{"id":"A","label":"Traditional diamond ring","cost":150000,"xp":5,"coins":2},{"id":"B","label":"Beautiful alternative stone","cost":30000,"xp":10,"coins":5},{"id":"C","label":"Simple band, save for the future","cost":8000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-314', 'dining', 'tipping', 'Tipping Dilemma', 'The tip screen shows 18%, 20%, 25%. You ordered a $5 coffee.', ARRAY['young_adult'], 3, 6, 4, '[{"id":"A","label":"25% — support the workers","cost":125,"xp":5,"coins":2},{"id":"B","label":"18% — standard tip","cost":90,"xp":8,"coins":4},{"id":"C","label":"Skip for counter service","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-315', 'social', 'trip', 'Expensive Friend Trip', 'Your friend group is planning a $3000 vacation. Can you afford it?', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"Go — put it on credit card","cost":30000,"xp":3,"coins":1},{"id":"B","label":"Suggest a cheaper destination","cost":10000,"xp":12,"coins":6},{"id":"C","label":"Sit this one out","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-316', 'social', 'bill', 'Splitting the Bill', 'Dinner with friends. You had a salad, they had steak. Split evenly?', ARRAY['young_adult'], 3, 6, 3, '[{"id":"A","label":"Split evenly, don''t be that person","cost":4000,"xp":5,"coins":2},{"id":"B","label":"Suggest separate checks","cost":1500,"xp":12,"coins":6},{"id":"C","label":"Venmo exact amounts","cost":1500,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-317', 'social', 'lending', 'Friend Needs Money', 'A close friend asks to borrow $500. They''ve been struggling.', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"Lend the full amount","cost":50000,"xp":8,"coins":3},{"id":"B","label":"Give what you can as a gift","cost":10000,"xp":12,"coins":6},{"id":"C","label":"Offer help in other ways","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-318', 'social', 'appearances', 'Keeping Up Appearances', 'Neighbors got a new car. Your car is fine but older.', ARRAY['young_adult'], 4, 8, 2, '[{"id":"A","label":"Finance a new car too","cost":150000,"xp":3,"coins":1},{"id":"B","label":"Detail your current car","cost":5000,"xp":10,"coins":5},{"id":"C","label":"Cars are for transport, not status","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-319', 'social', 'gifts', 'Group Gift at Work', 'Someone at work is leaving. Everyone''s chipping in for a gift.', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Contribute $50","cost":5000,"xp":5,"coins":2},{"id":"B","label":"Contribute $20","cost":2000,"xp":8,"coins":4},{"id":"C","label":"Sign the card only","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-320', 'social', 'charity', 'Charity Donation Request', 'A coworker is running a marathon for charity. Donate?', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Donate generously ($100)","cost":10000,"xp":10,"coins":5},{"id":"B","label":"Small donation ($25)","cost":2500,"xp":8,"coins":4},{"id":"C","label":"Wish them well, skip donation","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-321', 'health', 'gym', 'Gym Membership Decision', 'New year, new you. But gym memberships aren''t cheap.', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Premium gym with classes and sauna","cost":8000,"xp":8,"coins":4},{"id":"B","label":"Basic no-frills gym","cost":3000,"xp":12,"coins":6},{"id":"C","label":"Home workouts and outdoor running","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-322', 'health', 'wellness', 'Spa Day Temptation', 'You''ve been stressed. A spa day sounds perfect.', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Full spa package","cost":15000,"xp":5,"coins":2},{"id":"B","label":"Just a massage","cost":5000,"xp":8,"coins":4},{"id":"C","label":"DIY spa night at home","cost":500,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-323', 'health', 'therapy', 'Mental Health Support', 'You''ve been feeling overwhelmed. Therapy might help.', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"Weekly therapy sessions","cost":15000,"xp":18,"coins":10},{"id":"B","label":"Use employee assistance program","cost":0,"xp":15,"coins":8},{"id":"C","label":"Self-help books and apps","cost":1500,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-324', 'groceries', 'cooking', 'Home Cooking Equipment', 'You want to cook more. But you need better tools.', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Full kitchen upgrade","cost":20000,"xp":10,"coins":5},{"id":"B","label":"A few essential quality items","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Make do with what you have","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-325', 'food', 'meal_delivery', 'Meal Delivery Service', 'Meal kit delivery could simplify your cooking.', ARRAY['young_adult'], 3, 6, 3, '[{"id":"A","label":"Premium meal kit subscription","cost":8000,"xp":5,"coins":2},{"id":"B","label":"Budget meal kit service","cost":5000,"xp":8,"coins":4},{"id":"C","label":"Plan meals and shop yourself","cost":3000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-326', 'dining', 'happy_hour', 'Happy Hour Spending', 'Coworkers head to happy hour every Friday. Join them?', ARRAY['young_adult'], 3, 6, 3, '[{"id":"A","label":"Full happy hour — drinks and apps","cost":3500,"xp":3,"coins":1},{"id":"B","label":"One drink, socialize","cost":1000,"xp":8,"coins":4},{"id":"C","label":"Skip — save money","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-327', 'entertainment', 'concert', 'Concert Festival Tickets', 'Your favorite music festival is selling early bird tickets.', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"VIP weekend pass","cost":40000,"xp":5,"coins":2},{"id":"B","label":"General admission one day","cost":10000,"xp":8,"coins":4},{"id":"C","label":"Listen to the playlist at home","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-328', 'entertainment', 'vacation', 'Vacation Planning', 'You have PTO saved up. Time for a real vacation?', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"International trip","cost":80000,"xp":5,"coins":2},{"id":"B","label":"Domestic road trip","cost":20000,"xp":10,"coins":5},{"id":"C","label":"Staycation — explore your own city","cost":3000,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-329', 'entertainment', 'weekend', 'Weekend Getaway', 'A last-minute weekend deal popped up. Go or save?', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Book it — you deserve it","cost":25000,"xp":5,"coins":2},{"id":"B","label":"Find a budget version nearby","cost":8000,"xp":10,"coins":5},{"id":"C","label":"Save the money for later","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-330', 'finance', 'insurance', 'Car Insurance Review', 'Your car insurance renewal is up. Shopping around could save money.', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Stay with current — convenience","cost":8000,"xp":5,"coins":2},{"id":"B","label":"Compare quotes and switch","cost":5000,"xp":15,"coins":8},{"id":"C","label":"Lower coverage to save","cost":3000,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-331', 'finance', 'compound', 'Compound Interest Lesson', 'You realize $100/month invested at 22 beats $200/month at 32.', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"Start investing now, even small","cost":10000,"xp":20,"coins":10},{"id":"B","label":"Read more about it first","cost":0,"xp":8,"coins":3},{"id":"C","label":"Investing is for later","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-332', 'finance', 'advisor', 'Financial Advisor', 'A financial advisor offers a free consultation. Worth your time?', ARRAY['young_adult'], 4, 8, 1, '[{"id":"A","label":"Hire an advisor (ongoing)","cost":15000,"xp":12,"coins":6},{"id":"B","label":"One-time consultation","cost":5000,"xp":10,"coins":5},{"id":"C","label":"DIY with free robo-advisor","cost":0,"xp":8,"coins":4}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-333', 'finance', 'bills', 'Bill Negotiation', 'Your phone bill seems high. Worth calling to negotiate?', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Call and negotiate hard","cost":0,"xp":15,"coins":8},{"id":"B","label":"Switch to a budget carrier","cost":0,"xp":12,"coins":6},{"id":"C","label":"Don''t bother, it''s fine","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-334', 'social', 'bachelor', 'Bachelor Party Invitation', 'Best friend''s bachelor party is a destination weekend.', ARRAY['young_adult'], 4, 8, 1, '[{"id":"A","label":"Go all in — full destination trip","cost":40000,"xp":5,"coins":2},{"id":"B","label":"Go but set a strict budget","cost":15000,"xp":10,"coins":5},{"id":"C","label":"Offer to plan a local alternative","cost":3000,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-335', 'social', 'cosign', 'Friend Asks You to Cosign', 'A friend can''t get a loan without a cosigner. They ask you.', ARRAY['young_adult'], 4, 8, 1, '[{"id":"A","label":"Cosign — you trust them","cost":0,"xp":3,"coins":1},{"id":"B","label":"Help them find alternatives","cost":0,"xp":12,"coins":6},{"id":"C","label":"Decline — too risky","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-336', 'shopping', 'influencer', 'Influencer Product Promo', 'Your favorite influencer is promoting a product with a discount code.', ARRAY['young_adult'], 3, 6, 3, '[{"id":"A","label":"Buy it — they wouldn''t promote junk","cost":5000,"xp":3,"coins":1},{"id":"B","label":"Research reviews first","cost":0,"xp":10,"coins":5},{"id":"C","label":"You don''t need it","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-337', 'health', 'dental', 'Dental Work Needed', 'The dentist says you need a crown. Insurance covers part of it.', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"Premium crown at specialist","cost":40000,"xp":10,"coins":5},{"id":"B","label":"Standard crown at regular dentist","cost":20000,"xp":12,"coins":6},{"id":"C","label":"Delay treatment (risky)","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-338', 'shopping', 'black_friday', 'Black Friday Deals', 'Your wishlist items are 40% off. But it''s stuff you can live without.', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Buy everything on the list","cost":25000,"xp":3,"coins":1},{"id":"B","label":"One planned purchase only","cost":5000,"xp":15,"coins":8},{"id":"C","label":"Close the browser","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-339', 'emergency', 'medical', 'Unexpected Medical Bill', 'You went to the ER. The bill is much more than expected.', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"Pay in full to avoid interest","cost":50000,"xp":8,"coins":3},{"id":"B","label":"Set up a payment plan","cost":50000,"xp":12,"coins":6},{"id":"C","label":"Negotiate the bill down","cost":30000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-340', 'finance', 'tax_refund', 'Tax Refund Windfall', 'You got a bigger tax refund than expected. What to do?', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"Treat yourself — you earned it","cost":30000,"xp":3,"coins":1},{"id":"B","label":"Split: half fun, half savings","cost":15000,"xp":12,"coins":6},{"id":"C","label":"All into emergency fund or debt","cost":0,"xp":18,"coins":10}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-341', 'social', 'mlm', 'Friend Selling MLM Products', 'A friend invites you to a sales party for their MLM business.', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Buy to support your friend","cost":5000,"xp":3,"coins":1},{"id":"B","label":"Go but don''t buy anything","cost":0,"xp":8,"coins":4},{"id":"C","label":"Politely decline the invitation","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-342', 'social', 'fundraiser', 'Coworker''s Kid Fundraiser', 'Third coworker this month selling their kid''s school fundraiser items.', ARRAY['young_adult'], 3, 6, 3, '[{"id":"A","label":"Buy from each one","cost":3000,"xp":5,"coins":2},{"id":"B","label":"Buy from one, politely pass on others","cost":1000,"xp":8,"coins":4},{"id":"C","label":"Politely decline all","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-343', 'social', 'holiday', 'Holiday Gift Exchange', 'Office Secret Santa has a $30 limit but people always go over.', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Go above the limit ($50)","cost":5000,"xp":5,"coins":2},{"id":"B","label":"Stick to the $30 limit","cost":3000,"xp":12,"coins":6},{"id":"C","label":"Suggest a charitable donation instead","cost":1000,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-344', 'social', 'baby_shower', 'Baby Shower Gift', 'A friend''s baby shower is coming up. Registry items are pricey.', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"Big registry item","cost":8000,"xp":5,"coins":2},{"id":"B","label":"Group gift with others","cost":3000,"xp":10,"coins":5},{"id":"C","label":"Handmade or budget gift","cost":1000,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-345', 'social', 'housewarming', 'Housewarming Gift', 'A friend bought their first home. Party this weekend.', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Nice wine and fancy gift","cost":5000,"xp":5,"coins":2},{"id":"B","label":"Practical housewarming gift","cost":2000,"xp":10,"coins":5},{"id":"C","label":"Bring homemade food","cost":500,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-346', 'social', 'gym_buddy', 'Gym Buddy Pressure', 'Your workout partner wants to join an expensive gym.', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Join the fancy gym together","cost":8000,"xp":5,"coins":2},{"id":"B","label":"Suggest a cheaper gym","cost":3000,"xp":10,"coins":5},{"id":"C","label":"Work out separately","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-347', 'social', 'reunion', 'Reunion Weekend', 'College reunion is coming up. Travel, hotel, outfits — it all adds up.', ARRAY['young_adult'], 4, 8, 1, '[{"id":"A","label":"Full weekend experience","cost":25000,"xp":5,"coins":2},{"id":"B","label":"Day trip only","cost":5000,"xp":10,"coins":5},{"id":"C","label":"Catch up online instead","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-348', 'social', 'volunteer', 'Volunteer Opportunity', 'A charity event needs volunteers. Costs some money to participate.', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Volunteer + donate to the cause","cost":5000,"xp":15,"coins":8},{"id":"B","label":"Volunteer time only","cost":0,"xp":12,"coins":6},{"id":"C","label":"Donate money instead of time","cost":3000,"xp":8,"coins":4}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-349', 'career', 'association', 'Professional Association Dues', 'Your industry association offers networking and certifications.', ARRAY['young_adult'], 3, 6, 1, '[{"id":"A","label":"Full membership + conference","cost":20000,"xp":12,"coins":6},{"id":"B","label":"Basic membership only","cost":5000,"xp":10,"coins":5},{"id":"C","label":"Network informally for free","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-350', 'social', 'alumni', 'Alumni Donation Request', 'Your alma mater asks for an annual donation.', ARRAY['young_adult'], 3, 6, 2, '[{"id":"A","label":"Generous donation ($500)","cost":50000,"xp":8,"coins":3},{"id":"B","label":"Small recurring donation ($10/mo)","cost":1000,"xp":10,"coins":5},{"id":"C","label":"Not while you still have loans","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

