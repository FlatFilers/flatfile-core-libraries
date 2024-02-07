import { dts } from 'rollup-plugin-dts'
import commonjs from '@rollup/plugin-commonjs'
import css from 'rollup-plugin-import-css'
import json from '@rollup/plugin-json'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import url from '@rollup/plugin-url'
import dotenv from 'dotenv'

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
function commonPlugins(umd = true) {
  return [
    umd
      ? peerDepsExternal({
          includeDependencies: true,
        })
      : null,
    json(),
    commonjs(),
    css(),
    resolve({ browser: true }),
    typescript({
      tsconfig: 'tsconfig.json',
      outDir: 'dist',
      declaration: false,
      composite: false,
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
    plugins: commonPlugins(false),
    include: external,
  },
  {
    input: 'index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
]

export default config
