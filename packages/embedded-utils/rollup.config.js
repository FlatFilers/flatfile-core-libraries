import css from 'rollup-plugin-import-css'
import json from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import { dts } from 'rollup-plugin-dts'
import dotenv from 'dotenv'

dotenv.config()

const PROD = process.env.NODE_ENV !== 'development'
if (!PROD) {
  console.log('Not in production mode - skipping minification')
}
// Function to create common plugins, with a parameter to specify browser-specific settings
function createPlugins(isBrowser) {
  return [
    peerDepsExternal({
      includeDependencies: true,
    }),
    json(),
    css(),
    typescript({
      outDir: 'dist',
      tsconfig: isBrowser ? 'tsconfig.json' : undefined,
      declaration: false,
      composite: false,
    }),
    resolve({ browser: isBrowser, preferBuiltins: !isBrowser }),
    commonjs({ requireReturnsDefault: 'auto' }),
    PROD ? terser() : null,
  ]
}

const config = [
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
    plugins: createPlugins(false),
  },
  {
    input: 'src/index.ts',
    output: [
      {
        format: 'cjs',
        exports: 'auto',
        file: 'dist/index.browser.cjs',
      },
      {
        format: 'es',
        exports: 'auto',
        file: 'dist/index.browser.mjs',
        sourcemap: false,
      },
    ],
    plugins: createPlugins(true),
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
]

export default config
