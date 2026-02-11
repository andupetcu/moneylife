// packages/shared-types/src/errors.ts

export type ErrorCode =
  | 'INSUFFICIENT_FUNDS'
  | 'CARD_EXPIRED'
  | 'CARD_NOT_FOUND'
  | 'ACCOUNT_NOT_FOUND'
  | 'ACCOUNT_LIMIT_REACHED'
  | 'INVALID_TRANSFER'
  | 'OVERDRAFT_EXCEEDED'
  | 'CREDIT_LIMIT_EXCEEDED'
  | 'LOAN_DENIED'
  | 'WITHDRAWAL_LIMIT_EXCEEDED'
  | 'INVALID_AMOUNT'
  | 'INVALID_ACTION'
  | 'STALE_STATE'
  | 'RATE_LIMITED'
  | 'UNAUTHORIZED'
  | 'GAME_NOT_FOUND'
  | 'GAME_COMPLETED'
  | 'GAME_BANKRUPT'
  | 'PENDING_CARDS'
  | 'DUPLICATE_REQUEST'
  | 'BUDGET_INVALID'
  | 'GOAL_LIMIT_REACHED'
  | 'INVESTMENT_FROZEN'
  | 'INSURANCE_LAPSED'
  | 'FEATURE_LOCKED'
  | 'LEVEL_REQUIRED'
  | 'UNBALANCED_TRANSACTION'
  | 'ANTI_CHEAT_FLAG';

export interface AppError {
  code: ErrorCode;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export class GameplayError extends Error {
  public readonly code: ErrorCode;
  public readonly field?: string;

  constructor(code: ErrorCode, message: string, field?: string) {
    super(message);
    this.name = 'GameplayError';
    this.code = code;
    this.field = field;
  }
}
