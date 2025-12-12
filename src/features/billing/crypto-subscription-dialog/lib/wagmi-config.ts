import { http, createConfig } from 'wagmi'
import { bsc, mainnet, polygon } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [mainnet, bsc, polygon],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http()
  }
})

// USDT contract addresses per chain
export const USDT_ADDRESSES = {
  [mainnet.id]: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as const,
  [bsc.id]: '0x55d398326f99059fF775485246999027B3197955' as const,
  [polygon.id]: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' as const
}

// Subscription contract addresses (deploy and update)
export const SUBSCRIPTION_ADDRESSES = {
  [mainnet.id]: '' as const, // TODO: Deploy
  [bsc.id]: '' as const,     // TODO: Deploy
  [polygon.id]: '' as const  // TODO: Deploy
}

export const getChainId = (network: 'ethereum' | 'bsc' | 'polygon') => {
  switch (network) {
    case 'ethereum':
      return mainnet.id
    case 'bsc':
      return bsc.id
    case 'polygon':
      return polygon.id
  }
}
