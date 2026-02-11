import { Pool } from 'pg';

export interface AccountRow {
  id: string;
  game_id: string;
  type: string;
  name: string;
  balance: string;
  credit_limit: string | null;
  interest_rate: string;
  principal: string | null;
  remaining_principal: string | null;
  monthly_payment: string | null;
  term_months: number | null;
  months_paid: number | null;
  auto_pay_setting: string;
  status: string;
  opened_game_date: Date;
  consecutive_missed_payments: number;
  pending_interest: string;
  withdrawal_count_this_month: number;
}

export async function findAccountsByGameId(pool: Pool, gameId: string): Promise<AccountRow[]> {
  const result = await pool.query(
    'SELECT * FROM game_accounts WHERE game_id = $1 AND status = $2 ORDER BY created_at',
    [gameId, 'active'],
  );
  return result.rows;
}
