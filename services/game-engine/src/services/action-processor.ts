import { Pool, PoolClient } from 'pg';
import type { GameAction, GameActionResult, GameDate } from '@moneylife/shared-types';
import {
  advanceDay,
  isLastDayOfMonth,
  formatDate,
  addDays,
  createRng,
  selectDailyScenarios,
  getCardsPerDay,
  generateDecisionCard,
  calculateSavingsInterest,
  calculateMonthlyCreditCardInterest,
  calculateCreditHealthIndex,
  calculateBudgetScore,
  daysInMonth,
  type ScenarioEntry,
  type ScenarioData,
} from '@moneylife/simulation-engine';
import type { GameRow } from '../models/game.js';
import { findAccountsByGameId, type AccountRow } from '../models/account.js';
import { buildGameState } from './game-state.js';

// ---------- levels config (inlined from packages/config) ----------

interface LevelDef {
  level: number;
  cumulativeXp: number;
  xpBonus: number;
  coinBonus: number;
}

const LEVELS: LevelDef[] = [
  { level: 1, cumulativeXp: 500, xpBonus: 250, coinBonus: 100 },
  { level: 2, cumulativeXp: 2000, xpBonus: 500, coinBonus: 200 },
  { level: 3, cumulativeXp: 5000, xpBonus: 750, coinBonus: 300 },
  { level: 4, cumulativeXp: 10000, xpBonus: 1000, coinBonus: 400 },
  { level: 5, cumulativeXp: 18000, xpBonus: 1250, coinBonus: 500 },
  { level: 6, cumulativeXp: 30000, xpBonus: 1500, coinBonus: 600 },
  { level: 7, cumulativeXp: 48000, xpBonus: 1750, coinBonus: 700 },
  { level: 8, cumulativeXp: 73000, xpBonus: 2000, coinBonus: 800 },
];

// ---------- helpers ----------

function gameDateStr(d: GameDate): string {
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
}

async function awardXp(
  client: PoolClient,
  gameId: string,
  amount: number,
  reason: string,
  currentDate: string,
): Promise<{ leveledUp: boolean; newLevel: number; newXp: number }> {
  const res = await client.query(
    'UPDATE games SET total_xp = total_xp + $1, updated_at = NOW() WHERE id = $2 RETURNING total_xp, current_level',
    [amount, gameId],
  );
  let totalXp: number = res.rows[0].total_xp;
  let currentLevel: number = res.rows[0].current_level;
  let leveledUp = false;

  // Check level-up
  while (currentLevel < 8) {
    const nextLevel = LEVELS.find(l => l.level === currentLevel + 1);
    if (!nextLevel) break;
    if (totalXp >= nextLevel.cumulativeXp) {
      currentLevel = nextLevel.level;
      leveledUp = true;
      // Award level-up bonus
      const prevLevelDef = LEVELS.find(l => l.level === currentLevel);
      if (prevLevelDef) {
        totalXp += prevLevelDef.xpBonus;
        await client.query(
          'UPDATE games SET total_xp = $1, current_level = $2, total_coins = total_coins + $3 WHERE id = $4',
          [totalXp, currentLevel, prevLevelDef.coinBonus, gameId],
        );
      }
    } else {
      break;
    }
  }

  if (leveledUp) {
    await client.query(
      'UPDATE games SET current_level = $1 WHERE id = $2',
      [currentLevel, gameId],
    );
  }

  // Log event
  await client.query(
    `INSERT INTO game_events (game_id, type, game_date, description, data)
     VALUES ($1, 'xp_awarded', $2, $3, $4)`,
    [gameId, currentDate, `Earned ${amount} XP: ${reason}`, JSON.stringify({ amount, reason })],
  );

  return { leveledUp, newLevel: currentLevel, newXp: totalXp };
}

async function getCheckingAccount(client: PoolClient, gameId: string): Promise<AccountRow> {
  const res = await client.query(
    "SELECT * FROM game_accounts WHERE game_id = $1 AND type = 'checking' AND status = 'active' LIMIT 1",
    [gameId],
  );
  return res.rows[0];
}

