import dotenv from 'dotenv'
import { sassPlugin } from 'esbuild-sass-plugin'
import { defineConfig } from 'tsup'

dotenv.config()

const minify = process.env.NODE_ENV !== 'development'
if (!minify) {
  console.log('Not in production mode - skipping minification')
}

const nodeConfig = {
  name: 'node',
  platform: 'node',
  // minify,
  entryPoints: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
  clean: true,
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.js',
  }),
  esbuildPlugins: [sassPlugin({ type: 'css-text' })],
}

const browserConfig = {
  name: 'browser',
  platform: 'browser',
  // minify,
  entryPoints: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
  clean: true,
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.browser.cjs' : '.browser.js',
  }),
  esbuildPlugins: [sassPlugin({ type: 'css-text' })],
}

export default defineConfig([nodeConfig, browserConfig])
