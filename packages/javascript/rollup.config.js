import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import sucrase from '@rollup/plugin-sucrase'
import terser from '@rollup/plugin-terser'
import url from '@rollup/plugin-url'
import dotenv from 'dotenv'
import css from 'rollup-plugin-import-css'

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

const config = [
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
    plugins: [
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
    ],
    external,
  },
]

export default config
