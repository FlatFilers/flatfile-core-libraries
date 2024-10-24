import dotenv from 'dotenv'
import { sassPlugin } from 'esbuild-sass-plugin'
import { defineConfig } from 'tsup'

dotenv.config()

const minify = process.env.NODE_ENV !== 'development'
if (!minify) {
  console.log('Not in production mode - skipping minification')
}

const getOutExtension =
  (isBrowser) =>
  ({ format }) => ({
    js:
      format === 'cjs'
        ? isBrowser
          ? '.browser.cjs'
          : '.cjs'
        : format === 'iife'
        ? isBrowser
          ? '.browser.umd.js'
          : '.umd.js'
        : isBrowser
        ? '.browser.js'
        : '.js',
  })

const createConfig = (name, platform, isBrowser) => ({
  name,
  platform,
  minify,
  entryPoints: ['src/index.ts'],
  format: ['cjs', 'esm', 'iife'],
  dts: true,
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  treeshake: true,
  splitting: true,
  globalName: 'FlatFileReact',
  esbuildPlugins: [sassPlugin({ type: 'css-text' })],
  external: ['react', 'react-dom'],
  outExtension: getOutExtension(isBrowser),
})

const nodeConfig = createConfig('node', 'node', false)
const browserConfig = createConfig('browser', 'browser', true)

export default defineConfig([nodeConfig, browserConfig])
