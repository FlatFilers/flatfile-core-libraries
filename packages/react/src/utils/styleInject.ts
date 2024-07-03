// adapted from https://github.com/egoist/style-inject

/**
 * @description Creates a new `style` element and injects it into the Document Object
 * Model (DOM) at either the beginning or end of the head section, based on the
 * `insertAt` parameter. It also sets an optional `nonce` attribute to validate the
 * styles.
 * 
 * @param {string} css - CSS content that will be injected into the HTML document's
 * head tag using the `styleInject` function.
 * 
 * @param {'top'} .insertAt - location where the generated style rule should be
 * inserted into the `<head>` element of the HTML document, with `'top'` indicating
 * insertion at the top of the `<head>` element and any other value specifying an
 * explicit position.
 * 
 * @param {string} .nonce - nonce, which is an arbitrary value used to prevent caching
 * of stylesheets and ensure they are reevaluated by the browser each time they are
 * requested, helping protect against cross-site scripting (XSS) attacks.
 * 
 * @returns {any} a newly created `<style>` element added to the HTML document head,
 * containing the specified CSS content.
 */
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
