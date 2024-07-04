import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import sucrase from '@rollup/plugin-sucrase'
import terser from '@rollup/plugin-terser'
import url from '@rollup/plugin-url'
import dotenv from 'dotenv'
import { dts } from 'rollup-plugin-dts'
import css from 'rollup-plugin-import-css'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'

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
/**
 * @description Generates a configuration array for a JavaScript build tool, comprising
 * various plugins for tasks such as TypeScript transformation, CSS compilation, and
 * production mode optimization with Terser.
 * 
 * @param {true} umd - if condition for whether to include the `peerDepsExternal`
 * plugin or not.
 * 
 * @returns {array} an array of seven plugins for building and bundling JavaScript code.
 */
function commonPlugins(umd = true) {
  return [
    json(),
    umd
      ? peerDepsExternal({
          includeDependencies: true,
        })
      : null,
    resolve({ browser: true, extensions: ['.ts'] }),
    sucrase({
      exclude: ['node_modules/**'],
      transforms: ['typescript'],
    }),
    commonjs(),
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
    plugins: commonPlugins(false),
  },
  {
    input: 'index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
]

export default config
