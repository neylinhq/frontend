import { useCallback, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import type { CryptoNetwork } from '@/entities/subscription'
import { getEvmChainId, getUsdtContractAddress } from '@/entities/subscription/lib/crypto-utils'
import type { CryptoWallet } from './use-crypto-wallet'

interface EvmWalletConnectorProps {
  network: CryptoNetwork
  onWalletChange: (wallet: CryptoWallet) => void
}

export const EvmWalletConnector = ({ network, onWalletChange }: EvmWalletConnectorProps) => {
  const { address, isConnected, isConnecting } = useAccount()
  const { connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()

  const chainId = getEvmChainId(network)
  const usdtAddress = getUsdtContractAddress(network)

  const handleConnect = useCallback(async () => {
    if (!chainId) {
      throw new Error('Invalid network')
    }
    await connectAsync({
      connector: injected(),
      chainId
    })
  }, [connectAsync, chainId])

  const handleDisconnect = useCallback(async () => {
    await disconnectAsync()
  }, [disconnectAsync])

  // ERC-20 approve + transfer
  const subscribe = useCallback(
    async (orderId: string, amount: bigint) => {
      if (!address || !usdtAddress) {
        throw new Error('Wallet not connected or invalid network')
      }

      // TODO: Implement actual ERC-20 transfer using wagmi writeContract
      // For now, this is a placeholder
      console.log('EVM subscribe:', { orderId, amount, usdtAddress, address })
      throw new Error('EVM subscription not yet implemented')
    },
    [address, usdtAddress]
  )

  useEffect(() => {
    onWalletChange({
      address: address ?? null,
      isConnected,
      isConnecting,
      connect: handleConnect,
      disconnect: handleDisconnect,
      subscribe
    })
  }, [address, isConnected, isConnecting, handleConnect, handleDisconnect, subscribe, onWalletChange])

  return null
}
