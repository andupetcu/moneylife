import React from 'react';
import { render, screen } from '@testing-library/react';

describe('App pages', () => {
  it('renders dashboard page', async () => {
    const { default: DashboardPage } = await import('../../app/(app)/dashboard/page');
    render(<DashboardPage />);
    expect(screen.getByText('Home')).toBeTruthy();
  });

  it('renders rewards page', async () => {
    const { default: RewardsPage } = await import('../../app/(app)/rewards/page');
    render(<RewardsPage />);
    expect(screen.getByText('Rewards')).toBeTruthy();
  });

  it('renders social page', async () => {
    const { default: SocialPage } = await import('../../app/(app)/social/page');
    render(<SocialPage />);
    expect(screen.getByText('Social')).toBeTruthy();
  });

  it('dashboard shows empty state', async () => {
    const { default: DashboardPage } = await import('../../app/(app)/dashboard/page');
    render(<DashboardPage />);
    expect(screen.getByText(/No active game/)).toBeTruthy();
  });

  it('dashboard shows start button', async () => {
    const { default: DashboardPage } = await import('../../app/(app)/dashboard/page');
    render(<DashboardPage />);
    expect(screen.getByText('Start a new game')).toBeTruthy();
  });

  it('rewards shows empty state', async () => {
    const { default: RewardsPage } = await import('../../app/(app)/rewards/page');
    render(<RewardsPage />);
    expect(screen.getByText(/No badges earned/)).toBeTruthy();
  });

  it('social shows empty state', async () => {
    const { default: SocialPage } = await import('../../app/(app)/social/page');
    render(<SocialPage />);
    expect(screen.getByText(/No friends yet/)).toBeTruthy();
  });
});
