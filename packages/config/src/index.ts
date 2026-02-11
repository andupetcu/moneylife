// Stub config - will be replaced by parallel agent
export interface RegionConfig {
  code: string;
  currency: string;
  pppFactor: number;
  locale: string;
}

export interface PersonaConfig {
  type: string;
  startingCash: number;
  monthlyIncome: number;
  startingBills: Array<{ name: string; amount: number }>;
}

export function getRegionConfig(_code: string): RegionConfig {
  return { code: 'us', currency: 'USD', pppFactor: 1.0, locale: 'en-US' };
}

export function getPersonaConfig(_type: string): PersonaConfig {
  return {
    type: 'young_adult',
    startingCash: 200000,
    monthlyIncome: 350000,
    startingBills: [
      { name: 'Rent', amount: 80000 },
      { name: 'Utilities', amount: 10000 },
      { name: 'Groceries', amount: 30000 },
    ],
  };
}
