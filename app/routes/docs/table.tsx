import { Badge } from '@/shared/components/badge'
import { DocsBreadcrumbs } from '@/shared/components/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/components/docs-toc'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/table'
import { Typography } from '@/shared/components/typography'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/table'

export const handle = {
  breadcrumb: 'Table'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const TablePage = () => {
  const TOC_ITEMS: TocItem[] = [
    { id: 'basic', title: 'Basic', level: 2 },
    { id: 'usage', title: 'Usage', level: 2 },
    { id: 'api-reference', title: 'API Reference', level: 2 }
  ]

  const invoices = [
    {
      invoice: 'INV001',
      status: 'Paid',
      method: 'Credit Card',
      amount: '$250.00'
    },
    {
      invoice: 'INV002',
      status: 'Pending',
      method: 'PayPal',
      amount: '$150.00'
    },
    {
      invoice: 'INV003',
      status: 'Unpaid',
      method: 'Bank Transfer',
      amount: '$350.00'
    },
    {
      invoice: 'INV004',
      status: 'Paid',
      method: 'Credit Card',
      amount: '$450.00'
    }
  ]

  return (
    <div className='flex gap-10'>
      <div className='flex-1 min-w-0 space-y-10'>
        <header className='space-y-4'>
          <DocsBreadcrumbs
            items={[{ label: 'Components', href: '/docs/ui/button' }, { label: 'Table' }]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Table</Typography>
            <Badge variant='brand'>Component</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            Semantic table component for displaying tabular data with proper structure and styling.
          </Typography>
        </header>

        <section id='basic' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Basic</Typography>
          <DocsComponentPreview
            code={`<Table>
  <TableCaption>Recent invoices</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Method</TableHead>
      <TableHead className="text-right">Amount</TableHead>
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
                <TableCaption>Recent invoices</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[100px]'>Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className='text-right'>Amount</TableHead>
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
          <Typography variant='h2'>Usage</Typography>
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
} from '@/shared/components/table'

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
          <Typography variant='h2'>API Reference</Typography>
          <div className='rounded-lg border overflow-hidden'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/50'>
                <tr>
                  <th className='text-left px-4 py-3 font-medium'>Component</th>
                  <th className='text-left px-4 py-3 font-medium'>Description</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>Table</code>
                  </td>
                  <td className='px-4 py-3 text-xs text-muted-foreground'>
                    Root table container
                  </td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>TableHeader</code>
                  </td>
                  <td className='px-4 py-3 text-xs text-muted-foreground'>
                    Table header section
                  </td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>TableBody</code>
                  </td>
                  <td className='px-4 py-3 text-xs text-muted-foreground'>Table body section</td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>TableRow</code>
                  </td>
                  <td className='px-4 py-3 text-xs text-muted-foreground'>Table row</td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>TableHead</code>
                  </td>
                  <td className='px-4 py-3 text-xs text-muted-foreground'>Header cell</td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>TableCell</code>
                  </td>
                  <td className='px-4 py-3 text-xs text-muted-foreground'>Data cell</td>
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
