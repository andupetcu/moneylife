import React from 'react';
import type { Metadata, Viewport } from 'next';

import './globals.css';
import { Providers } from './providers';
import { globalAnimations } from '../src/lib/design-tokens';

export const metadata: Metadata = {
  title: 'MoneyLife — Learn Money by Living It',
  description:
    'A financial education game where you manage personal finances through realistic life scenarios. Build budgets, handle emergencies, invest, and learn to make smart money decisions.',
  keywords: ['financial education', 'money game', 'budgeting', 'personal finance', 'financial literacy'],
  icons: { icon: '/favicon.svg' },
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
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          ${globalAnimations}

          body {
            background: #0F0B1E;
            color: #F1F0FF;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          }

          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: #1A1333; }
          ::-webkit-scrollbar-thumb { background: #2D2545; border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: #4338CA; }

          ::selection { background: rgba(99, 102, 241, 0.3); }

          * { -webkit-tap-highlight-color: transparent; }
        ` }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
