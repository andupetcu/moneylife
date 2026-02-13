import React from 'react';
import type { Metadata, Viewport } from 'next';

import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'MoneyLife — Learn Money by Living It',
  description:
    'A financial education game where you manage personal finances through realistic life scenarios. Build budgets, handle emergencies, invest, and learn to make smart money decisions.',
  keywords: ['financial education', 'money game', 'budgeting', 'personal finance', 'financial literacy'],
  openGraph: {
    title: 'MoneyLife — Learn Money by Living It',
    description: 'The financial education game that teaches through play.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
