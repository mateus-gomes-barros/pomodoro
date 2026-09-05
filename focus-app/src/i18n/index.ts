import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en'
import ptBR from './locales/pt-BR'

export const LANGUAGE_STORAGE_KEY =
  'focus-language'

function getInitialLanguage(): string {
  const savedLanguage =
    localStorage.getItem(
      LANGUAGE_STORAGE_KEY,
    )

  if (
    savedLanguage === 'en' ||
    savedLanguage === 'pt-BR'
  ) {
    return savedLanguage
  }

  const deviceLanguage =
    navigator.language

  return deviceLanguage
    .toLowerCase()
    .startsWith('pt')
      ? 'pt-BR'
      : 'en'
}

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      'pt-BR': {
        translation: ptBR,
      },
    },

    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export async function setAppLanguage(
  language: 'en' | 'pt-BR',
) {
  localStorage.setItem(
    LANGUAGE_STORAGE_KEY,
    language,
  )

  await i18n.changeLanguage(language)
}

export default i18n
