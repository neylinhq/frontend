import { MoreVertical, Pencil, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { PaymentMethod } from '@/entities/subscription'
import { cn } from '@/shared/lib/cn'
import type { CardBrand } from '@/shared/lib/card-utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/shared/components/alert-dialog'
import { Button } from '@/shared/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/components/dropdown-menu'
import { cryptoIcons, Icon } from '@/shared/components/icon'
import { CardBrandIcon } from '@/shared/components/card-brand-icon'

interface PaymentMethodCardProps {
  method: PaymentMethod
  onRemove: (id: string) => void
  onSetDefault: (id: string) => void
  onEdit?: (method: PaymentMethod) => void
  loading?: boolean
}

export const PaymentMethodCard = ({
  method,
  onRemove,
  onSetDefault,
  onEdit,
  loading
}: PaymentMethodCardProps) => {
  const { t } = useTranslation()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const handleDelete = () => {
    onRemove(method.id)
    setIsDeleteOpen(false)
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
        return <Icon data={iconData} size={24} className='text-foreground' />
      }
      return null
    }
    const brand = (method.brand?.toLowerCase() || 'unknown') as CardBrand
    return <CardBrandIcon brand={brand} size='sm' />
  }

  const renderIdentifier = () => {
    if (method.type === 'crypto') {
      return (
        <span className='font-mono text-sm font-medium whitespace-nowrap'>
          {method.walletAddressShort}
        </span>
      )
    }
    return (
      <span className='font-mono text-sm font-medium whitespace-nowrap'>•••• {method.last4}</span>
    )
  }

  return (
    <>
      <div
        className={cn(
          'group relative flex items-center gap-3 px-4 py-3 rounded-lg border bg-card transition-all duration-200',
          'hover:shadow-sm hover:border-border/80',
          method.isDefault && 'ring-1 ring-primary/20'
        )}
      >
        {/* Left Side: Payment Method Info */}
        <div className='flex-1 flex flex-wrap items-center gap-3'>
          {renderIcon()}
          {renderIdentifier()}

          {method.isDefault && (
            <span className='inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground whitespace-nowrap'>
              <Star className='h-3 w-3 fill-current' />
              {t('billing.defaultPaymentMethod')}
            </span>
          )}
        </div>

        {/* Right Side: Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0'
              disabled={loading}
            >
              <MoreVertical className='h-4 w-4' />
              <span className='sr-only'>Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            {onEdit && (
              <>
                <DropdownMenuItem onClick={() => onEdit(method)} disabled={loading}>
                  <Pencil className='h-4 w-4 mr-2' />
                  {t('common.edit')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {!method.isDefault && (
              <DropdownMenuItem onClick={() => onSetDefault(method.id)} disabled={loading}>
                <Star className='h-4 w-4 mr-2' />
                {t('billing.setAsDefault')}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => setIsDeleteOpen(true)}
              disabled={loading || method.isDefault}
              className={cn(
                'text-destructive focus:text-destructive',
                method.isDefault && 'opacity-50'
              )}
            >
              <Trash2 className='h-4 w-4 mr-2' />
              {t('billing.removePaymentMethod.confirm')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
