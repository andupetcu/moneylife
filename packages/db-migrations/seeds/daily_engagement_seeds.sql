-- Seed data for daily engagement: 55 financial tips + 25 daily challenges

-- ============================================================
-- DAILY TIPS (55 total)
-- Categories: budgeting, saving, credit, investing, insurance, general
-- ============================================================

-- BUDGETING tips (10)
INSERT INTO daily_tips (category, persona, min_level, tip_text, tip_source) VALUES
('budgeting', NULL, 1, 'The 50/30/20 rule: spend 50% on needs, 30% on wants, and 20% on savings and debt repayment.', 'Senator Elizabeth Warren, "All Your Worth"'),
('budgeting', NULL, 1, 'Track every expense for one month. Most people are surprised to find they spend 15-20% more than they think.', 'Journal of Consumer Research'),
('budgeting', NULL, 1, 'Automate your budget by setting up separate accounts for bills, spending, and savings right after payday.', NULL),
('budgeting', 'teen', 1, 'Start budgeting your allowance now. Even small amounts teach habits that will save you thousands later.', NULL),
('budgeting', 'student', 1, 'Use your student ID for discounts everywhere — restaurants, software, transport, and entertainment.', NULL),
('budgeting', 'parent', 1, 'Involve your children in age-appropriate budget discussions. Kids who learn about money early make better financial decisions as adults.', 'University of Cambridge study'),
('budgeting', NULL, 2, 'Review subscriptions quarterly. The average person spends over $200/month on subscriptions they barely use.', 'West Monroe Partners survey'),
('budgeting', NULL, 1, 'Use the 24-hour rule: wait a full day before any non-essential purchase over 50 RON. Most impulse urges fade.', NULL),
('budgeting', 'young_adult', 1, 'Your first apartment budget should include utilities, internet, insurance, and a maintenance fund — not just rent.', NULL),
('budgeting', NULL, 3, 'Zero-based budgeting means giving every unit of currency a job. Unassigned money tends to disappear.', NULL);

-- SAVING tips (10)
INSERT INTO daily_tips (category, persona, min_level, tip_text, tip_source) VALUES
('saving', NULL, 1, 'Emergency funds should cover 3-6 months of expenses. Start with a goal of just 1 month and build from there.', 'Bankrate Financial Security Index'),
('saving', NULL, 1, 'Pay yourself first: transfer savings on payday before you spend anything else.', 'George S. Clason, "The Richest Man in Babylon"'),
('saving', NULL, 1, 'The latte factor: small daily expenses of 15 RON add up to over 5,400 RON per year.', 'David Bach, "The Automatic Millionaire"'),
('saving', 'teen', 1, 'Open a savings account as early as possible. Even saving 10% of gifts and allowance builds a powerful habit.', NULL),
('saving', 'student', 1, 'Set up automatic transfers of even 50 RON per month. Consistency matters more than amount when building savings habits.', NULL),
('saving', NULL, 2, 'Keep your emergency fund in a high-yield savings account, not under the mattress. Inflation erodes idle cash.', NULL),
('saving', 'parent', 1, 'Match your children''s savings contributions. It teaches them the concept of employer matching in retirement plans.', NULL),
('saving', NULL, 1, 'Use the 30-day savings rule for big purchases: put the money aside for 30 days. If you still want it, buy it.', NULL),
('saving', NULL, 3, 'Aim to save at least 3 months of expenses before investing. Investing without an emergency fund is risky.', NULL),
('saving', 'young_adult', 1, 'Your first savings goal should be 1 month of rent plus a security deposit — your housing safety net.', NULL);

-- CREDIT tips (10)
INSERT INTO daily_tips (category, persona, min_level, tip_text, tip_source) VALUES
('credit', NULL, 1, 'Your payment history is the single biggest factor in your credit score, making up about 35% of the total.', 'FICO'),
('credit', NULL, 1, 'Keep credit card utilization below 30%. Using 70%+ of your limit hurts your score even if you pay in full.', 'Experian'),
('credit', NULL, 2, 'Never close your oldest credit card. Length of credit history accounts for 15% of your credit score.', 'FICO'),
('credit', 'student', 1, 'A student credit card with a small limit is a great way to start building credit history responsibly.', NULL),
('credit', NULL, 1, 'Set up autopay for at least the minimum payment on every credit card to avoid late payment marks.', NULL),
('credit', NULL, 2, 'Check your credit report for free annually. Errors on credit reports affect 1 in 5 consumers.', 'FTC study'),
('credit', NULL, 3, 'A mix of credit types (cards, installment loans) can improve your score, but never take debt just for score points.', NULL),
('credit', 'young_adult', 1, 'Your first credit card should have no annual fee. Use it for one recurring bill and pay it off monthly.', NULL),
('credit', NULL, 1, 'Late payments stay on your credit report for 7 years. One missed payment can drop your score 50-100 points.', 'Experian data'),
('credit', 'teen', 1, 'You can start building credit at 18. Being added as an authorized user on a parent''s card can help even earlier.', NULL);

