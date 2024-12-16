import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  clean: true,
  minify: false,
  splitting: false,
  sourcemap: false,
  bundle: true,
  dts: false,
  noExternal: [/.*/],
  external: ['esbuild'],
  platform: 'node',
  target: 'node16',
  esbuildOptions(options) {
    options.conditions = ['module']
    options.loader = {
      '.js': 'js',
      '.ts': 'ts',
      '.tsx': 'tsx'
    }
  }
}) 