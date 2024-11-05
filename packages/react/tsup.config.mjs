import dotenv from 'dotenv'
import { sassPlugin } from 'esbuild-sass-plugin'
import { defineConfig } from 'tsup'

dotenv.config()

const minify = process.env.NODE_ENV !== 'development'
if (!minify) {
  console.log('Not in production mode - skipping minification')
}

const EXTENSION_MAP = {
  browser: {
    cjs: '.browser.cjs',
    default: '.browser.js',
  },
  node: {
    cjs: '.cjs',
    default: '.js',
  },
}
const getOutExtension =
  (platform) =>
  ({ format }) => ({
    js: EXTENSION_MAP[platform][format] || EXTENSION_MAP[platform].default,
  })

const createConfig = (platform) => ({
  name: platform,
  platform,
  minify,
  entryPoints: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  treeshake: true,
  splitting: true,
  esbuildPlugins: [sassPlugin({ type: 'css-text' })],
  external: ['react', 'react-dom'],
  outExtension: getOutExtension(platform),
})

const nodeConfig = createConfig('node')
const browserConfig = createConfig('browser')

export default defineConfig([nodeConfig, browserConfig])
