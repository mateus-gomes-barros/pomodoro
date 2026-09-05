import i18n from 'i18next'
import {
  Capacitor,
  registerPlugin,
} from '@capacitor/core'
import { initReactI18next } from 'react-i18next'

import en from './locales/en'
import ptBR from './locales/pt-BR'

export const LANGUAGE_STORAGE_KEY =
  'focus-language'


interface WidgetLanguagePlugin {
  setLanguage(options: {
    language: 'en' | 'pt-BR'
  }): Promise<void>
}

const WidgetLanguageBridge =
  registerPlugin<WidgetLanguagePlugin>(
    'WidgetLanguageBridge',
  )

async function syncWidgetLanguage(
  language: 'en' | 'pt-BR',
) {
  if (
    !Capacitor.isNativePlatform() ||
    Capacitor.getPlatform() !== 'android'
  ) {
    return
  }

  try {
    await WidgetLanguageBridge.setLanguage({
      language,
    })
  } catch {
    // Widgets não devem bloquear troca de idioma.
  }
}

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

  return 'pt-BR'
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

void syncWidgetLanguage(
  getInitialLanguage() as
    | 'en'
    | 'pt-BR',
)

export async function setAppLanguage(
  language: 'en' | 'pt-BR',
) {
  localStorage.setItem(
    LANGUAGE_STORAGE_KEY,
    language,
  )

  await i18n.changeLanguage(language)
  await syncWidgetLanguage(language)
}

export default i18n
