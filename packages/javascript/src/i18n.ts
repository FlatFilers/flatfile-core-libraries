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
 * @description Sets up i18n for the given languageOverride optionally provided,
 * preloads two languages (the default one and the specified one), and adds resources
 * for the given localTranslations object or language override. It also logs any
 * missing keys to the console if they are not already logged.
 * 
 * @param {string} languageOverride - language to be initialized and used as a fallback
 * language when no language is provided in the URL or through other means, and it
 * defaults to the value of `navigator.language` if not provided.
 * 
 * @returns {object} an initialized i18n object with added missing key handler and
 * resource bundles for the provided languages.
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
     * @description Checks if a given key is present in an array of translations, logs
     * an error message if it's missing and adds it to a list of missed keys for further
     * processing.
     * 
     * @param {readonly string[]} lng - language code of the translations, which is a
     * readonly string array.
     * 
     * @param {string} ns - namespace of the translations, which is used to check if the
     * key provided is within the specified namespace.
     * 
     * @param {string} key - string value that will be used as a key for a translation
     * in the given namespace.
     * 
     * @param {any} fallbackValue - value that will be used as the default value for the
     * key if it is not found in the translations or if there is an error checking the key.
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
 * matching against an extensions pattern and a filename regular expression.
 * 
 * @param {string} str - given string to be checked for file extension pattern matches.
 * 
 * @returns {boolean} a boolean value indicating whether a given string represents a
 * valid file name.
 */
const isTranslationFileName = (str: string) => {
  const extensionsPattern = ['json'].join('|')
  const filenameRegex = new RegExp(
    `^[^\\\\/?%*:|"<>]+\\.(${extensionsPattern})$`,
    'i'
  )
  return filenameRegex.test(str)
}
