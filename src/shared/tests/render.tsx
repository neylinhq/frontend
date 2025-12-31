import type { ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { createInstance } from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { MemoryRouter } from 'react-router'

type RenderOptions = {
  route?: string
  i18nResources?: Record<string, string>
  queryClient?: QueryClient
}

const createTestI18n = (resources?: Record<string, string>) => {
  const instance = createInstance()
  instance.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: {
        translation: resources ?? {}
      }
    },
    initImmediate: false,
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  })
  return instance
}

export const renderWithProviders = (ui: ReactElement, options: RenderOptions = {}) => {
  const queryClient =
    options.queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    })
  const i18n = createTestI18n(options.i18nResources)

  return {
    queryClient,
    i18n,
    ...render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[options.route ?? '/']}>{ui}</MemoryRouter>
        </QueryClientProvider>
      </I18nextProvider>
    )
  }
}
