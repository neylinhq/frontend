import { EyeIcon, EyeOffIcon } from '@untitledui/icons-react/outline'
import * as React from 'react'

import { cn } from '@/shared/lib/cn'

interface InputProps extends React.ComponentProps<'input'> {
  hidePasswordToggle?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, hidePasswordToggle = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === 'password'

    const togglePasswordVisibility = () => {
      setShowPassword(prev => !prev)
    }

    if (isPassword && !hidePasswordToggle) {
      return (
        <div className='relative'>
          <input
            type={showPassword ? 'text' : 'password'}
            className={cn(
              'flex h-9 w-full rounded-md border border-input bg-transparent px-input py-input pr-10 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
              'aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive',
              className
            )}
            ref={ref}
            {...props}
          />
          <button
            type='button'
            onClick={togglePasswordVisibility}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none'
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon className='h-4 w-4' /> : <EyeIcon className='h-4 w-4' />}
          </button>
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-input py-input text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
