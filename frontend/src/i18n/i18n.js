import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './locales/en.json';
import lvTranslations from './locales/lv.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },
    
    resources: {
      en: {
        translation: enTranslations,
      },
      lv: {
        translation: lvTranslations,
      },
    },
    
    react: {
      useSuspense: true,
    },
  });

export default i18n; 