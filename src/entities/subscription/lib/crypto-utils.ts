import type { CryptoCurrency, CryptoNetwork } from '@/entities/subscription'

/**
 * Shorten a wallet address for display
 * @param address - Full wallet address
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 */
export const shortenWalletAddress = (address: string, startChars = 6, endChars = 4) => {
  if (address.length <= startChars + endChars + 3) {
    return address
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

/**
 * Get the network name for display
 */
export const getNetworkDisplayName = (network: CryptoNetwork) => {
  const names: Record<CryptoNetwork, string> = {
    ton: 'TON',
    tron: 'Tron (TRC-20)',
    bsc: 'BNB Smart Chain (BEP-20)',
    polygon: 'Polygon',
    ethereum: 'Ethereum (ERC-20)'
  }
  return names[network]
}

/**
 * Get network fee estimate (approximate)
 */
export const getNetworkFeeEstimate = (network: CryptoNetwork): string => {
  const fees: Record<CryptoNetwork, string> = {
    ton: '~$0.01',
    tron: '~$0.50',
    bsc: '~$0.10',
    polygon: '~$0.01',
    ethereum: '~$2-10'
  }
  return fees[network]
}

/**
 * Get the wallet type for network
 */
export const getWalletType = (network: CryptoNetwork): 'tonconnect' | 'evm' | 'tron' => {
  if (network === 'ton') return 'tonconnect'
  if (network === 'tron') return 'tron'
  return 'evm' // bsc, polygon, ethereum
}

/**
 * Get the currency display name
 */
export const getCurrencyDisplayName = (currency: CryptoCurrency) => {
  const names: Record<CryptoCurrency, string> = {
    USDT: 'Tether USD'
  }
  return names[currency]
}

/**
 * Validate wallet address format based on network
 */
export const isValidWalletAddress = (address: string, network: CryptoNetwork) => {
  switch (network) {
    case 'ton':
      // TON: EQ... or UQ... followed by 46 characters (base64)
      return /^[EU]Q[a-zA-Z0-9_-]{46}$/.test(address)
    case 'tron':
      // Tron: T followed by 33 characters (base58)
      return /^T[a-zA-Z0-9]{33}$/.test(address)
    case 'bsc':
    case 'polygon':
    case 'ethereum':
      // EVM: 0x followed by 40 hex characters
      return /^0x[a-fA-F0-9]{40}$/.test(address)
    default:
      return false
  }
}

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
