import { useEffect, useRef } from 'react'

export function useDeepCompareEffect(callback: () => void, dependencies: any) {
  const currentDependenciesRef = useRef()

  const deepEqual = (obj1: any, obj2: any) => {
    if (obj1 === obj2) {
      return true
    }

    if (
      typeof obj1 !== 'object' ||
      obj1 === null ||
      typeof obj2 !== 'object' ||
      obj2 === null
    ) {
      return false
    }

    let keysObj1 = Object.keys(obj1)
    let keysObj2 = Object.keys(obj2)

    if (keysObj1.length !== keysObj2.length) {
      return false
    }

    for (let key of keysObj1) {
      if (!keysObj2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
        return false
      }
    }

    return true
  }

  useEffect(() => {
    if (!deepEqual(currentDependenciesRef.current, dependencies)) {
      callback()
    }

    // Update the ref with current dependencies after running the callback
    currentDependenciesRef.current = dependencies
  }, [callback, dependencies])
}
