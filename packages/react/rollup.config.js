import { dts } from 'rollup-plugin-dts'
import commonjs from '@rollup/plugin-commonjs'
import css from 'rollup-plugin-import-css'
import dotenv from 'dotenv'
import json from '@rollup/plugin-json'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import url from '@rollup/plugin-url'
import sucrase from '@rollup/plugin-sucrase'

dotenv.config()

const PROD = process.env.NODE_ENV !== 'development'

if (!PROD) {
  console.log('Not in production mode - skipping minification')
}

function commonPlugins(browser, umd = false) {
  return [
    umd
      ? undefined
      : peerDepsExternal({
          includeDependencies: true,
        }),
    json(),
    css(),
    commonjs({
      include: '**/node_modules/**',
      requireReturnsDefault: 'auto',
      esmExternals: true,
    }),
    resolve({
      browser,
      preferBuiltins: !browser,
    }),
    sucrase({
      jsxRuntime: 'automatic',
      exclude: ['**/node_modules/**', '**/.*/', '**/*.spec.ts', '**/*.scss'],
      transforms: ['typescript', 'jsx'],
    }),
    url({
      include: ['**/*.otf'],
      limit: Infinity,
      fileName: '[dirname][name][extname]',
    }),
    PROD ? terser() : null,
    postcss({
      extract: false,
      inject: false,
    }),
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
    onwarn: function (warning, warn) {
      // Skip certain warnings
      if (warning.code === 'THIS_IS_UNDEFINED') {
        return
      }
      // console.warn everything else
      warn(warning)
    },
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
    onwarn: function (warning, warn) {
      // Skip certain warnings
      if (warning.code === 'THIS_IS_UNDEFINED') {
        return
      }
      // console.warn everything else
      warn(warning)
    },
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
    onwarn: function (warning, warn) {
      // Skip certain warnings
      if (warning.code === 'THIS_IS_UNDEFINED') {
        return
      }
      // console.warn everything else
      warn(warning)
    },
  },
  // Types
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [css(), dts(), postcss()],
  },
]

export default config
