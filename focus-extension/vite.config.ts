import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@focus/shared': new URL(
        '../focus-shared/src',
        import.meta.url,
      ).pathname,
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: new URL(
          './index.html',
          import.meta.url,
        ).pathname,
        background: new URL(
          './src/background/service-worker.ts',
          import.meta.url,
        ).pathname,
      },
      output: {
        entryFileNames: (chunkInfo) =>
          chunkInfo.name === 'background'
            ? 'background.js'
            : 'assets/[name]-[hash].js',
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
