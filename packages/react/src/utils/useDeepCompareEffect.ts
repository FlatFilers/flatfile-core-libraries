import { useEffect, useRef } from 'react'

export function useDeepCompareEffect(callback: () => void, dependencies: any) {
  const currentDependenciesRef = useRef()

  useEffect(() => {
    if (!deepEqual(currentDependenciesRef.current, dependencies)) {
      callback()
    }

    // Update the ref with current dependencies after running the callback
    currentDependenciesRef.current = dependencies
  }, [callback, dependencies])
}

/**
 * Performs a deep comparison between two values
 * @param obj1 First value to compare
 * @param obj2 Second value to compare
 * @returns boolean indicating if values are deeply equal
 */
const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) {
    return true
  }

  // Handle special types
  if (obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() === obj2.getTime()
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    return (
      obj1.length === obj2.length &&
      obj1.every((val, idx) => deepEqual(val, obj2[idx]))
    )
  }

  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  ) {
    return false
  }

  const keysObj1 = Object.keys(obj1)
  const keysObj2 = Object.keys(obj2)

  if (keysObj1.length !== keysObj2.length) {
    return false
  }

  // Convert keys to Set for O(1) lookup
  const keysSet = new Set(keysObj2)
  for (const key of keysObj1) {
    if (!keysSet.has(key) || !deepEqual(obj1[key], obj2[key])) {
      return false
    }
  }

  return true
}
