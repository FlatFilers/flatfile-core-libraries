import { Client } from '@flatfile/listener'

export default function (listener: Client) {
  listener.on('**', (event) => {
    console.log('-> My event', event.topic)
  })
}
