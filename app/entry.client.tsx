import { StrictMode, startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'
import '@/app/i18n'
import { API_URL } from '@/shared/config/env'

const enableMocking = async () => {
  if (import.meta.env.VITE_MOCK_API !== 'true') {
    return
  }

  const { worker } = await import('@/shared/mocks/client')
  const isStrict = import.meta.env.VITE_MOCK_API_STRICT === 'true'
  const onUnhandledRequest = isStrict
    ? (request: Request, print: { error: () => void }) => {
        if (request.url.toString().startsWith(API_URL)) {
          print.error()
        }
      }
    : 'bypass'

  return worker.start({
    onUnhandledRequest,
    serviceWorker: {
      url: '/mockServiceWorker.js'
    }
  })
}

enableMocking().then(() => {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
      </StrictMode>
    )
  })
})
