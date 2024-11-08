import dotenv from 'dotenv'
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
  entryPoints: ['index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  treeshake: true,
  splitting: true,
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.mjs',
  }),
})
