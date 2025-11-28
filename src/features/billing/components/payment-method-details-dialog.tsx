import { useState } from 'react'
import { Copy, Star, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Icon, cryptoIcons } from '@/shared/ui/icon'

import { CardBrandIcon } from './card-brand-icon'
import { copyToClipboard, getNetworkDisplayName, getCurrencyDisplayName } from '../lib/crypto-utils'

import type { PaymentMethod } from '@/entities/subscription'
import type { CardBrand } from '../lib/card-utils'

interface PaymentMethodDetailsDialogProps {
  method: PaymentMethod | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRemove: (id: string) => void
  onSetDefault: (id: string) => void
  loading?: boolean
}

export function PaymentMethodDetailsDialog({
  method,
  open,
  onOpenChange,
  onRemove,
  onSetDefault,
  loading,
}: PaymentMethodDetailsDialogProps) {
  const { t } = useTranslation()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  if (!method) return null

  const formatExpiry = () => {
    if (method.type !== 'card') return null
    if (!method.expiryMonth || !method.expiryYear) return null
    return `${method.expiryMonth.toString().padStart(2, '0')}/${method.expiryYear.toString().slice(-2)}`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleDelete = () => {
    onRemove(method.id)
    setIsDeleteOpen(false)
    onOpenChange(false)
  }

  const handleSetDefault = () => {
    onSetDefault(method.id)
  }

  const handleCopyAddress = async () => {
    if (method.type !== 'crypto') return
    const success = await copyToClipboard(method.walletAddress)
    if (success) {
      toast.success(t('billing.addressCopied'))
    }
  }

  const getDeleteDescription = () => {
    if (method.type === 'crypto') {
      return t('billing.removeCryptoWallet.description', {
        currency: method.currency,
        address: method.walletAddressShort,
      })
    }
    return t('billing.removePaymentMethod.description', {
      brand: method.brand || 'Card',
      last4: method.last4,
    })
  }

  const renderIcon = () => {
    if (method.type === 'crypto') {
      const iconData = cryptoIcons[method.currency.toLowerCase()]
      if (iconData) {
        return <Icon data={iconData} size={40} className="text-foreground" />
      }
      return null
    }
    const brand = (method.brand?.toLowerCase() || 'unknown') as CardBrand
    return <CardBrandIcon brand={brand} size="lg" />
  }

  const renderCardDetails = () => {
    if (method.type !== 'card') return null
    return (
      <>
        <div className="flex flex-col items-center gap-4 py-4">
          {renderIcon()}
          <span className="font-mono text-lg font-medium">
            •••• •••• •••• {method.last4}
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('billing.type')}</span>
            <span className="font-medium capitalize">{method.brand || 'Card'}</span>
          </div>
          {formatExpiry() && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('billing.expires')}</span>
              <span className="font-medium">{formatExpiry()}</span>
            </div>
          )}
          {method.createdAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('billing.added')}</span>
              <span className="font-medium">{formatDate(method.createdAt)}</span>
            </div>
          )}
        </div>
      </>
    )
  }

  const renderCryptoDetails = () => {
    if (method.type !== 'crypto') return null
    return (
      <>
        <div className="flex flex-col items-center gap-4 py-4">
          {renderIcon()}
          <div className="flex flex-col items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground break-all text-center px-4">
              {method.walletAddress}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyAddress}
              className="h-8"
            >
              <Copy className="h-4 w-4 mr-2" />
              {t('billing.copyAddress')}
            </Button>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('billing.network')}</span>
            <span className="font-medium">{getNetworkDisplayName(method.network)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('billing.currency')}</span>
            <span className="font-medium">{getCurrencyDisplayName(method.currency)}</span>
          </div>
          {method.createdAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('billing.added')}</span>
              <span className="font-medium">{formatDate(method.createdAt)}</span>
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {method.type === 'crypto'
                ? t('billing.cryptoWallet')
                : t('billing.paymentMethod')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {renderCardDetails()}
            {renderCryptoDetails()}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {!method.isDefault && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleSetDefault}
                  disabled={loading}
                >
                  <Star className="h-4 w-4 mr-2" />
                  {t('billing.setAsDefault')}
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1 text-destructive hover:text-destructive"
                onClick={() => setIsDeleteOpen(true)}
                disabled={loading || method.isDefault}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('common.remove')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {method.type === 'crypto'
                ? t('billing.removeCryptoWallet.title')
                : t('billing.removePaymentMethod.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getDeleteDescription()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('billing.removePaymentMethod.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
