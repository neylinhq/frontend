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
    ton: 'TON'
  }
  return names[network]
}

/**
 * Get network fee estimate (approximate)
 */
export const getNetworkFeeEstimate = (network: CryptoNetwork): string => {
  const fees: Record<CryptoNetwork, string> = {
    ton: '~$0.01'
  }
  return fees[network]
}

/**
 * Get the wallet type for network
 */
export const getWalletType = (network: CryptoNetwork): 'tonconnect' => {
  return 'tonconnect'
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
