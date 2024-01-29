import css from 'rollup-plugin-import-css'
import json from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'

// Consolidated external dependencies
const external = [
  // TODO:  this feels like a hack, but it's a temp fix for now 
  //        to get the SheetHandler @flatfile/api to link properly
  // '@flatfile/api',
  '@flatfile/listener',
  '@flatfile/util-common',
  'pubnub',
]

// Function to create common plugins, with a parameter to specify browser-specific settings
function createPlugins(isBrowser) {
  return [
    json(),
    css(),
    typescript({
      outDir: 'dist',
      tsconfig: isBrowser ? 'tsconfig.json' : undefined,
      declaration: isBrowser,
      declarationDir: isBrowser ? './dist' : undefined,
    }),
    resolve({ browser: isBrowser, preferBuiltins: !isBrowser }),
    commonjs({ requireReturnsDefault: 'auto' }),
    terser(),
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
    external,
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
    external,
  },
]

export default config
