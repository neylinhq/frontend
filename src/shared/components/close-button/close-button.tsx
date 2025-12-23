import { XCloseIcon } from '@untitledui/icons-react/outline'
import { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'

type CloseButtonSize = 'sm' | 'md' | 'lg'

interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: CloseButtonSize
}

const sizeClasses: Record<CloseButtonSize, string> = {
  sm: 'h-6 w-6 [&>svg]:h-3 [&>svg]:w-3',
  md: 'h-8 w-8 [&>svg]:h-4 [&>svg]:w-4',
  lg: 'h-10 w-10 [&>svg]:h-5 [&>svg]:w-5'
}

export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  ({ className, size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      type='button'
      className={cn(
        'inline-flex items-center justify-center rounded-md',
        'cursor-pointer',
        'opacity-70 hover:opacity-100',
        'transition-opacity',
        'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <XCloseIcon />
      <span className='sr-only'>Close</span>
    </button>
  )
)
CloseButton.displayName = 'CloseButton'
