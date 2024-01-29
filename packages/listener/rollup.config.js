import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { dts } from 'rollup-plugin-dts'

import dotenv from 'dotenv'
dotenv.config()

const PROD = process.env.NODE_ENV === 'production'
if (!PROD) {
  console.log('Not in production mode - skipping minification')
}

const external = ['ansi-colors', 'flat', 'pako', 'wildcard-match']

function commonPlugins(browser) {
  return [
    json(),
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
        inlineDynamicImports: true,
        exports: 'auto',
        file: 'dist/index.cjs',
        sourcemap: false,
      },
      {
        format: 'esm',
        inlineDynamicImports: true,
        exports: 'auto',
        file: 'dist/index.mjs',
        sourcemap: true,
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
        inlineDynamicImports: true,
      },
      {
        exports: 'auto',
        file: 'dist/index.browser.mjs',
        sourcemap: false,
        format: 'es',
        inlineDynamicImports: true,
      },
    ],
    plugins: commonPlugins(true),
    external,
  },
  {
    input: 'src/index.ts',
    output: [
      {
        exports: 'auto',
        sourcemap: false,
        strict: true,
        file: 'dist/index.js',
        format: 'umd',
        inlineDynamicImports: true,
        name: 'FlatFileListener',
      },
    ],
    plugins: commonPlugins(true),
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
]
