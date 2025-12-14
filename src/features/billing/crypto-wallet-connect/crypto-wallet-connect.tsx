import { Loader2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CryptoNetwork } from '@/entities/subscription'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/shared/components/dialog'
import { NetworkSelector } from './components/network-selector'
import { WalletConnectStep } from './components/wallet-connect-step'
import { useCryptoWallet } from './lib/use-crypto-wallet'

interface CryptoWalletConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (network: CryptoNetwork, address: string) => void
}

interface CryptoWalletConnectContentProps {
  onSuccess: (network: CryptoNetwork, address: string) => void
  onBack?: () => void
  embedded?: boolean
}

/**
 * SSR-safe wrapper - only renders the content that uses wallet hooks on client
 */
export const CryptoWalletConnectDialog = (props: CryptoWalletConnectDialogProps) => {
  const [mounted, setMounted] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Before hydration, show a simple loading dialog
  if (!mounted) {
    return (
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent className='sm:max-w-[480px]'>
          <DialogHeader>
            <DialogTitle>{t('billing.crypto.title')}</DialogTitle>
            <DialogDescription>{t('billing.crypto.description')}</DialogDescription>
          </DialogHeader>
          <div className='py-8 flex items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <DialogTitle>{t('billing.crypto.title')}</DialogTitle>
          <DialogDescription>{t('billing.crypto.description')}</DialogDescription>
        </DialogHeader>
        <CryptoWalletConnectContent onSuccess={props.onSuccess} />
      </DialogContent>
    </Dialog>
  )
}

/**
 * Inner component that uses wallet hooks - can be used standalone (embedded) or inside dialog
 * Only handles wallet connection, NOT payment
 */
export const CryptoWalletConnectContent = ({
  onSuccess,
  onBack: externalOnBack,
  embedded = false
}: CryptoWalletConnectContentProps) => {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  // State
  const [network, setNetwork] = useState<CryptoNetwork | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Crypto wallet hook - safe to call here, after hydration
  const wallet = useCryptoWallet(network)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Автоматически добавляем кошелек после подключения
  const prevConnected = useRef(wallet.isConnected)

  useEffect(() => {
    // Вызываем onSuccess только когда кошелек ПЕРЕХОДИТ из disconnected в connected
    // А не когда он уже был connected
    if (network && wallet.isConnected && wallet.address && !prevConnected.current) {
      onSuccess(network, wallet.address)
    }
    prevConnected.current = wallet.isConnected
  }, [network, wallet.isConnected, wallet.address, onSuccess])

  // Network selection - устанавливаем сеть, useEffect сработает и вызовет connect
  const handleNetworkSelect = useCallback(
    async (selectedNetwork: CryptoNetwork) => {
      // Disconnect current wallet if connected (important for EVM networks)
      if (wallet.isConnected) {
        await wallet.disconnect()
      }

      setNetwork(selectedNetwork)
      setError(null)
    },
    [wallet]
  )

  // Автоматически подключаемся когда выбрана сеть
  useEffect(() => {
    if (network && !wallet.isConnected && !wallet.isConnecting) {
      wallet.connect().catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to connect wallet')
      })
    }
  }, [network, wallet])

  // Скрытый элемент-коннектор для управления кошельком
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const WalletConnector = (wallet as any)._connector

  // Before mount, show loading
  if (!mounted) {
    return (
      <div className='py-8 flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <>
      {/* Скрытый коннектор кошелька */}
      {WalletConnector}

      {/* Content */}
      <div className='py-4'>
        {!network ? (
          // Выбор сети
          <NetworkSelector selected={network} onSelect={handleNetworkSelect} />
        ) : (
          // Подключение кошелька
          <WalletConnectStep
            network={network}
            isConnected={wallet.isConnected}
            isConnecting={wallet.isConnecting}
            address={wallet.address}
            onConnect={() => wallet.connect()}
            onDisconnect={() => {
              wallet.disconnect()
              setNetwork(null)
              setError(null)
            }}
            error={error}
          />
        )}
      </div>
    </>
  )
}
