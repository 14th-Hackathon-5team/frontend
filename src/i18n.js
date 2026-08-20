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

// <html lang>도 UI 언어에 맞춰준다 — 스크린리더 발음, 브라우저 번역/자동완성 판단 기준이 되는 값이라
// 영어 모드에서 한국어로 남아 있으면 안 됨.
function syncDocumentLang(locale) {
  if (typeof document !== 'undefined') document.documentElement.lang = locale
}

syncDocumentLang(i18n.language)
i18n.on('languageChanged', syncDocumentLang)

export default i18n