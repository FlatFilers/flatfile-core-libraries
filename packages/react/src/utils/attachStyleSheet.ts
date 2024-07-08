import { styleInject } from '../utils/styleInject'

import stylesheet from '../components/style.scss'
export type StyleSheetOptions = {
  insertAt?: 'top'
  nonce?: string
}

/**
 * @description Attaches a CSS stylesheet to the current page or document using the
 * `styleInject` method.
 * 
 * @param {StyleSheetOptions} options - StyleSheetOptions object, which allows for
 * customization of the sheet's behavior and styling, such as setting the sheet's ID
 * or hiding specific rules.
 */
export function attachStyleSheet(options?: StyleSheetOptions) {
  styleInject(stylesheet, options)
}
