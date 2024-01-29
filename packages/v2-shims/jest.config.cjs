const path = require('path')

module.exports = {
  preset: '@flatfile/jest-preset-platform-sdk',
  setupFiles: [path.join(__dirname, './testing/setup-tests.js')],
}
