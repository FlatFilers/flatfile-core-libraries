import { ISpace } from '@flatfile/embedded-utils'

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
  > & { preload?: boolean }
>
