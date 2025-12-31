import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, expect } from 'vitest'
import { server } from '@/shared/mocks/server'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

// Cleanup after each test
afterEach(() => {
  server.resetHandlers()
  cleanup()
})

afterAll(() => {
  server.close()
})
