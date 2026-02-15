
-- ============================================================
-- STUDENT CARDS (DC-249 to DC-280) — persona: student, levels 1-6
-- ============================================================

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-249', 'education', 'textbooks', 'Textbook Dilemma', 'New semester, new books. They cost a fortune.', ARRAY['student'], 1, 4, 2, '[{"id":"A","label":"Buy all new from bookstore","cost":30000,"xp":5,"coins":2},{"id":"B","label":"Rent or buy used","cost":12000,"xp":12,"coins":6},{"id":"C","label":"Find free PDFs and library copies","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-250', 'housing', 'dorm', 'Dorm Room Furnishing', 'Your dorm room needs some personality and comfort.', ARRAY['student'], 1, 3, 1, '[{"id":"A","label":"Full makeover (lights, posters, bedding)","cost":15000,"xp":5,"coins":2},{"id":"B","label":"A few key comfort items","cost":5000,"xp":10,"coins":5},{"id":"C","label":"Keep it minimal","cost":1000,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-251', 'education', 'abroad', 'Study Abroad Opportunity', 'A semester abroad program is available. Life-changing but expensive.', ARRAY['student'], 2, 4, 1, '[{"id":"A","label":"Full study abroad experience","cost":100000,"xp":20,"coins":10},{"id":"B","label":"Short summer program instead","cost":30000,"xp":15,"coins":8},{"id":"C","label":"Study abroad can wait","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-252', 'career', 'internship', 'Internship Choice', 'You have two offers: paid but boring, or unpaid at your dream company.', ARRAY['student'], 2, 4, 1, '[{"id":"A","label":"Take the paid internship","cost":0,"xp":12,"coins":8},{"id":"B","label":"Unpaid dream internship","cost":0,"xp":15,"coins":5},{"id":"C","label":"Skip internship, work part-time","cost":0,"xp":8,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-253', 'finance', 'loans', 'Student Loan Decision', 'Financial aid doesn''t cover everything. Take out loans?', ARRAY['student'], 1, 4, 1, '[{"id":"A","label":"Borrow the full amount","cost":0,"xp":3,"coins":1},{"id":"B","label":"Borrow only what you need","cost":0,"xp":15,"coins":8},{"id":"C","label":"Work more hours to avoid loans","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-254', 'food', 'meal_plan', 'Meal Plan Renewal', 'Time to pick your meal plan for next semester.', ARRAY['student'], 1, 4, 2, '[{"id":"A","label":"Unlimited meal plan","cost":25000,"xp":5,"coins":2},{"id":"B","label":"Basic plan + some cooking","cost":15000,"xp":12,"coins":6},{"id":"C","label":"No plan — cook everything yourself","cost":8000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-255', 'social', 'campus', 'Campus Activities Fair', 'So many clubs and activities to join! Some have fees.', ARRAY['student'], 1, 3, 2, '[{"id":"A","label":"Join three clubs","cost":6000,"xp":10,"coins":5},{"id":"B","label":"Pick one meaningful club","cost":2000,"xp":12,"coins":6},{"id":"C","label":"Stick to free activities","cost":0,"xp":8,"coins":4}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-256', 'entertainment', 'spring_break', 'Spring Break Plans', 'Everyone''s booking trips for spring break.', ARRAY['student'], 1, 4, 1, '[{"id":"A","label":"Beach resort with friends","cost":30000,"xp":5,"coins":2},{"id":"B","label":"Budget road trip","cost":8000,"xp":10,"coins":5},{"id":"C","label":"Staycation and save money","cost":1000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-257', 'education', 'graduation', 'Graduation Costs', 'Cap, gown, announcements, photos — graduation adds up.', ARRAY['student'], 3, 4, 1, '[{"id":"A","label":"Full graduation package","cost":15000,"xp":5,"coins":2},{"id":"B","label":"Just cap and gown","cost":5000,"xp":10,"coins":5},{"id":"C","label":"Borrow from a friend who graduated","cost":500,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-258', 'shopping', 'laptop', 'Laptop for School', 'Your laptop is struggling. Classes need a reliable machine.', ARRAY['student'], 1, 4, 1, '[{"id":"A","label":"Latest MacBook Pro","cost":120000,"xp":5,"coins":2},{"id":"B","label":"Solid mid-range laptop","cost":45000,"xp":12,"coins":6},{"id":"C","label":"Refurbished or Chromebook","cost":15000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-259', 'dining', 'study', 'Coffee Shop Study Sessions', 'Studying at the coffee shop means buying drinks.', ARRAY['student'], 1, 4, 4, '[{"id":"A","label":"Daily fancy latte","cost":600,"xp":3,"coins":1},{"id":"B","label":"Basic drip coffee","cost":250,"xp":8,"coins":4},{"id":"C","label":"Brew at home, study at library","cost":50,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-260', 'social', 'greek', 'Greek Life Dues', 'Fraternity/sorority rush is here. Dues are steep but connections are valuable.', ARRAY['student'], 1, 3, 1, '[{"id":"A","label":"Join — pay full semester dues","cost":20000,"xp":8,"coins":4},{"id":"B","label":"Join a co-ed service frat (cheaper)","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Make friends through free clubs","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-261', 'transport', 'parking', 'Campus Parking Pass', 'Driving to campus means paying for parking or finding alternatives.', ARRAY['student'], 1, 4, 2, '[{"id":"A","label":"Premium parking pass","cost":10000,"xp":5,"coins":2},{"id":"B","label":"Remote lot (cheaper, longer walk)","cost":4000,"xp":10,"coins":5},{"id":"C","label":"Take the bus or bike","cost":1000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-262', 'finance', 'insurance', 'Renter''s Insurance', 'Your landlord recommends renter''s insurance for your apartment.', ARRAY['student'], 2, 4, 1, '[{"id":"A","label":"Get comprehensive coverage","cost":3000,"xp":15,"coins":8},{"id":"B","label":"Basic coverage only","cost":1500,"xp":12,"coins":6},{"id":"C","label":"Risk going without","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-263', 'entertainment', 'travel', 'Winter Break Travel', 'Going home for winter break. Flights are expensive.', ARRAY['student'], 1, 4, 1, '[{"id":"A","label":"Book a flight last minute","cost":25000,"xp":3,"coins":1},{"id":"B","label":"Book early for cheaper fare","cost":12000,"xp":12,"coins":6},{"id":"C","label":"Get a ride with a friend","cost":3000,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-264', 'housing', 'summer', 'Summer Housing', 'Your lease ends but you have a summer internship in town.', ARRAY['student'], 2, 4, 1, '[{"id":"A","label":"Keep your apartment year-round","cost":30000,"xp":5,"coins":2},{"id":"B","label":"Sublet a cheaper room","cost":15000,"xp":12,"coins":6},{"id":"C","label":"Find someone who needs a housesitter","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-265', 'education', 'supplies', 'Study Group Snacks', 'You''re hosting the study group tonight. Need snacks.', ARRAY['student'], 1, 4, 3, '[{"id":"A","label":"Order pizza for everyone","cost":3000,"xp":5,"coins":2},{"id":"B","label":"Chips and drinks","cost":1000,"xp":10,"coins":5},{"id":"C","label":"Everyone brings their own","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-266', 'career', 'professional', 'Professional Headshot', 'LinkedIn needs a good photo. Professional shots cost money.', ARRAY['student'], 2, 4, 1, '[{"id":"A","label":"Professional photographer","cost":8000,"xp":10,"coins":5},{"id":"B","label":"Career center free session","cost":0,"xp":12,"coins":6},{"id":"C","label":"Friend takes it with good lighting","cost":0,"xp":8,"coins":4}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-267', 'career', 'interview', 'Interview Outfit', 'Big job interview coming up. Need to look sharp.', ARRAY['student'], 2, 4, 1, '[{"id":"A","label":"Buy a full professional outfit","cost":15000,"xp":8,"coins":4},{"id":"B","label":"One key piece, mix with existing","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Borrow from a friend","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-268', 'career', 'networking', 'Career Fair Prep', 'Career fair next week. Do you invest in prep materials?', ARRAY['student'], 2, 4, 2, '[{"id":"A","label":"Resume printing + portfolio + new clothes","cost":8000,"xp":10,"coins":5},{"id":"B","label":"Print resumes, wear what you have","cost":1000,"xp":12,"coins":6},{"id":"C","label":"Wing it with a digital resume","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-269', 'finance', 'credit', 'First Credit Card', 'A credit card company is offering a student card. Good for building credit.', ARRAY['student'], 2, 4, 1, '[{"id":"A","label":"Get it, use responsibly for building credit","cost":0,"xp":18,"coins":10},{"id":"B","label":"Get a secured card (safer)","cost":5000,"xp":15,"coins":8},{"id":"C","label":"Too risky, stick to debit","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-270', 'housing', 'apartment', 'First Apartment Deposit', 'Moving off campus. Need first and last month plus security.', ARRAY['student'], 2, 4, 1, '[{"id":"A","label":"Nice place near campus","cost":40000,"xp":5,"coins":2},{"id":"B","label":"Affordable place with roommates","cost":20000,"xp":12,"coins":6},{"id":"C","label":"Stay in dorms another year","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-271', 'entertainment', 'streaming', 'Shared Streaming Accounts', 'Friends want to split streaming subscriptions.', ARRAY['student'], 1, 4, 3, '[{"id":"A","label":"Pay for your own accounts","cost":3000,"xp":5,"coins":2},{"id":"B","label":"Split costs with friends","cost":1000,"xp":15,"coins":8},{"id":"C","label":"Use free alternatives","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-272', 'education', 'project', 'Group Project Supplies', 'Your group project needs materials. Who pays?', ARRAY['student'], 1, 4, 2, '[{"id":"A","label":"Cover it all yourself","cost":4000,"xp":5,"coins":2},{"id":"B","label":"Split costs equally","cost":1500,"xp":12,"coins":6},{"id":"C","label":"Use only free resources","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-273', 'dining', 'late_night', 'Late Night Study Snacks', 'It''s midnight, you''re studying, and you''re starving.', ARRAY['student'], 1, 4, 4, '[{"id":"A","label":"Order delivery","cost":2500,"xp":3,"coins":1},{"id":"B","label":"Vending machine run","cost":500,"xp":5,"coins":2},{"id":"C","label":"Ramen from the pantry","cost":100,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-274', 'career', 'side_gig', 'Tutoring Side Gig', 'Younger students want help in a subject you''re good at.', ARRAY['student'], 2, 4, 2, '[{"id":"A","label":"Start tutoring for pay","cost":0,"xp":18,"coins":10},{"id":"B","label":"Volunteer tutoring for resume","cost":0,"xp":12,"coins":5},{"id":"C","label":"Too busy with your own studies","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-275', 'health', 'fitness', 'Campus Gym Membership', 'The campus gym has a semester pass. Is it worth it?', ARRAY['student'], 1, 4, 2, '[{"id":"A","label":"Premium gym with classes","cost":10000,"xp":10,"coins":5},{"id":"B","label":"Basic campus gym access","cost":3000,"xp":12,"coins":6},{"id":"C","label":"Run outside for free","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-276', 'social', 'alumni', 'Alumni Association', 'Before graduating, the alumni association offers a discounted lifetime membership.', ARRAY['student'], 3, 4, 1, '[{"id":"A","label":"Lifetime membership","cost":15000,"xp":10,"coins":5},{"id":"B","label":"One-year trial membership","cost":3000,"xp":8,"coins":4},{"id":"C","label":"Skip — network on your own","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-277', 'education', 'thesis', 'Thesis Printing and Binding', 'Your thesis needs to be professionally printed and bound.', ARRAY['student'], 3, 4, 1, '[{"id":"A","label":"Premium hardcover binding","cost":5000,"xp":5,"coins":2},{"id":"B","label":"Standard spiral binding","cost":1500,"xp":10,"coins":5},{"id":"C","label":"Digital-only submission","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-278', 'education', 'library', 'Overdue Library Books', 'You have overdue library books. Fines are adding up.', ARRAY['student'], 1, 4, 3, '[{"id":"A","label":"Pay fines and keep borrowing","cost":1500,"xp":5,"coins":2},{"id":"B","label":"Return books, switch to digital","cost":500,"xp":12,"coins":6},{"id":"C","label":"Set up reminders, avoid future fines","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-279', 'transport', 'car', 'Used Car vs No Car', 'Having a car would be convenient but it''s a big expense.', ARRAY['student'], 2, 4, 1, '[{"id":"A","label":"Buy a reliable used car","cost":60000,"xp":8,"coins":3},{"id":"B","label":"Get a cheap beater","cost":20000,"xp":10,"coins":5},{"id":"C","label":"Stick with transit and rides","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-280', 'social', 'party', 'End of Semester Party', 'Finals are over! Time to celebrate. Or is it?', ARRAY['student'], 1, 4, 2, '[{"id":"A","label":"Host a big party","cost":5000,"xp":5,"coins":2},{"id":"B","label":"Go to someone else''s party","cost":1000,"xp":8,"coins":4},{"id":"C","label":"Quiet celebration, save money","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

