import { schema } from '../db/schema';

describe('WatermelonDB schema', () => {
  it('has version 1', () => {
    expect(schema.version).toBe(1);
  });

  it('has game_states table', () => {
    const table = schema.tables.find((t: { name: string }) => t.name === 'game_states');
    expect(table).toBeDefined();
  });

  it('has action_queue table', () => {
    const table = schema.tables.find((t: { name: string }) => t.name === 'action_queue');
    expect(table).toBeDefined();
  });

  it('has cached_cards table', () => {
    const table = schema.tables.find((t: { name: string }) => t.name === 'cached_cards');
    expect(table).toBeDefined();
  });

  it('game_states has required columns', () => {
    const table = schema.tables.find((t: { name: string }) => t.name === 'game_states');
    const columnNames = table?.columns.map((c: { name: string }) => c.name);
    expect(columnNames).toContain('game_id');
    expect(columnNames).toContain('user_id');
    expect(columnNames).toContain('state_json');
    expect(columnNames).toContain('synced_at');
    expect(columnNames).toContain('is_dirty');
  });

  it('action_queue has required columns', () => {
    const table = schema.tables.find((t: { name: string }) => t.name === 'action_queue');
    const columnNames = table?.columns.map((c: { name: string }) => c.name);
    expect(columnNames).toContain('game_id');
    expect(columnNames).toContain('action_type');
    expect(columnNames).toContain('idempotency_key');
    expect(columnNames).toContain('status');
  });

  it('cached_cards has required columns', () => {
    const table = schema.tables.find((t: { name: string }) => t.name === 'cached_cards');
    const columnNames = table?.columns.map((c: { name: string }) => c.name);
    expect(columnNames).toContain('card_id');
    expect(columnNames).toContain('game_id');
    expect(columnNames).toContain('card_json');
    expect(columnNames).toContain('is_resolved');
  });
});
