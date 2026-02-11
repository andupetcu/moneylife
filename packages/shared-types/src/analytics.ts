// packages/shared-types/src/analytics.ts

export interface AnalyticsEvent {
  eventId: string;
  userId: string;
  gameId?: string;
  eventType: AnalyticsEventType;
  properties: Record<string, unknown>;
  timestamp: string;
  sessionId: string;
  deviceId: string;
  platform: string;
}

export type AnalyticsEventType =
  | 'game_created'
  | 'game_day_advanced'
  | 'card_decided'
  | 'month_end_processed'
  | 'level_up'
  | 'badge_earned'
  | 'reward_redeemed'
  | 'account_opened'
  | 'account_closed'
  | 'transfer_completed'
  | 'budget_set'
  | 'bankruptcy_declared'
  | 'insurance_claimed'
  | 'investment_traded'
  | 'streak_milestone'
  | 'tutorial_step_completed'
  | 'session_start'
  | 'session_end';

export interface LearningOutcome {
  userId: string;
  gameId: string;
  concept: FinancialConcept;
  demonstrated: boolean;
  demonstratedAt?: string;
}

export type FinancialConcept =
  | 'budgeting'
  | 'saving'
  | 'credit_management'
  | 'debt_management'
  | 'investing'
  | 'insurance'
  | 'tax_planning'
  | 'emergency_fund'
  | 'compound_interest'
  | 'risk_diversification';
