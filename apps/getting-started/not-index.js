/**
 * Get your Secret key at: https://platform.flatfile.com/developers and then
 * uncomment this line after setting the API Key value.
 */
// process.env.FLATFILE_API_KEY = "YOUR SECRET KEY"
// process.env.FLATFILE_COMPILE_MODE = 'no-minify'
/**
 * Write a basic Flatfile event subscriber. You can do nearly anything
 * that reacts to events inside Flatfile.
 */
export default function (listener) {
  listener.on('**', (event) => {
    console.log(`-> My event listener received an event: ${event.topic}`)
  })
}
