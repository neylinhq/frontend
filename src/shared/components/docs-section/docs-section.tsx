import { DocsSectionHeader } from '@/shared/components/docs-section-header'

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
    <DocsSectionHeader title={title} description={description} />
    {children}
  </section>
)
