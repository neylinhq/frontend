import { useCallback } from 'react'
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import type { CryptoNetwork } from '@/entities/subscription'

// Tron USDT (TRC-20) contract address
const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'

// Subscription contract address (будет задеплоен)
const SUBSCRIPTION_CONTRACT = 'T...' // TODO: replace after deploy

export const useTronWalletConnect = (network: CryptoNetwork | null) => {
  const { address, connected, connecting, connect, disconnect } = useWallet()

  const isActive = network === 'tron'

  const handleConnect = useCallback(async () => {
    if (!isActive) return
    await connect()
  }, [isActive, connect])

  const handleDisconnect = useCallback(async () => {
    await disconnect()
  }, [disconnect])

  // Approve USDT spending
  const approve = useCallback(async (amount: bigint) => {
    if (!address) throw new Error('Wallet not connected')

    // @ts-expect-error - tronWeb is injected by TronLink
    const tronWeb = window.tronWeb
    if (!tronWeb) throw new Error('TronLink not found')

    const contract = await tronWeb.contract().at(USDT_CONTRACT)

    const tx = await contract.approve(SUBSCRIPTION_CONTRACT, amount.toString()).send({
      feeLimit: 100_000_000, // 100 TRX
      callValue: 0
    })

    return tx
  }, [address])

  // Subscribe via smart contract
  const subscribe = useCallback(async (orderId: string, amount: bigint) => {
    if (!address) throw new Error('Wallet not connected')

    // @ts-expect-error - tronWeb is injected by TronLink
    const tronWeb = window.tronWeb
    if (!tronWeb) throw new Error('TronLink not found')

    const contract = await tronWeb.contract().at(SUBSCRIPTION_CONTRACT)

    // Convert orderId to bytes32
    const orderIdBytes = '0x' + orderId.replace(/-/g, '').padEnd(64, '0')

    const tx = await contract.subscribe(orderIdBytes, amount.toString()).send({
      feeLimit: 100_000_000, // 100 TRX
      callValue: 0
    })

    return tx
  }, [address])

  return {
    address: address ?? null,
    isConnected: connected,
    isConnecting: connecting,
    connect: handleConnect,
    disconnect: handleDisconnect,
    approve,
    subscribe
  }
}
