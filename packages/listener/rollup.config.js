import { dts } from 'rollup-plugin-dts'
import commonjs from '@rollup/plugin-commonjs'
import dotenv from 'dotenv'
import json from '@rollup/plugin-json'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import resolve from '@rollup/plugin-node-resolve'
import sucrase from '@rollup/plugin-sucrase'
import terser from '@rollup/plugin-terser'

dotenv.config()

const PROD = process.env.NODE_ENV !== 'development'
if (!PROD) {
  console.log('Not in production mode - skipping minification')
}

function commonPlugins(browser, umd = false) {
  return [
    umd
      ? null
      : peerDepsExternal({
          includeDependencies: true,
        }),
    json(),
    commonjs({ requireReturnsDefault: 'auto' }),
    resolve({ browser, preferBuiltins: !browser }),
    sucrase({
      exclude: ['node_modules/**'],
      transforms: ['typescript'],
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
    plugins: commonPlugins(true, true),
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
]
