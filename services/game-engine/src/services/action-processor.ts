import { Pool, PoolClient } from 'pg';
import type { GameAction, GameActionResult, GameDate, RewardGrant } from '@moneylife/shared-types';
import {
  advanceDay,
  isLastDayOfMonth,
  isLastDayOfQuarter,
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
  rollDailyEvents,
  getInsuranceForEvent,
  INSURANCE_CONFIGS,
  adjustedPremium,
  assessBankruptcy,
  calculateTaxAssessment,
  isTaxFilingDay,
  processClaim,
  type ScenarioEntry,
  type ScenarioData,
  type TriggeredEvent,
  type InsuranceCategory,
  type InsurancePremiumConfig,
} from '@moneylife/simulation-engine';
import { getAllLevels, getLevelConfig, getDifficultyConfig, getRegionConfig } from '@moneylife/config';
import type { DifficultyConfig, RegionConfig, LevelConfig } from '@moneylife/config';
import type { GameRow } from '../models/game.js';
import { findAccountsByGameId, type AccountRow } from '../models/account.js';
import { buildGameState } from './game-state.js';
import { evaluateBadges } from './badge-evaluator.js';

// ---------- levels config (from @moneylife/config) ----------

interface LevelDef {
  level: number;
  cumulativeXp: number;
  xpBonus: number;
  coinBonus: number;
}

