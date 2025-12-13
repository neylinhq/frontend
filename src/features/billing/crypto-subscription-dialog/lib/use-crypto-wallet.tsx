import type React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CryptoNetwork } from '@/entities/subscription'

export interface CryptoWallet {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
  subscribe: (orderId: string, amount: bigint) => Promise<string>
}

const emptyWallet: CryptoWallet = {
  address: null,
  isConnected: false,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
  subscribe: async () => { throw new Error('No network selected') }
}

/**
 * Hook для работы с TON кошельком
 * Лениво загружает коннектор когда выбрана сеть
 */
export const useCryptoWallet = (network: CryptoNetwork | null): CryptoWallet & { _connector: React.ReactNode } => {
  const [wallet, setWallet] = useState<CryptoWallet>(emptyWallet)
  const [WalletComponent, setWalletComponent] = useState<React.ComponentType<{
    network: CryptoNetwork
    onWalletChange: (wallet: CryptoWallet) => void
  }> | null>(null)

  // Лениво загружаем TON коннектор
  useEffect(() => {
    if (!network) {
      setWallet(emptyWallet)
      setWalletComponent(null)
      return
    }

    const loadWallet = async () => {
      try {
        const { TonWalletConnector } = await import('./ton-wallet-connector')
        setWalletComponent(() => TonWalletConnector)
      } catch {
        // Failed to load wallet connector
      }
    }

    loadWallet()
  }, [network])

  const handleWalletChange = useCallback((newWallet: CryptoWallet) => {
    setWallet(newWallet)
  }, [])

  // Рендерим скрытый компонент-коннектор который управляет состоянием кошелька
  const ConnectorElement = useMemo(() => {
    if (!WalletComponent || !network) return null
    return <WalletComponent network={network} onWalletChange={handleWalletChange} />
  }, [WalletComponent, network, handleWalletChange])

  // Возвращаем wallet с дополнительным элементом для рендера
  return useMemo(() => ({
    ...wallet,
    _connector: ConnectorElement
  }), [wallet, ConnectorElement])
}
