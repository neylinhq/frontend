import { Typography } from '@/shared/components/typography'

interface DocsSectionHeaderProps {
  title: string
  description?: string
}

export const DocsSectionHeader = ({ title, description }: DocsSectionHeaderProps) => (
  <div className='space-y-2'>
    <Typography variant='h2'>{title}</Typography>
    {description && <Typography variant='muted'>{description}</Typography>}
  </div>
)
