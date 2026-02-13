import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import ro from './ro.json';
import pl from './pl.json';
import hu from './hu.json';
import de from './de.json';
import fr from './fr.json';
import es from './es.json';
import cs from './cs.json';

if (!i18n.isInitialized) {
  const savedLang = typeof window !== 'undefined' ? localStorage.getItem('ml-language') : null;

  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      ro: { translation: ro },
      pl: { translation: pl },
      hu: { translation: hu },
      de: { translation: de },
      fr: { translation: fr },
      es: { translation: es },
      cs: { translation: cs },
    },
    lng: savedLang || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    initImmediate: false,
  });
}

export default i18n;
