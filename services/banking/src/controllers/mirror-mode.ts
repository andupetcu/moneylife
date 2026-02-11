import { Request, Response } from 'express';

export interface CategoryComparison {
  category: string;
  gameAmount: number;
  realAmount: number;
  differencePercent: number;
  insight: string;
}

// Transaction categorization — rule-based V1
const CATEGORY_MAP: Record<string, string[]> = {
  housing: ['rent', 'mortgage', 'property_tax', 'home_insurance', 'home_repair'],
  food: ['groceries', 'dining', 'food_and_drink', 'coffee_shop', 'food_delivery'],
  transport: ['gas', 'parking', 'transit', 'ride_share', 'auto'],
  shopping: ['clothing', 'electronics', 'retail', 'online_shopping'],
  health: ['medical', 'pharmacy', 'fitness', 'healthcare'],
  entertainment: ['streaming', 'movies', 'games', 'recreation'],
  utilities: ['electric', 'water', 'internet', 'phone'],
  subscriptions: ['subscription', 'membership'],
};

const MERCHANT_RULES: { patterns: string[]; category: string }[] = [
  { patterns: ['STARBUCKS', 'SBUX'], category: 'food' },
  { patterns: ['UBER TRIP', 'UBER *TRIP', 'LYFT'], category: 'transport' },
  { patterns: ['UBER *EATS', 'UBEREATS', 'DOORDASH', 'GRUBHUB'], category: 'food' },
  { patterns: ['NETFLIX', 'HULU', 'SPOTIFY', 'DISNEY+'], category: 'subscriptions' },
  { patterns: ['PLANET FITNESS', 'LA FITNESS', 'EQUINOX'], category: 'health' },
  { patterns: ['AMAZON', 'WALMART', 'TARGET'], category: 'shopping' },
  { patterns: ['SHELL', 'CHEVRON', 'EXXON', 'BP'], category: 'transport' },
];

export function categorizeTransaction(description: string, merchantName?: string): string {
  const text = (merchantName || description).toUpperCase();
  for (const rule of MERCHANT_RULES) {
    if (rule.patterns.some((p) => text.includes(p))) {
      return rule.category;
    }
  }
  return 'uncategorized';
}

export function generateInsight(category: string, gameAmount: number, realAmount: number): string {
  if (realAmount === 0 || gameAmount === 0) return '';
  const diffPct = ((realAmount - gameAmount) / gameAmount) * 100;
  if (diffPct > 30) {
    return `You're spending ${Math.round(Math.abs(diffPct))}% more on ${category} in real life vs your game budget.`;
  }
  if (diffPct < -20) {
    return `Great job! Your real ${category} spending is ${Math.round(Math.abs(diffPct))}% less than your game budget.`;
  }
  return `Your ${category} spending is closely aligned between game and real life.`;
}

export async function getMirrorComparison(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;
  const month = req.query.month as string;
  const gameId = req.query.gameId as string;

  // Stub: in production:
  // 1. Fetch game budget/actuals from game-engine
  // 2. Fetch real transactions from banking_transactions
  // 3. Categorize and compare
  const comparisons: CategoryComparison[] = [];

  res.json({
    userId,
    gameId,
    month,
    comparisons,
    insights: [],
    gameSavingsRate: 0,
    realSavingsRate: 0,
  });
}

// Provider fallback system
export const PROVIDER_PRIORITY: Record<string, string[]> = {
  US: ['plaid', 'salt_edge'],
  CA: ['plaid', 'salt_edge'],
  GB: ['truelayer', 'salt_edge'],
  DE: ['truelayer', 'salt_edge'],
  FR: ['truelayer', 'salt_edge'],
  BR: ['salt_edge'],
  NG: ['salt_edge'],
  RO: ['salt_edge'],
  PL: ['salt_edge'],
};

export function getProviderForCountry(countryCode: string): string[] {
  return PROVIDER_PRIORITY[countryCode] || ['salt_edge'];
}
