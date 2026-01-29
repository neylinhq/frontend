import { describe, expect, it, vi } from 'vitest'
import type { CryptoNetwork } from '../subscription.schema'
import {
  copyToClipboard,
  getCurrencyDisplayName,
  getEvmChainId,
  getNetworkDisplayName,
  getNetworkFeeEstimate,
  getSubscriptionContractAddress,
  getUsdtContractAddress,
  getWalletType,
  isValidWalletAddress,
  shortenWalletAddress
} from '../lib/crypto-utils'

describe('subscription crypto utils', () => {
  it('shortens wallet addresses', () => {
    expect(shortenWalletAddress('0x1234567890abcdef')).toBe('0x1234...cdef')
    expect(shortenWalletAddress('0x1234')).toBe('0x1234')
  })

  it('returns display names and fees', () => {
    expect(getNetworkDisplayName('tron')).toBe('Tron (TRC-20)')
    expect(getNetworkFeeEstimate('ethereum')).toBe('~$5-20')
    expect(getCurrencyDisplayName('USDT')).toBe('Tether USD')
  })

  it('detects wallet types and chain IDs', () => {
    expect(getWalletType('ton')).toBe('tonconnect')
    expect(getWalletType('tron')).toBe('tron')
    expect(getWalletType('polygon')).toBe('evm')
    expect(getWalletType('bsc')).toBe('evm')
    expect(getWalletType('ethereum')).toBe('evm')
    expect(getEvmChainId('bsc')).toBe(56)
    expect(getEvmChainId('ethereum')).toBe(1)
    expect(getEvmChainId('polygon')).toBe(137)
    expect(getEvmChainId('ton')).toBeNull()
  })

  it('validates wallet addresses by network', () => {
    expect(isValidWalletAddress('EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA', 'ton')).toBe(
      true
    )
    expect(isValidWalletAddress('TQJd3sY7y9t1qg2o7m2b4n9n5r5d9v7v2t', 'tron')).toBe(true)
    expect(isValidWalletAddress('TQJd3sY7y9t1qg2o7m2b4n9n5r5d9v7v20', 'tron')).toBe(
      false
    )
    expect(isValidWalletAddress('0x4bbeEB066eD09B7AEd07bF39Ee0460DFa2615200', 'ethereum')).toBe(
      true
    )
    expect(isValidWalletAddress('0x123', 'ethereum')).toBe(false)
    expect(isValidWalletAddress('0x4bbeEB066eD09B7AEd07bF39Ee0460DFa2615200', 'bsc')).toBe(
      true
    )
    expect(isValidWalletAddress('0x4bbeEB066eD09B7AEd07bF39Ee0460DFa2615200', 'polygon')).toBe(
      true
    )
    expect(isValidWalletAddress('bad', 'ton')).toBe(false)
  })

  it('handles unknown networks with defaults', () => {
    const unknown = 'unknown' as CryptoNetwork
    expect(isValidWalletAddress('0x123', unknown)).toBe(false)
    expect(getUsdtContractAddress(unknown)).toBeNull()
    expect(getSubscriptionContractAddress(unknown)).toBeNull()
  })

  it('returns contract addresses', () => {
    expect(getUsdtContractAddress('tron')).toBe('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t')
    expect(getUsdtContractAddress('ton')).toContain('EQ')
    expect(getUsdtContractAddress('ethereum')).toContain('0x')
    expect(getUsdtContractAddress('bsc')).toContain('0x')
    expect(getUsdtContractAddress('polygon')).toContain('0x')
    expect(getSubscriptionContractAddress('tron')).toBeNull()
    expect(getSubscriptionContractAddress('ton')).toBeNull()
    expect(getSubscriptionContractAddress('ethereum')).toBeNull()
    expect(getSubscriptionContractAddress('bsc')).toBeNull()
    expect(getSubscriptionContractAddress('polygon')).toBeNull()
  })

  it('copies text to clipboard', async () => {
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    })

    const success = await copyToClipboard('wallet')
    expect(success).toBe(true)
    expect(writeText).toHaveBeenCalledWith('wallet')

    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', originalClipboard)
    } else {
      delete (navigator as { clipboard?: unknown }).clipboard
    }
  })

  it('returns false when clipboard copy fails', async () => {
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
    const writeText = vi.fn().mockRejectedValue(new Error('fail'))
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    })

    const success = await copyToClipboard('wallet')
    expect(success).toBe(false)

    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', originalClipboard)
    } else {
      delete (navigator as { clipboard?: unknown }).clipboard
    }
  })
})
