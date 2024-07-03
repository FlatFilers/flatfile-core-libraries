// adapted from https://github.com/egoist/style-inject

export function styleInject(
  css: string,
  { insertAt, nonce }: { insertAt?: 'top'; nonce?: string } = {}
) {
  if (!css || typeof document === 'undefined') return

  const head = document.head || document.getElementsByTagName('head')[0]
  const style = document.createElement('style')
  style.type = 'text/css'

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild)
    } else {
      head.appendChild(style)
    }
  } else {
    head.appendChild(style)
  }
  if (nonce) {
    style.setAttribute('nonce', nonce)
  }
  if ((style as any).styleSheet) {
    ;(style as any).styleSheet.cssText = css
  } else {
    style.appendChild(document.createTextNode(css))
  }
}
