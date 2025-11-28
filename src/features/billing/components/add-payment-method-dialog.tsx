import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { CreditCard, Lock, Eye, EyeOff } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { CardBrandIcon } from './card-brand-icon'
import {
  addPaymentMethodSchema,
  type AddPaymentMethodValues,
  type PaymentMethodInput,
} from '../lib/validation'
import {
  formatCardNumber,
  formatExpiry,
  detectCardBrand,
  parseExpiry,
  type CardBrand,
} from '../lib/card-utils'
import { CARD_VALIDATION, getCvcLength, getCvcPlaceholder } from '../lib/card-validation'
import { cn } from '@/shared/lib/cn'

interface AddPaymentMethodDialogProps {
  onAdd: (data: PaymentMethodInput) => void
  loading?: boolean
  trigger?: React.ReactNode
}

export function AddPaymentMethodDialog({
  onAdd,
  loading,
  trigger,
}: AddPaymentMethodDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [showCvc, setShowCvc] = useState(false)
  const [cardBrand, setCardBrand] = useState<CardBrand>('unknown')

  const form = useForm<AddPaymentMethodValues>({
    resolver: zodResolver(addPaymentMethodSchema),
    defaultValues: {
      cardholderName: '',
      cardNumber: '',
      expiry: '',
      cvc: '',
    },
  })

  const handleCardNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
      const formatted = formatCardNumber(e.target.value)
      const brand = detectCardBrand(formatted)
      setCardBrand(brand)
      onChange(formatted)
    },
    []
  )

  const handleExpiryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
      const formatted = formatExpiry(e.target.value)
      onChange(formatted)
    },
    []
  )

  const handleSubmit = (values: AddPaymentMethodValues) => {
    const parsedExpiry = parseExpiry(values.expiry)
    if (!parsedExpiry) return

    // Don't allow unknown brand cards
    if (cardBrand === 'unknown') return

    const cardDigits = values.cardNumber.replace(/\D/g, '')

    const input: PaymentMethodInput = {
      cardholderName: values.cardholderName,
      cardNumber: cardDigits.slice(-4), // Only send last 4 for mock
      brand: cardBrand,
      expiryMonth: parseInt(parsedExpiry.month, 10),
      expiryYear: parseInt(parsedExpiry.year, 10),
    }

    onAdd(input)
    form.reset()
    setCardBrand('unknown')
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      form.reset()
      setCardBrand('unknown')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <CreditCard className="h-4 w-4 mr-2" />
            {t('settings.billing.paymentMethods.add')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t('billing.addPaymentMethod.title')}
          </DialogTitle>
          <DialogDescription>
            {t('billing.addPaymentMethod.description')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Cardholder Name */}
            <FormField
              control={form.control}
              name="cardholderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('billing.addPaymentMethod.cardholderName')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('form.placeholders.name')}
                      autoComplete="cc-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Card Number */}
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('billing.addPaymentMethod.cardNumber')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder={CARD_VALIDATION.CARD_NUMBER_PLACEHOLDER}
                        autoComplete="cc-number"
                        inputMode="numeric"
                        maxLength={CARD_VALIDATION.CARD_NUMBER_MAX_LENGTH}
                        className="pr-14"
                        {...field}
                        onChange={e => handleCardNumberChange(e, field.onChange)}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CardBrandIcon brand={cardBrand} size="sm" />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expiry and CVC */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('billing.addPaymentMethod.expiry')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={CARD_VALIDATION.EXPIRY_PLACEHOLDER}
                        autoComplete="cc-exp"
                        inputMode="numeric"
                        maxLength={CARD_VALIDATION.EXPIRY_MAX_LENGTH}
                        {...field}
                        onChange={e => handleExpiryChange(e, field.onChange)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cvc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      {t('billing.addPaymentMethod.cvc')}
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showCvc ? 'text' : 'password'}
                          placeholder={getCvcPlaceholder(cardBrand)}
                          autoComplete="cc-csc"
                          inputMode="numeric"
                          maxLength={getCvcLength(cardBrand)}
                          className="pr-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowCvc(!showCvc)}
                        >
                          {showCvc ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <Lock className="h-4 w-4 flex-shrink-0" />
              <span>{t('billing.addPaymentMethod.securityNotice')}</span>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={loading || !form.formState.isValid}
                className={cn(loading && 'opacity-70')}
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    {t('billing.addPaymentMethod.submit')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