const LEVELS: LevelDef[] = getAllLevels().map(l => ({
  level: l.level,
  cumulativeXp: l.cumulativeXp,
  xpBonus: l.xpBonus,
  coinBonus: l.coinBonus,
}));

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
  xpMultiplier: number = 1.0,
): Promise<{ leveledUp: boolean; newLevel: number; newXp: number }> {
  const scaledAmount = Math.round(amount * xpMultiplier);
  const res = await client.query(
    'UPDATE games SET total_xp = total_xp + $1, updated_at = NOW() WHERE id = $2 RETURNING total_xp, current_level',
    [scaledAmount, gameId],
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
  // Fall back to prepaid or savings if no checking (e.g. Teen persona)
  const res = await client.query(
    "SELECT * FROM game_accounts WHERE game_id = $1 AND status = 'active' AND type IN ('checking', 'prepaid', 'savings') ORDER BY CASE type WHEN 'checking' THEN 1 WHEN 'prepaid' THEN 2 WHEN 'savings' THEN 3 END LIMIT 1",
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

// ---------- streak tracking ----------

async function updateStreak(client: PoolClient, game: GameRow): Promise<void> {
  const now = new Date();
  const lastActionAt = game.updated_at instanceof Date ? game.updated_at : new Date(game.updated_at);
  const hoursSinceLastAction = (now.getTime() - lastActionAt.getTime()) / (1000 * 60 * 60);

  // Check for streak shield (grace period from coin purchase)
  let hasShield = false;
  const shieldRes = await client.query(
    "SELECT id FROM game_events WHERE game_id = $1 AND type = 'streak_shield_active' AND created_at > NOW() - interval '48 hours' LIMIT 1",
    [game.id],
  );
  if (shieldRes.rows.length > 0) {
    hasShield = true;
  }

  if (hoursSinceLastAction > 24 && !hasShield) {
    // Reset streak
    await client.query(
      'UPDATE games SET streak_current = 1, updated_at = NOW() WHERE id = $1',
      [game.id],
    );
    // Consume shield if present
    if (shieldRes.rows.length > 0) {
      await client.query("DELETE FROM game_events WHERE id = $1", [shieldRes.rows[0].id]);
    }
  } else {
    // Increment streak
    await client.query(
      'UPDATE games SET streak_current = streak_current + 1, streak_longest = GREATEST(streak_longest, streak_current + 1), updated_at = NOW() WHERE id = $1',
      [game.id],
    );
  }
}

// ---------- XP ledger ----------

async function writeXpLedger(
  client: PoolClient,
  userId: string,
  gameId: string,
  partnerId: string | null,
  amount: number,
  reason: string,
): Promise<void> {
  // Get current total XP for balance_after
  const res = await client.query('SELECT total_xp FROM games WHERE id = $1', [gameId]);
  const balanceAfter = res.rows[0]?.total_xp ?? 0;

  await client.query(
    `INSERT INTO xp_ledger (user_id, game_id, partner_id, amount, balance_after, reason)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, gameId, partnerId, amount, balanceAfter, reason],
  );
}

// ---------- coin ledger ----------

async function writeCoinLedger(
  client: PoolClient,
  userId: string,
  gameId: string,
  partnerId: string | null,
  amount: number,
  reason: string,
): Promise<void> {
  const res = await client.query('SELECT total_coins FROM games WHERE id = $1', [gameId]);
  const balanceAfter = res.rows[0]?.total_coins ?? 0;

  await client.query(
    `INSERT INTO coin_ledger (user_id, partner_id, amount, balance_after, reason)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, partnerId, amount, balanceAfter, reason],
  );
}

// ---------- random events processing ----------

async function processRandomEvents(
  client: PoolClient,
  game: GameRow,
  currentDate: GameDate,
  isMonthEnd: boolean,
  isQuarterEnd: boolean,
): Promise<Array<{ type: string; description: string; timestamp: GameDate; data: Record<string, unknown> }>> {
  const dateStr = gameDateStr(currentDate);
  const gameId = game.id;
  const events: Array<{ type: string; description: string; timestamp: GameDate; data: Record<string, unknown> }> = [];
  const monthlyIncome = parseInt(game.monthly_income, 10);

  // Use event-specific RNG seed
  const seed = `${game.random_seed}-events-${dateStr}`;
  const rng = createRng(seed);

  const triggered = rollDailyEvents(
    rng,
    currentDate,
    game.difficulty,
    game.persona,
    game.current_level,
    monthlyIncome,
    isMonthEnd,
    isQuarterEnd,
  );

  for (const evt of triggered) {
    // Check insurance coverage for insurable events
    let playerPays = evt.amount;
    let insuranceCovered = 0;
    let hadInsurance = false;

    if (evt.insuranceType && !evt.isPositive) {
      const insResult = await checkAndApplyInsurance(client, gameId, evt, dateStr);
      playerPays = insResult.playerPays;
      insuranceCovered = insResult.insuranceCovered;
      hadInsurance = insResult.hadInsurance;
    }

    if (evt.requiresDecision) {
      // Create as a decision card for large events
      await createEventDecisionCard(client, gameId, evt, currentDate, playerPays, hadInsurance, insuranceCovered);
      events.push({
        type: 'random_event_card',
        description: evt.description,
        timestamp: currentDate,
        data: { eventType: evt.type, amount: playerPays, insured: hadInsurance },
      });
    } else {
      // Auto-apply small events and positive events
      await applyRandomEvent(client, gameId, evt, currentDate, playerPays);
      events.push({
        type: 'random_event',
        description: evt.description,
        timestamp: currentDate,
        data: {
          eventType: evt.type,
          amount: evt.isPositive ? evt.amount : -playerPays,
          insured: hadInsurance,
          insuranceCovered,
        },
      });
    }
  }

  return events;
}

async function checkAndApplyInsurance(
  client: PoolClient,
  gameId: string,
  evt: TriggeredEvent,
  dateStr: string,
): Promise<{ playerPays: number; insuranceCovered: number; hadInsurance: boolean }> {
  if (!evt.insuranceType) return { playerPays: evt.amount, insuranceCovered: 0, hadInsurance: false };

  // Look for an active insurance account of the matching type
  const insuranceAcct = await client.query(
    "SELECT * FROM game_accounts WHERE game_id = $1 AND type = 'insurance' AND status = 'active' AND name ILIKE $2 LIMIT 1",
    [gameId, `%${evt.insuranceType}%`],
  );

  if (insuranceAcct.rows.length === 0) {
    return { playerPays: evt.amount, insuranceCovered: 0, hadInsurance: false };
  }

  const config = getInsuranceForEvent(evt.type);
  if (!config) return { playerPays: evt.amount, insuranceCovered: 0, hadInsurance: false };

  // Use the simulation-engine processClaim
  const claimResult = processClaim(
    {
      type: config.type as 'health' | 'auto' | 'renters' | 'homeowners' | 'life' | 'disability',
      monthlyPremium: config.basePremium,
      deductible: config.deductible,
      coverageRate: config.coverageRate,
      isActive: true,
      monthsActive: 1,
      monthsUnpaid: 0,
      claimsThisYear: 0,
      basePremium: config.basePremium,
    },
    evt.amount,
  );

  if (claimResult.covered) {
    // Record the insurance claim transaction
    await createTransaction(
      client, gameId, insuranceAcct.rows[0].id, dateStr,
      'insurance_claim', evt.category, claimResult.insurancePaid,
      parseInt(insuranceAcct.rows[0].balance, 10), // Insurance account balance unchanged
      `Insurance claim: ${evt.description}`,
      undefined, true,
    );

    // Log event
    await client.query(
      `INSERT INTO game_events (game_id, type, game_date, description, data)
       VALUES ($1, 'insurance_claim', $2, $3, $4)`,
      [gameId, dateStr, `Insurance covered ${claimResult.insurancePaid} of ${evt.amount}`,
        JSON.stringify({ eventType: evt.type, totalCost: evt.amount, covered: claimResult.insurancePaid, playerPays: claimResult.playerPays })],
    );
  }

  return {
    playerPays: claimResult.playerPays,
    insuranceCovered: claimResult.insurancePaid,
    hadInsurance: true,
  };
}

async function createEventDecisionCard(
  client: PoolClient,
  gameId: string,
  evt: TriggeredEvent,
  currentDate: GameDate,
  playerPays: number,
  hadInsurance: boolean,
  insuranceCovered: number,
): Promise<void> {
  const dateStr = gameDateStr(currentDate);
  const expiresDate = addDays(currentDate, 3);
  const cardId = `EVT-${evt.type}-${dateStr}`;

  // Build options for the event decision card
  const insuranceNote = hadInsurance ? ` (insurance covers ${insuranceCovered})` : '';
  const options = [
    {
      id: 'A',
      label: 'Pay the full amount',
      cost: playerPays,
      xp: 10,
      coins: 5,
      happiness: -5,
    },
    {
      id: 'B',
      label: 'Pay with credit card',
      cost: 0, // Deferred to credit card
      xp: 5,
      coins: 2,
      happiness: -3,
      effects: { balance_change: 0 },
    },
    {
      id: 'C',
      label: 'Try to negotiate / defer',
      cost: Math.round(playerPays * 0.7),
      xp: 15,
      coins: 8,
      happiness: -2,
    },
  ];

  // Insert as a dynamic decision card
  await client.query(
    `INSERT INTO decision_cards (id, category, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, is_active)
     VALUES ($1, $2, $3, $4, $5, 1, 8, 1, $6, true)
     ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, description = EXCLUDED.description`,
    [
      cardId, evt.category, evt.description,
      `${evt.description}${insuranceNote}. How do you want to handle this?`,
      ['teen', 'student', 'young_adult', 'parent'],
      JSON.stringify(options),
    ],
  );

  // Create the pending card
  await client.query(
    `INSERT INTO game_pending_cards (game_id, card_id, presented_game_date, expires_game_date, status)
     VALUES ($1, $2, $3, $4, 'pending')`,
    [gameId, cardId, dateStr, gameDateStr(expiresDate)],
  );
}

async function applyRandomEvent(
  client: PoolClient,
  gameId: string,
  evt: TriggeredEvent,
  currentDate: GameDate,
  playerPays: number,
): Promise<void> {
  const dateStr = gameDateStr(currentDate);
  const checking = await getCheckingAccount(client, gameId);
  if (!checking) return;

  if (evt.type === 'market_crash') {
    // evt.amount is a percentage — apply to investment balance
    const investAcct = await client.query(
      "SELECT * FROM game_accounts WHERE game_id = $1 AND type = 'investment_brokerage' AND status = 'active' LIMIT 1",
      [gameId],
    );
    if (investAcct.rows.length > 0) {
      const investBal = parseInt(investAcct.rows[0].balance, 10);
      if (investBal > 0) {
        const loss = Math.round(investBal * (evt.amount / 100));
        const newBal = await updateAccountBalance(client, investAcct.rows[0].id, -loss);
        await createTransaction(client, gameId, investAcct.rows[0].id, dateStr, 'expense', 'investment', -loss, newBal, `Market crash: lost ${evt.amount}% of investments`, undefined, true);
      }
    }
  } else if (evt.type === 'promotion') {
    // evt.amount is a percentage salary increase
    const currentIncome = await client.query('SELECT monthly_income FROM games WHERE id = $1', [gameId]);
    const income = parseInt(currentIncome.rows[0].monthly_income, 10);
    const increase = Math.round(income * (evt.amount / 100));
    await client.query('UPDATE games SET monthly_income = monthly_income + $1, updated_at = NOW() WHERE id = $2', [increase, gameId]);
    await client.query(
      `INSERT INTO game_events (game_id, type, game_date, description, data)
       VALUES ($1, 'promotion', $2, $3, $4)`,
      [gameId, dateStr, `Promotion! Salary increased by ${evt.amount}%`, JSON.stringify({ percentIncrease: evt.amount, absoluteIncrease: increase })],
    );
  } else if (evt.type === 'rent_increase') {
    // Increase rent bill by percentage
    const rentBill = await client.query(
      "SELECT * FROM scheduled_bills WHERE game_id = $1 AND is_active = true AND category = 'housing' LIMIT 1",
      [gameId],
    );
    if (rentBill.rows.length > 0) {
      const currentAmt = parseInt(rentBill.rows[0].amount, 10);
      const increase = Math.round(currentAmt * (evt.amount / 100));
      await client.query('UPDATE scheduled_bills SET amount = amount + $1, updated_at = NOW() WHERE id = $2', [increase, rentBill.rows[0].id]);
      await client.query(
        `INSERT INTO game_events (game_id, type, game_date, description, data)
         VALUES ($1, 'rent_increase', $2, $3, $4)`,
        [gameId, dateStr, `Rent increased by ${evt.amount}%`, JSON.stringify({ percentIncrease: evt.amount, absoluteIncrease: increase })],
      );
    }
  } else if (evt.type === 'utility_price_hike') {
    // Increase utility bills by percentage
    const utilBills = await client.query(
      "SELECT * FROM scheduled_bills WHERE game_id = $1 AND is_active = true AND (category = 'utilities' OR name ILIKE '%utilit%')",
      [gameId],
    );
    for (const bill of utilBills.rows) {
      const currentAmt = parseInt(bill.amount, 10);
      const increase = Math.round(currentAmt * (evt.amount / 100));
      await client.query('UPDATE scheduled_bills SET amount = amount + $1, updated_at = NOW() WHERE id = $2', [increase, bill.id]);
    }
  } else if (evt.type === 'job_loss') {
    // Reduce income to 0 temporarily — set a game event to restore in 2 months
    const currentIncome = await client.query('SELECT monthly_income FROM games WHERE id = $1', [gameId]);
    const originalIncome = parseInt(currentIncome.rows[0].monthly_income, 10);
    await client.query('UPDATE games SET monthly_income = 0, updated_at = NOW() WHERE id = $1', [gameId]);
    // Schedule recovery
    const recoveryDate = addDays(currentDate, 60);
    await client.query(
      `INSERT INTO game_events (game_id, type, game_date, description, data)
       VALUES ($1, 'job_loss', $2, $3, $4)`,
      [gameId, dateStr, 'Lost job — income set to 0',
        JSON.stringify({ originalIncome, recoveryDate: gameDateStr(recoveryDate) })],
    );
  } else if (evt.isPositive) {
    // Positive events: add money to checking
    const newBal = await updateAccountBalance(client, checking.id, evt.amount);
    await createTransaction(client, gameId, checking.id, dateStr, 'income', evt.category, evt.amount, newBal, evt.description, undefined, true);
  } else {
    // Negative events: deduct from checking
    const newBal = await updateAccountBalance(client, checking.id, -playerPays);
    await createTransaction(client, gameId, checking.id, dateStr, 'expense', evt.category, -playerPays, newBal, evt.description, undefined, true);
  }

  // Update happiness for events
  const happinessDelta = evt.isPositive ? 3 : -5;
  await client.query(
    'UPDATE games SET happiness = GREATEST(0, LEAST(100, happiness + $1)) WHERE id = $2',
    [happinessDelta, gameId],
  );
}

// ---------- job loss recovery check ----------

async function checkJobLossRecovery(
  client: PoolClient,
  gameId: string,
  currentDate: GameDate,
): Promise<boolean> {
  const dateStr = gameDateStr(currentDate);
  const jobLossEvents = await client.query(
    "SELECT data FROM game_events WHERE game_id = $1 AND type = 'job_loss' ORDER BY game_date DESC LIMIT 1",
    [gameId],
  );
  if (jobLossEvents.rows.length === 0) return false;

  const data = jobLossEvents.rows[0].data as { originalIncome?: number; recoveryDate?: string };
  if (!data.recoveryDate || !data.originalIncome) return false;

  if (dateStr >= data.recoveryDate) {
    // Check current income is still 0 (hasn't been restored already)
    const game = await client.query('SELECT monthly_income FROM games WHERE id = $1', [gameId]);
    if (parseInt(game.rows[0].monthly_income, 10) === 0) {
      await client.query('UPDATE games SET monthly_income = $1, updated_at = NOW() WHERE id = $2', [data.originalIncome, gameId]);
      await client.query(
        `INSERT INTO game_events (game_id, type, game_date, description, data)
         VALUES ($1, 'job_recovery', $2, 'Found new job — income restored!', $3)`,
        [gameId, dateStr, JSON.stringify({ restoredIncome: data.originalIncome })],
      );
      return true;
    }
  }
  return false;
}

// ---------- insurance premium processing ----------

async function processInsurancePremiums(
  client: PoolClient,
  gameId: string,
  difficulty: string,
  currentDate: GameDate,
): Promise<{ premiumsPaid: number; events: Array<{ type: string; description: string; timestamp: GameDate; data: Record<string, unknown> }> }> {
  const dateStr = gameDateStr(currentDate);
  let premiumsPaid = 0;
  const events: Array<{ type: string; description: string; timestamp: GameDate; data: Record<string, unknown> }> = [];

  // Find all active insurance accounts
  const insuranceAccts = await client.query(
    "SELECT * FROM game_accounts WHERE game_id = $1 AND type = 'insurance' AND status = 'active'",
    [gameId],
  );

  const checking = await getCheckingAccount(client, gameId);
  if (!checking) return { premiumsPaid: 0, events };

  for (const acct of insuranceAccts.rows) {
    const premium = parseInt(acct.balance, 10); // Premium stored in balance field as metadata
    if (premium > 0) {
      const adjustedAmt = adjustedPremium(premium, difficulty);
      const newBal = await updateAccountBalance(client, checking.id, -adjustedAmt);
      await createTransaction(client, gameId, checking.id, dateStr, 'insurance_premium', 'insurance', -adjustedAmt, newBal, `Insurance premium: ${acct.name}`, undefined, true);
      premiumsPaid += adjustedAmt;
      events.push({
        type: 'insurance_premium_paid',
        description: `Paid ${adjustedAmt} for ${acct.name}`,
        timestamp: currentDate,
        data: { accountId: acct.id, amount: adjustedAmt },
      });
    }
  }

  return { premiumsPaid, events };
}

// ---------- bankruptcy processing ----------

async function processBankruptcyCheck(
  client: PoolClient,
  game: GameRow,
  netWorth: number,
  currentDate: GameDate,
): Promise<Array<{ type: string; description: string; timestamp: GameDate; data: Record<string, unknown> }>> {
  const dateStr = gameDateStr(currentDate);
  const gameId = game.id;
  const monthlyIncome = parseInt(game.monthly_income, 10);
  const events: Array<{ type: string; description: string; timestamp: GameDate; data: Record<string, unknown> }> = [];

  // Count consecutive months of negative net worth
  const recentReports = await client.query(
    "SELECT net_worth FROM monthly_reports WHERE game_id = $1 ORDER BY game_month DESC LIMIT 6",
    [gameId],
  );
  let consecutiveNegativeMonths = 0;
  let monthsPositive = 0;
  for (const report of recentReports.rows) {
    const nw = parseInt(report.net_worth, 10);
    if (nw < 0) {
      consecutiveNegativeMonths++;
    } else {
      break;
    }
  }
  // For recovery: count consecutive positive months
  if (game.bankruptcy_active) {
    monthsPositive = 0;
    for (const report of recentReports.rows) {
      const nw = parseInt(report.net_worth, 10);
      if (nw >= 0) {
        monthsPositive++;
      } else {
        break;
      }
    }
  }

  const assessment = assessBankruptcy(netWorth, monthlyIncome, consecutiveNegativeMonths, game.bankruptcy_active, monthsPositive);

  if (assessment.shouldTriggerBankruptcy && !game.bankruptcy_active) {
    // Enter bankruptcy
    const bankruptcyEndDate = addDays(currentDate, 180); // 6 months recovery period
    await client.query(
      `UPDATE games SET bankruptcy_active = true, bankruptcy_count = bankruptcy_count + 1,
       bankruptcy_end_date = $1, chi_score = 300, status = 'active', updated_at = NOW() WHERE id = $2`,
      [gameDateStr(bankruptcyEndDate), gameId],
    );

    // Freeze investment accounts
    await client.query(
      "UPDATE game_accounts SET status = 'frozen' WHERE game_id = $1 AND type IN ('investment_brokerage', 'investment_retirement') AND status = 'active'",
      [gameId],
    );

    // Close credit cards
    await client.query(
      "UPDATE game_accounts SET status = 'frozen' WHERE game_id = $1 AND type = 'credit_card' AND status = 'active'",
      [gameId],
    );

    events.push({
      type: 'bankruptcy_triggered',
      description: 'Bankruptcy declared — investments frozen, credit cards suspended, CHI dropped to 300',
      timestamp: currentDate,
      data: { netWorth, consecutiveNegativeMonths, bankruptcyEndDate: gameDateStr(bankruptcyEndDate) },
    });

    await client.query(
      `INSERT INTO game_events (game_id, type, game_date, description, data)
       VALUES ($1, 'bankruptcy', $2, 'Bankruptcy declared', $3)`,
      [gameId, dateStr, JSON.stringify({ netWorth, ratio: assessment.netWorthToIncomeRatio })],
    );
  } else if (assessment.shouldExitBankruptcy) {
    // Exit bankruptcy
    await client.query(
      `UPDATE games SET bankruptcy_active = false, bankruptcy_end_date = NULL, updated_at = NOW() WHERE id = $1`,
      [gameId],
    );

    // Unfreeze investment accounts
    await client.query(
      "UPDATE game_accounts SET status = 'active' WHERE game_id = $1 AND type IN ('investment_brokerage', 'investment_retirement') AND status = 'frozen'",
      [gameId],
    );

    events.push({
      type: 'bankruptcy_exited',
      description: 'Exited bankruptcy — investments unfrozen, beginning financial recovery',
      timestamp: currentDate,
      data: { monthsPositive },
    });

    await client.query(
      `INSERT INTO game_events (game_id, type, game_date, description, data)
       VALUES ($1, 'bankruptcy_exit', $2, 'Exited bankruptcy', $3)`,
      [gameId, dateStr, JSON.stringify({ monthsPositive })],
    );
  } else if (assessment.stage === 'financial_stress' || assessment.stage === 'financial_distress') {
    events.push({
      type: `financial_warning_${assessment.stage}`,
      description: assessment.stage === 'financial_stress'
        ? 'Warning: You are under financial stress. Net worth is significantly negative.'
        : 'Danger: Financial distress — you may face bankruptcy if this continues.',
      timestamp: currentDate,
      data: { stage: assessment.stage, ratio: assessment.netWorthToIncomeRatio },
    });
  }

  return events;
}

// ---------- tax filing ----------

async function processTaxFiling(
  client: PoolClient,
  game: GameRow,
  currentDate: GameDate,
): Promise<Array<{ type: string; description: string; timestamp: GameDate; data: Record<string, unknown> }>> {
  const dateStr = gameDateStr(currentDate);
  const gameId = game.id;
  const events: Array<{ type: string; description: string; timestamp: GameDate; data: Record<string, unknown> }> = [];

  // Only for level 5+
  if (game.current_level < 5) return events;

  if (!isTaxFilingDay(currentDate)) return events;

  // Check we haven't already filed this year
  const existingFiling = await client.query(
    "SELECT id FROM game_events WHERE game_id = $1 AND type = 'tax_filing' AND game_date >= $2",
    [gameId, `${currentDate.year}-01-01`],
  );
  if (existingFiling.rows.length > 0) return events;

  const monthlyIncome = parseInt(game.monthly_income, 10);
  // Default 25% tax rate, withholding at 23% (slight under-withholding)
  const taxRate = 0.25;
  const withholdingRate = 0.23;

  const assessment = calculateTaxAssessment(monthlyIncome, 12, taxRate, withholdingRate);

  // Create a tax filing decision card
  const cardId = `TAX-FILING-${currentDate.year}`;
  const refundOrBill = assessment.refundOrBill;
  const isRefund = refundOrBill >= 0;

  const options = isRefund
    ? [
        {
          id: 'A',
          label: 'File carefully (get full refund)',
          cost: -refundOrBill, // Negative cost = income
          xp: 20,
          coins: 10,
          happiness: 5,
        },
        {
          id: 'B',
          label: 'Quick file (get 90% refund)',
          cost: -Math.round(refundOrBill * 0.9),
          xp: 10,
          coins: 5,
          happiness: 3,
        },
        {
          id: 'C',
          label: 'Hire tax preparer (get 105% via deductions, costs $50)',
          cost: -(Math.round(refundOrBill * 1.05) - 5000),
          xp: 15,
          coins: 8,
          happiness: 4,
        },
      ]
    : [
        {
          id: 'A',
          label: 'Pay tax bill in full',
          cost: Math.abs(refundOrBill),
          xp: 20,
          coins: 10,
          happiness: -3,
        },
        {
          id: 'B',
          label: 'Set up payment plan (+10% penalty)',
          cost: Math.round(Math.abs(refundOrBill) * 0.5), // Pay half now
          xp: 10,
          coins: 5,
          happiness: -2,
        },
        {
          id: 'C',
          label: 'Hire tax preparer (reduce bill by 15%, costs $50)',
          cost: Math.round(Math.abs(refundOrBill) * 0.85) + 5000,
          xp: 15,
          coins: 8,
          happiness: -1,
        },
      ];

  await client.query(
    `INSERT INTO decision_cards (id, category, title, description, persona_tags, level_range_min, level_range_max, frequency_weight, options, is_active)
     VALUES ($1, 'tax', $2, $3, $4, 5, 8, 1, $5, true)
     ON CONFLICT (id) DO UPDATE SET options = EXCLUDED.options, description = EXCLUDED.description`,
    [
      cardId,
      'Annual Tax Filing',
      isRefund
        ? `It's tax season! You're owed a refund of ${refundOrBill}. How do you want to file?`
        : `It's tax season! You owe ${Math.abs(refundOrBill)} in taxes. How do you want to handle it?`,
      ['teen', 'student', 'young_adult', 'parent'],
      JSON.stringify(options),
    ],
  );

  const expiresDate = addDays(currentDate, 5);
  await client.query(
    `INSERT INTO game_pending_cards (game_id, card_id, presented_game_date, expires_game_date, status)
     VALUES ($1, $2, $3, $4, 'pending')`,
    [gameId, cardId, dateStr, gameDateStr(expiresDate)],
  );

  await client.query(
    `INSERT INTO game_events (game_id, type, game_date, description, data)
     VALUES ($1, 'tax_filing', $2, $3, $4)`,
    [gameId, dateStr, 'Tax filing season',
      JSON.stringify({ ...assessment, isRefund })],
  );

  events.push({
    type: 'tax_filing',
    description: isRefund
      ? `Tax season: you're owed a refund of ${refundOrBill}!`
      : `Tax season: you owe ${Math.abs(refundOrBill)} in taxes.`,
    timestamp: currentDate,
    data: { ...assessment, isRefund },
  });

  return events;
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

  const difficultyConfig = getDifficultyConfig(game.difficulty);
  const regionConfig = getRegionConfig(game.region);

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

  // 3. Savings interest (use difficulty-configured APY, fallback to region, then account rate)
  const savingsAccounts = await client.query(
    "SELECT * FROM game_accounts WHERE game_id = $1 AND type = 'savings' AND status = 'active'",
    [gameId],
  );
  let savingsChange = 0;
  const effectiveSavingsAPY = difficultyConfig.savingsAPY ?? regionConfig.interestRates.savingsAPY;
  for (const sa of savingsAccounts.rows) {
    const balance = parseInt(sa.balance, 10);
    const rate = effectiveSavingsAPY || parseFloat(sa.interest_rate);
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

  // 4. Credit card interest (use difficulty-configured APR, fallback to region, then account rate)
  const ccAccounts = await client.query(
    "SELECT * FROM game_accounts WHERE game_id = $1 AND type = 'credit_card' AND status = 'active'",
    [gameId],
  );
  let debtChange = 0;
  const effectiveCreditCardAPR = difficultyConfig.creditCardAPR ?? regionConfig.interestRates.creditCardAPR;
  for (const cc of ccAccounts.rows) {
    const balance = parseInt(cc.balance, 10);
    // Credit card balance is negative (money owed)
    const outstanding = Math.abs(Math.min(0, balance));
    if (outstanding > 0) {
      const rate = effectiveCreditCardAPR || parseFloat(cc.interest_rate);
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
  await writeXpLedger(client, game.user_id, gameId, game.partner_id, 50, 'month-end bonus');

  // 11. Record streak ticks for monthly metrics
  const streakMetrics: Array<{ metric: string; passes: boolean }> = [
    { metric: 'chi_750_plus', passes: chiResult.overall >= 750 },
    { metric: 'budget_score_90', passes: budgetScore >= 90 },
    { metric: 'budget_score_95', passes: budgetScore >= 95 },
    { metric: 'utilization_under_10', passes: totalCreditAvailable > 0 ? (totalCreditUsed / totalCreditAvailable) < 0.10 : true },
  ];

  // Check savings rate
  const savingsThisMonth = savingsChange;
  const savingsRate = incomeTotal > 0 ? savingsThisMonth / incomeTotal : 0;
  streakMetrics.push({ metric: 'savings_rate_20pct', passes: savingsRate >= 0.20 });
  streakMetrics.push({ metric: 'monthly_savings_deposit', passes: savingsChange > 0 });

  for (const sm of streakMetrics) {
    // Get current streak value
    const prevRes = await client.query(
      "SELECT data->>'value' as val FROM game_events WHERE game_id = $1 AND type = 'streak_tick' AND data->>'metric' = $2 ORDER BY created_at DESC LIMIT 1",
      [gameId, sm.metric],
    );
    const prevStreak = prevRes.rows.length > 0 ? parseInt(prevRes.rows[0].val, 10) : 0;
    const newStreak = sm.passes ? prevStreak + 1 : 0;

    await client.query(
      `INSERT INTO game_events (game_id, type, game_date, description, data)
       VALUES ($1, 'streak_tick', $2, $3, $4)`,
      [gameId, dateStr, `Streak tick: ${sm.metric}`, JSON.stringify({ metric: sm.metric, value: newStreak, passes: sm.passes })],
    );
  }

  // 11. Insurance premiums
  const insuranceResult = await processInsurancePremiums(client, gameId, game.difficulty, currentDate);
  expenseTotal += insuranceResult.premiumsPaid;
  events.push(...insuranceResult.events);

  // 12. Bankruptcy check
  const bankruptcyEvents = await processBankruptcyCheck(client, game, netWorth, currentDate);
  events.push(...bankruptcyEvents);

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

    const diffConfig = getDifficultyConfig(game.difficulty);
    const regionCfg = getRegionConfig(game.region);

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
      const isQuarterEnd = isLastDayOfQuarter(currentDate);

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

      // Check job loss recovery
      await checkJobLossRecovery(client, game.id, nextDate);

      // Roll for random events
      const randomEventResults = await processRandomEvents(client, game, nextDate, isMonthEnd, isQuarterEnd);
      allEvents.push(...randomEventResults);

      // Check for tax filing (April 15, level 5+)
      const taxEvents = await processTaxFiling(client, game, nextDate);
      allEvents.push(...taxEvents);

      // Generate daily decision cards
      await generateDailyCards(client, game, nextDate);

      // Award daily XP (10 base, scaled by difficulty xpMultiplier)
      const xpResult = await awardXp(client, game.id, 10, 'daily advance', dateStr, diffConfig.xpMultiplier);

      // Update streak
      await updateStreak(client, game);

      await client.query(
        'UPDATE games SET current_game_date = $1, state_version = state_version + 1, updated_at = NOW() WHERE id = $2',
        [dateStr, game.id],
      );

      allEvents.push({ type: 'day_advanced', description: 'Day advanced', timestamp: nextDate, data: {} });
      if (xpResult.leveledUp) {
        allEvents.push({ type: 'level_up', description: `Leveled up to ${xpResult.newLevel}!`, timestamp: nextDate, data: { newLevel: xpResult.newLevel } });
      }

      // Evaluate badges after all state changes
      const triggeredEvents = allEvents.map(e => e.type);
      if (xpResult.leveledUp) triggeredEvents.push('level_up', `level_${xpResult.newLevel}_reached`);
      // Re-read game to get updated state
      const updatedGame = await client.query('SELECT * FROM games WHERE id = $1', [game.id]);
      const badgeResult = await evaluateBadges(client, updatedGame.rows[0], 'advance_day', triggeredEvents);

      // Write XP ledger entry for daily advance
      await writeXpLedger(client, game.user_id, game.id, game.partner_id, 10, 'daily advance');

      await client.query('COMMIT');

      return {
        success: true,
        newState: { currentDate: nextDate },
        events: allEvents,
        rewards: [...badgeResult.rewards],
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

      // Award XP and coins (scaled by difficulty xpMultiplier)
      if (xpAwarded > 0) {
        await awardXp(client, game.id, xpAwarded, `card decision: ${pendingCard.title}`, dateStr, diffConfig.xpMultiplier);
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

      events.push({ type: 'card_decided', description: `Decided card ${cardId}: ${chosenOption.label}`, timestamp: currentDate, data: { cardId, optionId, cost, xpAwarded, coinsAwarded } });

      // Determine triggered events for badge evaluation
      const cardEvents = ['card_decided', `card_category_${pendingCard.category}`];
      // Check if this was the first card decision
      const cardCount = await client.query(
        "SELECT COUNT(*) FROM game_pending_cards WHERE game_id = $1 AND status = 'resolved'",
        [game.id],
      );
      if (parseInt(cardCount.rows[0].count, 10) === 1) {
        cardEvents.push('first_card_decided');
      }
      // Check event-type triggers based on card category
      if (pendingCard.category === 'investment') cardEvents.push('investment_purchased');
      if (pendingCard.category === 'savings') cardEvents.push('savings_deposit_via_card');

      // Write XP ledger for card decision
      if (xpAwarded > 0) {
        await writeXpLedger(client, game.user_id, game.id, game.partner_id, xpAwarded, `card decision: ${pendingCard.title}`);
      }
      // Write coin ledger for card decision
      if (coinsAwarded > 0) {
        await writeCoinLedger(client, game.user_id, game.id, game.partner_id, coinsAwarded, `card decision: ${pendingCard.title}`);
      }

      // Evaluate badges
      const updatedGameForCard = await client.query('SELECT * FROM games WHERE id = $1', [game.id]);
      const cardBadgeResult = await evaluateBadges(client, updatedGameForCard.rows[0], 'decide_card', cardEvents);

      await client.query('COMMIT');

      const allCardRewards: RewardGrant[] = [];
      if (coinsAwarded > 0) allCardRewards.push({ type: 'coins' as const, amount: coinsAwarded, reason: 'card decision' });
      allCardRewards.push(...cardBadgeResult.rewards);

      return {
        success: true,
        newState: {},
        events,
        rewards: allCardRewards,
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
        interestRate = regionCfg.interestRates.savingsAPY;
      } else if (accountType === 'credit_card') {
        interestRate = diffConfig.creditCardAPR ?? regionCfg.interestRates.creditCardAPR;
        creditLimit = action.payload.creditLimit as number ?? 500000;
      } else if (accountType.includes('loan') || accountType === 'mortgage') {
        interestRate = action.payload.interestRate as number ?? regionCfg.interestRates.autoLoanAPR.good;
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

    } else if (action.type === 'buy_insurance') {
      const insuranceType = action.payload.insuranceType as string;
      if (!insuranceType) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'VALIDATION_ERROR', message: 'insuranceType is required' }] };
      }

      const config = INSURANCE_CONFIGS.find((c: InsurancePremiumConfig) => c.type === insuranceType);
      if (!config) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'VALIDATION_ERROR', message: `Invalid insurance type: ${insuranceType}. Valid: ${INSURANCE_CONFIGS.map((c: InsurancePremiumConfig) => c.type).join(', ')}` }] };
      }

      // Check if already insured
      const existing = await client.query(
        "SELECT id FROM game_accounts WHERE game_id = $1 AND type = 'insurance' AND name = $2 AND status = 'active'",
        [game.id, config.name],
      );
      if (existing.rows.length > 0) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'ALREADY_INSURED', message: `Already have active ${config.name}` }] };
      }

      // Check if can afford first premium
      const premium = adjustedPremium(config.basePremium, game.difficulty);
      const checking = await getCheckingAccount(client, game.id);
      if (!checking || parseInt(checking.balance, 10) < premium) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'INSUFFICIENT_FUNDS', message: 'Cannot afford insurance premium' }] };
      }

      const dateStr = gameDateStr(currentDate);

      // Create insurance account (balance stores the base premium for monthly billing)
      await client.query(
        `INSERT INTO game_accounts (game_id, type, name, balance, interest_rate, opened_game_date, status)
         VALUES ($1, 'insurance', $2, $3, 0, $4, 'active')`,
        [game.id, config.name, config.basePremium, dateStr],
      );

      // Pay first premium
      const newBal = await updateAccountBalance(client, checking.id, -premium);
      await createTransaction(client, game.id, checking.id, dateStr, 'insurance_premium', 'insurance', -premium, newBal, `First premium: ${config.name}`);

      await client.query('UPDATE games SET state_version = state_version + 1, updated_at = NOW() WHERE id = $1', [game.id]);
      await client.query('COMMIT');

      return {
        success: true, newState: {},
        events: [{ type: 'insurance_purchased', description: `Purchased ${config.name} — ${premium}/month`, timestamp: currentDate, data: { type: insuranceType, premium, deductible: config.deductible, coverageRate: config.coverageRate } }],
        rewards: [],
      };

    } else if (action.type === 'file_claim') {
      const insuranceType = action.payload.insuranceType as string;
      const claimAmount = action.payload.amount as number;

      if (!insuranceType || !claimAmount || claimAmount <= 0) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'VALIDATION_ERROR', message: 'insuranceType and positive amount are required' }] };
      }

      const config = INSURANCE_CONFIGS.find((c: InsurancePremiumConfig) => c.type === insuranceType);
      if (!config) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'VALIDATION_ERROR', message: `Invalid insurance type: ${insuranceType}` }] };
      }

      // Check for active policy
      const policyAcct = await client.query(
        "SELECT * FROM game_accounts WHERE game_id = $1 AND type = 'insurance' AND name = $2 AND status = 'active' LIMIT 1",
        [game.id, config.name],
      );
      if (policyAcct.rows.length === 0) {
        await client.query('ROLLBACK');
        return { success: false, newState: {}, events: [], rewards: [], errors: [{ code: 'NO_POLICY', message: `No active ${config.name} policy` }] };
      }

      const dateStr = gameDateStr(currentDate);

      // Process claim using simulation engine
      const claimResult = processClaim(
        {
          type: config.type as 'health' | 'auto' | 'renters' | 'homeowners' | 'life' | 'disability',
          monthlyPremium: config.basePremium,
          deductible: config.deductible,
          coverageRate: config.coverageRate,
          isActive: true,
          monthsActive: 1,
          monthsUnpaid: 0,
          claimsThisYear: 0,
          basePremium: config.basePremium,
        },
        claimAmount,
      );

      // Deposit insurance payout to checking
      const checking = await getCheckingAccount(client, game.id);
      if (checking && claimResult.insurancePaid > 0) {
        const newBal = await updateAccountBalance(client, checking.id, claimResult.insurancePaid);
        await createTransaction(client, game.id, checking.id, dateStr, 'insurance_claim', 'insurance', claimResult.insurancePaid, newBal, `Claim payout: ${config.name}`);
      }

      await client.query(
        `INSERT INTO game_events (game_id, type, game_date, description, data)
         VALUES ($1, 'insurance_claim_filed', $2, $3, $4)`,
        [game.id, dateStr, `Filed claim on ${config.name}`,
          JSON.stringify({ claimAmount, ...claimResult })],
      );

      await client.query('UPDATE games SET state_version = state_version + 1, updated_at = NOW() WHERE id = $1', [game.id]);
      await client.query('COMMIT');

      return {
        success: true, newState: {},
        events: [{
          type: 'claim_filed',
          description: `Claim filed: ${config.name} covered ${claimResult.insurancePaid} of ${claimAmount} (deductible: ${claimResult.deductiblePaid})`,
          timestamp: currentDate,
          data: { insuranceType, claimAmount, ...claimResult },
        }],
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
