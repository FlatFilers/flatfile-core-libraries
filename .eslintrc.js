module.exports = {
  root: true,
  extends: ['@flatfile/eslint-config-platform-sdk'],
  settings: {
    next: {
      rootDir: ['apps/*/'],
    },
  },
}
