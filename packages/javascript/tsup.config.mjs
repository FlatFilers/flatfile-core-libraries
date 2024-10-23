import dotenv from 'dotenv'
import { defineConfig } from 'tsup'

dotenv.config()

const minify = process.env.NODE_ENV !== 'development'
if (!minify) {
  console.log('Not in production mode - skipping minification')
}

const nodeConfig = {
  name: 'node',
  platform: 'node',
  minify,
  entryPoints: ['index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
  clean: true,
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.js',
  }),
}

const browserConfig = {
  name: 'browser',
  platform: 'browser',
  minify,
  entryPoints: ['index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
  clean: true,
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.browser.cjs' : '.browser.js',
  }),
}

export default defineConfig([nodeConfig, browserConfig])
