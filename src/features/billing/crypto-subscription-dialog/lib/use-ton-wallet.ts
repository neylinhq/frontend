import { useCallback } from 'react'
import { useTonConnectUI, useTonWallet as useTonWalletOriginal } from '@tonconnect/ui-react'
import type { CryptoNetwork } from '@/entities/subscription'

// TON USDT (jUSDT) jetton master address
const JUSDT_MASTER = 'EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA'

// Subscription contract address (будет задеплоен)
const SUBSCRIPTION_CONTRACT = 'EQ...' // TODO: replace after deploy

export const useTonWalletConnect = (network: CryptoNetwork | null) => {
  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWalletOriginal()

  const isActive = network === 'ton'

  const handleConnect = useCallback(async () => {
    if (!isActive) return
    await tonConnectUI.openModal()
  }, [isActive, tonConnectUI])

  const handleDisconnect = useCallback(async () => {
    await tonConnectUI.disconnect()
  }, [tonConnectUI])

  // Approve + Subscribe в TON делается одной транзакцией через jetton transfer
  // с forward payload для контракта подписки
  const subscribe = useCallback(async (orderId: string, amount: bigint) => {
    if (!wallet) throw new Error('Wallet not connected')

    // Сумма в наноджеттонах (USDT имеет 6 decimals)
    const amountNano = amount.toString()

    // Forward payload с orderId для контракта подписки
    const forwardPayload = Buffer.from(orderId.replace(/-/g, ''), 'hex').toString('base64')

    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 600, // 10 минут
      messages: [
        {
          address: JUSDT_MASTER,
          amount: '50000000', // 0.05 TON для комиссии
          payload: buildJettonTransferPayload(
            SUBSCRIPTION_CONTRACT,
            amountNano,
            forwardPayload
          )
        }
      ]
    }

    const result = await tonConnectUI.sendTransaction(transaction)
    return result.boc
  }, [wallet, tonConnectUI])

  return {
    address: wallet?.account?.address ?? null,
    isConnected: !!wallet,
    isConnecting: false, // TonConnect UI handles this internally
    connect: handleConnect,
    disconnect: handleDisconnect,
    subscribe
  }
}

// Helper: Build jetton transfer payload (TL-B encoded)
function buildJettonTransferPayload(
  destination: string,
  amount: string,
  forwardPayload: string
): string {
  // Simplified payload builder
  // В production использовать @ton/ton библиотеку для корректной сериализации
  const payload = {
    op: 0xf8a7ea5, // jetton transfer op
    queryId: Date.now(),
    amount,
    destination,
    responseDestination: destination,
    forwardTonAmount: '1', // 0.000000001 TON
    forwardPayload
  }

  // Base64 encoded cell (упрощённо)
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}
