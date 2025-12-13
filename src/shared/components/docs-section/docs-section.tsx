import { Typography } from '@/shared/components/typography'

interface DocsSectionProps {
  id: string
  title: string
  description?: string
  bordered?: boolean
  children: React.ReactNode
}

export const DocsSection = ({
  id,
  title,
  description,
  bordered = false,
  children
}: DocsSectionProps) => (
  <section id={id} className={`scroll-mt-20 space-y-4 ${bordered ? 'pt-6 border-t' : ''}`}>
    <div>
      <Typography variant='h2'>{title}</Typography>
      {description && <Typography variant='muted'>{description}</Typography>}
    </div>
    {children}
  </section>
)
