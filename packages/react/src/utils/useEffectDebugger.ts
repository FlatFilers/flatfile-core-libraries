import { useRef, useEffect, EffectCallback, DependencyList } from 'react'

const usePrevious = (value: any, initialValue: never[]) => {
  const ref = useRef(initialValue)
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}
export const useEffectDebugger = (
  effectHook: EffectCallback,
  dependencies: any[] | DependencyList | undefined,
  dependencyNames = []
) => {
  const previousDeps = usePrevious(dependencies, [])

  const changedDeps = dependencies?.reduce(
    (acc: any, dependency: any, index: number) => {
      if (dependency !== previousDeps[index]) {
        const keyName = dependencyNames[index] || index
        return {
          ...acc,
          [keyName]: {
            before: previousDeps[index],
            after: dependency,
          },
        }
      }

      return acc
    },
    {}
  )

  if (Object.keys(changedDeps).length) {
    console.log('[use-effect-debugger] ', changedDeps)
  }

  useEffect(effectHook, dependencies)
}
