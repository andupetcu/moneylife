import { Request, Response } from 'express';
import { Pool } from 'pg';
import { createGameSchema } from '../validators.js';
import { findGameById } from '../models/game.js';
import { findAccountsByGameId } from '../models/account.js';
import { getPersonaConfig, getDifficultyConfig, getRegionConfig } from '@moneylife/config';

export function listGamesController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await pool.query(
        'SELECT * FROM games WHERE user_id = $1 ORDER BY created_at DESC',
        [req.userId],
      );
      res.json(result.rows.map(g => ({
        id: g.id,
        userId: g.user_id,
        persona: g.persona,
        difficulty: g.difficulty,
        currency: g.currency_code,
        region: g.region,
        level: g.current_level,
        xp: g.total_xp,
        status: g.status,
        createdAt: g.created_at,
      })));
    } catch (err) {
      console.error('List games error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to list games' });
    }
  };
}

export function createGameController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    const parsed = createGameSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { persona, difficulty, currencyCode, region } = parsed.data;
    const personaConfig = getPersonaConfig(persona);
    const difficultyConfig = getDifficultyConfig(difficulty);
    const regionConfig = getRegionConfig(region);

    // Apply difficulty starting cash bonus to persona's starting cash
    const startingCash = Math.round(personaConfig.startingCash * (1 + difficultyConfig.startingCashBonus));

    // Build accounts list from persona config, using region interest rates
    const startingAccounts: Array<{ type: string; name: string; balance: number; rate: number }> = [];
    if (personaConfig.availableAccountsAtStart.includes('checking')) {
      startingAccounts.push({ type: 'checking', name: 'Checking', balance: startingCash, rate: regionConfig.interestRates.checkingAPY });
    }
    if (personaConfig.availableAccountsAtStart.includes('savings')) {
      // Savings starts at 0 unless there's no checking (teen), in which case cash goes here
      const savingsBalance = startingAccounts.length === 0 ? startingCash : 0;
      startingAccounts.push({ type: 'savings', name: 'Savings', balance: savingsBalance, rate: regionConfig.interestRates.savingsAPY });
    }
    if (personaConfig.availableAccountsAtStart.includes('credit_card')) {
      startingAccounts.push({ type: 'credit_card', name: 'Credit Card', balance: 0, rate: difficultyConfig.creditCardAPR ?? regionConfig.interestRates.creditCardAPR });
    }

    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const gameDate = '2026-01-01';
        const gameResult = await client.query(
          `INSERT INTO games (user_id, partner_id, persona, difficulty, region, currency_code, current_game_date,
           current_level, total_xp, total_coins, happiness, chi_score, chi_payment_history, chi_utilization,
           chi_credit_age, chi_credit_mix, chi_new_inquiries, budget_score, net_worth, monthly_income,
           random_seed, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
           RETURNING *`,
          [
            req.userId, req.partnerId ?? null, persona, difficulty, region, currencyCode,
            gameDate, 1, 0, 0, 60, 650, 70, 80, 30, 30, 100, 50,
            startingCash, personaConfig.monthlyIncome,
            Math.floor(Math.random() * 2147483647), 'active',
          ],
        );

        const game = gameResult.rows[0];

        for (const acct of startingAccounts) {
          await client.query(
            `INSERT INTO game_accounts (game_id, type, name, balance, interest_rate, opened_game_date, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'active')`,
            [game.id, acct.type, acct.name, acct.balance, acct.rate, gameDate],
          );
        }

        // Create scheduled bills from persona config
        const bills = personaConfig.startingBills;
        for (const bill of bills) {
          await client.query(
            `INSERT INTO scheduled_bills (game_id, name, amount, category, frequency, next_due_date, auto_pay, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, false, true)`,
            [game.id, bill.name, bill.amount, bill.category, 'monthly', '2026-02-01'],
          );
        }

        await client.query('COMMIT');

        const accounts = await findAccountsByGameId(pool, game.id);

        res.status(201).json({
          gameId: game.id,
          initialState: {
            id: game.id,
            userId: game.user_id,
            persona: game.persona,
            difficulty: game.difficulty,
            currency: game.currency_code,
            currentDate: { year: 2026, month: 1, day: 1 },
            currentLevel: game.current_level,
            totalXp: game.total_xp,
            totalCoins: game.total_coins,
            status: game.status,
            accounts: accounts.map(a => ({
              id: a.id,
              type: a.type,
              name: a.name,
              balance: parseInt(a.balance, 10),
              interestRate: parseFloat(a.interest_rate),
              isActive: a.status === 'active',
            })),
          },
        });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Create game error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to create game' });
    }
  };
}

export function getGameController(pool: Pool) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const game = await findGameById(pool, req.params.id as string);
      if (!game) {
        res.status(404).json({ code: 'GAME_NOT_FOUND', message: 'Game not found' });
        return;
      }

      if (game.user_id !== req.userId) {
        res.status(403).json({ code: 'FORBIDDEN', message: 'Not your game' });
        return;
      }

      const accounts = await findAccountsByGameId(pool, game.id);

      const pendingCards = await pool.query(
        "SELECT * FROM game_pending_cards WHERE game_id = $1 AND status = 'pending'",
        [game.id],
      );

      res.json({
        id: game.id,
        userId: game.user_id,
        partnerId: game.partner_id,
        persona: game.persona,
        difficulty: game.difficulty,
        currency: game.currency_code,
        region: game.region,
        currentDate: {
          year: game.current_game_date.getFullYear(),
          month: game.current_game_date.getMonth() + 1,
          day: game.current_game_date.getDate(),
        },
        currentLevel: game.current_level,
        totalXp: game.total_xp,
        totalCoins: game.total_coins,
        status: game.status,
        netWorth: parseInt(game.net_worth, 10),
        monthlyIncome: parseInt(game.monthly_income, 10),
        budgetScore: game.budget_score,
        creditHealthIndex: {
          overall: game.chi_score,
          factors: {
            paymentHistory: game.chi_payment_history,
            utilization: game.chi_utilization,
            accountAge: game.chi_credit_age,
            creditMix: game.chi_credit_mix,
            newCredit: game.chi_new_inquiries,
          },
        },
        streakDays: game.streak_current,
        stateVersion: game.state_version,
        accounts: accounts.map(a => ({
          id: a.id,
          type: a.type,
          name: a.name,
          balance: parseInt(a.balance, 10),
          interestRate: parseFloat(a.interest_rate),
          creditLimit: a.credit_limit ? parseInt(a.credit_limit, 10) : undefined,
          isActive: a.status === 'active',
        })),
        pendingCards: pendingCards.rows.map(c => ({
          id: c.id,
          cardId: c.card_id,
          presentedDate: c.presented_game_date,
          expiresDate: c.expires_game_date,
          status: c.status,
        })),
      });
    } catch (err) {
      console.error('Get game error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch game' });
    }
  };
}
