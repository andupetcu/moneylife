-- Seed: expanded decision cards (DC-215 through DC-520)
-- Teen, Student, Young Adult, Parent, and Multi-persona cards

-- ============================================================
-- TEEN CARDS (DC-215 to DC-248) — persona: teen, levels 1-4
-- ============================================================

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-215', 'teen', 'first_job', 'First Day at Work', 'You got your first part-time job! What do you buy to celebrate?', ARRAY['teen'], 1, 3, 2, '[{"id":"A","label":"Splurge on new outfit for work","cost":8000,"xp":5,"coins":2},{"id":"B","label":"Get one nice shirt","cost":2000,"xp":10,"coins":5},{"id":"C","label":"Wear what you have","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-216', 'teen', 'school', 'School Supply Shopping', 'New school year means new supplies. What''s your plan?', ARRAY['teen'], 1, 3, 3, '[{"id":"A","label":"Top brand everything","cost":6000,"xp":3,"coins":1},{"id":"B","label":"Mix of nice and basic","cost":3000,"xp":10,"coins":5},{"id":"C","label":"Reuse last year''s stuff","cost":500,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-217', 'teen', 'social', 'Prom Planning', 'Prom season is here! Everyone''s going all out.', ARRAY['teen'], 1, 4, 1, '[{"id":"A","label":"Full package: suit/dress, limo, dinner","cost":15000,"xp":5,"coins":2},{"id":"B","label":"Nice outfit, skip the limo","cost":5000,"xp":10,"coins":5},{"id":"C","label":"Borrow outfit, go casual","cost":1000,"xp":15,"coins":8},{"id":"D","label":"Skip prom entirely","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-218', 'teen', 'electronics', 'Phone Upgrade Pressure', 'Your phone is a year old but your friends all got new ones.', ARRAY['teen'], 1, 4, 2, '[{"id":"A","label":"Buy the latest model","cost":80000,"xp":3,"coins":1},{"id":"B","label":"Get a refurbished model","cost":25000,"xp":10,"coins":5},{"id":"C","label":"Keep your current phone","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-219', 'teen', 'gaming', 'New Game Launch', 'The game everyone''s talking about just dropped.', ARRAY['teen'], 1, 3, 3, '[{"id":"A","label":"Buy deluxe edition day one","cost":7000,"xp":3,"coins":1},{"id":"B","label":"Wait for a sale","cost":0,"xp":12,"coins":6},{"id":"C","label":"Watch streams instead","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-220', 'teen', 'social_media', 'Social Media Trend', 'A viral trend requires buying a specific product to participate.', ARRAY['teen'], 1, 3, 3, '[{"id":"A","label":"Buy it for the content","cost":3000,"xp":3,"coins":1},{"id":"B","label":"DIY a cheaper version","cost":500,"xp":12,"coins":6},{"id":"C","label":"Skip the trend","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-221', 'teen', 'saving', 'First Car Fund', 'You''ve been thinking about saving for your first car.', ARRAY['teen'], 2, 4, 2, '[{"id":"A","label":"Open savings account, deposit weekly","cost":2000,"xp":18,"coins":10},{"id":"B","label":"Save loose change in a jar","cost":500,"xp":10,"coins":5},{"id":"C","label":"Worry about it later","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-222', 'teen', 'allowance', 'Allowance Day', 'You just got your weekly allowance. What''s the plan?', ARRAY['teen'], 1, 3, 4, '[{"id":"A","label":"Spend it all this weekend","cost":2500,"xp":3,"coins":1},{"id":"B","label":"Save half, spend half","cost":1250,"xp":15,"coins":8},{"id":"C","label":"Save it all","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-223', 'teen', 'food', 'School Lunch Decision', 'Cafeteria or bring your own? Daily choice, big impact.', ARRAY['teen'], 1, 3, 5, '[{"id":"A","label":"Buy cafeteria lunch","cost":800,"xp":3,"coins":1},{"id":"B","label":"Pack lunch from home","cost":200,"xp":12,"coins":6},{"id":"C","label":"Skip lunch, save money","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-224', 'teen', 'social', 'Birthday Party Budget', 'Your birthday is coming up! How big do you go?', ARRAY['teen'], 1, 3, 2, '[{"id":"A","label":"Rent a venue, invite everyone","cost":10000,"xp":5,"coins":2},{"id":"B","label":"House party with close friends","cost":3000,"xp":10,"coins":5},{"id":"C","label":"Movie night with best friends","cost":1500,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-225', 'teen', 'income', 'Babysitting Gig', 'A neighbor offers you a weekend babysitting job.', ARRAY['teen'], 1, 3, 3, '[{"id":"A","label":"Accept — good money","cost":0,"xp":15,"coins":8},{"id":"B","label":"Ask for more per hour","cost":0,"xp":10,"coins":5},{"id":"C","label":"Too busy with friends","cost":0,"xp":3,"coins":1}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-226', 'teen', 'school', 'School Fundraiser', 'Your school is selling items for a fundraiser. Pressure to participate.', ARRAY['teen'], 1, 3, 2, '[{"id":"A","label":"Buy a bunch to show support","cost":3000,"xp":5,"coins":2},{"id":"B","label":"Buy one item","cost":500,"xp":10,"coins":5},{"id":"C","label":"Volunteer time instead","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-227', 'teen', 'sports', 'Sports Equipment Upgrade', 'Your coach says better gear could improve your game.', ARRAY['teen'], 1, 4, 2, '[{"id":"A","label":"Buy top-tier equipment","cost":12000,"xp":5,"coins":2},{"id":"B","label":"Get decent mid-range gear","cost":4000,"xp":10,"coins":5},{"id":"C","label":"Use what you have","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-228', 'teen', 'school', 'Yearbook Purchase', 'Yearbooks are on sale. Everyone''s getting one.', ARRAY['teen'], 1, 3, 2, '[{"id":"A","label":"Yearbook + personalization package","cost":5000,"xp":5,"coins":2},{"id":"B","label":"Basic yearbook","cost":3000,"xp":8,"coins":4},{"id":"C","label":"Skip it — take your own photos","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-229', 'teen', 'school', 'Class Ring Decision', 'The class ring vendor is at school. Everyone''s ordering.', ARRAY['teen'], 2, 4, 1, '[{"id":"A","label":"Gold ring with all upgrades","cost":15000,"xp":3,"coins":1},{"id":"B","label":"Basic silver ring","cost":5000,"xp":8,"coins":4},{"id":"C","label":"Skip the ring","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-230', 'teen', 'travel', 'School Trip Opportunity', 'Your school offers an educational trip. It costs money but sounds amazing.', ARRAY['teen'], 1, 4, 1, '[{"id":"A","label":"Sign up — full cost","cost":15000,"xp":15,"coins":8},{"id":"B","label":"Ask about financial aid","cost":5000,"xp":12,"coins":6},{"id":"C","label":"Skip it this year","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-231', 'teen', 'summer', 'Summer Camp Choice', 'Summer''s coming. What are you doing?', ARRAY['teen'], 1, 3, 1, '[{"id":"A","label":"Specialty camp (sports/tech/art)","cost":20000,"xp":15,"coins":8},{"id":"B","label":"Community day camp","cost":5000,"xp":10,"coins":5},{"id":"C","label":"Stay home, find free activities","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-232', 'teen', 'education', 'Tutoring Decision', 'You''re struggling in math. A tutor could help but costs money.', ARRAY['teen'], 1, 4, 2, '[{"id":"A","label":"Hire a private tutor","cost":8000,"xp":18,"coins":10},{"id":"B","label":"Join a study group","cost":0,"xp":12,"coins":6},{"id":"C","label":"Use free online resources","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-233', 'teen', 'entertainment', 'Movie Night with Friends', 'Friends want to see the new blockbuster in IMAX.', ARRAY['teen'], 1, 3, 3, '[{"id":"A","label":"IMAX + popcorn + drinks","cost":3000,"xp":3,"coins":1},{"id":"B","label":"Regular showing, sneak in snacks","cost":1200,"xp":10,"coins":5},{"id":"C","label":"Wait and stream it at home","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-234', 'teen', 'entertainment', 'Concert Tickets', 'Your favorite artist is coming to town. Tickets are selling fast!', ARRAY['teen'], 1, 4, 1, '[{"id":"A","label":"VIP front row seats","cost":15000,"xp":3,"coins":1},{"id":"B","label":"General admission","cost":5000,"xp":8,"coins":4},{"id":"C","label":"Watch the livestream","cost":1000,"xp":10,"coins":5},{"id":"D","label":"Skip it","cost":0,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-235', 'teen', 'gaming', 'In-Game Purchase Temptation', 'A limited-time skin/item is available in your favorite game.', ARRAY['teen'], 1, 3, 4, '[{"id":"A","label":"Buy the premium bundle","cost":2500,"xp":3,"coins":1},{"id":"B","label":"Just the basic item","cost":500,"xp":8,"coins":4},{"id":"C","label":"Earn it through gameplay","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-236', 'teen', 'fashion', 'Sneaker Hype', 'Limited edition sneakers just dropped. Resale value is crazy.', ARRAY['teen'], 1, 4, 2, '[{"id":"A","label":"Buy at retail — camp out","cost":15000,"xp":5,"coins":2},{"id":"B","label":"Get a similar looking pair","cost":4000,"xp":10,"coins":5},{"id":"C","label":"Your current shoes are fine","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-237', 'teen', 'food', 'Fast Food After School', 'Everyone''s going to get food after school. Join them?', ARRAY['teen'], 1, 3, 5, '[{"id":"A","label":"Full meal combo","cost":1200,"xp":3,"coins":1},{"id":"B","label":"Just a drink","cost":300,"xp":8,"coins":4},{"id":"C","label":"Head home for a snack","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-238', 'teen', 'social', 'Club Dues', 'Your school club requires membership dues this semester.', ARRAY['teen'], 1, 3, 2, '[{"id":"A","label":"Pay dues + buy club merch","cost":3000,"xp":8,"coins":4},{"id":"B","label":"Pay just the dues","cost":1000,"xp":12,"coins":6},{"id":"C","label":"Find a free club instead","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-239', 'teen', 'gifts', 'DIY vs Store Gift', 'Your friend''s birthday is coming up. What kind of gift?', ARRAY['teen'], 1, 3, 3, '[{"id":"A","label":"Buy something expensive","cost":4000,"xp":5,"coins":2},{"id":"B","label":"Thoughtful mid-range gift","cost":1500,"xp":10,"coins":5},{"id":"C","label":"Make something personal","cost":300,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-240', 'teen', 'electronics', 'Tech Accessory', 'You want a new phone case, earbuds, or charger.', ARRAY['teen'], 1, 3, 3, '[{"id":"A","label":"Premium brand accessories","cost":5000,"xp":3,"coins":1},{"id":"B","label":"Good quality off-brand","cost":1500,"xp":10,"coins":5},{"id":"C","label":"Use what you have","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-241', 'teen', 'education', 'Online Course Interest', 'You found an online course to learn coding/art/music.', ARRAY['teen'], 1, 4, 2, '[{"id":"A","label":"Paid premium course","cost":5000,"xp":18,"coins":10},{"id":"B","label":"Free course with ads","cost":0,"xp":12,"coins":6},{"id":"C","label":"Learn from YouTube","cost":0,"xp":10,"coins":5}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-242', 'teen', 'entertainment', 'Streaming Subscription', 'You want your own streaming service account.', ARRAY['teen'], 1, 3, 3, '[{"id":"A","label":"Premium plan, no ads","cost":1500,"xp":3,"coins":1},{"id":"B","label":"Basic plan with ads","cost":700,"xp":8,"coins":4},{"id":"C","label":"Share with family","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-243', 'teen', 'transport', 'Bike or Skateboard Upgrade', 'Your ride is getting old. Time for an upgrade?', ARRAY['teen'], 1, 3, 2, '[{"id":"A","label":"Brand new top model","cost":10000,"xp":5,"coins":2},{"id":"B","label":"Used but good condition","cost":3000,"xp":12,"coins":6},{"id":"C","label":"Fix up your current one","cost":500,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-244', 'teen', 'pet', 'Pet Care Costs', 'Your pet needs food, toys, and a vet checkup.', ARRAY['teen'], 1, 4, 3, '[{"id":"A","label":"Premium food + toys + full checkup","cost":5000,"xp":10,"coins":5},{"id":"B","label":"Basic food + checkup only","cost":2500,"xp":12,"coins":6},{"id":"C","label":"Just basic food for now","cost":1000,"xp":5,"coins":2}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-245', 'teen', 'food', 'Vending Machine Habit', 'You pass the vending machine every day. It adds up.', ARRAY['teen'], 1, 3, 5, '[{"id":"A","label":"Get a snack and drink daily","cost":300,"xp":3,"coins":1},{"id":"B","label":"Only when really hungry","cost":100,"xp":8,"coins":4},{"id":"C","label":"Bring snacks from home","cost":0,"xp":12,"coins":6}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-246', 'teen', 'fashion', 'Clothing Trend', 'A new fashion trend is everywhere on social media.', ARRAY['teen'], 1, 3, 3, '[{"id":"A","label":"Buy the full trendy look","cost":6000,"xp":3,"coins":1},{"id":"B","label":"Get one key piece","cost":2000,"xp":8,"coins":4},{"id":"C","label":"Style what you already own","cost":0,"xp":15,"coins":8}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-247', 'teen', 'saving', 'Piggy Bank Decision', 'You''ve saved up some money. What do you do with it?', ARRAY['teen'], 1, 3, 2, '[{"id":"A","label":"Spend it on something fun","cost":5000,"xp":3,"coins":1},{"id":"B","label":"Put half in savings, spend half","cost":2500,"xp":12,"coins":6},{"id":"C","label":"Keep saving toward a goal","cost":0,"xp":18,"coins":10}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

INSERT INTO decision_cards (id, category, subcategory, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, consequences)
VALUES ('DC-248', 'teen', 'health', 'Skincare Routine', 'Everyone''s into skincare now. Products aren''t cheap.', ARRAY['teen'], 1, 3, 3, '[{"id":"A","label":"Full premium skincare set","cost":5000,"xp":3,"coins":1},{"id":"B","label":"Drugstore basics","cost":1500,"xp":10,"coins":5},{"id":"C","label":"Soap and water works fine","cost":0,"xp":8,"coins":3}]', '{}')
ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, persona_tags = EXCLUDED.persona_tags, level_range_min = EXCLUDED.level_range_min, level_range_max = EXCLUDED.level_range_max;

