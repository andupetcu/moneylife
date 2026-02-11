import type { RegionCode } from './game.js';

export type BadgeCategory =
  | 'savings' | 'credit' | 'budget' | 'investment'
  | 'life_event' | 'engagement' | 'progression';

export interface BadgeCondition {
  type: 'threshold' | 'streak' | 'event' | 'compound';
  metric?: string;
  value?: number;
  duration?: number;
  conditions?: BadgeCondition[];
  operator?: 'and' | 'or';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: BadgeCategory;
  condition: BadgeCondition;
  xpReward: number;
  coinReward: number;
  isHidden: boolean;
}

export interface RewardCatalogItem {
  id: string;
  partnerId: string | null;
  name: string;
  description: string;
  image: string;
  coinCost: number;
  category: string;
  provider: string;
  fulfillmentType: 'digital' | 'physical' | 'experience';
  availability: 'in_stock' | 'limited' | 'out_of_stock';
  expiresAt?: string;
  regions: RegionCode[];
}
