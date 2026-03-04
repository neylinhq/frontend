import { PlusIcon } from '@untitledui/icons-react/outline'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/dialog'

import type { PaymentMethodInput } from '../lib/validation'
import { AddPaymentMethodContent, type CryptoWalletInput } from './add-payment-method-content'

interface AddPaymentMethodDialogProps {
  onAddCard: (data: PaymentMethodInput) => void
  onAddCrypto: (data: CryptoWalletInput) => void
  loading?: boolean
  trigger?: React.ReactNode
}

export const AddPaymentMethodDialog = ({
  onAddCard,
  onAddCrypto,
  loading,
  trigger
}: AddPaymentMethodDialogProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const handleAddCard = (data: PaymentMethodInput) => {
    onAddCard(data)
    setOpen(false)
  }

  const handleAddCrypto = (data: CryptoWalletInput) => {
    onAddCrypto(data)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size='sm'>
            <PlusIcon className='h-4 w-4 mr-2' />
            {t('settings.billing.paymentMethods.add')}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{t('billing.addPaymentMethod.selectTitle')}</DialogTitle>
          <DialogDescription>{t('billing.addPaymentMethod.selectDescription')}</DialogDescription>
        </DialogHeader>

        <AddPaymentMethodContent
          onAddCard={handleAddCard}
          onAddCrypto={handleAddCrypto}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  )
}
