import { Request, Response } from 'express';
import { Pool } from 'pg';
import { findGameById } from '../models/game.js';

export function getMonthlyReportController(pool: Pool) {
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

      const year = parseInt(req.params.year as string, 10);
      const month = parseInt(req.params.month as string, 10);

      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid year or month' });
        return;
      }

      const gameMonth = `${year}-${String(month).padStart(2, '0')}-01`;

      const result = await pool.query(
        'SELECT * FROM monthly_reports WHERE game_id = $1 AND game_month = $2',
        [game.id, gameMonth],
      );

      if (result.rows.length === 0) {
        res.status(404).json({ code: 'NOT_FOUND', message: 'Monthly report not found' });
        return;
      }

      const report = result.rows[0];
      res.json({
        gameId: report.game_id,
        month,
        year,
        income: parseInt(report.income_total, 10),
        expenses: parseInt(report.expense_total, 10),
        savings: parseInt(report.savings_change, 10),
        investmentChange: parseInt(report.investment_change, 10),
        debtChange: parseInt(report.debt_change, 10),
        netWorth: parseInt(report.net_worth, 10),
        budgetScore: report.budget_score,
        creditHealthIndex: report.chi_score,
        xpEarned: report.xp_earned,
        coinsEarned: report.coins_earned,
        highlights: report.highlights,
      });
    } catch (err) {
      console.error('Get monthly report error:', (err as Error).message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch report' });
    }
  };
}
