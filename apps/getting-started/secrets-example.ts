import { FlatfileListener } from '@flatfile/listener'

export default function (listener: FlatfileListener) {
  listener.on('**', async (event) => {
    const gtok = await event.secrets('GOOGLE_MAPS_TOKEN')
    console.log('GOOGLE_MAPS_TOKEN', { gtok })
  })
}
