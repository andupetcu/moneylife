import { Pool, PoolClient } from 'pg';
import crypto from 'node:crypto';

// ─── Encryption helpers ──────────────────────────────────────────────────────

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-encryption-key-32chars!!!!!';
const ALGORITHM = 'aes-256-cbc';

function deriveKey(key: string): Buffer {
  return crypto.createHash('sha256').update(key).digest();
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, deriveKey(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(encrypted: string): string {
  const [ivHex, data] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, deriveKey(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ─── Game category mapping ───────────────────────────────────────────────────

const GAME_CATEGORIES = [
  'housing', 'food', 'transport', 'entertainment',
  'utilities', 'health', 'education', 'shopping', 'other',
] as const;

export type GameCategory = (typeof GAME_CATEGORIES)[number];

const CATEGORY_MAP: Record<string, GameCategory> = {
  // Plaid categories
  'RENT_AND_UTILITIES': 'housing',
  'RENT': 'housing',
  'MORTGAGE': 'housing',
  'HOME_IMPROVEMENT': 'housing',
  'FOOD_AND_DRINK': 'food',
  'GROCERIES': 'food',
  'RESTAURANTS': 'food',
  'COFFEE': 'food',
  'TRANSPORTATION': 'transport',
  'TAXI': 'transport',
  'GAS_STATIONS': 'transport',
  'PARKING': 'transport',
  'PUBLIC_TRANSPORTATION': 'transport',
  'ENTERTAINMENT': 'entertainment',
  'RECREATION': 'entertainment',
  'MUSIC': 'entertainment',
  'MOVIES': 'entertainment',
  'GYMS_AND_FITNESS': 'entertainment',
  'UTILITIES': 'utilities',
  'TELECOMMUNICATION': 'utilities',
  'INTERNET': 'utilities',
  'HEALTHCARE': 'health',
  'MEDICAL': 'health',
  'PHARMACY': 'health',
  'EDUCATION': 'education',
  'TUITION': 'education',
  'BOOKS': 'education',
  'SHOPPING': 'shopping',
  'MERCHANDISE': 'shopping',
  'CLOTHING': 'shopping',
  'ELECTRONICS': 'shopping',
  'GENERAL_MERCHANDISE': 'shopping',
  // TrueLayer categories
  'PURCHASE': 'shopping',
  'BILL_PAYMENT': 'utilities',
  'CASH': 'other',
  'TRANSFER': 'other',
  'DEBIT': 'other',
  'CREDIT': 'other',
  'ATM': 'other',
  'DIRECT_DEBIT': 'utilities',
  'STANDING_ORDER': 'utilities',
};

export function categorizeTransaction(providerCategory: string | null | undefined): GameCategory {
  if (!providerCategory) return 'other';
  const upper = providerCategory.toUpperCase().replace(/[- ]/g, '_');
  if (CATEGORY_MAP[upper]) return CATEGORY_MAP[upper];
  // Try partial matching
  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (upper.includes(key) || key.includes(upper)) return value;
  }
  return 'other';
}

// ─── Provider interfaces ─────────────────────────────────────────────────────

export interface BankAccount {
  id: string;
  name: string;
  type: string;
  currency: string;
  balance?: number;
  lastFour?: string;
  institutionName?: string;
}

export interface BankTransaction {
  id: string;
  date: string;
  amount: number; // in cents
  currency: string;
  description: string;
  category: string | null;
  merchantName: string | null;
  pending: boolean;
  raw: Record<string, unknown>;
}

export interface LinkResult {
  type: 'link_token' | 'auth_url';
  value: string;
}

export interface TokenResult {
  accessToken: string;
  refreshToken?: string;
  connectionId: string;
  institutionName?: string;
}

export interface BankingProvider {
  name: 'plaid' | 'truelayer';
  initLink(userId: string, redirectUri?: string): Promise<LinkResult>;
  exchangeToken(code: string): Promise<TokenResult>;
  getAccounts(accessToken: string): Promise<BankAccount[]>;
  getTransactions(accessToken: string, from: string, to: string): Promise<BankTransaction[]>;
  refreshAccessToken?(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }>;
}

// ─── Plaid Client ────────────────────────────────────────────────────────────

const PLAID_ENVS: Record<string, string> = {
  sandbox: 'https://sandbox.plaid.com',
  development: 'https://development.plaid.com',
  production: 'https://production.plaid.com',
};

export class PlaidClient implements BankingProvider {
  readonly name = 'plaid' as const;
  private clientId: string;
  private secret: string;
  private baseUrl: string;

  constructor() {
    this.clientId = process.env.PLAID_CLIENT_ID || '';
    this.secret = process.env.PLAID_SECRET || '';
    const env = process.env.PLAID_ENV || 'sandbox';
    this.baseUrl = PLAID_ENVS[env] || PLAID_ENVS.sandbox;
  }

  get isConfigured(): boolean {
    return !!(this.clientId && this.secret);
  }

  private async post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: this.clientId, secret: this.secret, ...body }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error_message: `HTTP ${res.status}` }));
      throw new Error(`Plaid error: ${(err as any).error_message || res.status}`);
    }
    return res.json() as Promise<T>;
  }

  async initLink(userId: string): Promise<LinkResult> {
    const data = await this.post<{ link_token: string }>('/link/token/create', {
      user: { client_user_id: userId },
      client_name: 'MoneyLife',
      products: ['transactions'],
      country_codes: ['US', 'CA'],
      language: 'en',
    });
    return { type: 'link_token', value: data.link_token };
  }

  async exchangeToken(publicToken: string): Promise<TokenResult> {
    const data = await this.post<{ access_token: string; item_id: string }>(
      '/item/public_token/exchange',
      { public_token: publicToken },
    );
    // Get institution info
    let institutionName: string | undefined;
    try {
      const itemData = await this.post<{ item: { institution_id: string } }>('/item/get', {
        access_token: data.access_token,
      });
      const instData = await this.post<{ institution: { name: string } }>(
        '/institutions/get_by_id',
        { institution_id: itemData.item.institution_id, country_codes: ['US', 'CA'] },
      );
      institutionName = instData.institution.name;
    } catch {
      // Not critical
    }
    return {
      accessToken: data.access_token,
      connectionId: data.item_id,
      institutionName,
    };
  }

  async getAccounts(accessToken: string): Promise<BankAccount[]> {
    const data = await this.post<{
      accounts: Array<{
        account_id: string; name: string; type: string;
        balances: { current: number | null }; mask: string | null;
        subtype: string | null;
      }>;
    }>('/accounts/get', { access_token: accessToken });

    return data.accounts.map(a => ({
      id: a.account_id,
      name: a.name,
      type: a.subtype || a.type,
      currency: 'USD',
      balance: a.balances.current != null ? Math.round(a.balances.current * 100) : undefined,
      lastFour: a.mask || undefined,
    }));
  }

  async getTransactions(accessToken: string, from: string, to: string): Promise<BankTransaction[]> {
    const data = await this.post<{
      transactions: Array<{
        transaction_id: string; date: string; amount: number;
        iso_currency_code: string | null; name: string;
        personal_finance_category?: { primary: string };
        category?: string[];
        merchant_name: string | null; pending: boolean;
      }>;
    }>('/transactions/get', {
      access_token: accessToken,
      start_date: from,
      end_date: to,
      options: { count: 500, offset: 0 },
    });

    return data.transactions.map(t => ({
      id: t.transaction_id,
      date: t.date,
      // Plaid reports outflows as positive, inflows as negative. Normalize: negative = expense.
      amount: Math.round(-t.amount * 100),
      currency: t.iso_currency_code || 'USD',
      description: t.name,
      category: t.personal_finance_category?.primary || t.category?.[0] || null,
      merchantName: t.merchant_name,
      pending: t.pending,
      raw: t as unknown as Record<string, unknown>,
    }));
  }
}

