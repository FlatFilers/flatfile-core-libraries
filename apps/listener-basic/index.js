/**
 * Very basic listener
 *
 * @param listener
 */
export default (listener) => {
  listener.on('**', (event) => console.log(event))
}
