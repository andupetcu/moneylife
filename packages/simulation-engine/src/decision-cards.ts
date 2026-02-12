// packages/simulation-engine/src/decision-cards.ts
// Decision card generation, option processing, consequence application

import type { GameDate, DecisionCard, CardOption, Consequence, GameAccount, AccountType } from '@moneylife/shared-types';
import { GameplayError } from '@moneylife/shared-types';
import { createTransferTransaction, type AccountBalance } from './ledger.js';
import { addDays } from './time-engine.js';
import { randomInt, type ScenarioEntry } from './scenarios.js';
import { getLevelConfig } from '@moneylife/config';

export interface ScenarioOption {
  id: string;
  label: string;
  cost: number;
  xp: number;
  coins: number;
  costVariance?: [number, number];
}

export interface ScenarioData {
  id: string;
  category: string;
  subcategory?: string;
  title: string;
  description: string;
  stakeLevel: string;
  options: ScenarioOption[];
}

/**
 * Generate a DecisionCard from scenario data.
 */
export function generateDecisionCard(
  scenario: ScenarioData,
  currentDate: GameDate,
  rng: () => number,
  isBonus: boolean = false,
): DecisionCard {
  const expiresOnDay = addDays(currentDate, 3); // Cards expire after 3 game days

  const options: CardOption[] = scenario.options.map((opt) => {
    let actualCost = opt.cost;
    if (opt.costVariance) {
      actualCost = randomInt(rng, opt.costVariance[0], opt.costVariance[1]);
    }

    const consequences: Consequence[] = [];
    if (actualCost > 0) {
      consequences.push({
        type: 'balance_change',
        accountType: 'checking',
        amount: -actualCost,
        narrative: `Spent ${actualCost} on ${scenario.title}`,
      });
    }

    return {
      id: opt.id,
      label: opt.label,
      description: opt.label,
      consequences,
      xpReward: opt.xp,
      coinReward: opt.coins,
    };
  });

  return {
    id: scenario.id,
    category: scenario.category as DecisionCard['category'],
    title: scenario.title,
    description: scenario.description,
    options,
    expiresOnDay,
    isBonus,
    stakeLevel: scenario.stakeLevel as DecisionCard['stakeLevel'],
  };
}

/**
 * Process a card decision — apply consequences to account balances.
 * Returns the selected option and total balance changes.
 */
export function processCardDecision(
  card: DecisionCard,
  optionId: string,
  balances: Map<string, number>,
  checkingAccountId: string,
  gameId: string,
  date: GameDate,
): { option: CardOption; balanceChanges: Map<string, number> } {
  const option = card.options.find((o) => o.id === optionId);
  if (!option) {
    throw new GameplayError('CARD_NOT_FOUND', `Option ${optionId} not found on card ${card.id}`);
  }

  const balanceChanges = new Map<string, number>();

  for (const consequence of option.consequences) {
    if (consequence.type === 'balance_change') {
      const accountId = checkingAccountId; // Default to checking
      const currentBalance = balances.get(accountId) ?? 0;
      const newBalance = currentBalance + consequence.amount;
      balances.set(accountId, newBalance);
      balanceChanges.set(accountId, (balanceChanges.get(accountId) ?? 0) + consequence.amount);
    }
  }

  return { option, balanceChanges };
}

/**
 * Determine the number of cards for a given level using config.
 */
export function getCardsPerDay(
  level: number,
  rng: () => number,
): number {
  const levelConfig = getLevelConfig(level);
  let count = levelConfig.cardsPerDay.min;
  if (levelConfig.cardsPerDay.max > levelConfig.cardsPerDay.min && rng() < levelConfig.bonusCardChance) {
    count += 1;
  }
  return count;
}

/**
 * Get the XP/coin rewards from a card decision, applying modifiers.
 */
export function calculateCardRewards(
  option: CardOption,
  personaModifier: number,
  streakModifier: number,
  difficultyModifier: number,
): { xp: number; coins: number } {
  const baseXp = option.xpReward;
  const xp = Math.round(baseXp * personaModifier * streakModifier * difficultyModifier);
  const coins = option.coinReward; // Coins are not modified
  return { xp, coins };
}
