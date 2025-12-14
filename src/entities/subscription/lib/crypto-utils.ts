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
    tron: '~$1-3',
    bsc: '~$0.10',
    polygon: '~$0.01',
    ethereum: '~$5-20'
  }
  return fees[network]
}

/**
 * Wallet types for different networks
 */
export type WalletType = 'tonconnect' | 'evm' | 'tron'

/**
 * Get the wallet type for network
 */
export const getWalletType = (network: CryptoNetwork): WalletType => {
  switch (network) {
    case 'ton':
      return 'tonconnect'
    case 'tron':
      return 'tron'
    case 'bsc':
    case 'polygon':
    case 'ethereum':
      return 'evm'
  }
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
      // Tron: T followed by 33 base58 characters
      return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)
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

/**
 * Get chain ID for EVM networks
 */
export const getEvmChainId = (network: CryptoNetwork): number | null => {
  switch (network) {
    case 'ethereum':
      return 1
    case 'bsc':
      return 56
    case 'polygon':
      return 137
    default:
      return null
  }
}

/**
 * USDT contract addresses per network
 */
export const getUsdtContractAddress = (network: CryptoNetwork): string | null => {
  switch (network) {
    case 'ton':
      return 'EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA' // jUSDT
    case 'tron':
      return 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' // USDT TRC-20
    case 'ethereum':
      return '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDT ERC-20
    case 'bsc':
      return '0x55d398326f99059fF775485246999027B3197955' // USDT BEP-20
    case 'polygon':
      return '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' // USDT on Polygon
    default:
      return null
  }
}

/**
 * Subscription contract addresses per network
 * TODO: Update after deploying contracts to testnet/mainnet
 */
export const getSubscriptionContractAddress = (network: CryptoNetwork): string | null => {
  switch (network) {
    case 'ton':
      return null // TODO: Deploy TON contract
    case 'tron':
      return null // TODO: Deploy TRON contract
    case 'ethereum':
      return null // TODO: Deploy Ethereum contract
    case 'bsc':
      return null // TODO: Deploy BSC contract
    case 'polygon':
      return null // TODO: Deploy Polygon contract
    default:
      return null
  }
}
