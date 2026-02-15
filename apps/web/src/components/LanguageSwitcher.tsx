'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { colors, radius, shadows } from '../lib/design-tokens';

const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'ro', flag: '🇷🇴', name: 'Română' },
  { code: 'pl', flag: '🇵🇱', name: 'Polski' },
  { code: 'hu', flag: '🇭🇺', name: 'Magyar' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'cs', flag: '🇨🇿', name: 'Čeština' },
  { code: 'it', flag: '🇮🇹', name: 'Italiano' },
  { code: 'pt', flag: '🇧🇷', name: 'Português' },
  { code: 'sv', flag: '🇸🇪', name: 'Svenska' },
  { code: 'da', flag: '🇩🇰', name: 'Dansk' },
  { code: 'nb', flag: '🇳🇴', name: 'Norsk' },
  { code: 'fi', flag: '🇫🇮', name: 'Suomi' },
  { code: 'ja', flag: '🇯🇵', name: '日本語' },
  { code: 'hi', flag: '🇮🇳', name: 'हिन्दी' },
  { code: 'zh', flag: '🇨🇳', name: '中文' },
  { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
  { code: 'nl', flag: '🇳🇱', name: 'Nederlands' },
  { code: 'el', flag: '🇬🇷', name: 'Ελληνικά' },
  { code: 'bg', flag: '🇧🇬', name: 'Български' },
  { code: 'hr', flag: '🇭🇷', name: 'Hrvatski' },
  { code: 'sk', flag: '🇸🇰', name: 'Slovenčina' },
  { code: 'uk', flag: '🇺🇦', name: 'Українська' },
];

export default function LanguageSwitcher(): React.ReactElement {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  useEffect(() => {
    const saved = localStorage.getItem('ml-language');
    if (saved && saved !== i18n.language) {
      i18n.changeLanguage(saved);
    }
  }, [i18n]);

  useEffect(() => {
    const handleClick = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (code: string): void => {
    i18n.changeLanguage(code);
    localStorage.setItem('ml-language', code);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: radius.pill,
          border: `1px solid ${colors.border}`,
          background: colors.surface,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500,
          color: colors.textPrimary,
        }}
      >
        <span style={{ fontSize: 18 }}>{current.flag}</span>
        <span>{current.name}</span>
        <span style={{ fontSize: 10, color: colors.textMuted }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: 4,
          minWidth: 180,
          borderRadius: radius.md,
          background: colors.surface,
          boxShadow: shadows.elevated,
          border: `1px solid ${colors.borderLight}`,
          zIndex: 100,
          overflow: 'hidden',
        }}>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 14px',
                border: 'none',
                background: lang.code === i18n.language ? '#EEF2FF' : 'transparent',
                cursor: 'pointer',
                fontSize: 14,
                color: lang.code === i18n.language ? colors.primary : colors.textPrimary,
                fontWeight: lang.code === i18n.language ? 600 : 400,
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 18 }}>{lang.flag}</span>
              <span>{lang.name}</span>
              {lang.code === i18n.language && (
                <span style={{ marginLeft: 'auto', color: colors.primary, fontSize: 14 }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
