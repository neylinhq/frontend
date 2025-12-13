export interface ApiTableRow {
  name: string
  description?: string
  type?: string
  defaultValue?: string
}

interface DocsApiTableProps {
  variant: 'component' | 'props'
  rows: ApiTableRow[]
}

export const DocsApiTable = ({ variant, rows }: DocsApiTableProps) => {
  const headers = variant === 'component' ? ['Component', 'Description'] : ['Prop', 'Type', 'Default']

  return (
    <div className='rounded-lg border overflow-hidden'>
      <table className='w-full text-sm'>
        <thead className='bg-muted/50'>
          <tr>
            {headers.map(h => (
              <th key={h} className='text-left px-4 py-3 font-medium'>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y'>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className='px-4 py-3'>
                <code className='text-sm font-semibold text-brand'>{row.name}</code>
              </td>
              {variant === 'component' ? (
                <td className='px-4 py-3'>
                  <code className='text-xs text-muted-foreground'>{row.description}</code>
                </td>
              ) : (
                <>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>{row.type}</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs bg-muted px-1.5 py-0.5 rounded'>{row.defaultValue}</code>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
