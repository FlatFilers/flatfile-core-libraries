import { dts } from 'rollup-plugin-dts'
import commonjs from '@rollup/plugin-commonjs'
import css from 'rollup-plugin-import-css'
import dotenv from 'dotenv'
import json from '@rollup/plugin-json'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import resolve from '@rollup/plugin-node-resolve'
import sucrase from '@rollup/plugin-sucrase'
import terser from '@rollup/plugin-terser'
import url from '@rollup/plugin-url'

dotenv.config()

const PROD = process.env.NODE_ENV !== 'development'
if (!PROD) {
  console.log('Not in production mode - skipping minification')
}

const external = [
  '@flatfile/api',
  '@flatfile/listener',
  '@flatfile/plugin-record-hook',
]

// Common plugins function
function commonPlugins(excludePeerDeps = false) {
  return [
    !excludePeerDeps
      ? peerDepsExternal({
          includeDependencies: true,
        })
      : null,
    resolve({
      browser: true,
      extensions: ['.ts', '.js'],
      preferBuiltins: false,
    }),
    commonjs(),
    sucrase({
      exclude: ['node_modules/**'],
      transforms: ['typescript'],
    }),
    json(),
    css(),
    url({
      include: ['**/*.otf'],
      limit: Infinity,
      fileName: '[dirname][name][extname]',
    }),
    PROD ? terser() : null,
  ]
}

const config = [
  {
    input: 'index.ts',
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
    plugins: commonPlugins(),
    external,
  },
  {
    input: 'index.ts',
    output: {
      exports: 'auto',
      sourcemap: false,
      strict: true,
      file: 'dist/index.js',
      format: 'umd',
      name: 'FlatFileJavaScript',
    },
    plugins: commonPlugins(true),
  },
  {
    input: 'index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
]

export default config
