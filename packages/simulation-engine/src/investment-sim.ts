// packages/simulation-engine/src/investment-sim.ts
// Investment simulation (stocks, bonds, index funds with historical-like returns)

import { bankersRound } from './interest.js';
import { normalDistribution } from './scenarios.js';

export type AssetType = 'index' | 'bond' | 'stock' | 'crypto';

export interface AssetHolding {
  assetType: AssetType;
  value: number; // in smallest currency unit
  purchaseDate: { year: number; month: number; day: number };
  dripEnabled: boolean;
}

export interface AssetConfig {
  meanMonthlyReturn: number;
  stddevMonthlyReturn: number;
  annualDividendYield: number;
}

const ASSET_CONFIGS: Record<AssetType, AssetConfig> = {
  index: { meanMonthlyReturn: 0.007, stddevMonthlyReturn: 0.03, annualDividendYield: 0.02 },
  bond: { meanMonthlyReturn: 0.003, stddevMonthlyReturn: 0.005, annualDividendYield: 0.035 },
  stock: { meanMonthlyReturn: 0.008, stddevMonthlyReturn: 0.08, annualDividendYield: 0.015 },
  crypto: { meanMonthlyReturn: 0.01, stddevMonthlyReturn: 0.20, annualDividendYield: 0 },
};

/**
 * Get the config for an asset type.
 */
export function getAssetConfig(assetType: AssetType): AssetConfig {
  return ASSET_CONFIGS[assetType];
}

/**
 * Simulate one month's return for an asset.
 * Returns are deterministic based on the RNG.
 * monthly_return = normal_distribution(mean, stddev)
 * Clamped to [-30%, +30%]
 */
export function simulateMonthlyReturn(
  rng: () => number,
  assetType: AssetType,
  volatilityMultiplier: number = 1.0,
): number {
  const config = ASSET_CONFIGS[assetType];
  const stddev = config.stddevMonthlyReturn * volatilityMultiplier;
  return normalDistribution(rng, config.meanMonthlyReturn, stddev, -0.30, 0.30);
}

/**
 * Apply monthly return to an asset holding.
 * Returns the new value (integer).
 */
export function applyMonthlyReturn(
  currentValue: number,
  monthlyReturn: number,
): number {
  const newValue = bankersRound(currentValue * (1 + monthlyReturn));
  return Math.max(1, newValue); // Minimum value is 1 (0.01 CU)
}

/**
 * Calculate quarterly dividend payment.
 */
export function calculateQuarterlyDividend(
  portfolioValue: number,
  assetType: AssetType,
): number {
  const config = ASSET_CONFIGS[assetType];
  if (config.annualDividendYield <= 0) return 0;
  return bankersRound(portfolioValue * (config.annualDividendYield / 4));
}

/**
 * Simulate a portfolio for one month.
 * Returns updated holdings and any dividends.
 */
export function simulatePortfolioMonth(
  rng: () => number,
  holdings: AssetHolding[],
  isQuarterEnd: boolean,
  volatilityMultiplier: number = 1.0,
): { updatedHoldings: AssetHolding[]; totalDividends: number } {
  let totalDividends = 0;

  const updatedHoldings = holdings.map((holding) => {
    const monthlyReturn = simulateMonthlyReturn(rng, holding.assetType, volatilityMultiplier);
    let newValue = applyMonthlyReturn(holding.value, monthlyReturn);

    // Quarterly dividends
    if (isQuarterEnd) {
      const dividend = calculateQuarterlyDividend(holding.value, holding.assetType);
      if (dividend > 0) {
        if (holding.dripEnabled) {
          newValue += dividend;
        } else {
          totalDividends += dividend;
        }
      }
    }

    return { ...holding, value: newValue };
  });

  return { updatedHoldings, totalDividends };
}

/**
 * Calculate total portfolio value.
 */
export function totalPortfolioValue(holdings: AssetHolding[]): number {
  return holdings.reduce((sum, h) => sum + h.value, 0);
}

/**
 * Count unique asset types in a portfolio.
 */
export function uniqueAssetTypes(holdings: AssetHolding[]): number {
  return new Set(holdings.map((h) => h.assetType)).size;
}
