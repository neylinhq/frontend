import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { useCallback, useEffect } from 'react'
import type { CryptoNetwork } from '@/entities/subscription'
import type { CryptoWallet } from './use-crypto-wallet'

// TON USDT (jUSDT) jetton master address
const JUSDT_MASTER = 'EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA'
const CONNECT_TIMEOUT_MS = 60000

// Subscription contract address (будет задеплоен)
const SUBSCRIPTION_CONTRACT = 'EQ...' // TODO: replace after deploy

interface TonWalletConnectorProps {
  network: CryptoNetwork
  onWalletChange: (wallet: CryptoWallet) => void
}

export const TonWalletConnector = ({ onWalletChange }: TonWalletConnectorProps) => {
  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWallet()

  const handleConnect = useCallback(async () => {
    const wasConnected = !!wallet

    // Subscribe to modal state and wallet changes
    return new Promise<void>((resolve, reject) => {
      let modalWasOpen = false
      let resolved = false

      // Listen for modal state changes
      const unsubscribeModal = tonConnectUI.onModalStateChange((state) => {
        if (state.open) {
          modalWasOpen = true
        } else if (modalWasOpen && !resolved) {
          // Modal closed - check if wallet connected
          setTimeout(() => {
            const currentWallet = tonConnectUI.wallet
            if (!currentWallet && !wasConnected) {
              // User closed modal without connecting
              resolved = true
              unsubscribeModal()
              unsubscribeWallet()
              reject(new Error('User closed modal'))
            }
          }, 300) // Small delay to let state update
        }
      })

      // Listen for wallet status changes
      const unsubscribeWallet = tonConnectUI.onStatusChange((walletInfo) => {
        if (walletInfo && !resolved) {
          // Wallet connected successfully
          resolved = true
          unsubscribeModal()
          unsubscribeWallet()
          resolve()
        }
      })

      // Open modal
      tonConnectUI.openModal().catch((err) => {
        if (!resolved) {
          resolved = true
          unsubscribeModal()
          unsubscribeWallet()
          reject(err)
        }
      })

      // Timeout after 60 seconds
      setTimeout(() => {
        if (!resolved) {
          resolved = true
          unsubscribeModal()
          unsubscribeWallet()
          reject(new Error('Connection timeout'))
        }
      }, CONNECT_TIMEOUT_MS)
    })
  }, [tonConnectUI, wallet])

  const handleDisconnect = useCallback(async () => {
    await tonConnectUI.disconnect()
  }, [tonConnectUI])

  // Approve + Subscribe в TON делается одной транзакцией через jetton transfer
  const subscribe = useCallback(
    async (orderId: string, amount: bigint) => {
      if (!wallet) {
        throw new Error('Wallet not connected')
      }

      const amountNano = amount.toString()
      const forwardPayload = Buffer.from(orderId.replace(/-/g, ''), 'hex').toString('base64')

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: JUSDT_MASTER,
            amount: '50000000', // 0.05 TON для комиссии
            payload: buildJettonTransferPayload(SUBSCRIPTION_CONTRACT, amountNano, forwardPayload)
          }
        ]
      }

      const result = await tonConnectUI.sendTransaction(transaction)
      return result.boc
    },
    [wallet, tonConnectUI]
  )

  // Обновляем родительский компонент при изменении состояния
  useEffect(() => {
    onWalletChange({
      address: wallet?.account?.address ?? null,
      isConnected: !!wallet,
      isConnecting: false,
      connect: handleConnect,
      disconnect: handleDisconnect,
      subscribe
    })
  }, [wallet, handleConnect, handleDisconnect, subscribe, onWalletChange])

  return null
}

// Helper: Build jetton transfer payload
function buildJettonTransferPayload(
  destination: string,
  amount: string,
  forwardPayload: string
): string {
  const payload = {
    op: 0xf8a7ea5,
    queryId: Date.now(),
    amount,
    destination,
    responseDestination: destination,
    forwardTonAmount: '1',
    forwardPayload
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}
