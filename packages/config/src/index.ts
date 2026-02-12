import personasData from './personas.json';
import difficultyData from './difficulty.json';
import levelsData from './levels.json';
import usRegion from './regions/us.json';
import gbRegion from './regions/gb.json';
import deRegion from './regions/de.json';
import frRegion from './regions/fr.json';
import huRegion from './regions/hu.json';
import plRegion from './regions/pl.json';
import czRegion from './regions/cz.json';
import roRegion from './regions/ro.json';

// ---------- Region ----------

export interface RegionConfig {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  decimalDigits: number;
  locale: string;
  pppFactor: number;
  taxRates: {
    incomeTax: number;
    socialContributions?: number;
    nationalInsurance?: number;
    vat: number;
    salesTax?: number;
    capitalGainsTax: number;
    dividendTax: number;
  };
  typicalValues: {
    entryLevelSalaryMonthly: number;
    averageSalaryMonthly: number;
    averageRentCity: number;
    averageRentSuburb: number;
    groceriesMonthly: number;
    utilitiesMonthly: number;
    publicTransportMonthly: number;
    phoneMonthly: number;
    internetMonthly: number;
  };
  interestRates: {
    savingsAPY: number;
    checkingAPY: number;
    creditCardAPR: number;
    personalLoanAPR: { min: number; max: number };
    mortgageAPR: { fixed30y: number; fixed15y: number };
    autoLoanAPR: { good: number; bad: number };
    studentLoanAPR: number;
    overdraftAPR: number;
  };
  inflation: {
    annualRate: number;
    historicalAverage: number;
  };
  fees: {
    overdraftFee: number;
    lateFeeCredit: number;
    lateFeeRent: number;
    excessWithdrawalFee: number;
  };
  insurance: {
    healthPremium: number;
    autoPremium: number;
    rentersPremium: number;
    lifePremium: number;
    disabilityPremium: number;
  };
}

const REGIONS: Record<string, RegionConfig> = {
  us: usRegion as unknown as RegionConfig,
  gb: gbRegion as unknown as RegionConfig,
  de: deRegion as unknown as RegionConfig,
  fr: frRegion as unknown as RegionConfig,
  hu: huRegion as unknown as RegionConfig,
  pl: plRegion as unknown as RegionConfig,
  cz: czRegion as unknown as RegionConfig,
  ro: roRegion as unknown as RegionConfig,
};

export function getRegionConfig(code: string): RegionConfig {
  return REGIONS[code.toLowerCase()] ?? REGIONS.us;
}

// ---------- Persona ----------

export interface PersonaConfig {
  id: string;
  name: string;
  ageRange: [number, number];
  startingAge: number;
  startingCash: number;
  monthlyIncome: number;
  incomeSource: string;
  xpModifier: number;
  availableAccountsAtStart: string[];
  accountUnlocks: Record<string, number>;
  neverAvailable: string[];
  startingDebt?: Record<string, unknown>;
  startingBills: Array<{ name: string; amount: number; category: string }>;
  startingGoals: Array<{ name: string; target: number }>;
  narrative: string;
  householdMembers?: Array<{ type: string; name: string; incomeContribution: number; expenseContribution: number }>;
}

const PERSONAS: Record<string, PersonaConfig> = {};
for (const p of personasData.personas) {
  PERSONAS[p.id] = p as unknown as PersonaConfig;
}

export function getPersonaConfig(type: string): PersonaConfig {
  return PERSONAS[type] ?? PERSONAS.young_adult;
}

// ---------- Difficulty ----------

export interface DifficultyConfig {
  startingCashBonus: number;
  incomeVariability: number;
  emergencyFrequencyMonths: number;
  emergencyCostMultiplier: number;
  inflationAnnual: number;
  savingsAPY: number;
  creditCardAPR: number;
  lateFeeMultiplier: number;
  overdraftGraceDays: number;
  loanApprovalChiMin: number;
  goodChoiceXpBonus: number;
  consequenceChainProbability: number;
  xpMultiplier: number;
  billReminderDays: number;
  salaryRaiseFrequencyMonths: number;
  investmentVolatilityMultiplier: number;
  happinessDecayPerWeek: number;
  happinessFromSpendingMultiplier: number;
}

const DIFFICULTIES: Record<string, DifficultyConfig> = difficultyData.modes as Record<string, DifficultyConfig>;

export function getDifficultyConfig(mode: string): DifficultyConfig {
  return DIFFICULTIES[mode] ?? DIFFICULTIES.normal;
}

// ---------- Level ----------

export interface LevelConfig {
  level: number;
  name: string;
  theme: string;
  durationMonths: number;
  xpRequired: number;
  cumulativeXp: number;
  cardsPerDay: { min: number; max: number };
  bonusCardChance: number;
  unlockedMechanics: string[];
  newCardCategories: string[];
  victoryConditions: Array<Record<string, unknown>>;
  coinBonus: number;
  xpBonus: number;
  tutorialActive: boolean;
  endlessAfterCompletion?: boolean;
}

const LEVELS: LevelConfig[] = levelsData.levels as LevelConfig[];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[LEVELS.length - 1];
}

export function getAllLevels(): LevelConfig[] {
  return LEVELS;
}
