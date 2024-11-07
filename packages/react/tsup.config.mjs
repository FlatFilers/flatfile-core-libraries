import dotenv from 'dotenv'
import { sassPlugin } from 'esbuild-sass-plugin'
import { defineConfig } from 'tsup'

dotenv.config()

const minify = process.env.NODE_ENV !== 'development'
if (!minify) {
  console.log('Not in production mode - skipping minification')
}

export default defineConfig({
  name: 'browser',
  platform: 'browser',
  minify,
  entryPoints: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  treeshake: true,
  splitting: true,
  esbuildPlugins: [sassPlugin({ type: 'css-text' })],
  external: ['react', 'react-dom'],
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.mjs',
  }),
})
