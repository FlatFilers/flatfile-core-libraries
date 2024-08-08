import { styleInject } from '../utils/styleInject'

import stylesheet from '../components/style.scss'
import { MutableRefObject } from 'react'
export type StyleSheetOptions = {
  insertAt?: 'top'
  nonce?: string
}

export function attachStyleSheet(options?: StyleSheetOptions) {
  styleInject(stylesheet, options)
}

const styleSheetAttachedRef: MutableRefObject<boolean> = { current: false }

export function useAttachStyleSheet(options?: StyleSheetOptions) {
  if (!styleSheetAttachedRef.current) {
    attachStyleSheet(options)
    styleSheetAttachedRef.current = true
  }
}
