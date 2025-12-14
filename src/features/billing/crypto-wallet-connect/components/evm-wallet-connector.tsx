import { useCallback, useEffect, useRef } from 'react'
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { injected } from 'wagmi/connectors'
import type { CryptoNetwork } from '@/entities/subscription'
import { getEvmChainId, getUsdtContractAddress } from '@/entities/subscription/lib/crypto-utils'
import type { CryptoWallet } from './use-crypto-wallet'

interface EvmWalletConnectorProps {
  network: CryptoNetwork
  onWalletChange: (wallet: CryptoWallet) => void
}

export const EvmWalletConnector = ({ network, onWalletChange }: EvmWalletConnectorProps) => {
  const { address, isConnected, isConnecting, chainId: currentChainId } = useAccount()
  const { connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const { switchChainAsync } = useSwitchChain()

  const chainId = getEvmChainId(network)
  const usdtAddress = getUsdtContractAddress(network)

  // Use refs to access current values in stable callbacks
  const addressRef = useRef(address)
  const usdtAddressRef = useRef(usdtAddress)
  const chainIdRef = useRef(chainId)
  const connectAsyncRef = useRef(connectAsync)
  const disconnectAsyncRef = useRef(disconnectAsync)
  const switchChainAsyncRef = useRef(switchChainAsync)

  // Update refs on each render
  addressRef.current = address
  usdtAddressRef.current = usdtAddress
  chainIdRef.current = chainId
  connectAsyncRef.current = connectAsync
  disconnectAsyncRef.current = disconnectAsync
  switchChainAsyncRef.current = switchChainAsync

  // Switch chain if connected but on wrong network
  useEffect(() => {
    if (isConnected && chainId && currentChainId !== chainId) {
      switchChainAsync({ chainId }).catch(() => {
        // If switch fails, disconnect and reconnect with correct chain
        disconnectAsync()
      })
    }
  }, [network, chainId, currentChainId, isConnected, switchChainAsync, disconnectAsync])

  // Stable callbacks that don't change
  const handleConnect = useCallback(async () => {
    if (!chainIdRef.current) {
      throw new Error('Invalid network')
    }
    await connectAsyncRef.current({
      connector: injected(),
      chainId: chainIdRef.current
    })
  }, [])

  const handleDisconnect = useCallback(async () => {
    await disconnectAsyncRef.current()
  }, [])

  // ERC-20 approve + transfer
  const subscribe = useCallback(async (orderId: string, amount: bigint) => {
    if (!addressRef.current || !usdtAddressRef.current) {
      throw new Error('Wallet not connected or invalid network')
    }

    // TODO: Implement actual ERC-20 transfer using wagmi writeContract
    // For now, this is a placeholder
    console.log('EVM subscribe:', { orderId, amount, usdtAddress: usdtAddressRef.current, address: addressRef.current })
    throw new Error('EVM subscription not yet implemented')
  }, [])

  useEffect(() => {
    onWalletChange({
      address: address ?? null,
      isConnected,
      isConnecting,
      chainId: currentChainId ?? null,
      connect: handleConnect,
      disconnect: handleDisconnect,
      subscribe
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isConnected, isConnecting, currentChainId, onWalletChange])

  return null
}
