import type React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CryptoNetwork } from '@/entities/subscription'
import { getWalletType, type WalletType } from '@/entities/subscription/lib/crypto-utils'

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
  subscribe: async () => {
    throw new Error('No network selected')
  }
}

type WalletConnectorComponent = React.ComponentType<{
  network: CryptoNetwork
  onWalletChange: (wallet: CryptoWallet) => void
}>

/**
 * Hook для работы с крипто кошельками
 * Лениво загружает соответствующий коннектор в зависимости от сети
 */
export const useCryptoWallet = (
  network: CryptoNetwork | null
): CryptoWallet & { _connector: React.ReactNode } => {
  const [wallet, setWallet] = useState<CryptoWallet>(emptyWallet)
  const [WalletComponent, setWalletComponent] = useState<WalletConnectorComponent | null>(null)

  // Определяем тип кошелька по сети
  const walletType: WalletType | null = network ? getWalletType(network) : null

  // Лениво загружаем соответствующий коннектор
  useEffect(() => {
    if (!network || !walletType) {
      setWallet(emptyWallet)
      setWalletComponent(null)
      return
    }

    const loadWallet = async () => {
      try {
        switch (walletType) {
          case 'tonconnect': {
            const { TonWalletConnector } = await import('./ton-wallet-connector')
            setWalletComponent(() => TonWalletConnector)
            break
          }
          case 'evm': {
            const { EvmWalletConnector } = await import('./evm-wallet-connector')
            setWalletComponent(() => EvmWalletConnector)
            break
          }
          case 'tron': {
            const { TronWalletConnector } = await import('./tron-wallet-connector')
            setWalletComponent(() => TronWalletConnector)
            break
          }
        }
      } catch {
        // Failed to load wallet connector
      }
    }

    loadWallet()
  }, [network, walletType])

  const handleWalletChange = useCallback((newWallet: CryptoWallet) => {
    setWallet(newWallet)
  }, [])

  // Рендерим скрытый компонент-коннектор который управляет состоянием кошелька
  const ConnectorElement = useMemo(() => {
    if (!WalletComponent || !network) {
      return null
    }
    return <WalletComponent network={network} onWalletChange={handleWalletChange} />
  }, [WalletComponent, network, handleWalletChange])

  // Возвращаем wallet с дополнительным элементом для рендера
  return useMemo(
    () => ({
      ...wallet,
      _connector: ConnectorElement
    }),
    [wallet, ConnectorElement]
  )
}
