import React, { useState } from 'react';

import { UsersPage } from './pages/UsersPage';
import { GamesPage } from './pages/GamesPage';
import { PartnersPage } from './pages/PartnersPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AntiCheatPage } from './pages/AntiCheatPage';
import { SystemHealthPage } from './pages/SystemHealthPage';

type Page = 'users' | 'games' | 'partners' | 'analytics' | 'anti-cheat' | 'health';

const NAV_ITEMS: Array<{ key: Page; label: string }> = [
  { key: 'users', label: 'Users' },
  { key: 'games', label: 'Games' },
  { key: 'partners', label: 'Partners' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'anti-cheat', label: 'Anti-Cheat' },
  { key: 'health', label: 'System Health' },
];

export function App(): React.ReactElement {
  const [currentPage, setCurrentPage] = useState<Page>('users');

  const renderPage = (): React.ReactElement => {
    switch (currentPage) {
      case 'users': return <UsersPage />;
      case 'games': return <GamesPage />;
      case 'partners': return <PartnersPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'anti-cheat': return <AntiCheatPage />;
      case 'health': return <SystemHealthPage />;
    }
  };

  return (
    <div style={styles.layout}>
      <nav style={styles.sidebar}>
        <h1 style={styles.logo}>MoneyLife Admin</h1>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => setCurrentPage(item.key)}
            style={{
              ...styles.navButton,
              backgroundColor: currentPage === item.key ? '#EFF6FF' : 'transparent',
              color: currentPage === item.key ? '#2563EB' : '#374151',
              fontWeight: currentPage === item.key ? 600 : 400,
            }}
            data-testid={`nav-${item.key}`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <main style={styles.content} data-testid="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  layout: { display: 'flex', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  sidebar: { width: 240, borderRight: '1px solid #E5E7EB', padding: 16, display: 'flex', flexDirection: 'column', gap: 4 },
  logo: { fontSize: 18, fontWeight: 700, color: '#2563EB', marginBottom: 24, padding: '0 8px' },
  navButton: { display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14 },
  content: { flex: 1, padding: 32, backgroundColor: '#F9FAFB' },
};
