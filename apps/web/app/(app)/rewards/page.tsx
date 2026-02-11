'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

export default function RewardsPage(): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24 }}>
      <h1>{t('rewards.title')}</h1>
      <p style={{ color: '#9CA3AF' }}>{t('rewards.noBadges')}</p>
    </div>
  );
}
