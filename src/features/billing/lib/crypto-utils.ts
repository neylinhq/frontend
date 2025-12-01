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
    bitcoin: 'Bitcoin',
    ethereum: 'Ethereum',
    solana: 'Solana',
    tron: 'Tron'
  }
  return names[network]
}

/**
 * Get the currency display name
 */
export const getCurrencyDisplayName = (currency: CryptoCurrency) => {
  const names: Record<CryptoCurrency, string> = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    USDT: 'Tether',
    USDC: 'USD Coin',
    SOL: 'Solana'
  }
  return names[currency]
}

/**
 * Validate wallet address format based on network
 */
export const isValidWalletAddress = (address: string, network: CryptoNetwork) => {
  switch (network) {
    case 'ethereum':
    case 'tron':
      // Ethereum: 0x followed by 40 hex characters
      // Tron: T followed by 33 characters (base58)
      if (network === 'ethereum') {
        return /^0x[a-fA-F0-9]{40}$/.test(address)
      }
      return /^T[a-zA-Z0-9]{33}$/.test(address)
    case 'bitcoin':
      // Bitcoin: Legacy (1...), SegWit (3...), Native SegWit (bc1...)
      return /^(1|3)[a-zA-Z0-9]{25,34}$/.test(address) || /^bc1[a-zA-Z0-9]{39,59}$/.test(address)
    case 'solana':
      // Solana: Base58, 32-44 characters
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
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
