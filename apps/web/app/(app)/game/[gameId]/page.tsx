'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

export default function GamePage(): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div style={styles.container}>
      <h1>{t('game.dailySummary', { day: 1, month: 1 })}</h1>
      <p style={styles.empty}>{t('home.noPendingCards')}</p>
      <button style={styles.button}>{t('home.advanceDay')}</button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 800, margin: '40px auto', padding: 24 },
  empty: { color: '#9CA3AF', marginTop: 16 },
  button: { marginTop: 24, padding: '12px 24px', borderRadius: 8, backgroundColor: '#2563EB', color: '#FFF', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer' },
};
