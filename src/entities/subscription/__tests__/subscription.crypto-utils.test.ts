import { describe, expect, it, vi } from 'vitest'
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
  })

  it('returns display names and fees', () => {
    expect(getNetworkDisplayName('tron')).toBe('Tron (TRC-20)')
    expect(getNetworkFeeEstimate('ethereum')).toBe('~$5-20')
    expect(getCurrencyDisplayName('USDT')).toBe('Tether USD')
  })

  it('detects wallet types and chain IDs', () => {
    expect(getWalletType('ton')).toBe('tonconnect')
    expect(getWalletType('polygon')).toBe('evm')
    expect(getEvmChainId('bsc')).toBe(56)
    expect(getEvmChainId('ton')).toBeNull()
  })

  it('validates wallet addresses by network', () => {
    expect(isValidWalletAddress('EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA', 'ton')).toBe(
      true
    )
    expect(isValidWalletAddress('TQJd3sY7y9t1qg2o7m2b4n9n5r5d9v7v2t', 'tron')).toBe(false)
    expect(isValidWalletAddress('0x4bbeEB066eD09B7AEd07bF39Ee0460DFa2615200', 'ethereum')).toBe(
      true
    )
  })

  it('returns contract addresses', () => {
    expect(getUsdtContractAddress('tron')).toBe('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t')
    expect(getSubscriptionContractAddress('tron')).toBeNull()
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
})
