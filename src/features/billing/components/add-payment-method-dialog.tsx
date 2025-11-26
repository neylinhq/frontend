import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CreditCard } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Field } from '@/shared/ui/field'

interface AddPaymentMethodDialogProps {
  onAdd: (data: {
    cardNumber: string
    expiryMonth: string
    expiryYear: string
    cvc: string
    name: string
  }) => void
  loading?: boolean
  trigger?: React.ReactNode
}

export function AddPaymentMethodDialog({ onAdd, loading, trigger }: AddPaymentMethodDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiryMonth, setExpiryMonth] = useState('')
  const [expiryYear, setExpiryYear] = useState('')
  const [cvc, setCvc] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      cardNumber,
      expiryMonth,
      expiryYear,
      cvc,
      name
    })
    // Reset form
    setCardNumber('')
    setExpiryMonth('')
    setExpiryYear('')
    setCvc('')
    setName('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <CreditCard className="h-4 w-4 mr-2" />
            {t('settings.billing.paymentMethods.add')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('billing.addPaymentMethod.title')}</DialogTitle>
          <DialogDescription>{t('billing.addPaymentMethod.description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <Field label={t('billing.addPaymentMethod.cardholderName')} required>
              <Input
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </Field>
            <Field label={t('billing.addPaymentMethod.cardNumber')} required>
              <Input
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                maxLength={19}
                required
              />
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label={t('billing.addPaymentMethod.expiryMonth')} required>
                <Input
                  placeholder="MM"
                  value={expiryMonth}
                  onChange={e => setExpiryMonth(e.target.value)}
                  maxLength={2}
                  required
                />
              </Field>
              <Field label={t('billing.addPaymentMethod.expiryYear')} required>
                <Input
                  placeholder="YYYY"
                  value={expiryYear}
                  onChange={e => setExpiryYear(e.target.value)}
                  maxLength={4}
                  required
                />
              </Field>
              <Field label={t('billing.addPaymentMethod.cvc')} required>
                <Input
                  placeholder="123"
                  value={cvc}
                  onChange={e => setCvc(e.target.value)}
                  maxLength={4}
                  required
                />
              </Field>
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? t('common.loading') : t('billing.addPaymentMethod.submit')}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full">
              {t('common.cancel')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
