'use client';

import React, { useState } from 'react';
import { useT } from '../../../src/lib/useT';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../src/lib/auth-context';
import { colors, radius, shadows } from '../../../src/lib/design-tokens';

export default function LoginPage(): React.ReactElement {
  const t = useT();
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!email) { setError(t('auth.emailRequired') || 'Email required'); return; }
    if (!password) { setError(t('auth.passwordRequired') || 'Password required'); return; }
    setError(null);
    setIsLoading(true);
    const err = await login(email, password);
    setIsLoading(false);
    if (err) {
      setError(err);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, background: colors.surface, borderRadius: radius.xl, boxShadow: shadows.elevated, overflow: 'hidden' }}>
        {/* Purple header */}
        <div style={{ background: colors.primaryGradient, padding: '36px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>💰</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{t('appTitle') || 'MoneyLife'}</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>{t('auth.login') || 'Sign In'}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, display: 'block', marginBottom: 6 }}>{t('auth.email') || 'Email'}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              style={{ width: '100%', height: 52, padding: '0 16px', borderRadius: radius.md, border: `1px solid ${colors.border}`, fontSize: 16, outline: 'none', background: colors.inputBg, color: colors.textPrimary }} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, display: 'block', marginBottom: 6 }}>{t('auth.password') || 'Password'}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password"
              style={{ width: '100%', height: 52, padding: '0 16px', borderRadius: radius.md, border: `1px solid ${colors.border}`, fontSize: 16, outline: 'none', background: colors.inputBg, color: colors.textPrimary }} />
          </div>

          {error && <p style={{ color: colors.danger, fontSize: 14, padding: '10px 14px', background: '#FEF2F2', borderRadius: radius.sm, margin: 0 }}>{error}</p>}

          <button type="submit" disabled={isLoading} style={{
            width: '100%', height: 52, borderRadius: radius.md, background: colors.primaryGradient, color: '#FFFFFF',
            fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: 4,
            opacity: isLoading ? 0.7 : 1,
          }}>
            {isLoading ? (t('common.loading') || 'Loading...') : (t('auth.login') || 'Sign In')}
          </button>
        </form>

        <p style={{ textAlign: 'center', padding: '0 28px 28px', color: colors.textSecondary, fontSize: 14, margin: 0 }}>
          {t('auth.noAccount') || "Don't have an account?"}{' '}
          <a href="/register" style={{ color: colors.primary, fontWeight: 600 }}>{t('auth.signUp') || 'Sign Up'}</a>
        </p>
      </div>
    </div>
  );
}
