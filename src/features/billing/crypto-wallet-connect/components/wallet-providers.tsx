'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { http, createConfig, WagmiProvider } from 'wagmi'
import { mainnet, bsc, polygon } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WalletProvider as TronWalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks'
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters'

// Wagmi config for EVM networks
const wagmiConfig = createConfig({
  chains: [mainnet, bsc, polygon],
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http()
  }
})

// QueryClient for wagmi
const queryClient = new QueryClient()

// Tron adapters
const tronAdapters = [new TronLinkAdapter()]

interface WalletProvidersProps {
  children: ReactNode
}

/**
 * Провайдеры для всех крипто кошельков
 * TON Connect, EVM (wagmi), Tron
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
        <TronWalletProvider adapters={tronAdapters} autoConnect={false}>
          <TonProvider>{children}</TonProvider>
        </TronWalletProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}

// Отдельный компонент для TON Connect чтобы lazy-load его
const TonProvider = ({ children }: { children: ReactNode }) => {
  const [Provider, setProvider] = useState<{
    TonConnectUIProvider: React.ComponentType<{ children: ReactNode; manifestUrl: string }>
  } | null>(null)

  useEffect(() => {
    // Dynamic import для client-only библиотеки
    import('@tonconnect/ui-react')
      .then(tonModule => {
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
    <TonConnectUIProvider manifestUrl='/tonconnect-manifest.json'>{children}</TonConnectUIProvider>
  )
}
