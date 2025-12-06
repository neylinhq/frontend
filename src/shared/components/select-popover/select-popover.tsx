import { Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/shared/components/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/popover'
import { cn } from '@/shared/lib/cn'

export type SelectPopoverItem<T extends string = string> = {
  value: T
  label: string
  icon?: React.ReactNode
  color?: string
}

type SelectPopoverProps<T extends string = string> = {
  items: SelectPopoverItem<T>[]
  value: T
  onChange: (value: T) => void
  trigger?: React.ReactNode
  /** Hide label and chevron in trigger, show only icon/color */
  compact?: boolean
  placeholder?: string
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

export const SelectPopover = <T extends string = string>({
  items,
  value,
  onChange,
  trigger,
  compact = false,
  placeholder = 'Select...',
  align = 'start',
  side = 'bottom',
  className
}: SelectPopoverProps<T>) => {
  const [open, setOpen] = useState(false)
  const selectedItem = items.find(item => item.value === value)

  const handleSelect = (itemValue: T) => {
    onChange(itemValue)
    setOpen(false)
  }

  const renderIcon = (item: SelectPopoverItem<T>) => {
    if (item.color) {
      return (
        <span
          className='h-4 w-4 rounded-full border border-border flex-shrink-0'
          style={{ backgroundColor: item.color }}
        />
      )
    }
    if (item.icon) {
      return <span className='flex-shrink-0 [&>svg]:h-4 [&>svg]:w-4'>{item.icon}</span>
    }
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button
            variant='outline'
            size='sm'
            className={cn(compact ? 'px-2' : 'min-w-[100px]', className)}
          >
            <span className='flex items-center gap-1.5'>
              {selectedItem ? (
                <>
                  {renderIcon(selectedItem)}
                  {!compact && <span className='truncate'>{selectedItem.label}</span>}
                </>
              ) : (
                <span className='text-muted-foreground'>{placeholder}</span>
              )}
            </span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align={align} side={side} className='w-auto min-w-[140px] p-1'>
        <div className='flex flex-col'>
          {items.map(item => (
            <button
              type='button'
              key={item.value}
              onClick={() => handleSelect(item.value)}
              className={cn(
                'flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:bg-accent focus-visible:text-accent-foreground',
                'cursor-pointer transition-colors'
              )}
            >
              {renderIcon(item)}
              <span className='flex-1 text-left'>{item.label}</span>
              {value === item.value && <Check className='h-4 w-4 text-brand flex-shrink-0' />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
