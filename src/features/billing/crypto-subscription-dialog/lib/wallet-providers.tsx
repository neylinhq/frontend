'use client'

import { type ReactNode, useEffect, useState } from 'react'

interface WalletProvidersProps {
  children: ReactNode
}

/**
 * Провайдеры для TON Connect
 * Lazy-load чтобы избежать SSR проблем с window
 */
export const WalletProviders = ({ children }: WalletProvidersProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // На сервере и до hydration возвращаем children без провайдеров
  if (!mounted) {
    return <>{children}</>
  }

  return <TonProvider>{children}</TonProvider>
}

// Отдельный компонент для TON Connect чтобы lazy-load его
const TonProvider = ({ children }: { children: ReactNode }) => {
  const [Provider, setProvider] = useState<{
    TonConnectUIProvider: React.ComponentType<{ children: ReactNode; manifestUrl: string }>
  } | null>(null)

  useEffect(() => {
    // Dynamic import для client-only библиотеки
    import('@tonconnect/ui-react')
      .then((tonModule) => {
        setProvider({
          TonConnectUIProvider: tonModule.TonConnectUIProvider
        })
      })
      .catch(() => {
        // Silently handle missing optional package in dev
      })
  }, [])

  if (!Provider) {
    return <>{children}</>
  }

  const { TonConnectUIProvider } = Provider

  return (
    <TonConnectUIProvider manifestUrl='/tonconnect-manifest.json'>
      {children}
    </TonConnectUIProvider>
  )
}
