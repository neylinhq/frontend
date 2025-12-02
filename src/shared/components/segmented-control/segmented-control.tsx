import { cn } from '@/shared/lib/cn'

interface SegmentedControlOption<T extends string> {
  value: T
  label: string
  count?: number
}

interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: SegmentedControlOption<T>[]
  className?: string
}

export const SegmentedControl = <T extends string>({
  value,
  onChange,
  options,
  className
}: SegmentedControlProps<T>) => {
  return (
    <div className={cn('flex gap-1.5 rounded-lg bg-muted/50 p-1 w-fit', className)}>
      {options.map(option => (
        <button
          key={option.value}
          type='button'
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer',
            value === option.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <span
              className={cn(
                'ml-1.5 tabular-nums',
                value === option.value ? 'text-muted-foreground' : 'opacity-60'
              )}
            >
              {option.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
