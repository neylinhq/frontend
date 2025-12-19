import { Download01Icon } from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'
import type { PaymentHistory } from '@/entities/subscription'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/table'

interface PaymentHistoryTableProps {
  payments: PaymentHistory[]
}

export const PaymentHistoryTable = ({ payments }: PaymentHistoryTableProps) => {
  const { t } = useTranslation()

  // Ensure payments is always an array
  const paymentList = Array.isArray(payments) ? payments : []

  const formatAmount = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadgeVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'succeeded':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'failed':
        return 'destructive'
      case 'refunded':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  if (paymentList.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('billing.paymentHistory.title')}</CardTitle>
          <CardDescription className='text-balance'>
            {t('billing.paymentHistory.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground text-center py-8'>
            {t('billing.paymentHistory.empty')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('billing.paymentHistory.title')}</CardTitle>
        <CardDescription className='text-balance'>
          {t('billing.paymentHistory.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('billing.paymentHistory.date')}</TableHead>
              <TableHead>{t('billing.paymentHistory.desc')}</TableHead>
              <TableHead>{t('billing.paymentHistory.amount')}</TableHead>
              <TableHead>{t('billing.paymentHistory.status')}</TableHead>
              <TableHead className='text-right'>{t('billing.paymentHistory.invoice')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentList.map(payment => (
              <TableRow key={payment.id}>
                <TableCell className='font-medium'>{formatDate(payment.createdAt)}</TableCell>
                <TableCell>{payment.description}</TableCell>
                <TableCell>{formatAmount(payment.amount, payment.currency)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(payment.status)}>
                    {t(`billing.paymentStatus.${payment.status}`)}
                  </Badge>
                </TableCell>
                <TableCell className='text-right'>
                  {payment.invoiceUrl && (
                    <Button variant='ghost' size='sm' asChild>
                      <a href={payment.invoiceUrl} target='_blank' rel='noopener noreferrer'>
                        <Download01Icon className='h-4 w-4 mr-2' />
                        {t('billing.paymentHistory.download')}
                      </a>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
