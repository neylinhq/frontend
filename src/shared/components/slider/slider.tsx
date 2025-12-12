import * as SliderPrimitive from '@radix-ui/react-slider'
import * as React from 'react'

import { cn } from '@/shared/lib/cn'

const thumbClassName =
  'block h-4 w-4 cursor-grab rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  /** Number of thumbs to render (1 for single, 2 for range) */
  thumbCount?: number
}

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, thumbCount, ...props }, ref) => {
    // Auto-detect thumb count from value array length, or use explicit thumbCount
    const count = thumbCount ?? (Array.isArray(props.value) ? props.value.length : 1)

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn('relative flex w-full touch-none select-none items-center', className)}
        {...props}
      >
        <SliderPrimitive.Track className='relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20'>
          <SliderPrimitive.Range className='absolute h-full bg-primary' />
        </SliderPrimitive.Track>
        {Array.from({ length: count }).map((_, i) => (
          <SliderPrimitive.Thumb key={i} className={thumbClassName} />
        ))}
      </SliderPrimitive.Root>
    )
  }
)
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
