import * as React from 'react'
import { cn } from '@/shared/lib/cn'
import { Label } from '@/shared/ui/label'

interface FieldProps {
  label: string
  error?: string
  description?: string
  required?: boolean
  htmlFor?: string
  children: React.ReactElement
  className?: string
}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ label, error, description, required, htmlFor, children, className }, ref) => {
    const generatedId = React.useId()
    const id = htmlFor ?? generatedId
    const isInvalid = Boolean(error)

    // Clone child element to inject id and validation state
    const childWithProps = React.isValidElement(children)
      ? React.cloneElement(children, {
          id,
          'aria-invalid': isInvalid ? ('true' as const) : undefined
        } as React.Attributes & Record<string, unknown>)
      : children

    return (
      <div ref={ref} className={cn('space-y-1.5', className)}>
        <Label htmlFor={id} className={cn(isInvalid && 'text-destructive')}>
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
