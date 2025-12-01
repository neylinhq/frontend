import { useTranslation } from 'react-i18next'
import { getMeta } from '@/shared/lib/get-meta'
import { Badge } from '@/shared/ui/badge'
import { DocsBreadcrumbs } from '@/shared/ui/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/ui/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/ui/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/ui/docs-toc'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/ui/table'
import { Typography } from '@/shared/ui/typography'
import type { Route } from './+types/table'

export const handle = {
  breadcrumb: 'Table'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const TablePage = () => {
  const { t } = useTranslation()

  const TOC_ITEMS: TocItem[] = [
    { id: 'basic', title: t('docs.common.basic'), level: 2 },
    { id: 'usage', title: t('docs.common.usage'), level: 2 },
    { id: 'api-reference', title: t('docs.common.apiReference'), level: 2 }
  ]

  const invoices = [
    {
      invoice: 'INV001',
      status: t('docs.table.basic.paid'),
      method: t('docs.table.basic.creditCard'),
      amount: '$250.00'
    },
    {
      invoice: 'INV002',
      status: t('docs.table.basic.pending'),
      method: t('docs.table.basic.paypal'),
      amount: '$150.00'
    },
    {
      invoice: 'INV003',
      status: t('docs.table.basic.unpaid'),
      method: t('docs.table.basic.bankTransfer'),
      amount: '$350.00'
    },
    {
      invoice: 'INV004',
      status: t('docs.table.basic.paid'),
      method: t('docs.table.basic.creditCard'),
      amount: '$450.00'
    }
  ]

  return (
    <div className='flex gap-10'>
      <div className='flex-1 min-w-0 space-y-10'>
        <header className='space-y-4'>
          <DocsBreadcrumbs
            items={[
              { label: t('docs.common.components'), href: '/docs/ui/button' },
              { label: 'Table' }
            ]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Table</Typography>
            <Badge variant='brand'>{t('docs.common.component')}</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            {t('docs.table.lead')}
          </Typography>
        </header>

        <section id='basic' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>{t('docs.common.basic')}</Typography>
          <DocsComponentPreview
            code={`<Table>
  <TableCaption>${t('docs.table.basic.caption')}</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>${t('docs.table.basic.invoice')}</TableHead>
      <TableHead>${t('docs.table.basic.status')}</TableHead>
      <TableHead>${t('docs.table.basic.method')}</TableHead>
      <TableHead className="text-right">${t('docs.table.basic.amount')}</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {invoices.map((invoice) => (
      <TableRow key={invoice.invoice}>
        <TableCell className="font-medium">{invoice.invoice}</TableCell>
        <TableCell>{invoice.status}</TableCell>
        <TableCell>{invoice.method}</TableCell>
        <TableCell className="text-right">{invoice.amount}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>`}
          >
            <DocsPreview className='p-0 overflow-auto'>
              <Table>
                <TableCaption>{t('docs.table.basic.caption')}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[100px]'>{t('docs.table.basic.invoice')}</TableHead>
                    <TableHead>{t('docs.table.basic.status')}</TableHead>
                    <TableHead>{t('docs.table.basic.method')}</TableHead>
                    <TableHead className='text-right'>{t('docs.table.basic.amount')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map(invoice => (
                    <TableRow key={invoice.invoice}>
                      <TableCell className='font-medium'>{invoice.invoice}</TableCell>
                      <TableCell>{invoice.status}</TableCell>
                      <TableCell>{invoice.method}</TableCell>
                      <TableCell className='text-right'>{invoice.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='usage' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>{t('docs.common.usage')}</Typography>
          <DocsCodeBlock
            language='tsx'
            code={`import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

export function UsersTable({ users }: { users: User[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}`}
          />
        </section>

        <section id='api-reference' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>{t('docs.common.apiReference')}</Typography>
          <div className='rounded-lg border overflow-hidden'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/50'>
                <tr>
                  <th className='text-left px-4 py-3 font-medium'>{t('docs.common.component')}</th>
                  <th className='text-left px-4 py-3 font-medium'>
                    {t('docs.common.description')}
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>Table</code>
                  </td>
                  <td className='px-4 py-3'>{t('docs.table.api.tableDescription')}</td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>TableHeader</code>
                  </td>
                  <td className='px-4 py-3'>{t('docs.table.api.headerDescription')}</td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>TableBody</code>
                  </td>
                  <td className='px-4 py-3'>{t('docs.table.api.bodyDescription')}</td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>TableRow</code>
                  </td>
                  <td className='px-4 py-3'>{t('docs.table.api.rowDescription')}</td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>TableHead</code>
                  </td>
                  <td className='px-4 py-3'>{t('docs.table.api.headDescription')}</td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>TableCell</code>
                  </td>
                  <td className='px-4 py-3'>{t('docs.table.api.cellDescription')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <DocsToc items={TOC_ITEMS} className='hidden xl:block' />
    </div>
  )
}

export default TablePage
