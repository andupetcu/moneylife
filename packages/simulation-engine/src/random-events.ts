// packages/simulation-engine/src/random-events.ts
// Random life event system — emergencies, windfalls, and life changes

import type { GameDate } from '@moneylife/shared-types';
import { randomInt, randomFloat } from './scenarios.js';

// ---------- types ----------

export type RandomEventType =
  | 'medical_emergency'
  | 'car_breakdown'
  | 'job_loss'
  | 'salary_bonus'
  | 'tax_refund'
  | 'home_repair'
  | 'identity_theft'
  | 'inheritance'
  | 'market_crash'
  | 'wedding_invitation'
  | 'pet_emergency'
  | 'phone_laptop_broken'
  | 'parking_ticket'
  | 'found_money'
  | 'promotion'
  | 'rent_increase'
  | 'utility_price_hike';

export type InsuranceCategory = 'health' | 'auto' | 'home' | 'phone' | 'pet' | 'identity_theft';

export type EventFrequency = 'daily' | 'monthly' | 'quarterly';

export interface RandomEventDef {
  type: RandomEventType;
  /** Base probability per roll (before difficulty scaling) */
  probability: number;
  /** How often this event is rolled for */
  frequency: EventFrequency;
  /** Amount range in cents [min, max] — positive = cost to player, negative = income */
  amountRange: [number, number];
  /** Which account type is primarily affected */
  affectedAccount: 'checking' | 'savings' | 'investment' | 'income';
  /** Human-readable description template (use {amount} placeholder) */
  description: string;
  /** Which insurance type can cover this, if any */
  insuranceType: InsuranceCategory | null;
  /** Transaction category for bookkeeping */
  category: string;
  /** Whether this is a positive event for the player */
  isPositive: boolean;
  /** Persona restrictions (empty = all personas) */
  personas: string[];
  /** Minimum level required */
  minLevel: number;
}

export interface TriggeredEvent {
  type: RandomEventType;
  amount: number;
  description: string;
  category: string;
  affectedAccount: string;
  insuranceType: InsuranceCategory | null;
  isPositive: boolean;
  /** If true, present as a decision card; if false, auto-apply */
  requiresDecision: boolean;
}

// ---------- event catalog ----------

