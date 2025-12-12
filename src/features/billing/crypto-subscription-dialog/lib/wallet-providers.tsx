import { type ReactNode, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { WalletProvider as TronWalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from './wagmi-config'

// TonConnect manifest URL (нужно разместить на сервере)
const TON_CONNECT_MANIFEST_URL = '/tonconnect-manifest.json'

// Query client for wagmi (shared)
const queryClient = new QueryClient()

interface WalletProvidersProps {
  children: ReactNode
}

/**
 * Провайдеры для всех wallet библиотек
 * Оборачивает компоненты, которым нужен доступ к кошелькам
 */
export const WalletProviders = ({ children }: WalletProvidersProps) => {
  // Tron adapters need to be created lazily to avoid SSR issues
  const tronAdapters = useMemo(() => {
    // TronLinkAdapter will be loaded dynamically
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { TronLinkAdapter } = require('@tronweb3/tronwallet-adapters')
    return [new TronLinkAdapter()]
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <TonConnectUIProvider manifestUrl={TON_CONNECT_MANIFEST_URL}>
          <TronWalletProvider adapters={tronAdapters}>
            {children}
          </TronWalletProvider>
        </TonConnectUIProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}
