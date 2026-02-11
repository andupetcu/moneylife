'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

export default function RegisterPage(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!email) { setError(t('auth.emailRequired')); return; }
    if (!password) { setError(t('auth.passwordRequired')); return; }
    if (password.length < 8) { setError(t('auth.passwordTooShort')); return; }
    if (password !== confirmPassword) { setError(t('auth.passwordsDoNotMatch')); return; }
    setError(null);
    setIsLoading(true);
    try {
      router.push('/dashboard');
    } catch {
      setError(t('auth.emailInUse'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{t('auth.register')}</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>{t('auth.displayName')}</label>
        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t('auth.displayName')} style={styles.input} data-testid="register-name" />

        <label style={styles.label}>{t('auth.email')}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.email')} style={styles.input} data-testid="register-email" />

        <label style={styles.label}>{t('auth.password')}</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.password')} style={styles.input} data-testid="register-password" />

        <label style={styles.label}>{t('auth.confirmPassword')}</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('auth.confirmPassword')} style={styles.input} data-testid="register-confirm" />

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={isLoading} style={styles.button} data-testid="register-submit">
          {isLoading ? t('common.loading') : t('auth.register')}
        </button>
      </form>

      <p style={styles.footer}>
        {t('auth.hasAccount')}{' '}
        <a href="/login" style={styles.link}>{t('auth.signIn')}</a>
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 400, margin: '80px auto', padding: 24 },
  title: { textAlign: 'center', color: '#2563EB', fontSize: 32, marginBottom: 32 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  label: { fontSize: 14, fontWeight: 600, color: '#374151' },
  input: { padding: 12, borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 16 },
  error: { color: '#EF4444', fontSize: 14 },
  button: { padding: 14, borderRadius: 8, backgroundColor: '#2563EB', color: '#FFF', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer' },
  footer: { textAlign: 'center', marginTop: 24, color: '#6B7280' },
  link: { color: '#2563EB', fontWeight: 600 },
};
