import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class ActionQueueModel extends Model {
  static table = 'action_queue';

  @field('game_id') gameId!: string;
  @field('action_type') actionType!: string;
  @field('payload_json') payloadJson!: string;
  @field('idempotency_key') idempotencyKey!: string;
  @field('client_timestamp') clientTimestamp!: string;
  @field('status') status!: string;
  @readonly @date('created_at') createdAt!: Date;
}
