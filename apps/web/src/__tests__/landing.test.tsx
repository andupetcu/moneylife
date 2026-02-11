import React from 'react';
import { render, screen } from '@testing-library/react';

import LandingPage from '../../app/page';

describe('LandingPage', () => {
  it('renders the title', () => {
    render(<LandingPage />);
    expect(screen.getByText('MoneyLife')).toBeTruthy();
  });

  it('renders the subtitle', () => {
    render(<LandingPage />);
    expect(screen.getByText('Learn money by living it')).toBeTruthy();
  });

  it('renders feature cards', () => {
    render(<LandingPage />);
    expect(screen.getByText('📊 Realistic Simulation')).toBeTruthy();
    expect(screen.getByText('🎯 Decision Cards')).toBeTruthy();
    expect(screen.getByText('🏆 Earn Rewards')).toBeTruthy();
    expect(screen.getByText('🏫 Classroom Mode')).toBeTruthy();
    expect(screen.getByText('🏦 Mirror Mode')).toBeTruthy();
    expect(screen.getByText('🌍 Multi-Currency')).toBeTruthy();
  });

  it('renders CTA buttons', () => {
    render(<LandingPage />);
    expect(screen.getByText('Get Started Free')).toBeTruthy();
    expect(screen.getByText('Sign In')).toBeTruthy();
  });

  it('has correct links', () => {
    render(<LandingPage />);
    const getStarted = screen.getByText('Get Started Free');
    expect(getStarted.closest('a')?.getAttribute('href')).toBe('/register');
    const signIn = screen.getByText('Sign In');
    expect(signIn.closest('a')?.getAttribute('href')).toBe('/login');
  });

  it('renders footer', () => {
    render(<LandingPage />);
    expect(screen.getByText(/2026 MoneyLife/)).toBeTruthy();
  });
});
