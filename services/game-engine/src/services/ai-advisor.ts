import type { Pool } from 'pg';
import type { GameRow } from '../models/game.js';
import type { AccountRow } from '../models/account.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const AZURE_ENDPOINT =
  process.env.AZURE_OPENAI_ENDPOINT || 'https://footprints-ai.openai.azure.com';
const AZURE_KEY = process.env.AZURE_OPENAI_KEY || '';
const DEPLOYMENT = 'gpt-4o';
const API_VERSION = '2024-02-01';
const MAX_CALLS_PER_DAY = 10;

// ---------------------------------------------------------------------------
// Simple in-memory TTL cache
// ---------------------------------------------------------------------------

interface CacheEntry {
  value: string;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function cacheGet(key: string): string | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function cacheSet(key: string, value: string): void {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  // Evict expired entries periodically (keep cache bounded)
  if (cache.size > 200) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (now > v.expiresAt) cache.delete(k);
    }
  }
}

// ---------------------------------------------------------------------------
// Rate limiting (per game per calendar day)
// ---------------------------------------------------------------------------

// Map<gameId:YYYY-MM-DD, count>
const rateLimits = new Map<string, number>();

function checkRateLimit(gameId: string): boolean {
  const key = `${gameId}:${new Date().toISOString().slice(0, 10)}`;
  const count = rateLimits.get(key) ?? 0;
  return count < MAX_CALLS_PER_DAY;
}

function incrementRateLimit(gameId: string): void {
  const key = `${gameId}:${new Date().toISOString().slice(0, 10)}`;
  rateLimits.set(key, (rateLimits.get(key) ?? 0) + 1);
  // Clean up old keys
  if (rateLimits.size > 500) {
    const today = new Date().toISOString().slice(0, 10);
    for (const k of rateLimits.keys()) {
      if (!k.endsWith(today)) rateLimits.delete(k);
    }
  }
}

export function getRemainingCalls(gameId: string): number {
  const key = `${gameId}:${new Date().toISOString().slice(0, 10)}`;
  return MAX_CALLS_PER_DAY - (rateLimits.get(key) ?? 0);
}

// ---------------------------------------------------------------------------
// Azure OpenAI call
// ---------------------------------------------------------------------------

