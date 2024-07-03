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

/**
 * @description Returns an array of plugins to be used in a Webpack configuration
 * file for transpiling and bundling JavaScript and CSS code. It includes peer
 * dependencies, JSON, CSS, CommonJS, ES modules, resolved dependencies, JSX
 * transformation, and post-processing through Terser and PostCSS.
 * 
 * @param {boolean} browser - browser environment and controls the behavior of other
 * plugins in the `commonPlugins` function, including whether or not to include
 * external dependencies and how to transform files.
 * 
 * @param {false} umd - Boolean value of whether to include or exclude UMD plugins.
 * 
 * @returns {array} an array of plugins to be used for bundling code in a browser environment.
 */
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
    /**
     * @description Skips certain warnings based on their code values, while console
     * warning other warnings with the given message.
     * 
     * @param {object} warning - warning to be skipped or warned, which can be either
     * 'THIS_IS_UNDEFINED' or any other value for non-ignored warnings.
     * 
     * @param {object} warn - warning to be displayed to the user.
     * 
     * @returns {void} a warning message for any code that is not defined as `THIS_IS_UNDEFINED`.
     * 
     * 	* `code`: The warning code that triggered the warning message.
     * 	* `message`: The text message displayed in the console for the warning.
     */
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
    /**
     * @description Skips certain warnings based on a specified code and issues a warning
     * message to the console for all other warnings.
     * 
     * @param {object} warning - warning message that is to be displayed, and it is
     * processed by the function accordingly.
     * 
     * @param {object} warn - warning message that is to be output via the console.
     * 
     * @returns {undefined value because the `if` condition evaluates to `true`, causing
     * the function's second expression (i.e., `warn`) to be executed but with no value
     * provided as an argument, resulting in an undefined output} a warning message for
     * all warnings that are not related to the `THIS_IS_UNDEFINED` code.
     * 
     * 	* `code`: A string that represents the warning code. (Example: `'THIS_IS_UNDEFINED'`)
     * 	* `message`: A string that represents the message of the warning. (Example: `'This
     * variable is undefined'')`
     * 	* `object`: An object that contains additional properties related to the warning,
     * such as the file and line number where the warning occurred. (Example: `{ file:
     * 'main.js', line: 12 })`
     */
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
    /**
     * @description Skips certain warnings and logs others to the console using `console.warn()`.
     * 
     * @param {object} warning - warning message to be displayed, which the function
     * either skips or displays in the console depending on its `code` property value.
     * 
     * @param {object} warn - warning message to be logged to the console if it is not
     * skipped based on the condition set in the code.
     * 
     * @returns {error} a warning message for all warnings not specifically skipped.
     * 
     * 	* `code`: The type of warning generated, which can be one of several predefined
     * constants (e.g., 'THIS_IS_UNDEFINED', 'PATH_IS_NOT_ALLOWED', etc.).
     * 	* `message`: A string representing the text message to be warned about.
     * 	* `stack`: An optional string representing the stack trace associated with the
     * warning, which can be used for debugging purposes.
     */
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
