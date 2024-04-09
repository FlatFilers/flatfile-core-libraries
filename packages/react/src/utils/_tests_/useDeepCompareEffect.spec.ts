import { renderHook } from '@testing-library/react'
import { useDeepCompareEffect } from '../useDeepCompareEffect'

describe('useDeepCompareEffect', () => {
  it('should call callback on initial render', () => {
    const callback = jest.fn()
    renderHook(() => useDeepCompareEffect(callback, [1, 2, 3]))

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should not call callback if dependencies do not change', () => {
    const callback = jest.fn()
    const { rerender } = renderHook(
      ({ deps }) => useDeepCompareEffect(callback, deps),
      { initialProps: { deps: [1, 2, 3] } }
    )

    rerender({ deps: [1, 2, 3] })
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should call callback when dependencies change', () => {
    const callback = jest.fn()
    const { rerender } = renderHook(
      ({ deps }) => useDeepCompareEffect(callback, deps),
      { initialProps: { deps: [1, 2, 3] } }
    )

    rerender({ deps: [1, 2, 4] })
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should call callback when dependencies deeply change', () => {
    const callback = jest.fn()
    const { rerender } = renderHook(
      ({ deps }) => useDeepCompareEffect(callback, deps),
      { initialProps: { deps: [{ key: 'value' }] } }
    )

    rerender({ deps: [{ key: 'value' }] })
    expect(callback).toHaveBeenCalledTimes(1)

    rerender({ deps: [{ key: 'new value' }] })
    expect(callback).toHaveBeenCalledTimes(2)
  })
})
