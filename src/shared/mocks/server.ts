/**
 * MSW Server Setup (Node.js)
 * For use in tests (Vitest)
 */
import { setupServer } from 'msw/node'

import { handlers } from './handlers'

export const server = setupServer(...handlers)
