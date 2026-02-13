import { useTranslation } from 'react-i18next';
import en from '../i18n/en.json';

function lookup(key: string, params?: Record<string, unknown>): string {
  const parts = key.split('.');
  let val: unknown = en;
  for (const p of parts) {
    if (val && typeof val === 'object') val = (val as Record<string, unknown>)[p];
    else return key;
  }
  if (typeof val !== 'string') return key;
  if (params) {
    return val.replace(/\{\{(\w+)\}\}/g, (_, k) => String(params[k] ?? `{{${k}}}`));
  }
  return val;
}

export function useT() {
  const { t, ready } = useTranslation();
  // Test if i18n is actually working
  const working = ready && t('landing.tagline') !== 'landing.tagline';
  return working ? t : ((key: string, params?: Record<string, unknown>) => lookup(key, params)) as typeof t;
}
