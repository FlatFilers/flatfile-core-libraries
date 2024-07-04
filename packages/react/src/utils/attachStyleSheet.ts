import { styleInject } from '../utils/styleInject'

import stylesheet from '../components/style.scss'
export type StyleSheetOptions = {
  insertAt?: 'top'
  nonce?: string
}

export function attachStyleSheet(options?: StyleSheetOptions) {
  styleInject(stylesheet, options)
}