export const RANDOM_EVENT_CATALOG: RandomEventDef[] = [
  {
    type: 'medical_emergency',
    probability: 0.03,
    frequency: 'daily',
    amountRange: [20000, 500000],
    affectedAccount: 'checking',
    description: 'Unexpected medical expense — emergency room visit',
    insuranceType: 'health',
    category: 'health',
    isPositive: false,
    personas: [],
    minLevel: 1,
  },
  {
    type: 'car_breakdown',
    probability: 0.02,
    frequency: 'daily',
    amountRange: [15000, 200000],
    affectedAccount: 'checking',
    description: 'Car broke down — needs repair',
    insuranceType: 'auto',
    category: 'transport',
    isPositive: false,
    personas: ['young_adult', 'parent'],
    minLevel: 1,
  },
  {
    type: 'job_loss',
    probability: 0.005,
    frequency: 'daily',
    amountRange: [0, 0], // Special: affects income, not balance directly
    affectedAccount: 'income',
    description: 'Laid off from job — income reduced for 2 months',
    insuranceType: null,
    category: 'career',
    isPositive: false,
    personas: ['young_adult', 'parent'],
    minLevel: 3,
  },
  {
    type: 'salary_bonus',
    probability: 0.02,
    frequency: 'daily',
    amountRange: [10000, 100000],
    affectedAccount: 'checking',
    description: 'Performance bonus from work!',
    insuranceType: null,
    category: 'career',
    isPositive: true,
    personas: ['student', 'young_adult', 'parent'],
    minLevel: 1,
  },
  {
    type: 'tax_refund',
    probability: 0.01,
    frequency: 'daily', // Only triggers in April (checked at roll time)
    amountRange: [5000, 80000],
    affectedAccount: 'checking',
    description: 'Tax refund deposited!',
    insuranceType: null,
    category: 'tax',
    isPositive: true,
    personas: [],
    minLevel: 5,
  },
  {
    type: 'home_repair',
    probability: 0.015,
    frequency: 'daily',
    amountRange: [10000, 300000],
    affectedAccount: 'checking',
    description: 'Home needs urgent repair',
    insuranceType: 'home',
    category: 'housing',
    isPositive: false,
    personas: ['young_adult', 'parent'],
    minLevel: 2,
  },
  {
    type: 'identity_theft',
    probability: 0.003,
    frequency: 'daily',
    amountRange: [5000, 150000],
    affectedAccount: 'checking',
    description: 'Identity theft — fraudulent charges on your account',
    insuranceType: 'identity_theft',
    category: 'emergency',
    isPositive: false,
    personas: [],
    minLevel: 3,
  },
  {
    type: 'inheritance',
    probability: 0.001,
    frequency: 'daily',
    amountRange: [100000, 1000000],
    affectedAccount: 'checking',
    description: 'Received an inheritance from a relative',
    insuranceType: null,
    category: 'income',
    isPositive: true,
    personas: [],
    minLevel: 2,
  },
  {
    type: 'market_crash',
    probability: 0.002,
    frequency: 'daily',
    amountRange: [10, 30], // Percentage of investment value (10-30%)
    affectedAccount: 'investment',
    description: 'Market downturn — investments lost value',
    insuranceType: null,
    category: 'investment',
    isPositive: false,
    personas: [],
    minLevel: 4,
  },
  {
    type: 'wedding_invitation',
    probability: 0.01,
    frequency: 'daily',
    amountRange: [5000, 50000],
    affectedAccount: 'checking',
    description: "Friend's wedding — gift and travel expenses",
    insuranceType: null,
    category: 'social',
    isPositive: false,
    personas: ['student', 'young_adult', 'parent'],
    minLevel: 1,
  },
  {
    type: 'pet_emergency',
    probability: 0.015,
    frequency: 'daily',
    amountRange: [10000, 200000],
    affectedAccount: 'checking',
    description: 'Pet needs emergency vet visit',
    insuranceType: 'pet',
    category: 'health',
    isPositive: false,
    personas: ['young_adult', 'parent'],
    minLevel: 1,
  },
  {
    type: 'phone_laptop_broken',
    probability: 0.02,
    frequency: 'daily',
    amountRange: [10000, 150000],
    affectedAccount: 'checking',
    description: 'Phone or laptop needs replacement',
    insuranceType: 'phone',
    category: 'shopping',
    isPositive: false,
    personas: [],
    minLevel: 1,
  },
  {
    type: 'parking_ticket',
    probability: 0.03,
    frequency: 'daily',
    amountRange: [2500, 15000],
    affectedAccount: 'checking',
    description: 'Got a parking ticket',
    insuranceType: null,
    category: 'transport',
    isPositive: false,
    personas: ['young_adult', 'parent'],
    minLevel: 1,
  },
  {
    type: 'found_money',
    probability: 0.005,
    frequency: 'daily',
    amountRange: [500, 5000],
    affectedAccount: 'checking',
    description: 'Found some money!',
    insuranceType: null,
    category: 'income',
    isPositive: true,
    personas: [],
    minLevel: 1,
  },
  {
    type: 'promotion',
    probability: 0.003,
    frequency: 'monthly',
    amountRange: [5, 15], // Percentage salary increase
    affectedAccount: 'income',
    description: 'Got a promotion — salary increase!',
    insuranceType: null,
    category: 'career',
    isPositive: true,
    personas: ['student', 'young_adult', 'parent'],
    minLevel: 3,
  },
  {
    type: 'rent_increase',
    probability: 0.01,
    frequency: 'monthly',
    amountRange: [3, 10], // Percentage rent increase
    affectedAccount: 'checking',
    description: 'Landlord increased the rent',
    insuranceType: null,
    category: 'housing',
    isPositive: false,
    personas: ['student', 'young_adult', 'parent'],
    minLevel: 2,
  },
  {
    type: 'utility_price_hike',
    probability: 0.02,
    frequency: 'quarterly',
    amountRange: [5, 20], // Percentage utility increase
    affectedAccount: 'checking',
    description: 'Utility prices went up',
    insuranceType: null,
    category: 'housing',
    isPositive: false,
    personas: [],
    minLevel: 1,
  },
];

// ---------- difficulty multipliers ----------

const DIFFICULTY_FREQUENCY_MULTIPLIER: Record<string, number> = {
  easy: 0.5,
  normal: 1.0,
  hard: 1.5,
};

// ---------- core logic ----------

/**
 * Roll for random events on a given day.
 * Returns all events that triggered.
 */
