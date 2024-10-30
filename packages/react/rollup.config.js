import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import sucrase from '@rollup/plugin-sucrase'
import terser from '@rollup/plugin-terser'
import url from '@rollup/plugin-url'
import dotenv from 'dotenv'
import css from 'rollup-plugin-import-css'
import postcss from 'rollup-plugin-postcss'

dotenv.config()

const PROD = process.env.NODE_ENV !== 'development'

if (!PROD) {
  console.log('Not in production mode - skipping minification')
}

const config = [
  // UMD build
  {
    input: 'src/index.ts',
    output: {
      format: 'umd',
      name: 'FlatFileReact',
      file: 'dist/index.umd.js',
      exports: 'auto',
      sourcemap: true,
      strict: true,
    },
    plugins: [
      json(),
      css(),
      commonjs({
        include: '**/node_modules/**',
        requireReturnsDefault: 'auto',
        esmExternals: true,
      }),
      resolve({
        browser: true,
        preferBuiltins: false,
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
    ],
    onwarn: function (warning, warn) {
      // Skip certain warnings
      if (warning.code === 'THIS_IS_UNDEFINED') {
        return
      }
      // console.warn everything else
      warn(warning)
    },
  },
]

export default config
