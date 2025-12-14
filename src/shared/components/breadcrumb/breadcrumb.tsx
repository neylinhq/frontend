import { ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

interface BreadcrumbProps {
  parentLabel: string
  currentLabel: string
  onBack: () => void
  disabled?: boolean
  className?: string
}

export const Breadcrumb = ({
  parentLabel,
  currentLabel,
  onBack,
  disabled,
  className
}: BreadcrumbProps) => {
  return (
    <div className={cn('flex items-center gap-1.5 text-sm', className)}>
      <button
        type='button'
        onClick={onBack}
        disabled={disabled}
        className='text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed'
      >
        {parentLabel}
      </button>
      <ChevronRight className='h-3.5 w-3.5 text-muted-foreground' />
      <span className='text-foreground'>{currentLabel}</span>
    </div>
  )
}
