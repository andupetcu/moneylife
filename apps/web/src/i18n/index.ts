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
import it from './it.json';
import pt from './pt.json';
import sv from './sv.json';
import da from './da.json';
import nb from './nb.json';
import fi from './fi.json';
import ja from './ja.json';
import hi from './hi.json';
import zh from './zh.json';
import tr from './tr.json';
import nl from './nl.json';
import el from './el.json';
import bg from './bg.json';
import hr from './hr.json';
import sk from './sk.json';
import uk from './uk.json';

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
      it: { translation: it },
      pt: { translation: pt },
      sv: { translation: sv },
      da: { translation: da },
      nb: { translation: nb },
      fi: { translation: fi },
      ja: { translation: ja },
      hi: { translation: hi },
      zh: { translation: zh },
      tr: { translation: tr },
      nl: { translation: nl },
      el: { translation: el },
      bg: { translation: bg },
      hr: { translation: hr },
      sk: { translation: sk },
      uk: { translation: uk },
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
