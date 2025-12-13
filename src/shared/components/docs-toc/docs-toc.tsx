import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/lib/cn'
import styles from './docs-toc.module.css'
import { useActiveHeading } from './docs-toc.hooks'

export interface TocItem {
  id: string
  title: string
  level: 2 | 3
}

interface DocsTocProps {
  items: TocItem[]
  className?: string
}

export const DocsToc = ({ items, className }: DocsTocProps) => {
  const { t } = useTranslation()
  const activeId = useActiveHeading(items.map(item => item.id))

  if (items.length === 0) {
    return null
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Update URL hash without jumping
      window.history.pushState(null, '', `#${id}`)
    }
  }

  return (
    <nav className={cn('space-y-1', className)}>
      <p className='text-sm font-medium mb-4 text-foreground'>{t('docs.onThisPage')}</p>
      {items.map(item => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={e => handleClick(e, item.id)}
          className={cn(
            styles.item,
            item.level === 3 && 'pl-4',
            activeId === item.id && styles.itemActive
          )}
        >
          {item.title}
        </a>
      ))}
    </nav>
  )
}