export function rollDailyEvents(
  rng: () => number,
  date: GameDate,
  difficulty: string,
  persona: string,
  level: number,
  monthlyIncome: number,
  isMonthEnd: boolean,
  isQuarterEnd: boolean,
): TriggeredEvent[] {
  const diffMultiplier = DIFFICULTY_FREQUENCY_MULTIPLIER[difficulty] ?? 1.0;
  const triggered: TriggeredEvent[] = [];

  for (const def of RANDOM_EVENT_CATALOG) {
    // Check persona restrictions
    if (def.personas.length > 0 && !def.personas.includes(persona)) continue;

    // Check level requirement
    if (level < def.minLevel) continue;

    // Check frequency timing
    if (def.frequency === 'monthly' && !isMonthEnd) continue;
    if (def.frequency === 'quarterly' && !isQuarterEnd) continue;

    // Special: tax refund only in April
    if (def.type === 'tax_refund' && date.month !== 4) continue;

    // Roll probability with difficulty scaling
    // Negative events scale up on hard, positive events scale down (and vice versa for easy)
    let effectiveProb = def.probability;
    if (!def.isPositive) {
      effectiveProb *= diffMultiplier;
    } else {
      // Positive events are inversely scaled — more frequent on easy, less on hard
      effectiveProb *= (2.0 - diffMultiplier);
    }

    const roll = rng();
    if (roll >= effectiveProb) continue;

    // Event triggered — calculate amount
    const event = resolveEvent(def, rng, monthlyIncome);
    triggered.push(event);
  }

  return triggered;
}

/**
 * Resolve the details of a triggered event (amount, description, decision needed).
 */
function resolveEvent(
  def: RandomEventDef,
  rng: () => number,
  monthlyIncome: number,
): TriggeredEvent {
  let amount: number;

  if (def.type === 'market_crash') {
    // Amount is a percentage of investments — resolved later when we know investment balance
    const pct = randomInt(rng, def.amountRange[0], def.amountRange[1]);
    amount = pct; // Store percentage, resolve in action-processor
  } else if (def.type === 'promotion') {
    const pct = randomInt(rng, def.amountRange[0], def.amountRange[1]);
    amount = pct; // Store percentage, resolve in action-processor
  } else if (def.type === 'rent_increase' || def.type === 'utility_price_hike') {
    const pct = randomInt(rng, def.amountRange[0], def.amountRange[1]);
    amount = pct; // Store percentage, resolve in action-processor
  } else if (def.type === 'job_loss') {
    amount = 0; // Special handling in action-processor
  } else {
    amount = randomInt(rng, def.amountRange[0], def.amountRange[1]);
  }

  // Events costing more than 10% of monthly income become decision cards
  const threshold = monthlyIncome * 0.1;
  const requiresDecision = !def.isPositive && amount > threshold &&
    def.type !== 'market_crash' && def.type !== 'job_loss' &&
    def.type !== 'rent_increase' && def.type !== 'utility_price_hike';

  return {
    type: def.type,
    amount,
    description: def.description,
    category: def.category,
    affectedAccount: def.affectedAccount,
    insuranceType: def.insuranceType,
    isPositive: def.isPositive,
    requiresDecision,
  };
}

// ---------- insurance premium config ----------

export interface InsurancePremiumConfig {
  type: InsuranceCategory;
  /** Monthly premium in cents (base for normal difficulty, US region) */
  basePremium: number;
  /** Deductible in cents */
  deductible: number;
  /** Coverage rate (0-1, e.g. 0.80 = 80% after deductible) */
  coverageRate: number;
  /** Human-readable name */
  name: string;
  /** Which event types this covers */
  covers: RandomEventType[];
}

export const INSURANCE_CONFIGS: InsurancePremiumConfig[] = [
  {
    type: 'health',
    basePremium: 15000, // $150/month
    deductible: 50000,  // $500
    coverageRate: 0.80,
    name: 'Health Insurance',
    covers: ['medical_emergency'],
  },
  {
    type: 'auto',
    basePremium: 8000, // $80/month
    deductible: 25000, // $250
    coverageRate: 0.85,
    name: 'Auto Insurance',
    covers: ['car_breakdown'],
  },
  {
    type: 'home',
    basePremium: 5000, // $50/month
    deductible: 25000, // $250
    coverageRate: 0.80,
    name: "Home/Renter's Insurance",
    covers: ['home_repair'],
  },
  {
    type: 'phone',
    basePremium: 1500, // $15/month
    deductible: 5000,  // $50
    coverageRate: 0.75,
    name: 'Electronics Insurance',
    covers: ['phone_laptop_broken'],
  },
  {
    type: 'pet',
    basePremium: 4000, // $40/month
    deductible: 10000, // $100
    coverageRate: 0.70,
    name: 'Pet Insurance',
    covers: ['pet_emergency'],
  },
  {
    type: 'identity_theft',
    basePremium: 2000, // $20/month
    deductible: 0,
    coverageRate: 0.90,
    name: 'Identity Theft Protection',
    covers: ['identity_theft'],
  },
];

