// Badge evaluation engine — 60 badges from rewards-system.md §2

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type BadgeCategory = 'savings' | 'credit' | 'budget' | 'investment' | 'life_event' | 'engagement' | 'progression';

export interface BadgeCondition {
  type: 'threshold' | 'streak' | 'event' | 'compound';
  metric?: string;
  value?: number;
  duration?: number; // game months
  conditions?: BadgeCondition[];
  operator?: 'and' | 'or';
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  rarity: BadgeRarity;
  category: BadgeCategory;
  condition: BadgeCondition;
  coinReward: number;
  xpReward: number;
  hidden: boolean;
}

export const BADGE_CATALOG: BadgeDefinition[] = [
  // Savings (1-10)
  { id: 'BDG-SAVINGS-001', name: 'First Saver', description: 'Make your first deposit into a savings account', rarity: 'common', category: 'savings', condition: { type: 'threshold', metric: 'savings_deposits', value: 1 }, coinReward: 10, xpReward: 15, hidden: false },
  { id: 'BDG-SAVINGS-002', name: 'Consistent Saver', description: 'Make savings deposits in 4 consecutive months', rarity: 'common', category: 'savings', condition: { type: 'streak', metric: 'monthly_savings_deposit', value: 4 }, coinReward: 10, xpReward: 20, hidden: false },
  { id: 'BDG-SAVINGS-003', name: 'Emergency Ready', description: 'Build emergency fund >= 1 month expenses', rarity: 'rare', category: 'savings', condition: { type: 'threshold', metric: 'emergency_fund_months', value: 1 }, coinReward: 25, xpReward: 30, hidden: false },
  { id: 'BDG-SAVINGS-004', name: 'Safety Net', description: 'Build emergency fund >= 3 months expenses', rarity: 'rare', category: 'savings', condition: { type: 'threshold', metric: 'emergency_fund_months', value: 3 }, coinReward: 25, xpReward: 40, hidden: false },
  { id: 'BDG-SAVINGS-005', name: 'Fortress', description: 'Build emergency fund >= 6 months expenses', rarity: 'epic', category: 'savings', condition: { type: 'threshold', metric: 'emergency_fund_months', value: 6 }, coinReward: 50, xpReward: 60, hidden: false },
  { id: 'BDG-SAVINGS-006', name: 'Goal Getter', description: 'Complete any savings goal', rarity: 'common', category: 'savings', condition: { type: 'threshold', metric: 'completed_savings_goals', value: 1 }, coinReward: 10, xpReward: 15, hidden: false },
  { id: 'BDG-SAVINGS-007', name: 'Goal Crusher', description: 'Complete 5 savings goals', rarity: 'rare', category: 'savings', condition: { type: 'threshold', metric: 'completed_savings_goals', value: 5 }, coinReward: 25, xpReward: 35, hidden: false },
  { id: 'BDG-SAVINGS-008', name: 'Goal Legend', description: 'Complete 15 savings goals', rarity: 'epic', category: 'savings', condition: { type: 'threshold', metric: 'completed_savings_goals', value: 15 }, coinReward: 50, xpReward: 60, hidden: false },
  { id: 'BDG-SAVINGS-009', name: 'Savings Rate Star', description: 'Save >= 20% of income for 3 consecutive months', rarity: 'rare', category: 'savings', condition: { type: 'compound', operator: 'and', conditions: [{ type: 'threshold', metric: 'savings_rate_pct', value: 20 }, { type: 'streak', metric: 'savings_rate_months', value: 3 }] }, coinReward: 25, xpReward: 40, hidden: false },
  { id: 'BDG-SAVINGS-010', name: 'Millionaire (Game)', description: 'Savings balance reaches 100,000 CU', rarity: 'legendary', category: 'savings', condition: { type: 'threshold', metric: 'savings_balance', value: 100000 }, coinReward: 100, xpReward: 100, hidden: false },

  // Credit (11-20)
  { id: 'BDG-CREDIT-011', name: 'Credit Beginner', description: 'Open first credit card', rarity: 'common', category: 'credit', condition: { type: 'event', metric: 'open_credit_card' }, coinReward: 10, xpReward: 15, hidden: false },
  { id: 'BDG-CREDIT-012', name: 'Full Payer', description: 'Pay credit card in full 1 time', rarity: 'common', category: 'credit', condition: { type: 'threshold', metric: 'cc_full_payments', value: 1 }, coinReward: 10, xpReward: 15, hidden: false },
  { id: 'BDG-CREDIT-013', name: 'Spotless Record', description: 'Pay all bills on time for 6 consecutive months', rarity: 'rare', category: 'credit', condition: { type: 'streak', metric: 'all_bills_on_time_months', value: 6 }, coinReward: 25, xpReward: 40, hidden: false },
  { id: 'BDG-CREDIT-014', name: 'Credit Master', description: 'Maintain CHI >= 750 for 6 consecutive months', rarity: 'epic', category: 'credit', condition: { type: 'compound', operator: 'and', conditions: [{ type: 'threshold', metric: 'chi_score', value: 750 }, { type: 'streak', metric: 'chi_750_months', value: 6 }] }, coinReward: 50, xpReward: 60, hidden: false },
  { id: 'BDG-CREDIT-015', name: 'Perfect Score', description: 'Reach CHI = 850', rarity: 'legendary', category: 'credit', condition: { type: 'threshold', metric: 'chi_score', value: 850 }, coinReward: 100, xpReward: 100, hidden: false },
  { id: 'BDG-CREDIT-016', name: 'Utilization Pro', description: 'Keep credit utilization < 10% for 3 months', rarity: 'rare', category: 'credit', condition: { type: 'compound', operator: 'and', conditions: [{ type: 'threshold', metric: 'credit_utilization_below', value: 10 }, { type: 'streak', metric: 'low_util_months', value: 3 }] }, coinReward: 25, xpReward: 35, hidden: false },
  { id: 'BDG-CREDIT-017', name: 'Debt Destroyer', description: 'Pay off any loan completely', rarity: 'rare', category: 'credit', condition: { type: 'event', metric: 'pay_off_loan' }, coinReward: 25, xpReward: 35, hidden: false },
  { id: 'BDG-CREDIT-018', name: 'Debt Free', description: 'Have zero non-mortgage debt', rarity: 'epic', category: 'credit', condition: { type: 'threshold', metric: 'non_mortgage_debt', value: 0 }, coinReward: 50, xpReward: 60, hidden: false },
  { id: 'BDG-CREDIT-019', name: 'Completely Free', description: 'Have zero total debt', rarity: 'legendary', category: 'credit', condition: { type: 'threshold', metric: 'total_debt', value: 0 }, coinReward: 100, xpReward: 100, hidden: false },
  { id: 'BDG-CREDIT-020', name: 'Recovery Hero', description: 'Recover CHI from < 550 to > 700', rarity: 'epic', category: 'credit', condition: { type: 'compound', operator: 'and', conditions: [{ type: 'event', metric: 'chi_was_below_550' }, { type: 'threshold', metric: 'chi_score', value: 700 }] }, coinReward: 50, xpReward: 60, hidden: false },

  // Budget (21-26)
  { id: 'BDG-BUDGET-021', name: 'Budget Beginner', description: 'Create first budget', rarity: 'common', category: 'budget', condition: { type: 'event', metric: 'create_budget' }, coinReward: 10, xpReward: 15, hidden: false },
  { id: 'BDG-BUDGET-022', name: 'Budget Adherent', description: 'Score >= 75% budget adherence for 1 month', rarity: 'common', category: 'budget', condition: { type: 'threshold', metric: 'budget_score', value: 75 }, coinReward: 10, xpReward: 15, hidden: false },
  { id: 'BDG-BUDGET-023', name: 'Budget Boss', description: 'Score >= 90% budget adherence for 3 consecutive months', rarity: 'rare', category: 'budget', condition: { type: 'compound', operator: 'and', conditions: [{ type: 'threshold', metric: 'budget_score', value: 90 }, { type: 'streak', metric: 'budget_90_months', value: 3 }] }, coinReward: 25, xpReward: 40, hidden: false },
  { id: 'BDG-BUDGET-024', name: 'Budget Master', description: 'Score >= 90% budget adherence for 6 consecutive months', rarity: 'epic', category: 'budget', condition: { type: 'compound', operator: 'and', conditions: [{ type: 'threshold', metric: 'budget_score', value: 90 }, { type: 'streak', metric: 'budget_90_months', value: 6 }] }, coinReward: 50, xpReward: 60, hidden: false },
  { id: 'BDG-BUDGET-025', name: 'Budget Legend', description: 'Score >= 95% budget adherence for 12 consecutive months', rarity: 'legendary', category: 'budget', condition: { type: 'compound', operator: 'and', conditions: [{ type: 'threshold', metric: 'budget_score', value: 95 }, { type: 'streak', metric: 'budget_95_months', value: 12 }] }, coinReward: 100, xpReward: 100, hidden: false },
  { id: 'BDG-BUDGET-026', name: '50/30/20', description: 'Allocate budget within 5% of 50/30/20 rule', rarity: 'rare', category: 'budget', condition: { type: 'event', metric: 'budget_503020' }, coinReward: 25, xpReward: 35, hidden: false },

  // Investment (27-34)
  { id: 'BDG-INVEST-027', name: 'First Investment', description: 'Make first investment purchase', rarity: 'common', category: 'investment', condition: { type: 'event', metric: 'first_investment' }, coinReward: 10, xpReward: 15, hidden: false },
  { id: 'BDG-INVEST-028', name: 'Diversified', description: 'Hold 3+ different asset types simultaneously', rarity: 'rare', category: 'investment', condition: { type: 'threshold', metric: 'unique_asset_types', value: 3 }, coinReward: 25, xpReward: 35, hidden: false },
  { id: 'BDG-INVEST-029', name: 'Patient Investor', description: 'Hold an investment for 12+ game months without selling', rarity: 'rare', category: 'investment', condition: { type: 'threshold', metric: 'longest_hold_months', value: 12 }, coinReward: 25, xpReward: 35, hidden: false },
  { id: 'BDG-INVEST-030', name: 'Market Survivor', description: 'Maintain portfolio through a market crash event', rarity: 'epic', category: 'investment', condition: { type: 'event', metric: 'survived_crash' }, coinReward: 50, xpReward: 60, hidden: false },
  { id: 'BDG-INVEST-031', name: 'Portfolio Pro', description: 'Portfolio value exceeds 10,000 CU', rarity: 'epic', category: 'investment', condition: { type: 'threshold', metric: 'portfolio_value', value: 10000 }, coinReward: 50, xpReward: 60, hidden: false },
  { id: 'BDG-INVEST-032', name: 'Retirement Ready', description: 'Retirement readiness score >= 80%', rarity: 'legendary', category: 'investment', condition: { type: 'threshold', metric: 'retirement_readiness', value: 80 }, coinReward: 100, xpReward: 100, hidden: false },
  { id: 'BDG-INVEST-033', name: 'Crypto Survivor', description: 'Hold crypto through a crash without selling', rarity: 'rare', category: 'investment', condition: { type: 'event', metric: 'survived_crypto_crash' }, coinReward: 25, xpReward: 35, hidden: false },
  { id: 'BDG-INVEST-034', name: 'Dividend Collector', description: 'Receive 4 dividend payments', rarity: 'common', category: 'investment', condition: { type: 'threshold', metric: 'dividend_count', value: 4 }, coinReward: 10, xpReward: 15, hidden: false },

  // Life Event (35-44)
  { id: 'BDG-LIFE-035', name: 'Homeowner', description: 'Purchase a home', rarity: 'epic', category: 'life_event', condition: { type: 'event', metric: 'purchase_home' }, coinReward: 50, xpReward: 60, hidden: false },
  { id: 'BDG-LIFE-036', name: 'Smart Buyer', description: 'Purchase home with >= 20% down payment', rarity: 'rare', category: 'life_event', condition: { type: 'event', metric: 'home_20pct_down' }, coinReward: 25, xpReward: 35, hidden: false },
  { id: 'BDG-LIFE-037', name: 'Wheels', description: 'Purchase/finance a car', rarity: 'common', category: 'life_event', condition: { type: 'event', metric: 'purchase_car' }, coinReward: 10, xpReward: 15, hidden: false },
  { id: 'BDG-LIFE-038', name: 'Insured', description: 'Hold any insurance policy for 6 months', rarity: 'common', category: 'life_event', condition: { type: 'streak', metric: 'insurance_months', value: 6 }, coinReward: 10, xpReward: 15, hidden: false },
  { id: 'BDG-LIFE-039', name: 'Fully Covered', description: 'Hold 3+ insurance types simultaneously', rarity: 'rare', category: 'life_event', condition: { type: 'threshold', metric: 'insurance_types', value: 3 }, coinReward: 25, xpReward: 35, hidden: false },
  { id: 'BDG-LIFE-040', name: 'Claim Navigator', description: 'Successfully resolve an insurance claim', rarity: 'rare', category: 'life_event', condition: { type: 'event', metric: 'insurance_claim_resolved' }, coinReward: 25, xpReward: 35, hidden: false },
  { id: 'BDG-LIFE-041', name: 'Tax Pro', description: 'File taxes correctly first time', rarity: 'rare', category: 'life_event', condition: { type: 'event', metric: 'file_taxes_correct' }, coinReward: 25, xpReward: 35, hidden: false },
  { id: 'BDG-LIFE-042', name: 'Good Parent', description: 'Fund child college savings goal', rarity: 'epic', category: 'life_event', condition: { type: 'event', metric: 'fund_college' }, coinReward: 50, xpReward: 60, hidden: false },
  { id: 'BDG-LIFE-043', name: 'Emergency Handler', description: 'Handle emergency without going into debt', rarity: 'rare', category: 'life_event', condition: { type: 'event', metric: 'emergency_no_debt' }, coinReward: 25, xpReward: 35, hidden: false },
  { id: 'BDG-LIFE-044', name: 'Side Hustler', description: 'Complete a side-hustle event', rarity: 'common', category: 'life_event', condition: { type: 'event', metric: 'side_hustle' }, coinReward: 10, xpReward: 15, hidden: false },

  // Engagement (45-50)
  { id: 'BDG-ENGAGE-045', name: 'First Week', description: 'Play for 7 consecutive days', rarity: 'common', category: 'engagement', condition: { type: 'streak', metric: 'play_days', value: 7 }, coinReward: 10, xpReward: 25, hidden: false },
  { id: 'BDG-ENGAGE-046', name: 'Monthly Regular', description: 'Play for 30 consecutive days', rarity: 'common', category: 'engagement', condition: { type: 'streak', metric: 'play_days', value: 30 }, coinReward: 10, xpReward: 100, hidden: false },
  { id: 'BDG-ENGAGE-047', name: 'Dedicated', description: 'Play for 60 consecutive days', rarity: 'rare', category: 'engagement', condition: { type: 'streak', metric: 'play_days', value: 60 }, coinReward: 25, xpReward: 150, hidden: false },
  { id: 'BDG-ENGAGE-048', name: 'Committed', description: 'Play for 90 consecutive days', rarity: 'epic', category: 'engagement', condition: { type: 'streak', metric: 'play_days', value: 90 }, coinReward: 50, xpReward: 200, hidden: false },
  { id: 'BDG-ENGAGE-049', name: 'MoneyLife Veteran', description: 'Play for 180 consecutive days', rarity: 'legendary', category: 'engagement', condition: { type: 'streak', metric: 'play_days', value: 180 }, coinReward: 100, xpReward: 500, hidden: false },
  { id: 'BDG-ENGAGE-050', name: 'Speed Runner', description: 'Complete Level 1-4 in under 60 game days', rarity: 'rare', category: 'engagement', condition: { type: 'threshold', metric: 'levels_1_4_days', value: 60 }, coinReward: 25, xpReward: 35, hidden: false },

  // Progression (51-60)
  { id: 'BDG-PROG-051', name: 'Level 1 Graduate', description: 'Complete Level 1', rarity: 'common', category: 'progression', condition: { type: 'threshold', metric: 'completed_level', value: 1 }, coinReward: 10, xpReward: 15, hidden: false },
  { id: 'BDG-PROG-052', name: 'Level 2 Graduate', description: 'Complete Level 2', rarity: 'common', category: 'progression', condition: { type: 'threshold', metric: 'completed_level', value: 2 }, coinReward: 10, xpReward: 15, hidden: false },
  { id: 'BDG-PROG-053', name: 'Level 3 Graduate', description: 'Complete Level 3', rarity: 'common', category: 'progression', condition: { type: 'threshold', metric: 'completed_level', value: 3 }, coinReward: 10, xpReward: 15, hidden: false },
  { id: 'BDG-PROG-054', name: 'Level 4 Graduate', description: 'Complete Level 4', rarity: 'rare', category: 'progression', condition: { type: 'threshold', metric: 'completed_level', value: 4 }, coinReward: 25, xpReward: 35, hidden: false },
  { id: 'BDG-PROG-055', name: 'Level 5 Graduate', description: 'Complete Level 5', rarity: 'rare', category: 'progression', condition: { type: 'threshold', metric: 'completed_level', value: 5 }, coinReward: 25, xpReward: 35, hidden: false },
  { id: 'BDG-PROG-056', name: 'Level 6 Graduate', description: 'Complete Level 6', rarity: 'epic', category: 'progression', condition: { type: 'threshold', metric: 'completed_level', value: 6 }, coinReward: 50, xpReward: 60, hidden: false },
  { id: 'BDG-PROG-057', name: 'Level 7 Graduate', description: 'Complete Level 7', rarity: 'epic', category: 'progression', condition: { type: 'threshold', metric: 'completed_level', value: 7 }, coinReward: 50, xpReward: 60, hidden: false },
  { id: 'BDG-PROG-058', name: 'Level 8 Graduate', description: 'Complete Level 8', rarity: 'legendary', category: 'progression', condition: { type: 'threshold', metric: 'completed_level', value: 8 }, coinReward: 100, xpReward: 100, hidden: false },
  { id: 'BDG-PROG-059', name: 'MoneyLife Master', description: 'Complete all 8 levels with CHI never < 650', rarity: 'legendary', category: 'progression', condition: { type: 'compound', operator: 'and', conditions: [{ type: 'threshold', metric: 'completed_level', value: 8 }, { type: 'threshold', metric: 'min_chi_ever', value: 650 }] }, coinReward: 100, xpReward: 100, hidden: false },
  { id: 'BDG-PROG-060', name: 'Life Journey', description: 'Complete Teen → Student → Young Adult → Parent sequence', rarity: 'legendary', category: 'progression', condition: { type: 'threshold', metric: 'personas_completed', value: 4 }, coinReward: 100, xpReward: 100, hidden: false },

  // Hidden (H1-H5)
  { id: 'BDG-HIDDEN-H1', name: 'Penny Pincher', description: 'Choose the cheapest option on 20 consecutive decision cards', rarity: 'rare', category: 'engagement', condition: { type: 'streak', metric: 'cheapest_option_streak', value: 20 }, coinReward: 25, xpReward: 35, hidden: true },
  { id: 'BDG-HIDDEN-H2', name: 'YOLO', description: 'Choose the most expensive option on 10 consecutive cards', rarity: 'rare', category: 'engagement', condition: { type: 'streak', metric: 'expensive_option_streak', value: 10 }, coinReward: 25, xpReward: 35, hidden: true },
  { id: 'BDG-HIDDEN-H3', name: 'Bankruptcy Bounce-Back', description: 'Go bankrupt and reach CHI 700+', rarity: 'epic', category: 'credit', condition: { type: 'compound', operator: 'and', conditions: [{ type: 'event', metric: 'went_bankrupt' }, { type: 'threshold', metric: 'chi_score', value: 700 }] }, coinReward: 50, xpReward: 60, hidden: true },
  { id: 'BDG-HIDDEN-H4', name: 'Against All Odds', description: 'Complete game on Hard after bankruptcy', rarity: 'legendary', category: 'progression', condition: { type: 'compound', operator: 'and', conditions: [{ type: 'event', metric: 'went_bankrupt' }, { type: 'event', metric: 'completed_hard' }] }, coinReward: 100, xpReward: 100, hidden: true },
  { id: 'BDG-HIDDEN-H5', name: 'Philanthropist', description: 'Donate to charity events 5 times', rarity: 'rare', category: 'life_event', condition: { type: 'threshold', metric: 'charity_donations', value: 5 }, coinReward: 25, xpReward: 35, hidden: true },
];

