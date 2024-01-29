import { CountryCast } from './RegionCast'

describe('tests for RegionCast ->', () => {
  test('CountryCast', () => {
    const ccFull = CountryCast('full')
    const ccTwo = CountryCast('iso-2')
    expect(ccFull('US')).toBe('United States of America')
    expect(ccTwo('US')).toBe('US')
    expect(ccTwo('USA')).toBe('US')
  })
})