async function callAzureOpenAI(
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  const url = `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=${API_VERSION}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': AZURE_KEY,
    },
    body: JSON.stringify({ messages, temperature: 0.7, max_tokens: 500 }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Azure OpenAI error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

// ---------------------------------------------------------------------------
// Helpers – build context from game state
// ---------------------------------------------------------------------------

function centsToStr(cents: number | string): string {
  const n = typeof cents === 'string' ? parseInt(cents, 10) : cents;
  return `$${(n / 100).toFixed(2)}`;
}

interface BillRow {
  name: string;
  amount: number | string;
  next_due_date: string | Date;
  category: string;
  auto_pay: boolean;
}

interface TransactionRow {
  description: string;
  amount: number | string;
  category: string;
  created_at: string | Date;
}

interface PendingCardRow {
  id: string;
  card_id: string;
  title?: string;
  description?: string;
  category?: string;
  options?: unknown;
}

function buildFinancialSummary(
  game: GameRow,
  accounts: AccountRow[],
  bills: BillRow[],
  recentTx: TransactionRow[],
): string {
  const lines: string[] = [];

  lines.push(`## Player Profile`);
  lines.push(`- Persona: ${game.persona}, Difficulty: ${game.difficulty}, Region: ${game.region}`);
  lines.push(`- Level: ${game.current_level}, XP: ${game.total_xp}, Coins: ${game.total_coins}`);
  lines.push(`- Game Date: ${game.current_game_date}`);
  lines.push(`- Status: ${game.status}${game.bankruptcy_active ? ' (BANKRUPT)' : ''}`);
  lines.push('');

  lines.push(`## Financial Overview`);
  lines.push(`- Net Worth: ${centsToStr(game.net_worth)}`);
  lines.push(`- Monthly Income: ${centsToStr(game.monthly_income)}`);
  lines.push(`- Budget Score: ${game.budget_score}%`);
  lines.push(`- Happiness: ${game.happiness}`);
  lines.push(`- Streak: ${game.streak_current} days`);
  lines.push('');

  lines.push(`## Credit Health Index (CHI): ${game.chi_score}/850`);
  lines.push(`- Payment History: ${game.chi_payment_history}, Utilization: ${game.chi_utilization}`);
  lines.push(`- Credit Age: ${game.chi_credit_age}, Credit Mix: ${game.chi_credit_mix}`);
  lines.push(`- New Inquiries: ${game.chi_new_inquiries}`);
  lines.push('');

  lines.push(`## Accounts`);
  for (const a of accounts) {
    let line = `- ${a.name} (${a.type}): Balance ${centsToStr(a.balance)}`;
    if (a.credit_limit) line += `, Limit ${centsToStr(a.credit_limit)}`;
    if (a.interest_rate) line += `, Rate ${a.interest_rate}%`;
    lines.push(line);
  }
  lines.push('');

  if (bills.length > 0) {
    lines.push(`## Upcoming Bills`);
    for (const b of bills) {
      lines.push(`- ${b.name}: ${centsToStr(b.amount)} due ${b.next_due_date}, ${b.auto_pay ? 'autopay' : 'manual'}`);
    }
    lines.push('');
  }

  if (recentTx.length > 0) {
    lines.push(`## Recent Transactions (last 10)`);
    for (const tx of recentTx.slice(0, 10)) {
      lines.push(`- ${tx.description}: ${centsToStr(tx.amount)} [${tx.category}]`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Load supporting data from DB
// ---------------------------------------------------------------------------

async function loadGameContext(pool: Pool, gameId: string): Promise<{
  bills: BillRow[];
  recentTx: TransactionRow[];
}> {
  const [billsRes, txRes] = await Promise.all([
    pool.query(
      'SELECT name, amount, next_due_date, category, auto_pay FROM scheduled_bills WHERE game_id = $1 AND is_active = true ORDER BY next_due_date LIMIT 20',
      [gameId],
    ),
    pool.query(
      'SELECT description, amount, category, created_at FROM game_transactions WHERE game_id = $1 ORDER BY created_at DESC LIMIT 10',
      [gameId],
    ),
  ]);
  return {
    bills: billsRes.rows,
    recentTx: txRes.rows,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function isAIAvailable(): boolean {
  return Boolean(AZURE_KEY);
}

export async function getFinancialAdvice(
  pool: Pool,
  game: GameRow,
  accounts: AccountRow[],
  question?: string,
): Promise<string> {
  if (!AZURE_KEY) throw new Error('AI advisor not configured');
  if (!checkRateLimit(game.id)) throw new Error('Daily AI call limit reached (10/day)');

  const { bills, recentTx } = await loadGameContext(pool, game.id);
  const summary = buildFinancialSummary(game, accounts, bills, recentTx);

  const cacheKey = `advice:${game.id}:${game.state_version}:${question ?? ''}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const systemPrompt = [
    'You are a friendly, encouraging AI financial advisor inside MoneyLife, a financial literacy game.',
    'The player is learning about managing money. Give practical, clear advice using their actual financial data.',
    'Keep responses to 2-4 short paragraphs. Use simple language. Be encouraging but honest.',
    'If the player is struggling (low CHI, negative net worth, bankruptcy), focus on actionable recovery steps.',
    'Never break the fourth wall – treat this as a real financial situation within the game world.',
    '',
    summary,
  ].join('\n');

  const userMessage = question || 'Give me personalized financial advice based on my current situation.';

  incrementRateLimit(game.id);
  const answer = await callAzureOpenAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ]);

  cacheSet(cacheKey, answer);
  return answer;
}

export async function getCardHint(
  pool: Pool,
  game: GameRow,
  accounts: AccountRow[],
  card: PendingCardRow,
): Promise<string> {
  if (!AZURE_KEY) throw new Error('AI advisor not configured');
  if (!checkRateLimit(game.id)) throw new Error('Daily AI call limit reached (10/day)');

  const { bills, recentTx } = await loadGameContext(pool, game.id);
  const summary = buildFinancialSummary(game, accounts, bills, recentTx);

  const cacheKey = `hint:${game.id}:${game.state_version}:${card.id}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const optionsText = JSON.stringify(card.options, null, 2);
  const systemPrompt = [
    'You are a financial advisor in MoneyLife, a financial literacy game.',
    'The player is asking for help choosing between options on a decision card.',
    'Analyze each option given their financial state. Recommend the best option and explain WHY in 2-3 sentences.',
    'Consider their balances, upcoming bills, CHI score, and overall financial health.',
    'Format: Start with "I recommend Option [X]: [label]" then explain.',
    '',
    summary,
  ].join('\n');

  const userPrompt = [
    `Decision Card: ${card.title || card.card_id}`,
    card.description ? `Description: ${card.description}` : '',
    card.category ? `Category: ${card.category}` : '',
    '',
    `Options:`,
    optionsText,
    '',
    'Which option is best for my current financial situation and why?',
  ].join('\n');

  incrementRateLimit(game.id);
  const answer = await callAzureOpenAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  cacheSet(cacheKey, answer);
  return answer;
}

export async function getDailySummary(
  pool: Pool,
  game: GameRow,
  accounts: AccountRow[],
): Promise<string> {
  if (!AZURE_KEY) throw new Error('AI advisor not configured');
  if (!checkRateLimit(game.id)) throw new Error('Daily AI call limit reached (10/day)');

  const { bills, recentTx } = await loadGameContext(pool, game.id);
  const summary = buildFinancialSummary(game, accounts, bills, recentTx);

  const dateStr = game.current_game_date instanceof Date
    ? game.current_game_date.toISOString().slice(0, 10)
    : String(game.current_game_date);
  const cacheKey = `daily:${game.id}:${dateStr}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const systemPrompt = [
    'You are a financial advisor in MoneyLife, a financial literacy game.',
    'Generate a brief 2-3 sentence daily financial summary/tip for the player.',
    'Vary your advice based on their financial health: mention upcoming bills, recent spending trends, CHI improvements, or savings tips.',
    'Be encouraging and specific. Reference actual numbers from their accounts.',
    'Keep it conversational and under 60 words.',
    '',
    summary,
  ].join('\n');

  incrementRateLimit(game.id);
  const answer = await callAzureOpenAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'Give me my daily financial summary and tip.' },
  ]);

  cacheSet(cacheKey, answer);
  return answer;
}
