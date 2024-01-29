import tinycolor from 'tinycolor2'
import { makeTheme } from '../makeTheme'

describe('makeTheme', () => {
  test('throws for invalid colors', () => {
    const primaryColorInvalid = 'turtle'
    const primaryColorValid = 'yellow'
    const lightenedPrimary = tinycolor(primaryColorValid)
      .lighten(30)
      .toHexString()
    expect(() => makeTheme({ primaryColor: primaryColorInvalid })).toThrowError(
      'invalid primary color passed'
    )
    expect(makeTheme({ primaryColor: primaryColorValid })).toStrictEqual({
      root: { primaryColor: primaryColorValid },
      sidebar: {
        logo: '',
        backgroundColor: primaryColorValid,
        titleColor: lightenedPrimary,
        textColor: lightenedPrimary,
        footerTextColor: lightenedPrimary,
      },
    })
  })

  test('sets textColor exact if passed', () => {
    const colors = { primaryColor: '#808f87', textColor: '#fff' }
    expect(makeTheme(colors)).toStrictEqual({
      root: { primaryColor: colors.primaryColor },
      sidebar: {
        logo: '',
        backgroundColor: colors.primaryColor,
        titleColor: colors.textColor,
        textColor: colors.textColor,
        footerTextColor: colors.textColor,
      },
    })
  })
  test('sets all textColor variables to primaryColor lightened if textColor is not passed', () => {
    const colors = { primaryColor: '#808f87' }
    const lightenedPrimary = tinycolor(colors.primaryColor)
      .lighten(30)
      .toHexString()
    expect(makeTheme(colors)).toStrictEqual({
      root: { primaryColor: colors.primaryColor },
      sidebar: {
        logo: '',
        backgroundColor: colors.primaryColor,
        titleColor: lightenedPrimary,
        textColor: lightenedPrimary,
        footerTextColor: lightenedPrimary,
      },
    })
  })
  test('sets logo', () => {
    const logo = 'www.fakelogo.io'
    expect(makeTheme({ logo })).toStrictEqual({
      root: { primaryColor: '' },
      sidebar: {
        logo: 'www.fakelogo.io',
        backgroundColor: '',
        titleColor: '',
        textColor: '',
        footerTextColor: '',
      },
    })
  })
})
