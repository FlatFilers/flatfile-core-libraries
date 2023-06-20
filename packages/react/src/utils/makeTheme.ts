import tinycolor from 'tinycolor2'
import { IThemeConfig } from '../types/IThemeConfig'

/**
 * @name makeTheme
 * @description Helper func to generate theme config to be passed to a workbook component
 *
 * @param { IThemeGenerator }
 * @returns { IThemeConfig }
 */

interface IThemeGenerator {
  primaryColor?: string
  textColor?: string
  logo?: string
}

export const makeTheme = (props: IThemeGenerator): IThemeConfig => {
  const { primaryColor, textColor, logo } = props

  // validate primaryColor
  if (!!primaryColor && !tinycolor(primaryColor).isValid()) {
    throw new Error('invalid primary color passed')
  }

  // validate textColor if passed
  if (!!textColor && !tinycolor(textColor).isValid()) {
    throw new Error('invalid text color passed')
  }

  const lightPrimary = primaryColor
    ? tinycolor(primaryColor).lighten(30).toHexString()
    : ''
  const primaryTextColor = textColor || lightPrimary

  return {
    root: { primaryColor: primaryColor || '' },
    sidebar: {
      logo: logo || '',
      backgroundColor: primaryColor || '',
      titleColor: primaryTextColor,
      textColor: primaryTextColor,
      footerTextColor: primaryTextColor,
    },
  }
}
