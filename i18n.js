import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'

import en from './locales/en.json'
import pt from './locales/pt.json'
import es from './locales/es.json'
import de from './locales/de.json'
import ru from './locales/ru.json'
import fil from './locales/fil.json'
import it from './locales/it.json'
import fr from './locales/fr.json'

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: Localization.getLocales()[0]?.languageCode || 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    pt: { translation: pt },
    es: { translation: es },
    de: { translation: de },
    ru: { translation: ru },
    fil: { translation: fil },
    it: { translation: it },
    fr: { translation: fr },
  },
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
