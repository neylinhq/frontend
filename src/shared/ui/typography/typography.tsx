import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/shared/lib/cn'

const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight',
      h2: 'scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0',
      h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
      h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
      h5: 'scroll-m-20 text-lg font-semibold tracking-tight',
      h6: 'scroll-m-20 text-base font-semibold tracking-tight',
      p: 'leading-7 [&:not(:first-child)]:mt-6',
      lead: 'text-xl text-muted-foreground',
      large: 'text-lg font-semibold',
      small: 'text-sm font-medium leading-none',
      muted: 'text-sm text-muted-foreground',
      xs: 'text-xs text-muted-foreground',
      code: 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
      blockquote: 'mt-6 border-l-2 pl-6 italic',
      list: 'my-6 ml-6 list-disc [&>li]:mt-2',
      'inline-code': 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm'
    }
  },
  defaultVariants: {
    variant: 'p'
  }
})

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  asChild?: boolean
  /** Кастомный HTML тег */
  as?: keyof JSX.IntrinsicElements
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, asChild = false, as, ...props }, ref) => {
    // Определяем дефолтный HTML элемент на основе variant
    const getDefaultElement = (): keyof JSX.IntrinsicElements => {
      if (as) return as
      switch (variant) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          return variant
        case 'lead':
        case 'large':
        case 'small':
        case 'muted':
        case 'xs':
        case 'p':
          return 'p'
        case 'code':
        case 'inline-code':
          return 'code'
        case 'blockquote':
          return 'blockquote'
        case 'list':
          return 'ul'
        default:
          return 'p'
      }
    }

    const Comp = asChild ? Slot : getDefaultElement()

    return (
      <Comp
        className={cn(typographyVariants({ variant, className }))}
        ref={ref as any}
        {...props}
      />
    )
  }
)
Typography.displayName = 'Typography'

export { Typography, typographyVariants }
