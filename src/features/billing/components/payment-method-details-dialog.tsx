import { Copy, Pencil, Star, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { PaymentMethod, UpdatePaymentMethodInput } from '@/entities/subscription'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { cryptoIcons, Icon } from '@/shared/ui/icon'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import type { CardBrand } from '../lib/card-utils'
import {
  copyToClipboard,
  getCurrencyDisplayName,
  getNetworkDisplayName,
  isValidWalletAddress
} from '../lib/crypto-utils'
import { CardBrandIcon } from './card-brand-icon'

interface PaymentMethodDetailsDialogProps {
  method: PaymentMethod | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRemove: (id: string) => void
  onSetDefault: (id: string) => void
  onUpdate?: (input: UpdatePaymentMethodInput) => void
  loading?: boolean
  updateLoading?: boolean
}

export const PaymentMethodDetailsDialog = ({
  method,
  open,
  onOpenChange,
  onRemove,
  onSetDefault,
  onUpdate,
  loading,
  updateLoading
}: PaymentMethodDetailsDialogProps) => {
  const { t } = useTranslation()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Edit form state for crypto only (cards are view-only)
  const [editWalletAddress, setEditWalletAddress] = useState('')
  const [addressError, setAddressError] = useState<string | null>(null)

  // Reset edit state when method changes or dialog opens
  useEffect(() => {
    if (method && open) {
      if (method.type === 'crypto') {
        setEditWalletAddress(method.walletAddress)
        setAddressError(null)
      }
      setIsEditing(false)
    }
  }, [method, open])

  if (!method) {
    return null
  }

  const formatExpiry = () => {
    if (method.type !== 'card') {
      return null
    }
    if (!method.expiryMonth || !method.expiryYear) {
      return null
    }
    return `${method.expiryMonth.toString().padStart(2, '0')}/${method.expiryYear.toString().slice(-2)}`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return null
    }
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
    if (method.type !== 'crypto') {
      return
    }
    const success = await copyToClipboard(method.walletAddress)
    if (success) {
      toast.success(t('billing.addressCopied'))
    }
  }

  const handleStartEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    // Reset to original values (only crypto is editable)
    if (method.type === 'crypto') {
      setEditWalletAddress(method.walletAddress)
      setAddressError(null)
    }
    setIsEditing(false)
  }

  const handleSaveEdit = () => {
    if (!onUpdate || method.type !== 'crypto') {
      return
    }

    // Validate wallet address
    if (!isValidWalletAddress(editWalletAddress, method.network)) {
      setAddressError(t('billing.addCryptoWallet.invalidAddress'))
      return
    }
    onUpdate({
      id: method.id,
      walletAddress: editWalletAddress
    })
    setIsEditing(false)
  }

  const getDeleteDescription = () => {
    if (method.type === 'crypto') {
      return t('billing.removeCryptoWallet.description', {
        currency: method.currency,
        address: method.walletAddressShort
      })
    }
    return t('billing.removePaymentMethod.description', {
      brand: method.brand || 'Card',
      last4: method.last4
    })
  }

  const renderIcon = () => {
    if (method.type === 'crypto') {
      const iconData = cryptoIcons[method.currency.toLowerCase()]
      if (iconData) {
        return <Icon data={iconData} size={40} className='text-foreground' />
      }
      return null
    }
    const brand = (method.brand?.toLowerCase() || 'unknown') as CardBrand
    return <CardBrandIcon brand={brand} size='lg' />
  }

  const renderCardDetails = () => {
    if (method.type !== 'card') {
      return null
    }

    // Cards are view-only (no edit mode)
    return (
      <>
        <div className='flex flex-col items-center gap-4 py-4'>
          {renderIcon()}
          <span className='font-mono text-lg font-medium'>•••• •••• •••• {method.last4}</span>
        </div>

        <div className='space-y-3 text-sm'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>{t('billing.type')}</span>
            <span className='font-medium capitalize'>{method.brand || 'Card'}</span>
          </div>
          {formatExpiry() && (
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>{t('billing.expires')}</span>
              <span className='font-medium'>{formatExpiry()}</span>
            </div>
          )}
          {method.createdAt && (
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>{t('billing.added')}</span>
              <span className='font-medium'>{formatDate(method.createdAt)}</span>
            </div>
          )}
        </div>
      </>
    )
  }

  const renderCryptoDetails = () => {
    if (method.type !== 'crypto') {
      return null
    }

    if (isEditing) {
      return (
        <>
          <div className='flex flex-col items-center gap-4 py-4'>{renderIcon()}</div>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label>{t('billing.editPaymentMethod.walletAddress')}</Label>
              <Input
                value={editWalletAddress}
                onChange={e => {
                  setEditWalletAddress(e.target.value)
                  setAddressError(null)
                }}
                placeholder={t('billing.addCryptoWallet.addressPlaceholder')}
                className='font-mono text-sm'
              />
              {addressError && <p className='text-sm text-destructive'>{addressError}</p>}
            </div>

            <div className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>{t('billing.network')}</span>
                <span className='font-medium'>{getNetworkDisplayName(method.network)}</span>
              </div>
              <span className='text-xs text-muted-foreground'>
                {t('billing.editPaymentMethod.networkNotEditable')}
              </span>
            </div>
          </div>
        </>
      )
    }

    return (
      <>
        <div className='flex flex-col items-center gap-4 py-4'>
          {renderIcon()}
          <div className='flex flex-col items-center gap-2'>
            <span className='font-mono text-sm text-muted-foreground break-all text-center px-4'>
              {method.walletAddress}
            </span>
            <Button variant='ghost' size='sm' onClick={handleCopyAddress} className='h-8'>
              <Copy className='h-4 w-4 mr-2' />
              {t('billing.copyAddress')}
            </Button>
          </div>
        </div>

        <div className='space-y-3 text-sm'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>{t('billing.network')}</span>
            <span className='font-medium'>{getNetworkDisplayName(method.network)}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>{t('billing.currency')}</span>
            <span className='font-medium'>{getCurrencyDisplayName(method.currency)}</span>
          </div>
          {method.createdAt && (
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>{t('billing.added')}</span>
              <span className='font-medium'>{formatDate(method.createdAt)}</span>
            </div>
          )}
        </div>
      </>
    )
  }

  const getDialogTitle = () => {
    if (isEditing && method.type === 'crypto') {
      return t('billing.editPaymentMethod.titleCrypto')
    }
    return method.type === 'crypto' ? t('billing.cryptoWallet') : t('billing.paymentMethod')
  }

  // Only crypto wallets can be edited
  const canEdit = method.type === 'crypto' && onUpdate

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>

          <div className='space-y-6'>
            {renderCardDetails()}
            {renderCryptoDetails()}

            {/* Actions */}
            {isEditing && canEdit ? (
              <div className='flex gap-3 pt-2'>
                <Button
                  variant='outline'
                  className='flex-1'
                  onClick={handleCancelEdit}
                  disabled={updateLoading}
                >
                  {t('common.cancel')}
                </Button>
                <Button className='flex-1' onClick={handleSaveEdit} disabled={updateLoading}>
                  {t('billing.editPaymentMethod.save')}
                </Button>
              </div>
            ) : (
              <div className='flex flex-col gap-2 pt-2'>
                {canEdit && (
                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={handleStartEdit}
                    disabled={loading}
                  >
                    <Pencil className='h-4 w-4 mr-2' />
                    {t('common.edit')}
                  </Button>
                )}
                {!method.isDefault && (
                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={handleSetDefault}
                    disabled={loading}
                  >
                    <Star className='h-4 w-4 mr-2' />
                    {t('billing.setAsDefault')}
                  </Button>
                )}
                <Button
                  variant='outline'
                  className='w-full text-destructive hover:text-destructive'
                  onClick={() => setIsDeleteOpen(true)}
                  disabled={loading || method.isDefault}
                >
                  <Trash2 className='h-4 w-4 mr-2' />
                  {t('common.remove')}
                </Button>
              </div>
            )}
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
            <AlertDialogDescription>{getDeleteDescription()}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {t('billing.removePaymentMethod.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
