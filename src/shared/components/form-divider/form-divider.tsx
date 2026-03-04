import type * as React from 'react'

import { cn } from '@/shared/lib/cn'

interface FormDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export const FormDivider = ({ children, className, ...props }: FormDividerProps) => {
  if (!children) {
    return (
      <div className={cn('relative py-4', className)} {...props}>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)} {...props}>
      <div className='absolute inset-0 flex items-center'>
        <span className='w-full border-t' />
      </div>
      <div className='relative flex justify-center text-xs uppercase'>
        <span className='bg-background px-2 text-muted-foreground'>{children}</span>
      </div>
    </div>
  )
}
