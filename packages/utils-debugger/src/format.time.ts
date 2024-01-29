/**
 * Format a date to a time string
 *
 * @param _date
 */
export function formatTime(_date: string | Date): string {
  const date = new Date(_date)
  const hours = ((date.getHours() + 11) % 12) + 1
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0')
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM'

  return `${hours}:${minutes}:${seconds}.${milliseconds} ${ampm}`
}
