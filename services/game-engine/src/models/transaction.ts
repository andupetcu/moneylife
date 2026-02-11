import { Pool } from 'pg';

export interface TransactionRow {
  id: string;
  game_id: string;
  account_id: string;
  game_date: Date;
  type: string;
  category: string | null;
  subcategory: string | null;
  amount: string;
  balance_after: string;
  description: string;
  card_id: string | null;
  is_automated: boolean;
  idempotency_key: string | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
}

export async function findTransactionsByGameId(
  pool: Pool,
  gameId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<TransactionRow[]> {
  const result = await pool.query(
    'SELECT * FROM transactions WHERE game_id = $1 ORDER BY game_date DESC, created_at DESC LIMIT $2 OFFSET $3',
    [gameId, limit, offset],
  );
  return result.rows;
}
