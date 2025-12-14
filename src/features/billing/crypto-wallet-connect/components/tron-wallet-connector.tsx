import { useCallback, useEffect, useRef } from 'react'
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

  // Use refs to access current values in stable callbacks
  const addressRef = useRef(address)
  const usdtAddressRef = useRef(usdtAddress)
  const connectRef = useRef(connect)
  const disconnectRef = useRef(disconnect)

  // Update refs on each render
  addressRef.current = address
  usdtAddressRef.current = usdtAddress
  connectRef.current = connect
  disconnectRef.current = disconnect

  // Stable callbacks that don't change
  const handleConnect = useCallback(async () => {
    await connectRef.current()
  }, [])

  const handleDisconnect = useCallback(async () => {
    await disconnectRef.current()
  }, [])

  const subscribe = useCallback(async (orderId: string, amount: bigint) => {
    if (!addressRef.current || !usdtAddressRef.current) {
      throw new Error('Wallet not connected')
    }

    // TODO: Implement TRC-20 transfer
    console.log('Tron subscribe:', { orderId, amount, usdtAddress: usdtAddressRef.current, address: addressRef.current })
    throw new Error('Tron subscription not yet implemented')
  }, [])

  useEffect(() => {
    onWalletChange({
      address: address ?? null,
      isConnected: connected,
      isConnecting: connecting,
      connect: handleConnect,
      disconnect: handleDisconnect,
      subscribe
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, connected, connecting, onWalletChange])

  return null
}
