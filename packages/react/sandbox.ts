/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    outputTruncateLength: 8000,
    root: './src',
    setupFiles: './src/test/setup.ts',
    coverage: {
      100: true,
      all: true,
      reporter: ['text', 'json', 'html'],
    },
  },
  clearScreen: false,
  plugins: [react()],
  server: {
    open: true,
  },
})
