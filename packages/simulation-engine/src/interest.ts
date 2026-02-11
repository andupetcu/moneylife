// packages/simulation-engine/src/interest.ts
// Interest calculations: savings APY, credit card APR daily, loan amortization

/**
 * Convert APY to monthly rate.
 * monthly_rate = (1 + APY)^(1/12) - 1
 */
export function apyToMonthlyRate(apy: number): number {
  return Math.pow(1 + apy, 1 / 12) - 1;
}

/**
 * Calculate monthly savings interest using average daily balance.
 * All amounts in smallest currency unit (cents).
 * Returns interest earned (integer, using banker's rounding).
 */
export function calculateSavingsInterest(
  averageDailyBalance: number,
  annualRate: number,
): number {
  if (averageDailyBalance <= 0 || annualRate <= 0) {
    return 0;
  }
  const monthlyRate = apyToMonthlyRate(annualRate);
  return bankersRound(averageDailyBalance * monthlyRate);
}

/**
 * Calculate daily credit card interest.
 * DPR = APR / 365
 * daily_interest = outstanding_balance * DPR
 * Returns daily interest in cents (integer).
 */
export function calculateDailyCreditCardInterest(
  outstandingBalance: number,
  apr: number,
): number {
  if (outstandingBalance <= 0 || apr <= 0) {
    return 0;
  }
  const dpr = apr / 365;
  return bankersRound(outstandingBalance * dpr);
}

/**
 * Calculate monthly credit card interest based on average daily balance.
 * ADB = sum(daily_balances) / days_in_cycle
 * monthly_interest = ADB * DPR * days_in_cycle
 */
export function calculateMonthlyCreditCardInterest(
  averageDailyBalance: number,
  apr: number,
  daysInCycle: number,
): number {
  if (averageDailyBalance <= 0 || apr <= 0 || daysInCycle <= 0) {
    return 0;
  }
  const dpr = apr / 365;
  return bankersRound(averageDailyBalance * dpr * daysInCycle);
}

/**
 * Calculate loan amortization monthly payment.
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 *
 * @param principal - Loan amount in cents
 * @param annualRate - Annual interest rate (e.g., 0.065 for 6.5%)
 * @param termMonths - Total number of monthly payments
 * @returns Monthly payment in cents (integer)
 */
export function calculateAmortizationPayment(
  principal: number,
  annualRate: number,
  termMonths: number,
): number {
  if (principal <= 0 || termMonths <= 0) {
    return 0;
  }
  if (annualRate <= 0) {
    // Zero-interest loan
    return bankersRound(principal / termMonths);
  }

  const r = annualRate / 12;
  const factor = Math.pow(1 + r, termMonths);
  const payment = principal * (r * factor) / (factor - 1);
  return bankersRound(payment);
}

/**
 * Split a loan payment into interest and principal portions.
 */
export function splitLoanPayment(
  remainingPrincipal: number,
  annualRate: number,
  monthlyPayment: number,
): { interest: number; principal: number } {
  const interestPortion = bankersRound(remainingPrincipal * (annualRate / 12));
  const principalPortion = monthlyPayment - interestPortion;
  return {
    interest: interestPortion,
    principal: principalPortion,
  };
}

/**
 * Generate a full amortization schedule.
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
): Array<{ month: number; payment: number; interest: number; principal: number; remaining: number }> {
  const monthlyPayment = calculateAmortizationPayment(principal, annualRate, termMonths);
  const schedule: Array<{
    month: number;
    payment: number;
    interest: number;
    principal: number;
    remaining: number;
  }> = [];

  let remaining = principal;

  for (let month = 1; month <= termMonths; month++) {
    const interest = bankersRound(remaining * (annualRate / 12));
    let principalPart: number;
    let payment: number;

    if (month === termMonths) {
      // Last payment covers exact remaining balance
      principalPart = remaining;
      payment = remaining + interest;
    } else {
      payment = monthlyPayment;
      principalPart = payment - interest;
    }

    remaining = remaining - principalPart;
    if (remaining < 0) remaining = 0;

    schedule.push({
      month,
      payment,
      interest,
      principal: principalPart,
      remaining,
    });
  }

  return schedule;
}

/**
 * Calculate compound interest.
 * A = P * (1 + r/n)^(n*t)
 */
export function calculateCompoundInterest(
  principal: number,
  annualRate: number,
  compoundingsPerYear: number,
  years: number,
): number {
  const amount = principal * Math.pow(1 + annualRate / compoundingsPerYear, compoundingsPerYear * years);
  return bankersRound(amount);
}

/**
 * Calculate simple interest.
 * I = P * r * t
 */
export function calculateSimpleInterest(
  principal: number,
  annualRate: number,
  years: number,
): number {
  return bankersRound(principal * annualRate * years);
}

/**
 * Calculate overdraft daily interest.
 * If checking_balance < 0: daily_charge = |balance| * (APR / 365)
 */
export function calculateOverdraftDailyInterest(
  negativeBalance: number,
  apr: number,
): number {
  const absBalance = Math.abs(negativeBalance);
  if (absBalance <= 0 || apr <= 0) {
    return 0;
  }
  return bankersRound(absBalance * (apr / 365));
}

/**
 * Banker's rounding (round half to even).
 * This is the standard for financial calculations.
 */
export function bankersRound(value: number): number {
  if (value === 0) return 0;
  const rounded = Math.round(value);
  // Check if exactly at .5
  const diff = Math.abs(value - (rounded - 0.5));
  if (diff < 1e-10) {
    // Exactly at .5 — round to even
    return rounded % 2 === 0 ? rounded : rounded - 1;
  }
  return rounded;
}

/**
 * Calculate minimum credit card payment.
 * MAX(floor, percentage * balance)
 */
export function calculateMinimumPayment(
  statementBalance: number,
  minimumFloor: number,
  minimumPercent: number,
): number {
  if (statementBalance <= 0) return 0;
  if (statementBalance <= minimumFloor) return statementBalance;
  return Math.max(minimumFloor, bankersRound(statementBalance * minimumPercent));
}
