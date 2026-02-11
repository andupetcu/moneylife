'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

export default function DashboardPage(): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{t('tabs.home')}</h1>
      <p style={styles.subtitle}>{t('home.noActiveGame')}</p>
      <p style={styles.description}>{t('empty.noGames')}</p>
      <button style={styles.button}>{t('home.startNewGame')}</button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 800, margin: '40px auto', padding: 24 },
  title: { fontSize: 28, fontWeight: 700, color: '#111827' },
  subtitle: { fontSize: 20, color: '#6B7280', marginTop: 16 },
  description: { color: '#9CA3AF', marginTop: 8 },
  button: { marginTop: 24, padding: '12px 24px', borderRadius: 8, backgroundColor: '#2563EB', color: '#FFF', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer' },
};
