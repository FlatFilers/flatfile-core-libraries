import css from 'rollup-plugin-import-css'
import json from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'
import url from '@rollup/plugin-url'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import postcss from "rollup-plugin-postcss";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

const external = [
  'react',
  'react-dom',
  // TODO:  this feels like a hack, but it's a temp fix for now 
  //        to get the onSubmit @flatfile/api to link properly
  // '@flatfile/api',
  '@flatfile/embedded-utils',
  '@flatfile/listener',
  '@flatfile/plugin-record-hook',
  'pubnub',
  'pubnub-react',
  'styled-components',
  'tinycolor2',
]

function commonPlugins(browser) {
  return [
    peerDepsExternal(),
    json(),
    css(),
    resolve({ browser, preferBuiltins: !browser }),
    commonjs({ requireReturnsDefault: 'auto' }),
    typescript({
      outDir: 'dist',
      declaration: browser,
      declarationDir: './dist',
    }),
    url({
      include: ['**/*.otf'],
      limit: Infinity,
      fileName: '[dirname][name][extname]',
    }),
    terser(),
    postcss()
  ]
}

const config = [
  // Non-browser build
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
    plugins: commonPlugins(false),
    external,
  },
  // Browser build
  {
    input: 'index.ts',
    output: [
      { format: 'cjs', exports: 'auto', file: 'dist/index.browser.cjs' },
      {
        format: 'es',
        exports: 'auto',
        file: 'dist/index.browser.mjs',
        sourcemap: false,
      },
    ],
    plugins: commonPlugins(true),
    external,
  },
  // UMD build
  {
    input: 'index.ts',
    output: {
      format: 'umd',
      name: 'FlatFileReact',
      file: 'dist/index.js',
      exports: 'auto',
      sourcemap: false,
      strict: true,
    },
    plugins: commonPlugins(true),
  },
]

export default config
