/**
 * Sets the value at a specified path within an object.
 * @param obj The object to modify.
 * @param value The value to set at the path.
 * @param keys The path of keys to the location within the object where the value should be set.
 *
 *
 * @example
 * // Example 1: Basic usage
 * const data = {};
 * digSet(data, 'new value', 'level1', 'level2', 'level3');
 * console.log(data);
 * // Outputs: { level1: { level2: { level3: 'new value' } } }
 *
 * @example
 * // Example 2: Overwriting existing value
 * const userProfile = { name: 'Alice', contact: { email: 'alice@example.com' } };
 * digSet(userProfile, 'alice@newdomain.com', 'contact', 'email');
 * console.log(userProfile);
 * // Outputs: { name: 'Alice', contact: { email: 'alice@newdomain.com' } }
 *
 * @example
 * // Example 3: Extending an existing object structure
 * const settings = { display: { theme: 'dark' } };
 * digSet(settings, true, 'display', 'fullscreen');
 * console.log(settings);
 * // Outputs: { display: { theme: 'dark', fullscreen: true } }
 */
export function digSet<T extends Record<string, any>>(
  obj: T | undefined,
  value: any,
  ...keys: string[]
): T {
  const base: T = obj || ({} as T)
  let current = base
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    // If the key doesn't exist or it's not an object, create a new object at that key
    if (!current[key] || typeof current[key] !== 'object') {
      // @ts-ignore
      current[key] = {}
    }
    // Move to the next part of the path
    current = current[key]
  }

  // Set the value at the final key
  const finalKey = keys[keys.length - 1]
  // @ts-ignore
  current[finalKey] = value
  return base
}
