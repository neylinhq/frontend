import { cn } from '@/shared/lib/cn'

interface LoadingDotsProps {
  /** Size of each dot */
  size?: 'sm' | 'md' | 'lg'
  /** Color variant */
  variant?: 'default' | 'muted' | 'primary'
  className?: string
}

const sizeClasses = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5'
}

const variantClasses = {
  default: 'bg-foreground/60',
  muted: 'bg-muted-foreground/60',
  primary: 'bg-primary/60'
}

/**
 * Animated loading dots indicator
 * @example
 * <LoadingDots />
 * <LoadingDots size="lg" variant="primary" />
 */
export const LoadingDots = ({ size = 'md', variant = 'primary', className }: LoadingDotsProps) => {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span
        className={cn('rounded-full animate-pulse', sizeClasses[size], variantClasses[variant])}
        style={{ animationDelay: '0ms' }}
      />
      <span
        className={cn('rounded-full animate-pulse', sizeClasses[size], variantClasses[variant])}
        style={{ animationDelay: '150ms' }}
      />
      <span
        className={cn('rounded-full animate-pulse', sizeClasses[size], variantClasses[variant])}
        style={{ animationDelay: '300ms' }}
      />
    </div>
  )
}
