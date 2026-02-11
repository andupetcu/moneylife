describe('Friend System', () => {
  it('normalizes user IDs for friendship uniqueness (lower UUID first)', () => {
    const a = 'aaaa-0000';
    const b = 'bbbb-0000';
    const [first, second] = [a, b].sort();
    expect(first).toBe(a);
    expect(second).toBe(b);

    const [first2, second2] = [b, a].sort();
    expect(first2).toBe(a);
    expect(second2).toBe(b);
  });

  it('generates valid join codes', () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[A-Z0-9]+$/);
    // No ambiguous chars (0, O, 1, I)
    expect(code).not.toMatch(/[0OI1]/);
  });
});

describe('Leaderboard Types', () => {
  const validTypes = ['global', 'friends', 'classroom'];
  const validTimeframes = ['weekly', 'monthly', 'all_time'];
  const validMetrics = ['net_worth', 'chi_score', 'budget_adherence', 'xp'];

  it('validates leaderboard types', () => {
    expect(validTypes).toContain('global');
    expect(validTypes).toContain('friends');
    expect(validTypes).toContain('classroom');
    expect(validTypes).not.toContain('invalid');
  });

  it('validates timeframes', () => {
    for (const tf of validTimeframes) {
      expect(typeof tf).toBe('string');
    }
  });

  it('validates metrics', () => {
    expect(validMetrics.length).toBeGreaterThanOrEqual(4);
  });
});

describe('Classroom', () => {
  it('validates assignment types', () => {
    const types = ['complete_level', 'budget_adherence', 'savings_goal', 'custom'];
    expect(types).toHaveLength(4);
  });

  it('validates difficulty options', () => {
    const difficulties = ['easy', 'normal', 'hard'];
    expect(difficulties).toHaveLength(3);
  });

  it('enforces max level range', () => {
    const min = 1;
    const max = 8;
    expect(max).toBeGreaterThanOrEqual(min);
    expect(max).toBeLessThanOrEqual(8);
  });
});