async function createTransaction(
  client: PoolClient,
  gameId: string,
  accountId: string,
  gameDate: string,
  type: string,
  category: string,
  amount: number,
  balanceAfter: number,
  description: string,
  cardId?: string,
  isAutomated: boolean = false,
): Promise<void> {
  await client.query(
    `INSERT INTO transactions (game_id, account_id, game_date, type, category, amount, balance_after, description, card_id, is_automated)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [gameId, accountId, gameDate, type, category, amount, balanceAfter, description, cardId ?? null, isAutomated],
  );
}

async function updateAccountBalance(client: PoolClient, accountId: string, delta: number): Promise<number> {
  const res = await client.query(
    'UPDATE game_accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2 RETURNING balance',
    [delta, accountId],
  );
  return parseInt(res.rows[0].balance, 10);
}

function getNextDueDate(current: string, frequency: string): string {
  const [y, m, d] = current.split('-').map(Number);
  const date: GameDate = { year: y, month: m, day: d };
  switch (frequency) {
    case 'monthly': {
      let nm = date.month + 1;
      let ny = date.year;
      if (nm > 12) { nm = 1; ny++; }
      const maxD = daysInMonth(ny, nm);
      return gameDateStr({ year: ny, month: nm, day: Math.min(date.day, maxD) });
    }
    case 'quarterly': {
      let nm = date.month + 3;
      let ny = date.year;
      while (nm > 12) { nm -= 12; ny++; }
      const maxD = daysInMonth(ny, nm);
      return gameDateStr({ year: ny, month: nm, day: Math.min(date.day, maxD) });
    }
    case 'annually': {
      const ny = date.year + 1;
      const maxD = daysInMonth(ny, date.month);
      return gameDateStr({ year: ny, month: date.month, day: Math.min(date.day, maxD) });
    }
    case 'weekly':
      return gameDateStr(addDays(date, 7));
    case 'biweekly':
      return gameDateStr(addDays(date, 14));
    default:
      return gameDateStr(addDays(date, 30));
  }
}

// ---------- month-end processing ----------

async function processMonthEnd(
  client: PoolClient,
  game: GameRow,
  currentDate: GameDate,
): Promise<{ events: Array<{ type: string; description: string; timestamp: GameDate; data: Record<string, unknown> }> }> {
  const dateStr = gameDateStr(currentDate);
  const gameId = game.id;
  const events: Array<{ type: string; description: string; timestamp: GameDate; data: Record<string, unknown> }> = [];
  let monthXp = 0;
  let monthCoins = 0;
  let incomeTotal = 0;
  let expenseTotal = 0;

  // 1. Deposit salary
  const checking = await getCheckingAccount(client, gameId);
  if (checking) {
    const income = parseInt(game.monthly_income, 10);
    const newBal = await updateAccountBalance(client, checking.id, income);
    await createTransaction(client, gameId, checking.id, dateStr, 'income', 'salary', income, newBal, 'Monthly salary deposit', undefined, true);
    incomeTotal += income;
    events.push({ type: 'salary_deposited', description: `Salary of ${income} cents deposited`, timestamp: currentDate, data: { amount: income } });
  }

  // 2. Process all scheduled bills
  const bills = await client.query(
    "SELECT * FROM scheduled_bills WHERE game_id = $1 AND is_active = true AND next_due_date <= $2",
    [gameId, dateStr],
  );

  for (const bill of bills.rows) {
    const acct = checking; // Default to checking
    if (acct) {
      const amt = parseInt(bill.amount, 10);
      const newBal = await updateAccountBalance(client, acct.id, -amt);
      await createTransaction(client, gameId, acct.id, dateStr, 'expense', bill.category, -amt, newBal, `Bill: ${bill.name}`, undefined, true);
      expenseTotal += amt;

      // Update next due date
      const nextDue = getNextDueDate(bill.next_due_date instanceof Date ? bill.next_due_date.toISOString().split('T')[0] : bill.next_due_date, bill.frequency);
      await client.query('UPDATE scheduled_bills SET next_due_date = $1, updated_at = NOW() WHERE id = $2', [nextDue, bill.id]);
    }
  }

  // 3. Savings interest
  const savingsAccounts = await client.query(
    "SELECT * FROM game_accounts WHERE game_id = $1 AND type = 'savings' AND status = 'active'",
    [gameId],
  );
  let savingsChange = 0;
  for (const sa of savingsAccounts.rows) {
    const balance = parseInt(sa.balance, 10);
    const rate = parseFloat(sa.interest_rate);
    if (balance > 0 && rate > 0) {
      const interest = calculateSavingsInterest(balance, rate);
      if (interest > 0) {
        const newBal = await updateAccountBalance(client, sa.id, interest);
        await createTransaction(client, gameId, sa.id, dateStr, 'interest_credit', 'savings_interest', interest, newBal, 'Monthly savings interest', undefined, true);
        savingsChange += interest;
        incomeTotal += interest;
      }
    }
  }

  // 4. Credit card interest
  const ccAccounts = await client.query(
    "SELECT * FROM game_accounts WHERE game_id = $1 AND type = 'credit_card' AND status = 'active'",
    [gameId],
  );
  let debtChange = 0;
  for (const cc of ccAccounts.rows) {
    const balance = parseInt(cc.balance, 10);
    // Credit card balance is negative (money owed)
    const outstanding = Math.abs(Math.min(0, balance));
    if (outstanding > 0) {
      const rate = parseFloat(cc.interest_rate);
      const daysInCycle = daysInMonth(currentDate.year, currentDate.month);
      const interest = calculateMonthlyCreditCardInterest(outstanding, rate, daysInCycle);
      if (interest > 0) {
        const newBal = await updateAccountBalance(client, cc.id, -interest);
        await createTransaction(client, gameId, cc.id, dateStr, 'interest_debit', 'credit_card_interest', -interest, newBal, 'Credit card interest charge', undefined, true);
        expenseTotal += interest;
        debtChange += interest;
      }
    }
  }

  // 5. Recalculate net worth
  const allAccounts = await client.query(
    "SELECT * FROM game_accounts WHERE game_id = $1 AND status = 'active'",
    [gameId],
  );
  let netWorth = 0;
  const accountTypes: string[] = [];
  const accountAges: number[] = [];
  let totalCreditUsed = 0;
  let totalCreditAvailable = 0;

  for (const acct of allAccounts.rows) {
    const bal = parseInt(acct.balance, 10);
    netWorth += bal;
    accountTypes.push(acct.type);
    // Approximate age in months from opened date
    const opened = acct.opened_game_date instanceof Date ? acct.opened_game_date : new Date(acct.opened_game_date);
    const monthsAge = (currentDate.year - opened.getFullYear()) * 12 + (currentDate.month - (opened.getMonth() + 1));
    accountAges.push(Math.max(0, monthsAge));
    if (acct.type === 'credit_card' && acct.credit_limit) {
      totalCreditAvailable += parseInt(acct.credit_limit, 10);
      totalCreditUsed += Math.abs(Math.min(0, bal));
    }
  }

  // 6. Calculate Credit Health Index
  const chiResult = calculateCreditHealthIndex({
    paymentHistory: { onTimePayments: bills.rows.length, latePayments: [], missedPayments: [], collections: 0 },
    utilization: { totalCreditUsed, totalCreditAvailable, hasAnyCreditAccounts: ccAccounts.rows.length > 0 },
    accountAge: { accountAgesMonths: accountAges },
    creditMix: { accountTypes },
    newCredit: { applicationsLast6Months: 0 },
  });

  // 7. Budget score (simplified — use transactions this month)
  const monthStart = `${currentDate.year}-${String(currentDate.month).padStart(2, '0')}-01`;
  const txns = await client.query(
    "SELECT category, SUM(ABS(amount)) as spent FROM transactions WHERE game_id = $1 AND game_date >= $2 AND game_date <= $3 AND amount < 0 GROUP BY category",
    [gameId, monthStart, dateStr],
  );
  const budgetCategories = txns.rows.map((r: { category: string; spent: string }) => ({
    category: r.category || 'other',
    budgeted: Math.round(parseInt(game.monthly_income, 10) / Math.max(1, txns.rows.length)),
    spent: parseInt(r.spent, 10),
  }));
  const budgetScore = budgetCategories.length > 0 ? calculateBudgetScore(budgetCategories) : 50;

  // 8. Update game state
  await client.query(
    `UPDATE games SET net_worth = $1, chi_score = $2, chi_payment_history = $3, chi_utilization = $4,
     chi_credit_age = $5, chi_credit_mix = $6, chi_new_inquiries = $7, budget_score = $8, updated_at = NOW()
     WHERE id = $9`,
    [
      netWorth, chiResult.overall, chiResult.factors.paymentHistory, chiResult.factors.utilization,
      chiResult.factors.accountAge, chiResult.factors.creditMix, chiResult.factors.newCredit,
      budgetScore, gameId,
    ],
  );

  // 9. Monthly report
  const gameMonth = `${currentDate.year}-${String(currentDate.month).padStart(2, '0')}-01`;
  await client.query(
    `INSERT INTO monthly_reports (game_id, game_month, income_total, expense_total, savings_change, investment_change, debt_change, net_worth, chi_score, budget_score, xp_earned, coins_earned, highlights)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     ON CONFLICT (game_id, game_month) DO UPDATE SET income_total = EXCLUDED.income_total, expense_total = EXCLUDED.expense_total,
     savings_change = EXCLUDED.savings_change, net_worth = EXCLUDED.net_worth, chi_score = EXCLUDED.chi_score, budget_score = EXCLUDED.budget_score,
     xp_earned = EXCLUDED.xp_earned, coins_earned = EXCLUDED.coins_earned`,
    [
      gameId, gameMonth, incomeTotal, expenseTotal, savingsChange, 0, debtChange,
      netWorth, chiResult.overall, budgetScore, monthXp, monthCoins,
      JSON.stringify([{ type: 'month_end', message: `Month-end processed for ${currentDate.month}/${currentDate.year}` }]),
    ],
  );

  // 10. Month-end XP bonus
  await awardXp(client, gameId, 50, 'month-end bonus', dateStr);

  events.push({
    type: 'month_end_processed',
    description: `Month-end processed: income ${incomeTotal}, expenses ${expenseTotal}`,
    timestamp: currentDate,
    data: { incomeTotal, expenseTotal, netWorth, chiScore: chiResult.overall, budgetScore },
  });

  return { events };
}

// ---------- daily card generation ----------

async function generateDailyCards(
  client: PoolClient,
  game: GameRow,
  currentDate: GameDate,
): Promise<void> {
  const dateStr = gameDateStr(currentDate);
  const seed = `${game.random_seed}-${dateStr}`;
  const rng = createRng(seed);
  const numCards = getCardsPerDay(game.current_level, rng);

  // Load all decision cards from DB as ScenarioEntry
  const allCards = await client.query(
    "SELECT * FROM decision_cards WHERE is_active = true",
  );

  if (allCards.rows.length === 0) return;

  const scenarioEntries: ScenarioEntry[] = allCards.rows.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    category: r.category as string,
    personaTags: (r.persona_tags as string[]) ?? [],
    levelRange: [r.level_range_min as number, r.level_range_max as number] as [number, number],
    frequencyWeight: r.frequency_weight as number,
  }));

  // Get recent card ids (last 7 days)
  const recentCards = await client.query(
    "SELECT card_id FROM game_pending_cards WHERE game_id = $1 AND presented_game_date >= ($2::date - interval '7 days')",
    [game.id, dateStr],
  );
  const recentCardIds = recentCards.rows.map((r: { card_id: string }) => r.card_id);

  const selected = selectDailyScenarios(
    rng,
    scenarioEntries,
    { persona: game.persona, level: game.current_level, recentCardIds, recentCategories: new Map() },
    numCards,
  );

  for (const entry of selected) {
    // Get full card data
    const cardRow = allCards.rows.find((r: Record<string, unknown>) => r.id === entry.id);
    if (!cardRow) continue;

    const expiresDate = addDays(currentDate, 3);
    await client.query(
      `INSERT INTO game_pending_cards (game_id, card_id, presented_game_date, expires_game_date, status)
       VALUES ($1, $2, $3, $4, 'pending')`,
      [game.id, entry.id, dateStr, gameDateStr(expiresDate)],
    );
  }
}

// ---------- process daily bills ----------

async function processDailyBills(
  client: PoolClient,
  gameId: string,
  currentDate: GameDate,
): Promise<void> {
  const dateStr = gameDateStr(currentDate);
  const bills = await client.query(
    "SELECT * FROM scheduled_bills WHERE game_id = $1 AND is_active = true AND auto_pay = true AND next_due_date = $2",
    [gameId, dateStr],
  );

  for (const bill of bills.rows) {
    const checking = await getCheckingAccount(client, gameId);
    if (!checking) continue;

    const amt = parseInt(bill.amount, 10);
    const newBal = await updateAccountBalance(client, checking.id, -amt);
    await createTransaction(client, gameId, checking.id, dateStr, 'expense', bill.category, -amt, newBal, `Auto-pay: ${bill.name}`, undefined, true);

    const nextDue = getNextDueDate(dateStr, bill.frequency);
    await client.query('UPDATE scheduled_bills SET next_due_date = $1, updated_at = NOW() WHERE id = $2', [nextDue, bill.id]);
  }
}

// ---------- main processor ----------

export async function processAction(
  pool: Pool,
  game: GameRow,
  action: GameAction,
): Promise<GameActionResult> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Optimistic locking
    const lockResult = await client.query(
      'SELECT state_version FROM games WHERE id = $1 FOR UPDATE',
      [game.id],
    );

    if (lockResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'GAME_NOT_FOUND', message: 'Game not found' }] };
    }

    const accounts = await findAccountsByGameId(pool, game.id);
    const gameState = buildGameState(game, accounts);
    const currentDate = gameState.currentDate;

    if (action.type === 'advance_day') {
      // Check for unresolved pending cards
      const pendingCards = await client.query(
        "SELECT COUNT(*) FROM game_pending_cards WHERE game_id = $1 AND status = 'pending'",
        [game.id],
      );
      if (parseInt(pendingCards.rows[0].count, 10) > 0) {
        await client.query('ROLLBACK');
        return {
          success: false, newState: {}, events: [], rewards: [],
          errors: [{ code: 'PENDING_CARDS', message: 'Resolve all pending decision cards before advancing' }],
        };
      }

      const isMonthEnd = isLastDayOfMonth(currentDate);

      // Process month-end BEFORE advancing day
      const allEvents: Array<{ type: string; description: string; timestamp: GameDate; data: Record<string, unknown> }> = [];
      if (isMonthEnd) {
        const meResult = await processMonthEnd(client, game, currentDate);
        allEvents.push(...meResult.events);
      }

      const nextDate = advanceDay(currentDate);
      const dateStr = gameDateStr(nextDate);

      // Process daily autopay bills
      await processDailyBills(client, game.id, nextDate);

      // Generate daily decision cards
      await generateDailyCards(client, game, nextDate);

      // Award daily XP (10 base)
      const xpResult = await awardXp(client, game.id, 10, 'daily advance', dateStr);

      await client.query(
        'UPDATE games SET current_game_date = $1, state_version = state_version + 1, updated_at = NOW() WHERE id = $2',
        [dateStr, game.id],
      );

      await client.query('COMMIT');

      allEvents.push({ type: 'day_advanced', description: 'Day advanced', timestamp: nextDate, data: {} });
      if (xpResult.leveledUp) {
        allEvents.push({ type: 'level_up', description: `Leveled up to ${xpResult.newLevel}!`, timestamp: nextDate, data: { newLevel: xpResult.newLevel } });
      }

      return {
        success: true,
        newState: { currentDate: nextDate },
        events: allEvents,
        rewards: [],
      };

    } else if (action.type === 'decide_card') {
      const cardId = action.payload.cardId as string;
      const optionId = action.payload.optionId as string;

      if (!cardId || !optionId) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'VALIDATION_ERROR', message: 'cardId and optionId are required' }] };
      }

      // Get the pending card
      const pendingResult = await client.query(
        "SELECT gpc.*, dc.options, dc.category, dc.title FROM game_pending_cards gpc JOIN decision_cards dc ON dc.id = gpc.card_id WHERE gpc.id = $1 AND gpc.game_id = $2 AND gpc.status = 'pending'",
        [cardId, game.id],
      );

      if (pendingResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'CARD_NOT_FOUND', message: 'Pending card not found' }] };
      }

      const pendingCard = pendingResult.rows[0];
      const cardOptions = pendingCard.options as Array<{ id: string; label: string; cost?: number; xp?: number; coins?: number; happiness?: number; effects?: { balance_change?: number; xp?: number; coins?: number; happiness?: number; consequence_card_id?: string } }>;
      const chosenOption = cardOptions.find(o => o.id === optionId);

      if (!chosenOption) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'INVALID_OPTION', message: 'Option not found on card' }] };
      }

      const dateStr = gameDateStr(currentDate);
      const events: Array<{ type: string; description: string; timestamp: GameDate; data: Record<string, unknown> }> = [];

      // Apply balance changes
      const cost = chosenOption.cost ?? chosenOption.effects?.balance_change ?? 0;
      let xpAwarded = chosenOption.xp ?? chosenOption.effects?.xp ?? 0;
      let coinsAwarded = chosenOption.coins ?? chosenOption.effects?.coins ?? 0;
      const happinessChange = chosenOption.happiness ?? chosenOption.effects?.happiness ?? 0;

      if (cost > 0) {
        const checking = await getCheckingAccount(client, game.id);
        if (checking) {
          const newBal = await updateAccountBalance(client, checking.id, -cost);
          await createTransaction(client, game.id, checking.id, dateStr, 'expense', pendingCard.category, -cost, newBal, `Card: ${pendingCard.title} — ${chosenOption.label}`, pendingCard.card_id);
        }
      } else if (cost < 0) {
        // Negative cost = income
        const checking = await getCheckingAccount(client, game.id);
        if (checking) {
          const newBal = await updateAccountBalance(client, checking.id, -cost); // -cost is positive
          await createTransaction(client, game.id, checking.id, dateStr, 'income', pendingCard.category, -cost, newBal, `Card: ${pendingCard.title} — ${chosenOption.label}`, pendingCard.card_id);
        }
      }

      // Mark card resolved
      await client.query(
        "UPDATE game_pending_cards SET selected_option_id = $1, resolved_at = NOW(), status = 'resolved', xp_awarded = $2, coins_awarded = $3 WHERE id = $4",
        [optionId, xpAwarded, coinsAwarded, cardId],
      );

      // Award XP and coins
      if (xpAwarded > 0) {
        await awardXp(client, game.id, xpAwarded, `card decision: ${pendingCard.title}`, dateStr);
      }
      if (coinsAwarded > 0) {
        await client.query('UPDATE games SET total_coins = total_coins + $1 WHERE id = $2', [coinsAwarded, game.id]);
      }

      // Update happiness
      if (happinessChange !== 0) {
        await client.query(
          'UPDATE games SET happiness = GREATEST(0, LEAST(100, happiness + $1)) WHERE id = $2',
          [happinessChange, game.id],
        );
      }

      // Queue consequence chains
      const consequenceCardId = chosenOption.effects?.consequence_card_id;
      if (consequenceCardId) {
        const futureDate = addDays(currentDate, Math.floor(Math.random() * 14) + 3);
        // Check if card exists in decision_cards
        const ccExists = await client.query('SELECT id FROM decision_cards WHERE id = $1', [consequenceCardId]);
        if (ccExists.rows.length > 0) {
          await client.query(
            `INSERT INTO game_pending_cards (game_id, card_id, presented_game_date, expires_game_date, status)
             VALUES ($1, $2, $3, $4, 'pending')`,
            [game.id, consequenceCardId, gameDateStr(futureDate), gameDateStr(addDays(futureDate, 3))],
          );
        }
      }

      await client.query('UPDATE games SET state_version = state_version + 1, updated_at = NOW() WHERE id = $1', [game.id]);
      await client.query('COMMIT');

      events.push({ type: 'card_decided', description: `Decided card ${cardId}: ${chosenOption.label}`, timestamp: currentDate, data: { cardId, optionId, cost, xpAwarded, coinsAwarded } });

      return {
        success: true,
        newState: {},
        events,
        rewards: coinsAwarded > 0 ? [{ type: 'coins', amount: coinsAwarded }] : [],
      };

    } else if (action.type === 'transfer') {
      const fromAccountId = action.payload.fromAccountId as string;
      const toAccountId = action.payload.toAccountId as string;
      const amount = action.payload.amount as number;

      if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'VALIDATION_ERROR', message: 'fromAccountId, toAccountId, and positive amount are required' }] };
      }

      const fromAccount = accounts.find(a => a.id === fromAccountId);
      if (!fromAccount || parseInt(fromAccount.balance, 10) < amount) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'INSUFFICIENT_FUNDS', message: 'Insufficient funds for transfer' }] };
      }

      const fromBal = await updateAccountBalance(client, fromAccountId, -amount);
      const toBal = await updateAccountBalance(client, toAccountId, amount);

      const dateStr = gameDateStr(currentDate);
      await createTransaction(client, game.id, fromAccountId, dateStr, 'transfer', 'transfer', -amount, fromBal, 'Transfer out');
      await createTransaction(client, game.id, toAccountId, dateStr, 'transfer', 'transfer', amount, toBal, 'Transfer in');

      await client.query('UPDATE games SET state_version = state_version + 1, updated_at = NOW() WHERE id = $1', [game.id]);
      await client.query('COMMIT');

      return {
        success: true,
        newState: {},
        events: [{ type: 'transfer', description: `Transferred ${amount} cents`, timestamp: currentDate, data: { fromAccountId, toAccountId, amount } }],
        rewards: [],
      };

    } else if (action.type === 'set_budget') {
      const allocations = action.payload.allocations as Record<string, number> | undefined;
      if (!allocations || typeof allocations !== 'object') {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'VALIDATION_ERROR', message: 'allocations object is required' }] };
      }

      // Store budget allocations in game events as JSONB (simple approach)
      const dateStr = gameDateStr(currentDate);
      await client.query(
        `INSERT INTO game_events (game_id, type, game_date, description, data)
         VALUES ($1, 'budget_set', $2, 'Budget allocations updated', $3)`,
        [game.id, dateStr, JSON.stringify(allocations)],
      );

      await client.query('UPDATE games SET state_version = state_version + 1, updated_at = NOW() WHERE id = $1', [game.id]);
      await client.query('COMMIT');

      return {
        success: true, newState: {},
        events: [{ type: 'budget_set', description: 'Budget allocations updated', timestamp: currentDate, data: allocations as Record<string, unknown> }],
        rewards: [],
      };

    } else if (action.type === 'open_account') {
      const accountType = action.payload.accountType as string;
      const name = (action.payload.name as string) ?? accountType;

      const validTypes = ['savings', 'credit_card', 'student_loan', 'auto_loan', 'mortgage', 'personal_loan', 'investment_brokerage', 'investment_retirement'];
      if (!validTypes.includes(accountType)) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'VALIDATION_ERROR', message: `Invalid account type: ${accountType}` }] };
      }

      const dateStr = gameDateStr(currentDate);
      let interestRate = 0;
      let creditLimit: number | null = null;
      let principal: number | null = null;
      let monthlyPayment: number | null = null;
      let termMonths: number | null = null;

      if (accountType === 'savings') {
        interestRate = 0.025;
      } else if (accountType === 'credit_card') {
        interestRate = 0.219;
        creditLimit = action.payload.creditLimit as number ?? 500000;
      } else if (accountType.includes('loan') || accountType === 'mortgage') {
        interestRate = action.payload.interestRate as number ?? 0.065;
        principal = action.payload.principal as number ?? 0;
        termMonths = action.payload.termMonths as number ?? 60;
      }

      const res = await client.query(
        `INSERT INTO game_accounts (game_id, type, name, balance, interest_rate, credit_limit, principal, remaining_principal, monthly_payment, term_months, opened_game_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active') RETURNING id`,
        [game.id, accountType, name, principal ? principal : 0, interestRate, creditLimit, principal, principal, monthlyPayment, termMonths, dateStr],
      );

      // If it's a loan, deposit the principal into checking
      if (principal && principal > 0) {
        const checking = await getCheckingAccount(client, game.id);
        if (checking) {
          const newBal = await updateAccountBalance(client, checking.id, principal);
          await createTransaction(client, game.id, checking.id, dateStr, 'loan_disbursement', 'loan', principal, newBal, `${name} disbursement`);
        }
      }

      await client.query('UPDATE games SET state_version = state_version + 1, updated_at = NOW() WHERE id = $1', [game.id]);
      await client.query('COMMIT');

      return {
        success: true, newState: {},
        events: [{ type: 'account_opened', description: `Opened ${accountType}: ${name}`, timestamp: currentDate, data: { accountId: res.rows[0].id, accountType } }],
        rewards: [],
      };

    } else if (action.type === 'close_account') {
      const accountId = action.payload.accountId as string;
      if (!accountId) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'VALIDATION_ERROR', message: 'accountId is required' }] };
      }

      const acct = accounts.find(a => a.id === accountId);
      if (!acct) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'ACCOUNT_NOT_FOUND', message: 'Account not found' }] };
      }

      const balance = parseInt(acct.balance, 10);
      if (balance < 0) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'OUTSTANDING_BALANCE', message: 'Cannot close account with outstanding balance' }] };
      }

      // Transfer remaining balance to checking if not checking
      if (acct.type !== 'checking' && balance > 0) {
        const checking = await getCheckingAccount(client, game.id);
        if (checking) {
          const dateStr = gameDateStr(currentDate);
          await updateAccountBalance(client, checking.id, balance);
          await createTransaction(client, game.id, checking.id, dateStr, 'transfer', 'account_closure', balance, parseInt(checking.balance, 10) + balance, `Funds from closed ${acct.name}`);
        }
      }

      await client.query("UPDATE game_accounts SET status = 'closed', balance = 0, updated_at = NOW() WHERE id = $1", [accountId]);
      await client.query('UPDATE games SET state_version = state_version + 1, updated_at = NOW() WHERE id = $1', [game.id]);
      await client.query('COMMIT');

      return {
        success: true, newState: {},
        events: [{ type: 'account_closed', description: `Closed account ${acct.name}`, timestamp: currentDate, data: { accountId } }],
        rewards: [],
      };

    } else if (action.type === 'set_autopay') {
      const billId = action.payload.billId as string;
      const enabled = action.payload.enabled as boolean ?? true;

      if (!billId) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'VALIDATION_ERROR', message: 'billId is required' }] };
      }

      await client.query('UPDATE scheduled_bills SET auto_pay = $1, updated_at = NOW() WHERE id = $2 AND game_id = $3', [enabled, billId, game.id]);
      await client.query('UPDATE games SET state_version = state_version + 1, updated_at = NOW() WHERE id = $1', [game.id]);
      await client.query('COMMIT');

      return {
        success: true, newState: {},
        events: [{ type: 'autopay_set', description: `Auto-pay ${enabled ? 'enabled' : 'disabled'}`, timestamp: currentDate, data: { billId, enabled } }],
        rewards: [],
      };

    } else if (action.type === 'invest') {
      const amount = action.payload.amount as number;
      const assetType = (action.payload.assetType as string) ?? 'index';

      if (!amount || amount <= 0) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'VALIDATION_ERROR', message: 'Positive amount required' }] };
      }

      const checking = await getCheckingAccount(client, game.id);
      if (!checking || parseInt(checking.balance, 10) < amount) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'INSUFFICIENT_FUNDS', message: 'Not enough funds to invest' }] };
      }

      const dateStr = gameDateStr(currentDate);

      // Get or create investment account
      let investAcct = await client.query(
        "SELECT * FROM game_accounts WHERE game_id = $1 AND type = 'investment_brokerage' AND status = 'active' LIMIT 1",
        [game.id],
      );
      if (investAcct.rows.length === 0) {
        await client.query(
          `INSERT INTO game_accounts (game_id, type, name, balance, interest_rate, opened_game_date, status)
           VALUES ($1, 'investment_brokerage', 'Investment Account', 0, 0, $2, 'active')`,
          [game.id, dateStr],
        );
        investAcct = await client.query(
          "SELECT * FROM game_accounts WHERE game_id = $1 AND type = 'investment_brokerage' AND status = 'active' LIMIT 1",
          [game.id],
        );
      }

      const investId = investAcct.rows[0].id;
      const newCheckBal = await updateAccountBalance(client, checking.id, -amount);
      const newInvestBal = await updateAccountBalance(client, investId, amount);

      await createTransaction(client, game.id, checking.id, dateStr, 'investment_buy', 'investment', -amount, newCheckBal, `Invested in ${assetType}`);
      await createTransaction(client, game.id, investId, dateStr, 'investment_buy', 'investment', amount, newInvestBal, `Bought ${assetType}`, undefined);

      // Store holding metadata in event
      await client.query(
        `INSERT INTO game_events (game_id, type, game_date, description, data)
         VALUES ($1, 'investment_buy', $2, $3, $4)`,
        [game.id, dateStr, `Invested ${amount} in ${assetType}`, JSON.stringify({ amount, assetType })],
      );

      await client.query('UPDATE games SET state_version = state_version + 1, updated_at = NOW() WHERE id = $1', [game.id]);
      await client.query('COMMIT');

      return {
        success: true, newState: {},
        events: [{ type: 'invested', description: `Invested ${amount} in ${assetType}`, timestamp: currentDate, data: { amount, assetType } }],
        rewards: [],
      };

    } else if (action.type === 'sell_investment') {
      const amount = action.payload.amount as number;

      if (!amount || amount <= 0) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'VALIDATION_ERROR', message: 'Positive amount required' }] };
      }

      const investAcct = await client.query(
        "SELECT * FROM game_accounts WHERE game_id = $1 AND type = 'investment_brokerage' AND status = 'active' LIMIT 1",
        [game.id],
      );
      if (investAcct.rows.length === 0 || parseInt(investAcct.rows[0].balance, 10) < amount) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'INSUFFICIENT_FUNDS', message: 'Not enough investment balance' }] };
      }

      const dateStr = gameDateStr(currentDate);
      const investId = investAcct.rows[0].id;
      const checking = await getCheckingAccount(client, game.id);
      if (!checking) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'NO_CHECKING', message: 'No checking account' }] };
      }

      const newInvestBal = await updateAccountBalance(client, investId, -amount);
      const newCheckBal = await updateAccountBalance(client, checking.id, amount);

      await createTransaction(client, game.id, investId, dateStr, 'investment_sell', 'investment', -amount, newInvestBal, 'Sold investment');
      await createTransaction(client, game.id, checking.id, dateStr, 'investment_sell', 'investment', amount, newCheckBal, 'Investment proceeds');

      await client.query('UPDATE games SET state_version = state_version + 1, updated_at = NOW() WHERE id = $1', [game.id]);
      await client.query('COMMIT');

      return {
        success: true, newState: {},
        events: [{ type: 'investment_sold', description: `Sold ${amount} in investments`, timestamp: currentDate, data: { amount } }],
        rewards: [],
      };

    } else {
      // Generic action - update version
      await client.query('UPDATE games SET state_version = state_version + 1, updated_at = NOW() WHERE id = $1', [game.id]);
      await client.query('COMMIT');

      return {
        success: true,
        newState: {},
        events: [{ type: action.type, description: `Processed ${action.type}`, timestamp: currentDate, data: action.payload }],
        rewards: [],
      };
    }
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
