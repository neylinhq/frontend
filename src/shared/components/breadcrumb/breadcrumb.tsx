import { ChevronLeftIcon } from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/lib/cn'

interface BreadcrumbProps {
  onBack: () => void
  disabled?: boolean
  className?: string
}

export const Breadcrumb = ({ onBack, disabled, className }: BreadcrumbProps) => {
  const { t } = useTranslation()

  return (
    <button
      type='button'
      onClick={onBack}
      disabled={disabled}
      className={cn(
        'flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      <ChevronLeftIcon className='h-3.5 w-3.5' />
      <span>{t('common.back')}</span>
    </button>
  )
}
