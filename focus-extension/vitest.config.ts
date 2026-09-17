import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@focus/shared': new URL(
        '../focus-shared/src',
        import.meta.url,
      ).pathname,
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
