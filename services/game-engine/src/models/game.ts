import { Pool } from 'pg';

export interface GameRow {
  id: string;
  user_id: string;
  partner_id: string | null;
  persona: string;
  difficulty: string;
  region: string;
  currency_code: string;
  ppp_factor: string;
  current_game_date: Date;
  current_level: number;
  total_xp: number;
  level_xp: number;
  total_coins: number;
  happiness: number;
  streak_current: number;
  streak_longest: number;
  chi_score: number;
  chi_payment_history: number;
  chi_utilization: number;
  chi_credit_age: number;
  chi_credit_mix: number;
  chi_new_inquiries: number;
  budget_score: number;
  net_worth: string;
  monthly_income: string;
  inflation_cumulative: string;
  bankruptcy_count: number;
  bankruptcy_active: boolean;
  bankruptcy_end_date: Date | null;
  state_version: string;
  random_seed: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export async function findGameById(pool: Pool, id: string): Promise<GameRow | null> {
  const result = await pool.query('SELECT * FROM games WHERE id = $1 AND deleted_at IS NULL', [id]);
  return result.rows[0] ?? null;
}

export async function findGamesByUserId(pool: Pool, userId: string): Promise<GameRow[]> {
  const result = await pool.query(
    'SELECT * FROM games WHERE user_id = $1 AND deleted_at IS NULL ORDER BY updated_at DESC',
    [userId],
  );
  return result.rows;
}
