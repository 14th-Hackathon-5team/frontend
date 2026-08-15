import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ko from './locales/ko.json'

export const APP_LANGUAGE_TO_LOCALE = {
  KOREAN: 'ko',
  ENGLISH: 'en',
}

export function toLocale(appLanguage) {
  return APP_LANGUAGE_TO_LOCALE[appLanguage] ?? 'en'
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ko: { translation: ko },
  },
  lng: toLocale(localStorage.getItem('preferredLanguage')),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnObjects: true,
})

export default i18n