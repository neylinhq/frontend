import { useCallback, useEffect } from 'react'
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import type { CryptoNetwork } from '@/entities/subscription'
import { getUsdtContractAddress } from '@/entities/subscription/lib/crypto-utils'
import type { CryptoWallet } from './use-crypto-wallet'

interface TronWalletConnectorProps {
  network: CryptoNetwork
  onWalletChange: (wallet: CryptoWallet) => void
}

export const TronWalletConnector = ({ onWalletChange }: TronWalletConnectorProps) => {
  const { address, connected, connecting, connect, disconnect } = useWallet()

  const usdtAddress = getUsdtContractAddress('tron')

  const handleConnect = useCallback(async () => {
    await connect()
  }, [connect])

  const handleDisconnect = useCallback(async () => {
    await disconnect()
  }, [disconnect])

  const subscribe = useCallback(
    async (orderId: string, amount: bigint) => {
      if (!address || !usdtAddress) {
        throw new Error('Wallet not connected')
      }

      // TODO: Implement TRC-20 transfer
      console.log('Tron subscribe:', { orderId, amount, usdtAddress, address })
      throw new Error('Tron subscription not yet implemented')
    },
    [address, usdtAddress]
  )

  useEffect(() => {
    onWalletChange({
      address: address ?? null,
      isConnected: connected,
      isConnecting: connecting,
      connect: handleConnect,
      disconnect: handleDisconnect,
      subscribe
    })
  }, [address, connected, connecting, handleConnect, handleDisconnect, subscribe, onWalletChange])

  return null
}
