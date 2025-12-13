'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from './wagmi-config'

// Query client for wagmi (shared)
const queryClient = new QueryClient()

interface WalletProvidersProps {
  children: ReactNode
}

/**
 * Провайдеры для wallet библиотек
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

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <TonAndTronProviders>
          {children}
        </TonAndTronProviders>
      </WagmiProvider>
    </QueryClientProvider>
  )
}

// Отдельный компонент для TON и Tron чтобы lazy-load их
const TonAndTronProviders = ({ children }: { children: ReactNode }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [providers, setProviders] = useState<{
    TonConnectUIProvider: React.ComponentType<{ children: ReactNode; manifestUrl: string }>
    TronWalletProvider: React.ComponentType<any>
    tronAdapters: unknown[]
  } | null>(null)

  useEffect(() => {
    // Dynamic import для client-only библиотек
    Promise.all([
      import('@tonconnect/ui-react'),
      import('@tronweb3/tronwallet-adapter-react-hooks'),
      import('@tronweb3/tronwallet-adapter-tronlink')
    ]).then(([tonModule, tronHooksModule, tronLinkModule]) => {
      setProviders({
        TonConnectUIProvider: tonModule.TonConnectUIProvider,
        TronWalletProvider: tronHooksModule.WalletProvider,
        tronAdapters: [new tronLinkModule.TronLinkAdapter()]
      })
    }).catch(() => {
      // Silently handle missing optional packages in dev
    })
  }, [])

  if (!providers) {
    return <>{children}</>
  }

  const { TonConnectUIProvider, TronWalletProvider, tronAdapters } = providers

  return (
    <TonConnectUIProvider manifestUrl='/tonconnect-manifest.json'>
      <TronWalletProvider adapters={tronAdapters}>
        {children}
      </TronWalletProvider>
    </TonConnectUIProvider>
  )
}
