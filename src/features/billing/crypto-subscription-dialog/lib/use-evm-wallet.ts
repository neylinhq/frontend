import { useCallback } from 'react'
import { erc20Abi } from 'viem'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useWriteContract
} from 'wagmi'
import type { CryptoNetwork } from '@/entities/subscription'
import { getChainId, SUBSCRIPTION_ADDRESSES, USDT_ADDRESSES } from './wagmi-config'

// Subscription contract ABI (simplified)
const subscriptionAbi = [
  {
    name: 'subscribe',
    type: 'function',
    inputs: [
      { name: 'orderId', type: 'bytes32' },
      { name: 'monthlyAmount', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  }
] as const

export const useEvmWallet = (network: CryptoNetwork | null) => {
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { writeContractAsync } = useWriteContract()

  const targetChainId = network && ['bsc', 'polygon', 'ethereum'].includes(network)
    ? getChainId(network as 'bsc' | 'polygon' | 'ethereum')
    : null

  const handleConnect = useCallback(async () => {
    const injectedConnector = connectors.find(c => c.id === 'injected')
    if (injectedConnector) {
      connect({ connector: injectedConnector })
    }
  }, [connect, connectors])

  const handleDisconnect = useCallback(() => {
    disconnect()
  }, [disconnect])

  const ensureCorrectChain = useCallback(async () => {
    if (targetChainId && chainId !== targetChainId) {
      await switchChain({ chainId: targetChainId })
    }
  }, [chainId, targetChainId, switchChain])

  const approve = useCallback(async (amount: bigint) => {
    if (!targetChainId) throw new Error('No target chain')

    await ensureCorrectChain()

    const usdtAddress = USDT_ADDRESSES[targetChainId]
    const subscriptionAddress = SUBSCRIPTION_ADDRESSES[targetChainId]

    if (!subscriptionAddress) {
      throw new Error('Subscription contract not deployed')
    }

    const hash = await writeContractAsync({
      address: usdtAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [subscriptionAddress as `0x${string}`, amount]
    })

    return hash
  }, [targetChainId, ensureCorrectChain, writeContractAsync])

  const subscribe = useCallback(async (orderId: string, amount: bigint) => {
    if (!targetChainId) throw new Error('No target chain')

    await ensureCorrectChain()

    const subscriptionAddress = SUBSCRIPTION_ADDRESSES[targetChainId]

    if (!subscriptionAddress) {
      throw new Error('Subscription contract not deployed')
    }

    // Convert orderId to bytes32
    const orderIdBytes = `0x${orderId.replace(/-/g, '').padEnd(64, '0')}` as `0x${string}`

    const hash = await writeContractAsync({
      address: subscriptionAddress as `0x${string}`,
      abi: subscriptionAbi,
      functionName: 'subscribe',
      args: [orderIdBytes, amount]
    })

    return hash
  }, [targetChainId, ensureCorrectChain, writeContractAsync])

  return {
    address: address ?? null,
    isConnected,
    isConnecting,
    connect: handleConnect,
    disconnect: handleDisconnect,
    approve,
    subscribe
  }
}