-- INVESTING tips (10)
INSERT INTO daily_tips (category, persona, min_level, tip_text, tip_source) VALUES
('investing', NULL, 2, 'Time in the market beats timing the market. A study showed that missing the 10 best days over 20 years cuts returns in half.', 'J.P. Morgan Asset Management'),
('investing', NULL, 2, 'Index funds have lower fees than actively managed funds and outperform 80%+ of active managers over 15 years.', 'S&P SPIVA Scorecard'),
('investing', NULL, 3, 'Diversification is the only free lunch in investing. Spread risk across asset classes, sectors, and regions.', 'Harry Markowitz, Nobel laureate'),
('investing', NULL, 2, 'The Rule of 72: divide 72 by your annual return rate to estimate how many years it takes to double your money.', NULL),
('investing', NULL, 3, 'Compound interest is the eighth wonder of the world. Starting 10 years earlier can mean twice the retirement savings.', NULL),
('investing', 'student', 2, 'Start investing with even 100 RON/month during university. Those early contributions grow the most over a career.', NULL),
('investing', NULL, 2, 'Never invest money you will need within the next 3-5 years. Short-term market drops can be severe.', NULL),
('investing', NULL, 4, 'Rebalance your portfolio annually. Winning assets become overweighted and increase your risk beyond your target.', NULL),
('investing', 'young_adult', 2, 'Your 20s are the most powerful decade for investing. 1 RON invested at 22 is worth more than 3 RON invested at 42.', NULL),
('investing', NULL, 3, 'Dollar-cost averaging (investing fixed amounts regularly) reduces the risk of buying at market peaks.', NULL);

-- INSURANCE tips (8)
INSERT INTO daily_tips (category, persona, min_level, tip_text, tip_source) VALUES
('insurance', NULL, 1, 'Health insurance is not optional. A single hospital visit can cost more than a year of premiums.', NULL),
('insurance', NULL, 2, 'Increasing your deductible can lower premiums by 15-30%, but make sure you can cover the higher deductible from savings.', NULL),
('insurance', 'parent', 1, 'Life insurance is essential when others depend on your income. Term life insurance is affordable and straightforward.', NULL),
('insurance', NULL, 2, 'Bundle home and auto insurance with the same provider for discounts of 10-25%.', NULL),
('insurance', 'young_adult', 1, 'Renter''s insurance costs just 15-30 RON/month and covers your belongings against theft, fire, and water damage.', NULL),
('insurance', NULL, 3, 'Review your insurance coverage annually. Life changes like marriage, kids, or a new home require updated coverage.', NULL),
('insurance', 'student', 1, 'Check if your university offers student health insurance. It is often cheaper than private plans.', NULL),
('insurance', NULL, 2, 'An emergency fund and insurance work together: insurance covers catastrophes, your fund covers deductibles and smaller surprises.', NULL);

-- GENERAL tips (7)
INSERT INTO daily_tips (category, persona, min_level, tip_text, tip_source) VALUES
('general', NULL, 1, 'Financial literacy is the #1 skill schools don''t teach. You are already ahead by playing this game.', NULL),
('general', NULL, 1, 'Talk about money with trusted friends or family. Financial taboos keep people from learning and getting help.', NULL),
('general', NULL, 1, 'Avoid lifestyle inflation: when your income goes up, increase savings first, not spending.', NULL),
('general', 'teen', 1, 'The money habits you build between ages 14-18 predict your financial behavior for the rest of your life.', 'Cambridge University study'),
('general', NULL, 2, 'Beware of ''buy now, pay later'' schemes. They make spending feel painless but debt accumulates quickly.', NULL),
('general', 'parent', 2, 'Give children an allowance tied to responsibilities. It teaches earning, saving, and spending decisions simultaneously.', NULL),
('general', NULL, 1, 'Write down your financial goals. People who write goals are 42% more likely to achieve them.', 'Dominican University study');


-- ============================================================
-- DAILY CHALLENGES (25 total)
-- Types: savings, spending_freeze, quiz, budget, social
-- Check types: manual_claim, auto_savings, auto_no_spending, auto_budget
-- ============================================================

