import { Loading02Icon } from '@untitledui/icons-react/outline'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CryptoNetwork } from '@/entities/subscription'
import { getEvmChainId, getWalletType } from '@/entities/subscription/lib/crypto-utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/shared/components/dialog'

import { useCryptoWallet } from '../model/crypto-wallet-connect.hooks.tsx'
import { NetworkSelector } from './network-selector'
import { WalletConnectStep } from './wallet-connect-step'

interface CryptoWalletConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (network: CryptoNetwork, address: string) => void
}

interface CryptoWalletConnectContentProps {
  onSuccess: (network: CryptoNetwork, address: string) => void
  onBack?: () => void
  loading?: boolean
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
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>{t('billing.crypto.title')}</DialogTitle>
            <DialogDescription>{t('billing.crypto.description')}</DialogDescription>
          </DialogHeader>
          <div className='py-8 flex items-center justify-center'>
            <Loading02Icon className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
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
  loading,
  embedded = false
}: CryptoWalletConnectContentProps) => {
  const [mounted, setMounted] = useState(false)

  // State
  const [network, setNetwork] = useState<CryptoNetwork | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userRejected, setUserRejected] = useState(false)
  const [isConnectingLocal, setIsConnectingLocal] = useState(false)

  // Crypto wallet hook - safe to call here, after hydration
  const wallet = useCryptoWallet(network)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Автоматически сохраняем кошелек при успешном подключении
  const hasAutoSavedRef = useRef(false)
  useEffect(() => {
    if (!network || !wallet.isConnected || !wallet.address) {
      hasAutoSavedRef.current = false
      return
    }

    // Для EVM кошельков - проверяем, что chainId соответствует выбранной сети
    const walletType = getWalletType(network)
    if (walletType === 'evm') {
      const expectedChainId = getEvmChainId(network)
      if (wallet.chainId !== expectedChainId) {
        return
      }
    }

    // Сохраняем только один раз при подключении
    if (!hasAutoSavedRef.current) {
      hasAutoSavedRef.current = true
      onSuccess(network, wallet.address)
    }
  }, [network, wallet.isConnected, wallet.address, wallet.chainId, onSuccess])

  // Кнопка "Add Wallet" - только для повторного вызова окна провайдера
  const handleAddWallet = useCallback(() => {
    setUserRejected(false)
    setError(null)
    setIsConnectingLocal(true)
    wallet
      .connect()
      .catch(err => {
        if (err && typeof err === 'object' && 'code' in err && err.code === 4001) {
          setUserRejected(true)
          setError('Connection cancelled')
        } else {
          setError(err instanceof Error ? err.message : 'Failed to connect wallet')
        }
      })
      .finally(() => {
        setIsConnectingLocal(false)
      })
  }, [wallet])

  // Network selection - устанавливаем сеть и делаем разовую попытку подключения
  const handleNetworkSelect = useCallback((selectedNetwork: CryptoNetwork) => {
    setNetwork(selectedNetwork)
    setError(null)
    setUserRejected(false) // Сбрасываем флаг отказа при выборе новой сети
  }, [])

  // Автоматически вызываем окно провайдера при выборе сети (если пользователь не отменял)
  useEffect(() => {
    if (
      network &&
      !wallet.isConnected &&
      !wallet.isConnecting &&
      !userRejected &&
      !isConnectingLocal
    ) {
      setIsConnectingLocal(true)
      wallet
        .connect()
        .catch(err => {
          // Проверяем код ошибки - 4001 = User rejected
          if (err && typeof err === 'object' && 'code' in err && err.code === 4001) {
            setUserRejected(true)
            setError('Connection cancelled')
          } else {
            setError(err instanceof Error ? err.message : 'Failed to connect wallet')
          }
        })
        .finally(() => {
          setIsConnectingLocal(false)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, wallet.isConnected, wallet.isConnecting, userRejected, isConnectingLocal])

  // Скрытый элемент-коннектор для управления кошельком
  const WalletConnector = wallet._connector

  // Before mount, show loading
  if (!mounted) {
    return (
      <div className='py-8 flex items-center justify-center'>
        <Loading02Icon className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  const handleBackToNetworkSelect = () => {
    wallet.disconnect()
    setNetwork(null)
    setError(null)
  }

  // Smart back handler: if on network selection, go to parent; if on wallet connect, go to network selection
  const handleBack = () => {
    if (network) {
      // On wallet connect step -> back to network selection
      handleBackToNetworkSelect()
    } else {
      // On network selection step -> back to parent (card/crypto choice)
      if (externalOnBack) {
        externalOnBack()
      }
    }
  }

  return (
    <>
      {/* Скрытый коннектор кошелька */}
      <div>{WalletConnector}</div>

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
            onConnect={() => {
              setUserRejected(false) // Сбрасываем флаг при ручном подключении
              setError(null)
              setIsConnectingLocal(true)
              wallet
                .connect()
                .catch(err => {
                  if (err && typeof err === 'object' && 'code' in err && err.code === 4001) {
                    setUserRejected(true)
                    setError('Connection cancelled')
                  } else {
                    setError(err instanceof Error ? err.message : 'Failed to connect wallet')
                  }
                })
                .finally(() => {
                  setIsConnectingLocal(false)
                })
            }}
            onDisconnect={handleBackToNetworkSelect}
            onAddWallet={handleAddWallet}
            error={error}
          />
        )}
      </div>
    </>
  )
}