/**
 * Get the insurance config that covers a given event type.
 */
export function getInsuranceForEvent(eventType: RandomEventType): InsurancePremiumConfig | null {
  return INSURANCE_CONFIGS.find(c => c.covers.includes(eventType)) ?? null;
}

/**
 * Adjust premium for difficulty (hard = more expensive).
 */
export function adjustedPremium(basePremium: number, difficulty: string): number {
  const multipliers: Record<string, number> = {
    easy: 0.8,
    normal: 1.0,
    hard: 1.2,
  };
  return Math.round(basePremium * (multipliers[difficulty] ?? 1.0));
}

// ---------- bankruptcy ----------

export type BankruptcyStage = 'none' | 'financial_stress' | 'financial_distress' | 'bankruptcy';

export interface BankruptcyAssessment {
  stage: BankruptcyStage;
  netWorthToIncomeRatio: number;
  shouldTriggerBankruptcy: boolean;
  shouldExitBankruptcy: boolean;
}

/**
 * Assess the player's financial situation for bankruptcy stages.
 * @param netWorth - Current net worth in cents
 * @param monthlyIncome - Monthly income in cents
 * @param consecutiveNegativeMonths - How many months net worth has been below threshold
 * @param bankruptcyActive - Whether bankruptcy is currently active
 * @param monthsPositive - Months of positive net worth during bankruptcy recovery
 */
export function assessBankruptcy(
  netWorth: number,
  monthlyIncome: number,
  consecutiveNegativeMonths: number,
  bankruptcyActive: boolean,
  monthsPositive: number,
): BankruptcyAssessment {
  if (monthlyIncome <= 0) {
    return { stage: 'none', netWorthToIncomeRatio: 0, shouldTriggerBankruptcy: false, shouldExitBankruptcy: false };
  }

  const ratio = netWorth / monthlyIncome;

  // Recovery check
  if (bankruptcyActive && monthsPositive >= 6) {
    return { stage: 'none', netWorthToIncomeRatio: ratio, shouldTriggerBankruptcy: false, shouldExitBankruptcy: true };
  }

  if (bankruptcyActive) {
    return { stage: 'bankruptcy', netWorthToIncomeRatio: ratio, shouldTriggerBankruptcy: false, shouldExitBankruptcy: false };
  }

  // Stage determination based on net worth to income ratio
  if (ratio < -5.0 && consecutiveNegativeMonths >= 3) {
    return { stage: 'bankruptcy', netWorthToIncomeRatio: ratio, shouldTriggerBankruptcy: true, shouldExitBankruptcy: false };
  }
  if (ratio < -3.5) {
    return { stage: 'financial_distress', netWorthToIncomeRatio: ratio, shouldTriggerBankruptcy: false, shouldExitBankruptcy: false };
  }
  if (ratio < -2.0) {
    return { stage: 'financial_stress', netWorthToIncomeRatio: ratio, shouldTriggerBankruptcy: false, shouldExitBankruptcy: false };
  }

  return { stage: 'none', netWorthToIncomeRatio: ratio, shouldTriggerBankruptcy: false, shouldExitBankruptcy: false };
}

// ---------- tax system ----------

export interface TaxAssessment {
  annualSalary: number;
  taxRate: number;
  totalTaxOwed: number;
  totalWithheld: number;
  refundOrBill: number; // Positive = refund, negative = owes
}

/**
 * Calculate annual tax assessment.
 * @param monthlyIncome - Monthly income in cents
 * @param monthsWorked - Months worked this tax year (usually 12)
 * @param taxRate - Effective tax rate from region config (e.g. 0.22)
 * @param withholdingRate - How much was withheld (usually slightly less than actual rate)
 */
export function calculateTaxAssessment(
  monthlyIncome: number,
  monthsWorked: number,
  taxRate: number,
  withholdingRate: number,
): TaxAssessment {
  const annualSalary = monthlyIncome * monthsWorked;
  const totalTaxOwed = Math.round(annualSalary * taxRate);
  const totalWithheld = Math.round(annualSalary * withholdingRate);
  const refundOrBill = totalWithheld - totalTaxOwed;

  return {
    annualSalary,
    taxRate,
    totalTaxOwed,
    totalWithheld,
    refundOrBill,
  };
}

/**
 * Check if it's tax filing time (April, day 15 of the game year).
 */
export function isTaxFilingDay(date: GameDate): boolean {
  return date.month === 4 && date.day === 15;
}