// ─── TrueLayer Client ────────────────────────────────────────────────────────

const TRUELAYER_ENVS: Record<string, { auth: string; api: string }> = {
  sandbox: { auth: 'https://auth.truelayer-sandbox.com', api: 'https://api.truelayer-sandbox.com' },
  production: { auth: 'https://auth.truelayer.com', api: 'https://api.truelayer.com' },
};

export class TrueLayerClient implements BankingProvider {
  readonly name = 'truelayer' as const;
  private clientId: string;
  private clientSecret: string;
  private authUrl: string;
  private apiUrl: string;

  constructor() {
    this.clientId = process.env.TRUELAYER_CLIENT_ID || '';
    this.clientSecret = process.env.TRUELAYER_CLIENT_SECRET || '';
    const env = process.env.TRUELAYER_ENV || 'sandbox';
    const urls = TRUELAYER_ENVS[env] || TRUELAYER_ENVS.sandbox;
    this.authUrl = urls.auth;
    this.apiUrl = urls.api;
  }

  get isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  async initLink(userId: string, redirectUri?: string): Promise<LinkResult> {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      scope: 'info accounts balance cards transactions direct_debits standing_orders offline_access',
      redirect_uri: redirectUri || `${process.env.APP_URL || 'http://localhost:3000'}/banking/callback`,
      state: userId,
    });
    return { type: 'auth_url', value: `${this.authUrl}/?${params}` };
  }

  async exchangeToken(code: string): Promise<TokenResult> {
    const res = await fetch(`${this.authUrl}/connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: `${process.env.APP_URL || 'http://localhost:3000'}/banking/callback`,
        code,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`TrueLayer token error: ${(err as Record<string, string>).error || res.status}`);
    }
    const data = await res.json() as { access_token: string; refresh_token: string };

    // Get institution name from metadata
    let institutionName: string | undefined;
    try {
      const metaRes = await fetch(`${this.apiUrl}/data/v1/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      if (metaRes.ok) {
        const meta = await metaRes.json() as {
          results: Array<{ provider: { display_name: string; provider_id: string } }>;
        };
        institutionName = meta.results?.[0]?.provider?.display_name;
      }
    } catch {
      // Not critical
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      connectionId: `tl_${Date.now()}`,
      institutionName,
    };
  }

  async getAccounts(accessToken: string): Promise<BankAccount[]> {
    const res = await fetch(`${this.apiUrl}/data/v1/accounts`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`TrueLayer accounts error: ${res.status}`);
    const data = await res.json() as {
      results: Array<{
        account_id: string; display_name: string; account_type: string;
        currency: string; account_number?: { number?: string };
      }>;
    };

    return data.results.map(a => ({
      id: a.account_id,
      name: a.display_name,
      type: a.account_type,
      currency: a.currency,
      lastFour: a.account_number?.number?.slice(-4),
    }));
  }

  async getTransactions(accessToken: string, from: string, to: string): Promise<BankTransaction[]> {
    const params = new URLSearchParams({ from, to });
    const res = await fetch(`${this.apiUrl}/data/v1/accounts?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`TrueLayer error: ${res.status}`);
    const accountsData = await res.json() as { results: Array<{ account_id: string }> };

    const allTx: BankTransaction[] = [];
    for (const account of accountsData.results) {
      const txRes = await fetch(
        `${this.apiUrl}/data/v1/accounts/${account.account_id}/transactions?from=${from}&to=${to}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      if (!txRes.ok) continue;
      const txData = await txRes.json() as {
        results: Array<{
          transaction_id: string; timestamp: string; amount: number;
          currency: string; description: string;
          transaction_category: string; merchant_name?: string;
          transaction_classification: string[];
        }>;
      };

      for (const t of txData.results) {
        allTx.push({
          id: t.transaction_id,
          date: t.timestamp.split('T')[0],
          amount: Math.round(t.amount * 100),
          currency: t.currency,
          description: t.description,
          category: t.transaction_classification?.[0] || t.transaction_category || null,
          merchantName: t.merchant_name || null,
          pending: false,
          raw: t as unknown as Record<string, unknown>,
        });
      }
    }
    return allTx;
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }> {
    const res = await fetch(`${this.authUrl}/connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
      }),
    });
    if (!res.ok) throw new Error(`TrueLayer refresh error: ${res.status}`);
    const data = await res.json() as { access_token: string; refresh_token: string };
    return { accessToken: data.access_token, refreshToken: data.refresh_token };
  }
}

// ─── Provider factory ────────────────────────────────────────────────────────

const EU_REGIONS = ['ro', 'pl', 'hu', 'cz', 'gb', 'de', 'fr'];
const US_REGIONS = ['us', 'ca'];

export function getProviderForRegion(region: string): BankingProvider {
  if (US_REGIONS.includes(region.toLowerCase())) return new PlaidClient();
  if (EU_REGIONS.includes(region.toLowerCase())) return new TrueLayerClient();
  // Default to TrueLayer for unknown regions (EU-first approach)
  return new TrueLayerClient();
}

export function isProviderConfigured(region: string): boolean {
  const provider = getProviderForRegion(region);
  return (provider as PlaidClient | TrueLayerClient).isConfigured;
}

// ─── Database helpers ────────────────────────────────────────────────────────

export interface LinkedAccountRow {
  id: string;
  user_id: string;
  partner_id: string | null;
  provider: string;
  provider_connection_id: string;
  institution_name: string | null;
  access_token_encrypted: string | null;
  status: string;
  consent_granted_at: Date | null;
  consent_expires_at: Date | null;
  last_sync_at: Date | null;
  error_details: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export async function findLinkedAccountsByUserId(
  pool: Pool,
  userId: string,
): Promise<LinkedAccountRow[]> {
  const result = await pool.query(
    `SELECT * FROM linked_accounts
     WHERE user_id = $1 AND deleted_at IS NULL AND status != 'revoked'
     ORDER BY created_at DESC`,
    [userId],
  );
  return result.rows;
}

export async function findLinkedAccountById(
  pool: Pool,
  id: string,
  userId: string,
): Promise<LinkedAccountRow | null> {
  const result = await pool.query(
    'SELECT * FROM linked_accounts WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
    [id, userId],
  );
  return result.rows[0] ?? null;
}

export async function createLinkedAccount(
  client: PoolClient | Pool,
  params: {
    userId: string;
    partnerId: string | null;
    provider: string;
    connectionId: string;
    institutionName: string | null;
    accessTokenEncrypted: string;
    consentExpiresAt: Date;
  },
): Promise<LinkedAccountRow> {
  const result = await client.query(
    `INSERT INTO linked_accounts
     (user_id, partner_id, provider, provider_connection_id, institution_name,
      access_token_encrypted, status, consent_granted_at, consent_expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW(), $7)
     RETURNING *`,
    [
      params.userId, params.partnerId, params.provider, params.connectionId,
      params.institutionName, params.accessTokenEncrypted, params.consentExpiresAt,
    ],
  );
  return result.rows[0];
}

export async function softDeleteLinkedAccount(
  pool: Pool,
  id: string,
  userId: string,
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Delete synced transactions
    await client.query(
      'DELETE FROM synced_transactions WHERE linked_account_id = $1 AND user_id = $2',
      [id, userId],
    );
    // Soft-delete the account
    await client.query(
      "UPDATE linked_accounts SET deleted_at = NOW(), status = 'revoked', access_token_encrypted = NULL WHERE id = $1 AND user_id = $2",
      [id, userId],
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function syncTransactions(
  pool: Pool,
  account: LinkedAccountRow,
  from: string,
  to: string,
): Promise<number> {
  if (!account.access_token_encrypted) throw new Error('No access token');

  const accessToken = decrypt(account.access_token_encrypted);
  const provider = account.provider === 'plaid' ? new PlaidClient() : new TrueLayerClient();

  // Check consent expiry
  if (account.consent_expires_at && new Date(account.consent_expires_at) < new Date()) {
    await pool.query(
      "UPDATE linked_accounts SET status = 'disconnected', error_details = $2 WHERE id = $1",
      [account.id, JSON.stringify({ reason: 'consent_expired' })],
    );
    throw new Error('Consent expired. Please re-link your account.');
  }

  const transactions = await provider.getTransactions(accessToken, from, to);
  let synced = 0;

  for (const tx of transactions) {
    const gameCategory = categorizeTransaction(tx.category);
    await pool.query(
      `INSERT INTO synced_transactions
       (linked_account_id, user_id, partner_id, provider_transaction_id,
        date, amount, currency, description, category, category_source,
        merchant_name, is_pending, raw_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'vendor', $10, $11, $12)
       ON CONFLICT (linked_account_id, provider_transaction_id) DO UPDATE
       SET amount = EXCLUDED.amount, is_pending = EXCLUDED.is_pending,
           category = EXCLUDED.category, description = EXCLUDED.description`,
      [
        account.id, account.user_id, account.partner_id, tx.id,
        tx.date, tx.amount, tx.currency, tx.description,
        gameCategory, tx.merchantName, tx.pending,
        JSON.stringify(tx.raw),
      ],
    );
    synced++;
  }

  // Update last_sync_at
  await pool.query(
    'UPDATE linked_accounts SET last_sync_at = NOW(), updated_at = NOW() WHERE id = $1',
    [account.id],
  );

  return synced;
}

export async function getSyncedTransactions(
  pool: Pool,
  userId: string,
  from?: string,
  to?: string,
): Promise<Array<{
  id: string; linkedAccountId: string; date: string; amount: number;
  currency: string; description: string; category: string;
  merchantName: string | null; isPending: boolean;
}>> {
  let query = `SELECT id, linked_account_id, date, amount, currency, description,
                      category, merchant_name, is_pending
               FROM synced_transactions WHERE user_id = $1`;
  const params: unknown[] = [userId];
  if (from) {
    params.push(from);
    query += ` AND date >= $${params.length}`;
  }
  if (to) {
    params.push(to);
    query += ` AND date <= $${params.length}`;
  }
  query += ' ORDER BY date DESC';

  const result = await pool.query(query, params);
  return result.rows.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    linkedAccountId: r.linked_account_id as string,
    date: (r.date as Date).toISOString().split('T')[0],
    amount: Number(r.amount),
    currency: r.currency as string,
    description: r.description as string,
    category: r.category as string,
    merchantName: r.merchant_name as string | null,
    isPending: r.is_pending as boolean,
  }));
}
