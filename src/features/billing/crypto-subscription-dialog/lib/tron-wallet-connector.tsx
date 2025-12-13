import { useCallback, useEffect } from 'react'
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import type { CryptoNetwork } from '@/entities/subscription'
import type { CryptoWallet } from './use-crypto-wallet'

// Tron USDT (TRC-20) contract address
const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'

// Subscription contract address (будет задеплоен)
const SUBSCRIPTION_CONTRACT = 'T...' // TODO: replace after deploy

interface TronWalletConnectorProps {
  network: CryptoNetwork
  onWalletChange: (wallet: CryptoWallet) => void
}

export const TronWalletConnector = ({ onWalletChange }: TronWalletConnectorProps) => {
  const { address, connected, connecting, connect, disconnect } = useWallet()

  const handleConnect = useCallback(async () => {
    await connect()
  }, [connect])

  const handleDisconnect = useCallback(async () => {
    await disconnect()
  }, [disconnect])

  // Approve USDT spending
  const approve = useCallback(async (amount: bigint) => {
    if (!address) throw new Error('Wallet not connected')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tronWeb = (window as any).tronWeb
    if (!tronWeb) throw new Error('TronLink not found')

    const contract = await tronWeb.contract().at(USDT_CONTRACT)

    const tx = await contract.approve(SUBSCRIPTION_CONTRACT, amount.toString()).send({
      feeLimit: 100_000_000,
      callValue: 0
    })

    return tx
  }, [address])

  // Subscribe via smart contract
  const subscribe = useCallback(async (orderId: string, amount: bigint) => {
    if (!address) throw new Error('Wallet not connected')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tronWeb = (window as any).tronWeb
    if (!tronWeb) throw new Error('TronLink not found')

    const contract = await tronWeb.contract().at(SUBSCRIPTION_CONTRACT)
    const orderIdBytes = '0x' + orderId.replace(/-/g, '').padEnd(64, '0')

    const tx = await contract.subscribe(orderIdBytes, amount.toString()).send({
      feeLimit: 100_000_000,
      callValue: 0
    })

    return tx
  }, [address])

  // Обновляем родительский компонент при изменении состояния
  useEffect(() => {
    onWalletChange({
      address: address ?? null,
      isConnected: connected,
      isConnecting: connecting,
      connect: handleConnect,
      disconnect: handleDisconnect,
      approve,
      subscribe
    })
  }, [address, connected, connecting, handleConnect, handleDisconnect, approve, subscribe, onWalletChange])

  return null
}
