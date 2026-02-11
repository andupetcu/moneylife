'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SocialPage(): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24 }}>
      <h1>{t('social.title')}</h1>
      <p style={{ color: '#9CA3AF' }}>{t('social.noFriends')}</p>
    </div>
  );
}
