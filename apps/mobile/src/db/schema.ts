import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'game_states',
      columns: [
        { name: 'game_id', type: 'string', isIndexed: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'state_json', type: 'string' },
        { name: 'synced_at', type: 'number' },
        { name: 'is_dirty', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'action_queue',
      columns: [
        { name: 'game_id', type: 'string', isIndexed: true },
        { name: 'action_type', type: 'string' },
        { name: 'payload_json', type: 'string' },
        { name: 'idempotency_key', type: 'string' },
        { name: 'client_timestamp', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'cached_cards',
      columns: [
        { name: 'card_id', type: 'string', isIndexed: true },
        { name: 'game_id', type: 'string', isIndexed: true },
        { name: 'card_json', type: 'string' },
        { name: 'expires_on', type: 'string' },
        { name: 'is_resolved', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
});
