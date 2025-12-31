import { defineConfig } from '@playwright/test'

const PORT = process.env.E2E_PORT ?? '3000'
const BASE_URL = `http://localhost:${PORT}`
const DEV_COMMAND = process.env.E2E_DEV_COMMAND ?? `npm run dev -- --port ${PORT}`

export default defineConfig({
  testDir: './src/app/__tests__',
  testMatch: '**/*.e2e.ts',
  use: {
    baseURL: BASE_URL
  },
  webServer: {
    command: DEV_COMMAND,
    url: BASE_URL,
    reuseExistingServer: false,
    env: {
      ...process.env,
      VITE_MOCK_API: 'true',
      VITE_MOCK_API_STRICT: 'true'
    }
  }
})
