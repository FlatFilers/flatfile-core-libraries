import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import * as localDe from './locales/de/translation.json'
import * as localEnCA from './locales/en-CA/translation.json'
import * as localEnGB from './locales/en-GB/translation.json'
import * as localEnZA from './locales/en-ZA/translation.json'
import * as localEn from './locales/en/translation.json'
import * as localEs from './locales/es/translation.json'
import * as localFrCA from './locales/fr-CA/translation.json'
import * as localFrFR from './locales/fr-Fr/translation.json'
import * as localFr from './locales/fr/translation.json'
import * as localId from './locales/id/translation.json'
import * as localIt from './locales/it/translation.json'
import * as localJp from './locales/jp/translation.json'
import * as localKr from './locales/kr/translation.json'
import * as localPtBR from './locales/pt-BR/translation.json'
import * as localPt from './locales/pt/translation.json'
import * as localTr from './locales/tr/translation.json'
import * as localVi from './locales/vi/translation.json'
import * as localZh from './locales/zh/translation.json'

const supportedLanguages = [
  'de',
  'en',
  'en-GB',
  'en-CA',
  'en-ZA',
  'es',
  'fr',
  'fr-CA',
  'fr-FR',
  'id',
  'it',
  'jp',
  'kr',
  'pt',
  'pt-BR',
  'tr',
  'vi',
  'zh',
]

type SupportedLanguage = (typeof supportedLanguages)[number]

type Translations = typeof localEn

type StripEndings<K> = K extends `${infer R}_one`
  ? R
  : K extends `${infer R}_other`
  ? R
  : K extends `${infer R}_zero`
  ? R
  : K

type PathKeys<T, P extends string = ''> = {
  [K in keyof T]: K extends string | number
    ? T[K] extends object
      ? StripEndings<`${P}${K}`> | PathKeys<T[K], `${P}${K}.`>
      : StripEndings<`${P}${K}`>
    : never
}[keyof T]

export type TranslationsKeys = PathKeys<Translations>

const localTranslations: Record<SupportedLanguage, Translations | any> = {
  // the en file will often be in front of the other translation files so typing to Translations no longer works here
  de: localDe,
  en: localEn,
  'en-GB': localEnGB,
  'en-CA': localEnCA,
  'en-ZA': localEnZA,
  es: localEs,
  fr: localFr,
  'fr-CA': localFrCA,
  'fr-FR': localFrFR,
  id: localId,
  it: localIt,
  jp: localJp,
  kr: localKr,
  pt: localPt,
  'pt-BR': localPtBR,
  tr: localTr,
  vi: localVi,
  zh: localZh,
}

/**
 * @description Sets up an instance of `i18n` using the `LanguageDetector` and provides
 * fallback languages. It also handles missing keys and adds them to a list for
 * logging. Additionally, it adds resource bundles for specified localization files.
 * 
 * @param {string} languageOverride - language to be initialized for the i18n instance,
 * and is used to customize the initialization process when it's different from the
 * system language.
 * 
 * @returns {object} an initialized i18n instance with preloaded language resources.
 */
export const getI18n = (languageOverride?: string) => {
  const loggedMissingKeys = new Set<string>()

  i18n.use(LanguageDetector).init({
    preload: [languageOverride ?? navigator.language, 'en'],
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    saveMissing: true, //required for missing key handler
    /**
     * @description Checks if a given key is valid and logs an error message to the console
     * if it's not. If the key is missing, it adds it to a logging list for subsequent handling.
     * 
     * @param {readonly string[]} lng - 𝔄 for which to check the provided key is not a
     * regular string or filename, and it is used to identify the language being checked.
     * 
     * @param {string} ns - namespace for which the function is checking the existence
     * of the key.
     * 
     * @param {string} key - property that needs to be validated in order for the function
     * to return successfully without any errors.
     * 
     * @param {any} fallbackValue - default value that will be used to display if the key
     * is missing or cannot be translated.
     */
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

/**
 * @description Checks if a given string is a valid file name for translations by
 * checking if it matches a pattern of accepted file extensions separated by a pipe
 * | and a regex that matches any string starting with a letter or underscore followed
 * by any characters except those prohibited.
 * 
 * @param {string} str - given string to be checked for extensions.
 * 
 * @returns {boolean} a boolean indicating whether a given string represents a valid
 * translation file name.
 */
const isTranslationFileName = (str: string) => {
  const extensionsPattern = ['json'].join('|')
  const filenameRegex = new RegExp(
    `^[^\\\\/?%*:|"<>]+\\.(${extensionsPattern})$`,
    'i'
  )
  return filenameRegex.test(str)
}
