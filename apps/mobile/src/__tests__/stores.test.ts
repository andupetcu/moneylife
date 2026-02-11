import { useGameStore } from '../stores/useGameStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useRewardsStore } from '../stores/useRewardsStore';
import { useSettingsStore } from '../stores/useSettingsStore';

describe('useGameStore', () => {
  beforeEach(() => useGameStore.setState(useGameStore.getInitialState()));

  it('initializes with null game', () => {
    expect(useGameStore.getState().currentGame).toBeNull();
  });

  it('sets game and pending cards', () => {
    const mockGame = { id: 'g1', pendingCards: [{ id: 'c1' }] } as never;
    useGameStore.getState().setGame(mockGame);
    expect(useGameStore.getState().currentGame).toBe(mockGame);
    expect(useGameStore.getState().pendingCards).toHaveLength(1);
  });

  it('clears game', () => {
    useGameStore.getState().setGame({ id: 'g1', pendingCards: [] } as never);
    useGameStore.getState().clearGame();
    expect(useGameStore.getState().currentGame).toBeNull();
  });

  it('sets offline status', () => {
    useGameStore.getState().setOffline(true);
    expect(useGameStore.getState().isOffline).toBe(true);
  });

  it('updates game partial', () => {
    useGameStore.getState().setGame({ id: 'g1', netWorth: 1000, pendingCards: [] } as never);
    useGameStore.getState().updateGamePartial({ netWorth: 2000 });
    expect(useGameStore.getState().currentGame?.netWorth).toBe(2000);
  });

  it('does not crash on partial update with no game', () => {
    useGameStore.getState().updateGamePartial({ netWorth: 2000 });
    expect(useGameStore.getState().currentGame).toBeNull();
  });

  it('sets loading state', () => {
    useGameStore.getState().setLoading(true);
    expect(useGameStore.getState().isLoading).toBe(true);
  });

  it('sets pending cards independently', () => {
    useGameStore.getState().setPendingCards([{ id: 'c1' }, { id: 'c2' }] as never);
    expect(useGameStore.getState().pendingCards).toHaveLength(2);
  });
});

describe('useAuthStore', () => {
  beforeEach(() => useAuthStore.setState(useAuthStore.getInitialState()));

  it('initializes as not authenticated', () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('sets authenticated with user and tokens', () => {
    const user = { id: 'u1', email: 'test@test.com' } as never;
    const tokens = { accessToken: 'at', refreshToken: 'rt' };
    useAuthStore.getState().setAuthenticated(user, tokens);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user).toBe(user);
    expect(useAuthStore.getState().tokens).toBe(tokens);
  });

  it('logs out', () => {
    useAuthStore.getState().setAuthenticated({ id: 'u1' } as never, { accessToken: 'a', refreshToken: 'r' });
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().tokens).toBeNull();
  });

  it('sets loading state', () => {
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('sets user independently', () => {
    const user = { id: 'u1' } as never;
    useAuthStore.getState().setUser(user);
    expect(useAuthStore.getState().user).toBe(user);
  });

  it('sets tokens independently', () => {
    const tokens = { accessToken: 'a', refreshToken: 'r' };
    useAuthStore.getState().setTokens(tokens);
    expect(useAuthStore.getState().tokens).toBe(tokens);
  });
});

describe('useRewardsStore', () => {
  beforeEach(() => useRewardsStore.setState(useRewardsStore.getInitialState()));

  it('initializes with zero values', () => {
    const state = useRewardsStore.getState();
    expect(state.totalXp).toBe(0);
    expect(state.totalCoins).toBe(0);
    expect(state.currentLevel).toBe(1);
    expect(state.badges).toHaveLength(0);
  });

  it('sets rewards data', () => {
    useRewardsStore.getState().setRewardsData({ totalXp: 100, totalCoins: 50, currentLevel: 2, streakDays: 5 });
    expect(useRewardsStore.getState().totalXp).toBe(100);
    expect(useRewardsStore.getState().currentLevel).toBe(2);
  });

  it('adds badge', () => {
    useRewardsStore.getState().addBadge({ id: 'b1', name: 'Test' } as never);
    expect(useRewardsStore.getState().badges).toHaveLength(1);
  });

  it('updates coins', () => {
    useRewardsStore.getState().updateCoins(50);
    expect(useRewardsStore.getState().totalCoins).toBe(50);
    useRewardsStore.getState().updateCoins(-20);
    expect(useRewardsStore.getState().totalCoins).toBe(30);
  });

  it('updates xp', () => {
    useRewardsStore.getState().updateXp(100);
    expect(useRewardsStore.getState().totalXp).toBe(100);
  });

  it('sets badges list', () => {
    useRewardsStore.getState().setBadges([{ id: 'b1' }, { id: 'b2' }] as never);
    expect(useRewardsStore.getState().badges).toHaveLength(2);
  });

  it('sets catalog', () => {
    useRewardsStore.getState().setCatalog([{ id: 'r1' }] as never);
    expect(useRewardsStore.getState().catalog).toHaveLength(1);
  });
});

describe('useSettingsStore', () => {
  beforeEach(() => useSettingsStore.setState(useSettingsStore.getInitialState()));

  it('initializes with defaults', () => {
    expect(useSettingsStore.getState().locale).toBe('en');
    expect(useSettingsStore.getState().themeMode).toBe('system');
    expect(useSettingsStore.getState().pushNotifications).toBe(true);
  });

  it('sets locale', () => {
    useSettingsStore.getState().setLocale('ro');
    expect(useSettingsStore.getState().locale).toBe('ro');
  });

  it('sets theme mode', () => {
    useSettingsStore.getState().setThemeMode('dark');
    expect(useSettingsStore.getState().themeMode).toBe('dark');
  });

  it('toggles push notifications', () => {
    useSettingsStore.getState().setPushNotifications(false);
    expect(useSettingsStore.getState().pushNotifications).toBe(false);
  });

  it('toggles email notifications', () => {
    useSettingsStore.getState().setEmailNotifications(false);
    expect(useSettingsStore.getState().emailNotifications).toBe(false);
  });

  it('toggles sound', () => {
    useSettingsStore.getState().setSoundEnabled(false);
    expect(useSettingsStore.getState().soundEnabled).toBe(false);
  });

  it('toggles haptics', () => {
    useSettingsStore.getState().setHapticsEnabled(false);
    expect(useSettingsStore.getState().hapticsEnabled).toBe(false);
  });
});