INSERT INTO daily_challenges (challenge_type, title, description, persona, min_level, reward_xp, reward_coins, check_type, check_params) VALUES
-- SAVINGS challenges (6)
('savings', 'Save 10% of your income', 'Transfer at least 10% of today''s income to your savings account.', NULL, 1, 20, 15, 'auto_savings', '{"min_percent": 10}'),
('savings', 'Transfer to savings', 'Make any transfer to your savings account today.', NULL, 1, 15, 10, 'auto_savings', '{"min_amount": 1}'),
('savings', 'Big saver day', 'Transfer at least 500 RON to savings today.', NULL, 2, 30, 25, 'auto_savings', '{"min_amount": 500}'),
('savings', 'Emergency fund builder', 'Add to your savings — every bit brings you closer to 3 months of expenses.', NULL, 1, 20, 15, 'auto_savings', '{"min_amount": 1}'),
('savings', 'Save before you spend', 'Transfer money to savings before making any other transaction today.', NULL, 2, 25, 20, 'manual_claim', '{}'),
('savings', 'Allowance saver', 'Save at least half of today''s allowance or income.', 'teen', 1, 20, 15, 'auto_savings', '{"min_percent": 50}'),

-- SPENDING FREEZE challenges (4)
('spending_freeze', 'No-spend day', 'Make no discretionary purchases today. Bills and essentials are okay.', NULL, 1, 25, 20, 'auto_no_spending', '{"allow_bills": true}'),
('spending_freeze', 'Complete spending freeze', 'Spend absolutely nothing today. A true zero-spend day.', NULL, 2, 35, 25, 'auto_no_spending', '{"allow_bills": false}'),
('spending_freeze', 'Wants-free day', 'Avoid all ''want'' purchases today. Only spend on true needs.', NULL, 1, 20, 15, 'auto_no_spending', '{"allow_bills": true}'),
('spending_freeze', 'Entertainment fast', 'Skip entertainment spending today and find free activities instead.', NULL, 1, 15, 10, 'manual_claim', '{}'),

-- BUDGET challenges (5)
('budget', 'Stay under budget', 'Keep today''s total spending under 80% of your daily budget.', NULL, 1, 20, 15, 'auto_budget', '{"max_percent": 80}'),
('budget', 'Perfect budget day', 'Keep spending within your budget categories today — no category over 100%.', NULL, 2, 30, 20, 'auto_budget', '{"max_percent": 100}'),
('budget', 'Frugal champion', 'Spend less than 50% of your daily budget today.', NULL, 2, 30, 25, 'auto_budget', '{"max_percent": 50}'),
('budget', 'Student budget master', 'Keep all spending within your student budget today.', 'student', 1, 20, 15, 'auto_budget', '{"max_percent": 100}'),
('budget', 'Family budget check', 'Review and stay within your family budget today.', 'parent', 1, 20, 15, 'manual_claim', '{}'),

-- QUIZ challenges (6)
('quiz', 'What is compound interest?', 'Compound interest is interest earned on both the principal and previously accumulated interest. Claim this reward after reading the tip!', NULL, 1, 15, 10, 'manual_claim', '{}'),
('quiz', 'Credit score basics', 'Your credit score ranges from 300-850 and affects loan rates, rental applications, and more. Knowledge is power!', NULL, 1, 15, 10, 'manual_claim', '{}'),
('quiz', 'The Rule of 72', 'Divide 72 by your annual return rate to estimate doubling time. At 8% return, money doubles in about 9 years.', NULL, 2, 15, 10, 'manual_claim', '{}'),
('quiz', 'What is inflation?', 'Inflation is the rate at which prices rise over time, reducing your purchasing power. Savings must outpace inflation to grow.', NULL, 1, 15, 10, 'manual_claim', '{}'),
('quiz', 'Emergency fund 101', 'An emergency fund covers 3-6 months of expenses for unexpected events like job loss, medical bills, or car repairs.', NULL, 1, 15, 10, 'manual_claim', '{}'),
('quiz', 'Needs vs wants', 'Needs are essentials like food, shelter, and transport. Wants are everything else. Knowing the difference is the foundation of budgeting.', NULL, 1, 15, 10, 'manual_claim', '{}'),

-- SOCIAL challenges (4)
('social', 'Check the leaderboard', 'Visit the leaderboard and see how you compare to other players.', NULL, 1, 10, 10, 'manual_claim', '{}'),
('social', 'Add a friend', 'Send a friend request to another MoneyLife player.', NULL, 1, 15, 15, 'manual_claim', '{}'),
('social', 'Share your progress', 'Check your monthly report and compare your progress to last month.', NULL, 2, 15, 10, 'manual_claim', '{}'),
('social', 'Financial discussion', 'Talk about one financial topic you learned in MoneyLife with a friend or family member today.', NULL, 1, 20, 15, 'manual_claim', '{}');
