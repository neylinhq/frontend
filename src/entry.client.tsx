import { StrictMode, startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'
import '@/app/i18n'

const enableMocking = async () => {
  if (import.meta.env.VITE_MOCK_API !== 'true') {
    return
  }

  const { worker } = await import('@/shared/mocks/browser')

  return worker.start({
    onUnhandledRequest: 'bypass',
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
