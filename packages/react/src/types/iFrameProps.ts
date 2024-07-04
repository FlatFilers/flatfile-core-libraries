import { ISpace } from '@flatfile/embedded-utils'
import { StyleSheetOptions } from '../utils/attachStyleSheet'
export type IFrameTypes = Partial<
  Pick<
    ISpace,
    | 'iframeStyles'
    | 'mountElement'
    | 'exitText'
    | 'exitTitle'
    | 'exitPrimaryButtonText'
    | 'exitSecondaryButtonText'
    | 'displayAsModal'
    | 'closeSpace'
    | 'spaceUrl'
  > & {
    preload?: boolean
    resetOnClose?: boolean
    styleSheetOptions?: StyleSheetOptions
  }
>