export interface PlayerMetrics {
  [metric: string]: number | boolean;
}

export function evaluateCondition(condition: BadgeCondition, metrics: PlayerMetrics): boolean {
  switch (condition.type) {
    case 'threshold':
      if (!condition.metric || condition.value === undefined) return false;
      return (metrics[condition.metric] as number) >= condition.value;

    case 'streak':
      if (!condition.metric || !condition.value) return false;
      return (metrics[condition.metric] as number) >= condition.value;

    case 'event':
      if (!condition.metric) return false;
      return !!metrics[condition.metric];

    case 'compound':
      if (!condition.conditions || !condition.operator) return false;
      if (condition.operator === 'and') {
        return condition.conditions.every((c) => evaluateCondition(c, metrics));
      }
      return condition.conditions.some((c) => evaluateCondition(c, metrics));

    default:
      return false;
  }
}

export function evaluateBadges(
  metrics: PlayerMetrics,
  alreadyEarned: Set<string>,
): BadgeDefinition[] {
  const newBadges: BadgeDefinition[] = [];

  for (const badge of BADGE_CATALOG) {
    if (alreadyEarned.has(badge.id)) continue;
    if (evaluateCondition(badge.condition, metrics)) {
      newBadges.push(badge);
    }
  }

  return newBadges;
}
