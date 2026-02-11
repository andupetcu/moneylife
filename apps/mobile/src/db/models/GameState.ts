import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, json } from '@nozbe/watermelondb/decorators';

export class GameStateModel extends Model {
  static table = 'game_states';

  @field('game_id') gameId!: string;
  @field('user_id') userId!: string;
  @field('state_json') stateJson!: string;
  @field('synced_at') syncedAt!: number;
  @field('is_dirty') isDirty!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
