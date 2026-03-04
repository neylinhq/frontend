/**
 * Formats a crypto wallet address to a shortened version
 * @param address - Full wallet address
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Shortened address like "0x0D11...4aD6"
 */
export const shortenWalletAddress = (address: string, startChars = 6, endChars = 4): string => {
  if (!address || address.length <= startChars + endChars) {
    return address
  }

  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}
