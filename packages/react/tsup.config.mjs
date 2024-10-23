import dotenv from 'dotenv'
import { sassPlugin } from 'esbuild-sass-plugin'
import { defineConfig } from 'tsup'

dotenv.config()

const PROD = process.env.NODE_ENV === 'production'
if (!PROD) {
  console.log('Not in production mode - skipping minification')
}

const nodeConfig = {
  name: 'node',
  platform: 'node',
  minify: process.env.NODE_ENV === 'production',
  entryPoints: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
  clean: true,
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.js',
  }),
  esbuildPlugins: [
    sassPlugin({
      type: 'lit-css',
    }),
  ],
  external: ['lit-element/lit-element.js'],
}

const browserConfig = {
  name: 'browser',
  platform: 'browser',
  minify: process.env.NODE_ENV === 'production',
  entryPoints: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
  clean: true,
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.browser.cjs' : '.browser.js',
  }),
  esbuildPlugins: [
    sassPlugin({
      type: 'lit-css',
    }),
  ],
  external: ['lit-element/lit-element.js'],
}

export default defineConfig([nodeConfig, browserConfig])
