import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class CachedCardModel extends Model {
  static table = 'cached_cards';

  @field('card_id') cardId!: string;
  @field('game_id') gameId!: string;
  @field('card_json') cardJson!: string;
  @field('expires_on') expiresOn!: string;
  @field('is_resolved') isResolved!: boolean;
  @readonly @date('created_at') createdAt!: Date;
}
