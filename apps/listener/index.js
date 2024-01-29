export default function (listener) {
  listener.on('**', (event) => {
    console.log('-> My event', event.topic)
  })
}
