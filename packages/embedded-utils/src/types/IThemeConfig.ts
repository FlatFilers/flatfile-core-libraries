import { BaseCustomTableThemeProps } from './CustomTheme'

export interface IThemeConfig {
  /**
   * Global styles
   */
  root?: {
    [key: string]: string
  }
  /**
   * Sidebar styles
   */
  sidebar?: {
    [key: string]: string
  }
  /**
   * Data table styles
   */
  table?: Partial<BaseCustomTableThemeProps>
}
