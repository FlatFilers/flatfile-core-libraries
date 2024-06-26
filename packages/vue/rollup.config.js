import path from 'path'
import vue from 'rollup-plugin-vue'
import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import babel from '@rollup/plugin-babel'
import PostCSS from 'rollup-plugin-postcss'
import simplevars from 'postcss-simple-vars'
import postcssImport from 'postcss-import'
import minimist from 'minimist'
import postcssUrl from 'postcss-url'
import url from '@rollup/plugin-url'
import nested from 'postcss-nested'
import autoprefixer from 'autoprefixer'
import typescript from 'rollup-plugin-typescript2'

const postcssConfigList = [
  postcssImport({
    resolve(id, basedir) {
      // resolve alias @css, @import '@css/style.css'
      if (id.startsWith('@css')) {
        return path.resolve('./src', id.slice(5))
      }

      // resolve relative path, @import './components/style.css'
      return path.resolve(basedir, id)
    },
  }),
  simplevars,
  nested,
  postcssUrl({ url: 'inline' }),
  autoprefixer({
    overrideBrowserslist: '> 1%, IE 6, Explorer >= 10, Safari >= 7',
  }),
]

const argv = minimist(process.argv.slice(2))

const projectRoot = path.resolve(__dirname, '.')

let postVueConfig = [
  // Process only `<style module>` blocks.
  PostCSS({
    modules: {
      generateScopedName: '[local]___[hash:base64:5]',
    },
    include: /&module=.*\.css$/,
  }),
  // Process all `<style>` blocks except `<style module>`.
  PostCSS({
    include: /(?<!&module=.*)\.css$/,
    plugins: [...postcssConfigList],
  }),
  url({
    include: ['**/*.svg', '**/*.png', '**/*.gif', '**/*.jpg', '**/*.jpeg'],
  }),
]

const baseConfig = {
  plugins: {
    preVue: [
      alias({
        entries: [
          {
            find: '@',
            replacement: `${path.resolve(projectRoot, 'src')}`,
          },
        ],
        customResolver: resolve({
          extensions: ['.js', '.jsx', '.vue'],
        }),
      }),
    ],
    vue: {
      target: 'browser',
      preprocessStyles: true,
      postcssPlugins: [...postcssConfigList],
    },
    postVue: [...postVueConfig],
    babel: {
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx', '.vue'],
      babelHelpers: 'bundled',
    },
    replace: {
      preventAssignment: true
    }
  },
}

// Refer to https://rollupjs.org/guide/en/#warning-treating-module-as-external-dependency
const external = ['vue', '@flatfile/plugin-record-hook']

// Refer to https://rollupjs.org/guide/en#output-globals for details
const globals = { vue: 'Vue' }

const entriespath = {
  index: './src/index.ts',
}

let buildFormats = []

if (!argv.format || argv.format === 'es') {
  const esConfig = {
    input: entriespath,
    external,
    output: {
      format: 'esm',
      dir: 'dist/esm',
    },
    plugins: [
      typescript(),
      replace(baseConfig.plugins.replace),
      ...baseConfig.plugins.preVue,
      vue(baseConfig.plugins.vue),
      ...baseConfig.plugins.postVue,
      babel({
        ...baseConfig.plugins.babel,
        presets: [['@babel/preset-env', { modules: false }]],
      }),
      commonjs(),
    ],
  }

  const merged = {
    input: 'src/index.ts',
    external,
    output: {
      format: 'esm',
      file: 'dist/vuelib.esm.js',
    },
    plugins: [
      typescript(),
      replace(baseConfig.plugins.replace),
      ...baseConfig.plugins.preVue,
      vue(baseConfig.plugins.vue),
      ...baseConfig.plugins.postVue,
      babel({
        ...baseConfig.plugins.babel,
        presets: [['@babel/preset-env', { modules: false }]],
      }),
      commonjs(),
    ],
  }

  buildFormats.push(esConfig)
  buildFormats.push(merged)
  buildFormats = [...buildFormats]
}

if (!argv.format || argv.format === 'cjs') {
  const cjsConfig = {
    ...baseConfig,
    input: entriespath,
    external,
    output: {
      compact: true,
      format: 'cjs',
      dir: 'dist/cjs',
      exports: 'named',
      globals,
    },
    plugins: [
      typescript(),
      replace(baseConfig.plugins.replace),
      ...baseConfig.plugins.preVue,
      vue({
        ...baseConfig.plugins.vue,
        template: {
          ...baseConfig.plugins.vue.template,
          optimizeSSR: true,
        },
      }),
      ...baseConfig.plugins.postVue,
      babel(baseConfig.plugins.babel),
      commonjs(),
    ],
  }
  buildFormats.push(cjsConfig)
}
// Export config
export default buildFormats
