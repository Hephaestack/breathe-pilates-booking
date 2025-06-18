import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en/translation.json';
import gr from '../locales/gr/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      gr: { translation: gr },
    },
    lng: 'gr',
    fallbackLng: 'gr',
    interpolation: { escapeValue: false },
  });

export default i18n;