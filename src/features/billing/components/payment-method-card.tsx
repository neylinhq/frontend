import { useState } from 'react'
import { MoreVertical, Star, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
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
import type { PaymentMethod } from '@/entities/subscription'
import { cn } from '@/shared/lib/cn'
import { CardBrandIcon } from './card-brand-icon'
import type { CardBrand } from '../lib/card-utils'

interface PaymentMethodCardProps {
  method: PaymentMethod
  onRemove: (id: string) => void
  onSetDefault: (id: string) => void
  loading?: boolean
}

export function PaymentMethodCard({
  method,
  onRemove,
  onSetDefault,
  loading,
}: PaymentMethodCardProps) {
  const { t } = useTranslation()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const brand = (method.brand?.toLowerCase() || 'unknown') as CardBrand

  const handleDelete = () => {
    onRemove(method.id)
    setIsDeleteOpen(false)
  }

  const formatExpiry = () => {
    if (!method.expiryMonth || !method.expiryYear) return null
    return `${method.expiryMonth.toString().padStart(2, '0')}/${method.expiryYear.toString().slice(-2)}`
  }

  return (
    <>
      <div
        className={cn(
          'group relative flex items-start gap-3 px-4 py-3 rounded-lg border bg-card transition-all duration-200',
          'hover:shadow-sm hover:border-border/80',
          method.isDefault && 'ring-1 ring-primary/20'
        )}
      >
        {/* Brand Icon */}
        <div className="flex-shrink-0 pt-0.5">
          <CardBrandIcon brand={brand} size="sm" />
        </div>

        {/* Card Info - Responsive Layout */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* First Line: Card Number - Always in one line */}
          <div className="flex items-center">
            <span className="font-mono text-sm font-medium whitespace-nowrap">
              •••• •••• •••• {method.last4}
            </span>
          </div>

          {/* Second Line: Meta Info */}
          <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
            {formatExpiry() && (
              <span>
                {t('billing.expires')} {formatExpiry()}
              </span>
            )}
            <span className="capitalize">
              {method.brand || 'Card'}
            </span>
            {method.isDefault && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-muted">
                <Star className="h-3 w-3 fill-current" />
                {t('billing.defaultPaymentMethod')}
              </span>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              disabled={loading}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {!method.isDefault && (
              <>
                <DropdownMenuItem
                  onClick={() => onSetDefault(method.id)}
                  disabled={loading}
                >
                  <Star className="h-4 w-4 mr-2" />
                  {t('billing.setAsDefault')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              onClick={() => setIsDeleteOpen(true)}
              disabled={loading || method.isDefault}
              className={cn(
                'text-destructive focus:text-destructive',
                method.isDefault && 'opacity-50'
              )}
            >
              <Trash2 className="h-4 w-4 mr-2" />
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
              {t('billing.removePaymentMethod.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('billing.removePaymentMethod.description', {
                brand: method.brand || 'Card',
                last4: method.last4,
              })}
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
