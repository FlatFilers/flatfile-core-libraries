import css from 'rollup-plugin-import-css'
import json from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { dts } from 'rollup-plugin-dts'
import terser from '@rollup/plugin-terser'

import dotenv from 'dotenv'
dotenv.config()

const PROD = process.env.NODE_ENV === 'production'
if (!PROD) {
  console.log('Not in production mode - skipping minification')
}

const external = [
  '@flatfile/api',
  '@flatfile/blueprint',
  '@flatfile/listener',
  '@flatfile/plugin-record-hook',
]

function commonPlugins(browser) {
  return [
    json(),
    css(),
    commonjs({ requireReturnsDefault: 'auto' }),
    resolve({ browser, preferBuiltins: !browser }),
    typescript({
      tsconfig: 'tsconfig.json',
      outDir: 'dist',
      declaration: false,
      declarationMap: false,
    }),
    PROD ? terser() : null,
  ]
}

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        format: 'commonjs',
        exports: 'auto',
        file: 'dist/index.cjs',
        sourcemap: false,
      },
      {
        format: 'esm',
        exports: 'auto',
        file: 'dist/index.mjs',
        sourcemap: true,
      },
      {
        exports: 'auto',
        sourcemap: false,
        strict: true,
        file: 'dist/index.js',
        format: 'umd',
        name: 'v2Shims',
      },
    ],
    plugins: commonPlugins(false),
    external,
  },
  {
    input: 'src/index.ts',
    output: [
      {
        exports: 'auto',
        file: 'dist/index.browser.cjs',
        format: 'cjs',
      },
      {
        exports: 'auto',
        file: 'dist/index.browser.mjs',
        sourcemap: false,
        format: 'es',
      },
    ],
    plugins: commonPlugins(true),
    external,
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
]
