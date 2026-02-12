'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../src/lib/auth-context';

export default function LoginPage(): React.ReactElement {
  const { t } = useTranslation();
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
    <div style={styles.container}>
      <h1 style={styles.title}>{t('appTitle') || 'MoneyLife'}</h1>
      <h2 style={styles.subtitle}>{t('auth.login') || 'Sign In'}</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>{t('auth.email') || 'Email'}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={styles.input} />

        <label style={styles.label}>{t('auth.password') || 'Password'}</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" style={styles.input} />

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={isLoading} style={{...styles.button, opacity: isLoading ? 0.7 : 1}}>
          {isLoading ? (t('common.loading') || 'Loading...') : (t('auth.login') || 'Sign In')}
        </button>
      </form>

      <p style={styles.footer}>
        {t('auth.noAccount') || "Don't have an account?"}{' '}
        <a href="/register" style={styles.link}>{t('auth.signUp') || 'Sign Up'}</a>
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 400, margin: '80px auto', padding: 24 },
  title: { textAlign: 'center', color: '#2563EB', fontSize: 32 },
  subtitle: { textAlign: 'center', color: '#6B7280', marginBottom: 32 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  label: { fontSize: 14, fontWeight: 600, color: '#374151' },
  input: { padding: 12, borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 16, outline: 'none' },
  error: { color: '#EF4444', fontSize: 14, padding: '8px 12px', background: '#FEF2F2', borderRadius: 8 },
  button: { padding: 14, borderRadius: 8, backgroundColor: '#2563EB', color: '#FFF', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: 8 },
  footer: { textAlign: 'center', marginTop: 24, color: '#6B7280' },
  link: { color: '#2563EB', fontWeight: 600 },
};
