import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import url from '@rollup/plugin-url'
import dotenv from 'dotenv'
import { dts } from 'rollup-plugin-dts'
import css from 'rollup-plugin-import-css'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'

dotenv.config()

const PROD = process.env.NODE_ENV !== 'development'

if (!PROD) {
  console.log('Not in production mode - skipping minification')
}

function commonPlugins(browser, umd = false) {
  return [
    !umd ? peerDepsExternal() : null,
    json(),
    css(),
    resolve({ browser, preferBuiltins: !browser }),
    commonjs({ requireReturnsDefault: 'auto' }),
    typescript({
      outDir: 'dist',
      tsconfig: 'tsconfig.json',
      declaration: false,
      composite: false,
    }),
    url({
      include: ['**/*.otf'],
      limit: Infinity,
      fileName: '[dirname][name][extname]',
    }),
    PROD ? terser() : null,
    postcss(),
  ]
}

const config = [
  // Non-browser build
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
        sourcemap: false,
      },
    ],
    plugins: commonPlugins(false, false),
  },
  // Browser build
  {
    input: 'src/index.ts',
    output: [
      { format: 'cjs', exports: 'auto', file: 'dist/index.browser.cjs' },
      {
        format: 'es',
        exports: 'auto',
        file: 'dist/index.browser.mjs',
        sourcemap: false,
      },
    ],
    plugins: commonPlugins(true, false),
  },
  // UMD build
  {
    input: 'src/index.ts',
    output: {
      format: 'umd',
      name: 'FlatFileReact',
      file: 'dist/index.js',
      exports: 'auto',
      sourcemap: false,
      strict: true,
    },
    plugins: commonPlugins(true, true),
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [css(), dts(), postcss()],
  },
]

export default config
