import dotenv from 'dotenv'
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
  entryPoints: ['index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  treeshake: true,
  splitting: true,
  outExtension: getOutExtension(platform),
})

const nodeConfig = createConfig('node')
const browserConfig = createConfig('browser')

export default defineConfig([nodeConfig, browserConfig])
