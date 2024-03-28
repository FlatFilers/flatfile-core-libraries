import { isEqual } from 'lodash'
import { useRef, useEffect } from 'react'

export function useDeepCompareEffect(callback: () => void, dependencies: any) {
  const currentDependenciesRef = useRef()

  useEffect(() => {
    if (!isEqual(currentDependenciesRef.current, dependencies)) {
      callback()
    }

    // Update the ref with current dependencies after running the callback
    currentDependenciesRef.current = dependencies
  }, [callback, dependencies]) // You need to ensure callback and dependencies are stable or memoized
}
