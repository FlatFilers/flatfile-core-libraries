import { styleInject } from '../utils/styleInject'

import stylesheet from '../components/style.scss'
export type StyleSheetOptions = {
  insertAt?: 'top'
  nonce?: string
}

/**
 * @description Attaches a CSS stylesheet to the HTML document through the `styleInject`
 * method, providing an optional set of options for customization.
 * 
 * @param {StyleSheetOptions} options - configuration object for customizing the
 * behavior of the style injection process.
 */
export function attachStyleSheet(options?: StyleSheetOptions) {
  styleInject(stylesheet, options)
}
