import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Wallet } from 'lucide-react'
import { z } from 'zod'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Icon, cryptoIcons } from '@/shared/ui/icon'

import { isValidWalletAddress, shortenWalletAddress, getNetworkDisplayName, getCurrencyDisplayName } from '../lib/crypto-utils'

import type { CryptoNetwork, CryptoCurrency } from '@/entities/subscription'

const CRYPTO_OPTIONS: { currency: CryptoCurrency; network: CryptoNetwork }[] = [
  { currency: 'BTC', network: 'bitcoin' },
  { currency: 'ETH', network: 'ethereum' },
  { currency: 'USDT', network: 'ethereum' },
  { currency: 'USDC', network: 'ethereum' },
  { currency: 'SOL', network: 'solana' },
]

const addCryptoWalletSchema = z.object({
  currency: z.enum(['BTC', 'ETH', 'USDT', 'USDC', 'SOL']),
  walletAddress: z.string().min(20, 'Invalid wallet address'),
})

type AddCryptoWalletValues = z.infer<typeof addCryptoWalletSchema>

export interface CryptoWalletInput {
  currency: CryptoCurrency
  network: CryptoNetwork
  walletAddress: string
  walletAddressShort: string
}

interface AddCryptoWalletDialogProps {
  onAdd: (data: CryptoWalletInput) => void
  loading?: boolean
  trigger?: React.ReactNode
}

export function AddCryptoWalletDialog({
  onAdd,
  loading,
  trigger,
}: AddCryptoWalletDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const form = useForm<AddCryptoWalletValues>({
    resolver: zodResolver(addCryptoWalletSchema),
    defaultValues: {
      currency: 'ETH',
      walletAddress: '',
    },
  })

  const selectedCurrency = form.watch('currency')
  const selectedOption = CRYPTO_OPTIONS.find(o => o.currency === selectedCurrency)
  const selectedNetwork = selectedOption?.network || 'ethereum'

  const onSubmit = (values: AddCryptoWalletValues) => {
    const network = CRYPTO_OPTIONS.find(o => o.currency === values.currency)?.network || 'ethereum'

    if (!isValidWalletAddress(values.walletAddress, network)) {
      form.setError('walletAddress', {
        type: 'manual',
        message: t('billing.addCryptoWallet.invalidAddress'),
      })
      return
    }

    onAdd({
      currency: values.currency,
      network,
      walletAddress: values.walletAddress,
      walletAddressShort: shortenWalletAddress(values.walletAddress),
    })

    setOpen(false)
    form.reset()
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      form.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Wallet className="h-4 w-4 mr-2" />
            {t('billing.addCryptoWallet.title')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('billing.addCryptoWallet.title')}</DialogTitle>
          <DialogDescription>
            {t('billing.addCryptoWallet.description')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('billing.currency')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('billing.addCryptoWallet.selectCurrency')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CRYPTO_OPTIONS.map((option) => {
                        const iconData = cryptoIcons[option.currency.toLowerCase()]
                        return (
                          <SelectItem key={option.currency} value={option.currency}>
                            <div className="flex items-center gap-2">
                              {iconData && (
                                <Icon data={iconData} size={16} className="text-foreground" />
                              )}
                              <span>{getCurrencyDisplayName(option.currency)}</span>
                              <span className="text-muted-foreground">({option.currency})</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-sm text-muted-foreground">
              {t('billing.network')}: {getNetworkDisplayName(selectedNetwork)}
            </div>

            <FormField
              control={form.control}
              name="walletAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('billing.walletAddress')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('billing.addCryptoWallet.addressPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {t('billing.addCryptoWallet.submit')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
