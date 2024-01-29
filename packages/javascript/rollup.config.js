import css from 'rollup-plugin-import-css'
import typescript from '@rollup/plugin-typescript'
import url from '@rollup/plugin-url'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import terser from '@rollup/plugin-terser'
import { dts } from 'rollup-plugin-dts'

const PROD = process.env.NODE_ENV === 'production'
if (!PROD) {
  console.log('Not in production mode - skipping minification')
}
// Consolidated external dependencies
const external = [
  '@flatfile/api',
  '@flatfile/embedded-utils',
  '@flatfile/listener',
  '@flatfile/plugin-record-hook',
]

// Common plugins function
function commonPlugins() {
  return [
    json(),
    commonjs(),
    css(),
    resolve({ browser: true }),
    typescript({
      tsconfig: 'tsconfig.json',
      outDir: 'dist',
      declaration: false,
      declarationMap: false,
    }),
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
    plugins: commonPlugins(),
  },
  {
    input: 'index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
]

export default config
