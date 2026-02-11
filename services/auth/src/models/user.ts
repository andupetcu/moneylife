import { Pool } from 'pg';

export async function findUserByEmail(pool: Pool, email: string): Promise<UserRow | null> {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email.toLowerCase()],
  );
  return result.rows[0] ?? null;
}

export async function findUserById(pool: Pool, id: string): Promise<UserRow | null> {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
    [id],
  );
  return result.rows[0] ?? null;
}

export async function createUser(
  pool: Pool,
  data: {
    email: string;
    passwordHash: string | null;
    displayName: string;
    dateOfBirth?: string;
    locale?: string;
    timezone?: string;
    partnerId?: string | null;
    socialProvider?: string;
    socialProviderId?: string;
  },
): Promise<UserRow> {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, display_name, date_of_birth, locale, timezone, partner_id, social_provider, social_provider_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      data.email.toLowerCase(),
      data.passwordHash,
      data.displayName,
      data.dateOfBirth ?? null,
      data.locale ?? 'en',
      data.timezone ?? 'UTC',
      data.partnerId ?? null,
      data.socialProvider ?? null,
      data.socialProviderId ?? null,
    ],
  );
  return result.rows[0];
}

export async function findUserBySocialProvider(
  pool: Pool,
  provider: string,
  providerId: string,
): Promise<UserRow | null> {
  const result = await pool.query(
    'SELECT * FROM users WHERE social_provider = $1 AND social_provider_id = $2 AND deleted_at IS NULL',
    [provider, providerId],
  );
  return result.rows[0] ?? null;
}

export interface UserRow {
  id: string;
  email: string;
  password_hash: string | null;
  display_name: string;
  date_of_birth: string | null;
  timezone: string;
  locale: string;
  partner_id: string | null;
  role: string;
  status: string;
  social_provider: string | null;
  social_provider_id: string | null;
  referral_code: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
