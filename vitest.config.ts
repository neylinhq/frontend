import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    include: ['**/__tests__/**/*.test.{ts,tsx}', '**/__tests__/**/*.integration.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.dev/**', '**/dist/**', '**/*.e2e.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/entities/**/*.ts',
        'src/features/**/lib/**/*.ts',
        'src/shared/lib/**/*.ts'
      ],
      exclude: [
        '**/node_modules/**',
        '**/.dev/**',
        '**/dist/**',
        '**/index.ts',
        '**/*.types.ts',
        'src/shared/lib/*.ts',
        'src/features/graph/lib/layout-algorithms-optimized.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/__mocks__'
      ]
    }
  }
})
