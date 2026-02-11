import React from 'react';
import Link from 'next/link';

/**
 * Landing page — server-rendered for SEO.
 */
export default function LandingPage(): React.ReactElement {
  return (
    <main style={styles.main}>
      <section style={styles.hero}>
        <h1 style={styles.title}>MoneyLife</h1>
        <p style={styles.subtitle}>Learn money by living it</p>
        <p style={styles.description}>
          A financial education game where you manage personal finances through realistic scenarios.
          Pick a persona, navigate financial decisions, build budgets, handle emergencies, and learn
          to make smart money decisions — all in a safe, gamified environment.
        </p>
        <div style={styles.cta}>
          <Link href="/register" style={styles.primaryButton}>
            Get Started Free
          </Link>
          <Link href="/login" style={styles.secondaryButton}>
            Sign In
          </Link>
        </div>
      </section>

      <section style={styles.features}>
        <div style={styles.feature}>
          <h3>📊 Realistic Simulation</h3>
          <p>Manage checking, savings, credit cards, loans, and investments with real-world financial mechanics.</p>
        </div>
        <div style={styles.feature}>
          <h3>🎯 Decision Cards</h3>
          <p>Face daily financial decisions with real consequences. Every choice teaches a lesson.</p>
        </div>
        <div style={styles.feature}>
          <h3>🏆 Earn Rewards</h3>
          <p>Earn XP, coins, and badges for smart financial decisions. Redeem for real-world rewards.</p>
        </div>
        <div style={styles.feature}>
          <h3>🏫 Classroom Mode</h3>
          <p>Teachers can create classrooms, set assignments, and track student progress.</p>
        </div>
        <div style={styles.feature}>
          <h3>🏦 Mirror Mode</h3>
          <p>Connect your real bank account and compare simulated vs real spending patterns.</p>
        </div>
        <div style={styles.feature}>
          <h3>🌍 Multi-Currency</h3>
          <p>Play in your local currency — RON, PLN, EUR, GBP, USD, and more.</p>
        </div>
      </section>

      <footer style={styles.footer}>
        <p>© 2026 MoneyLife. Financial education for everyone.</p>
      </footer>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  hero: {
    textAlign: 'center',
    padding: '80px 0 60px',
  },
  title: {
    fontSize: 56,
    fontWeight: 700,
    color: '#2563EB',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    color: '#6B7280',
    marginBottom: 24,
  },
  description: {
    fontSize: 18,
    color: '#374151',
    maxWidth: 700,
    margin: '0 auto 40px',
    lineHeight: 1.6,
  },
  cta: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    padding: '14px 32px',
    borderRadius: 8,
    fontSize: 18,
    fontWeight: 600,
    textDecoration: 'none',
  },
  secondaryButton: {
    border: '2px solid #2563EB',
    color: '#2563EB',
    padding: '12px 32px',
    borderRadius: 8,
    fontSize: 18,
    fontWeight: 600,
    textDecoration: 'none',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 24,
    padding: '40px 0',
  },
  feature: {
    padding: 24,
    borderRadius: 12,
    border: '1px solid #E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  footer: {
    textAlign: 'center',
    padding: '40px 0',
    color: '#9CA3AF',
    borderTop: '1px solid #E5E7EB',
  },
};
