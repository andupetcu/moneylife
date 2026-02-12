import React from 'react';
import Link from 'next/link';
import { colors, radius, shadows } from '../src/lib/design-tokens';

/**
 * Landing page — server-rendered for SEO.
 */
export default function LandingPage(): React.ReactElement {
  return (
    <main style={{ minHeight: '100vh', background: colors.background }}>
      {/* Hero */}
      <section style={{
        background: colors.primaryGradient,
        padding: '100px 24px 80px',
        textAlign: 'center',
        borderRadius: `0 0 ${radius.xl}px ${radius.xl}px`,
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
          <h1 style={{ fontSize: 52, fontWeight: 700, color: '#FFFFFF', marginBottom: 12 }}>MoneyLife</h1>
          <p style={{ fontSize: 22, color: 'rgba(255,255,255,0.85)', marginBottom: 16 }}>Learn money by living it</p>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            A financial education game where you manage personal finances through realistic scenarios.
            Pick a persona, navigate financial decisions, build budgets, handle emergencies, and learn
            to make smart money decisions — all in a safe, gamified environment.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link href="/register" style={{
              background: '#FFFFFF',
              color: colors.primary,
              padding: '16px 36px',
              borderRadius: radius.pill,
              fontSize: 18,
              fontWeight: 600,
              boxShadow: shadows.elevated,
            }}>
              Get Started Free
            </Link>
            <Link href="/login" style={{
              border: '2px solid rgba(255,255,255,0.5)',
              color: '#FFFFFF',
              padding: '14px 36px',
              borderRadius: radius.pill,
              fontSize: 18,
              fontWeight: 600,
            }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '60px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 20,
      }}>
        {[
          { icon: '📊', title: 'Realistic Simulation', desc: 'Manage checking, savings, credit cards, loans, and investments with real-world financial mechanics.' },
          { icon: '🎯', title: 'Decision Cards', desc: 'Face daily financial decisions with real consequences. Every choice teaches a lesson.' },
          { icon: '🏆', title: 'Earn Rewards', desc: 'Earn XP, coins, and badges for smart financial decisions. Redeem for real-world rewards.' },
          { icon: '🏫', title: 'Classroom Mode', desc: 'Teachers can create classrooms, set assignments, and track student progress.' },
          { icon: '🏦', title: 'Mirror Mode', desc: 'Connect your real bank account and compare simulated vs real spending patterns.' },
          { icon: '🌍', title: 'Multi-Currency', desc: 'Play in your local currency — RON, PLN, EUR, GBP, USD, and more.' },
        ].map((f) => (
          <div key={f.title} style={{
            background: colors.surface,
            padding: 28,
            borderRadius: radius.lg,
            boxShadow: shadows.card,
            border: `1px solid ${colors.borderLight}`,
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: colors.textPrimary, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '32px 24px',
        color: colors.textMuted,
        borderTop: `1px solid ${colors.border}`,
        fontSize: 14,
      }}>
        <p>© 2026 MoneyLife. Financial education for everyone.</p>
      </footer>
    </main>
  );
}
