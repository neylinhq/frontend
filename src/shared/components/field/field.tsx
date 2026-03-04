import * as React from 'react'

import { Label } from '@/shared/components/label'
import { cn } from '@/shared/lib/cn'

interface FieldProps {
  label: React.ReactNode
  error?: string
  description?: string
  required?: boolean
  htmlFor?: string
  children: React.ReactElement
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** Custom classes for the label element */
  labelClassName?: string
}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  (
    {
      label,
      error,
      description,
      required,
      htmlFor,
      children,
      size = 'md',
      className,
      labelClassName
    },
    ref
  ) => {
    const generatedId = React.useId()
    const id = htmlFor ?? generatedId
    const isInvalid = Boolean(error)
    const spacingClass = size === 'sm' ? 'space-y-1' : size === 'lg' ? 'space-y-2' : 'space-y-1.5'

    // Clone child element to inject id and validation state
    const childWithProps = React.isValidElement(children)
      ? React.cloneElement(children, {
          id,
          'aria-invalid': isInvalid ? ('true' as const) : undefined
        } as React.Attributes & Record<string, unknown>)
      : children

    return (
      <div ref={ref} className={cn(spacingClass, className)}>
        <Label htmlFor={id} className={cn(isInvalid && 'text-destructive', labelClassName)}>
          {label}
          {required && <span className='text-destructive ml-1'>*</span>}
        </Label>

        {childWithProps}

        {!isInvalid && description && (
          <p className='text-sm text-muted-foreground'>{description}</p>
        )}

        {isInvalid && <p className='text-sm font-medium text-destructive'>{error}</p>}
      </div>
    )
  }
)

Field.displayName = 'Field'

export { Field }
export type { FieldProps }
