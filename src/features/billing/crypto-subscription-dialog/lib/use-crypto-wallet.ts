import { useMemo } from 'react'
import type { CryptoNetwork } from '@/entities/subscription'
import { getWalletType } from '@/entities/subscription'
import { useEvmWallet } from './use-evm-wallet'
import { useTonWalletConnect } from './use-ton-wallet'
import { useTronWalletConnect } from './use-tron-wallet'

export interface CryptoWallet {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
  approve?: (amount: bigint) => Promise<string>
  subscribe: (orderId: string, amount: bigint) => Promise<string>
}

/**
 * Unified hook для работы с криптокошельками
 * Автоматически выбирает нужный коннектор в зависимости от сети
 */
export const useCryptoWallet = (network: CryptoNetwork | null): CryptoWallet => {
  const evmWallet = useEvmWallet(network)
  const tonWallet = useTonWalletConnect(network)
  const tronWallet = useTronWalletConnect(network)

  const wallet = useMemo<CryptoWallet>(() => {
    if (!network) {
      return {
        address: null,
        isConnected: false,
        isConnecting: false,
        connect: async () => {},
        disconnect: () => {},
        subscribe: async () => { throw new Error('No network selected') }
      }
    }

    const walletType = getWalletType(network)

    switch (walletType) {
      case 'tonconnect':
        return {
          address: tonWallet.address,
          isConnected: tonWallet.isConnected,
          isConnecting: tonWallet.isConnecting,
          connect: tonWallet.connect,
          disconnect: tonWallet.disconnect,
          // TON не требует отдельного approve - всё в одной транзакции
          subscribe: tonWallet.subscribe
        }

      case 'tron':
        return {
          address: tronWallet.address,
          isConnected: tronWallet.isConnected,
          isConnecting: tronWallet.isConnecting,
          connect: tronWallet.connect,
          disconnect: tronWallet.disconnect,
          approve: tronWallet.approve,
          subscribe: tronWallet.subscribe
        }

      case 'evm':
        return {
          address: evmWallet.address,
          isConnected: evmWallet.isConnected,
          isConnecting: evmWallet.isConnecting,
          connect: evmWallet.connect,
          disconnect: evmWallet.disconnect,
          approve: evmWallet.approve,
          subscribe: evmWallet.subscribe
        }
    }
  }, [network, evmWallet, tonWallet, tronWallet])

  return wallet
}
