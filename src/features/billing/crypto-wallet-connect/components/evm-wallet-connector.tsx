import { useCallback, useEffect, useRef } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract
} from 'wagmi'
import { injected } from 'wagmi/connectors'

import type { CryptoNetwork } from '@/entities/subscription'
import {
  getEvmChainId,
  getSubscriptionContractAddress,
  getUsdtContractAddress
} from '@/entities/subscription/lib/crypto-utils'

import type { CryptoWallet } from './use-crypto-wallet'

// ERC-20 ABI (только approve и allowance)
const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

// Subscription contract ABI
const SUBSCRIPTION_ABI = [
  {
    name: 'subscribe',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'orderId', type: 'bytes32' },
      { name: 'monthlyAmount', type: 'uint256' }
    ],
    outputs: []
  }
] as const

interface EvmWalletConnectorProps {
  network: CryptoNetwork
  onWalletChange: (wallet: CryptoWallet) => void
}

export const EvmWalletConnector = ({ network, onWalletChange }: EvmWalletConnectorProps) => {
  const { address, isConnected, isConnecting, chainId: currentChainId } = useAccount()
  const { connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync } = useWriteContract()

  const chainId = getEvmChainId(network)
  const usdtAddress = getUsdtContractAddress(network)
  const subscriptionAddress = getSubscriptionContractAddress(network)

  // Use refs to access current values in stable callbacks
  const addressRef = useRef(address)
  const usdtAddressRef = useRef(usdtAddress)
  const subscriptionAddressRef = useRef(subscriptionAddress)
  const chainIdRef = useRef(chainId)
  const connectAsyncRef = useRef(connectAsync)
  const disconnectAsyncRef = useRef(disconnectAsync)
  const switchChainAsyncRef = useRef(switchChainAsync)
  const writeContractAsyncRef = useRef(writeContractAsync)

  // Update refs on each render
  addressRef.current = address
  usdtAddressRef.current = usdtAddress
  subscriptionAddressRef.current = subscriptionAddress
  chainIdRef.current = chainId
  connectAsyncRef.current = connectAsync
  disconnectAsyncRef.current = disconnectAsync
  switchChainAsyncRef.current = switchChainAsync
  writeContractAsyncRef.current = writeContractAsync

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

  /**
   * Subscribe with EVM wallet:
   * 1. Approve USDT spending
   * 2. Call subscribe() on subscription contract
   */
  const subscribe = useCallback(async (orderId: string, amount: bigint) => {
    if (!addressRef.current || !usdtAddressRef.current || !subscriptionAddressRef.current) {
      throw new Error('Wallet not connected or contracts not deployed')
    }

    // Step 1: Approve USDT spending (with extra buffer for gas fluctuations)
    const approveAmount = amount * BigInt(12) // Approve 12 months worth to avoid repeated approvals

    const approveTxHash = await writeContractAsyncRef.current({
      address: usdtAddressRef.current as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [subscriptionAddressRef.current as `0x${string}`, approveAmount]
    })

    // Step 2: Call subscribe on subscription contract
    // Convert orderId (UUID) to bytes32
    const orderIdBytes32 = `0x${orderId.replace(/-/g, '')}` as `0x${string}`

    const subscribeTxHash = await writeContractAsyncRef.current({
      address: subscriptionAddressRef.current as `0x${string}`,
      abi: SUBSCRIPTION_ABI,
      functionName: 'subscribe',
      args: [orderIdBytes32, amount]
    })

    // Return the subscribe transaction hash
    return subscribeTxHash
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
