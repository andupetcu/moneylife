'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CardPage(): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24 }}>
      <h1>{t('game.decisionCard')}</h1>
      <p style={{ color: '#9CA3AF' }}>{t('error.notFound')}</p>
    </div>
  );
}
