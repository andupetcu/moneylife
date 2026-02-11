/**
 * Currency formatting utility.
 * All monetary values in the app are stored as integers in the smallest currency unit (cents, bani, grosze).
 * This function converts to display format using Intl.NumberFormat.
 *
 * @param amountInCents - Integer amount in smallest currency unit
 * @param currencyCode - ISO 4217 currency code
 * @returns Formatted currency string (e.g., "5.000,00 lei" for RON)
 */

const CURRENCY_CONFIG: Record<string, { locale: string; symbol: string; decimals: number }> = {
  RON: { locale: 'ro-RO', symbol: 'lei', decimals: 2 },
  PLN: { locale: 'pl-PL', symbol: 'zł', decimals: 2 },
  HUF: { locale: 'hu-HU', symbol: 'Ft', decimals: 0 },
  CZK: { locale: 'cs-CZ', symbol: 'Kč', decimals: 2 },
  GBP: { locale: 'en-GB', symbol: '£', decimals: 2 },
  EUR: { locale: 'de-DE', symbol: '€', decimals: 2 },
  USD: { locale: 'en-US', symbol: '$', decimals: 2 },
};

export function formatCurrency(amountInCents: number, currencyCode: string): string {
  const config = CURRENCY_CONFIG[currencyCode];
  if (!config) return `${amountInCents} ${currencyCode}`;

  const amount = config.decimals > 0
    ? amountInCents / Math.pow(10, config.decimals)
    : amountInCents;

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount);
}

/**
 * Format currency with a +/- sign prefix for display in transaction lists.
 */
export function formatCurrencySigned(amountInCents: number, currencyCode: string): string {
  const prefix = amountInCents > 0 ? '+' : '';
  return `${prefix}${formatCurrency(amountInCents, currencyCode)}`;
}

/**
 * Get the number of decimal places for a currency.
 */
export function getCurrencyDecimals(currencyCode: string): number {
  return CURRENCY_CONFIG[currencyCode]?.decimals ?? 2;
}

export { CURRENCY_CONFIG };
