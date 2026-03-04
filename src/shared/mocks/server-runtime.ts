import { API_URL } from '@/shared/config/env'

import { server } from './server'

let isStarted = false

export const ensureServerMocking = () => {
  if (isStarted) {
    return
  }

  const isStrict = import.meta.env.VITE_MOCK_API_STRICT === 'true'
  const onUnhandledRequest = isStrict
    ? (request: Request, print: { error: () => void }) => {
        if (request.url.toString().startsWith(API_URL)) {
          print.error()
        }
      }
    : 'bypass'

  server.listen({ onUnhandledRequest })
  isStarted = true
}
