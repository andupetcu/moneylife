import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import LoginPage from '../../app/(auth)/login/page';

// Mock next/navigation at module level — already done in jest.setup.js

describe('LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByText('Log in')).toBeTruthy();
  });

  it('renders email input', () => {
    render(<LoginPage />);
    expect(screen.getByTestId('login-email')).toBeTruthy();
  });

  it('renders password input', () => {
    render(<LoginPage />);
    expect(screen.getByTestId('login-password')).toBeTruthy();
  });

  it('renders submit button', () => {
    render(<LoginPage />);
    expect(screen.getByTestId('login-submit')).toBeTruthy();
  });

  it('shows error for empty email', () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByTestId('login-submit'));
    expect(screen.getByText('Email is required')).toBeTruthy();
  });

  it('renders sign up link', () => {
    render(<LoginPage />);
    expect(screen.getByText('Sign up')).toBeTruthy();
  });
});

describe('RegisterPage', () => {
  // Import dynamically to test
  let RegisterPage: React.ComponentType;

  beforeAll(async () => {
    const mod = await import('../../app/(auth)/register/page');
    RegisterPage = mod.default;
  });

  it('renders register form', () => {
    render(<RegisterPage />);
    expect(screen.getByText('Create account')).toBeTruthy();
  });

  it('renders all input fields', () => {
    render(<RegisterPage />);
    expect(screen.getByTestId('register-name')).toBeTruthy();
    expect(screen.getByTestId('register-email')).toBeTruthy();
    expect(screen.getByTestId('register-password')).toBeTruthy();
    expect(screen.getByTestId('register-confirm')).toBeTruthy();
  });

  it('shows error for empty email on submit', () => {
    render(<RegisterPage />);
    fireEvent.click(screen.getByTestId('register-submit'));
    expect(screen.getByText('Email is required')).toBeTruthy();
  });

  it('renders sign in link', () => {
    render(<RegisterPage />);
    expect(screen.getByText('Sign in')).toBeTruthy();
  });
});
