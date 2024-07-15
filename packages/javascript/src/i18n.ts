import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

export type Translations = Record<string, any>

export const getI18n = (
  localTranslations: Translations,
  languageOverride?: string
) => {
  const loggedMissingKeys = new Set<string>()

  i18n.use(LanguageDetector).init({
    preload: [languageOverride ?? navigator.language, 'en'],
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    saveMissing: true, //required for missing key handler
    missingKeyHandler: (
      lng: readonly string[],
      ns: string,
      key: string,
      fallbackValue: any
    ): void => {
      //check that key is not a regular string or filename
      if (
        !key.includes('.') ||
        key.match(/[\s\n\t]/) ||
        key.includes('...') ||
        isTranslationFileName(key) ||
        key.endsWith('.')
      ) {
        return
      }
      if (!loggedMissingKeys.has(key)) {
        console.error(`[i18n] Missing key: ${key}`)
        loggedMissingKeys.add(key)
      }
    },
  })
  Object.keys(localTranslations).forEach((lng) => {
    i18n.addResourceBundle(
      lng,
      'translation',
      localTranslations[languageOverride ?? lng] ?? {}
    )
  })
  return i18n
}

const isTranslationFileName = (str: string) => {
  const extensionsPattern = ['json'].join('|')
  const filenameRegex = new RegExp(
    `^[^\\\\/?%*:|"<>]+\\.(${extensionsPattern})$`,
    'i'
  )
  return filenameRegex.test(str)
}
