import { cva, type VariantProps } from 'class-variance-authority'
import { Link } from 'react-router'
import { cn } from '@/shared/lib/cn'
import { NeylinSymbol } from './components/neylin-symbol'

const logoVariants = cva('flex items-center select-none', {
  variants: {
    size: {
      xs: '[&_.logo-symbol]:size-5',
      sm: '[&_.logo-symbol]:size-6',
      md: '[&_.logo-symbol]:size-7',
      lg: '[&_.logo-symbol]:size-8',
      xl: '[&_.logo-symbol]:size-9',
      '2xl': '[&_.logo-symbol]:size-10',
      '3xl': '[&_.logo-symbol]:size-12',
      '4xl': '[&_.logo-symbol]:size-14'
    }
  },
  defaultVariants: {
    size: 'md'
  }
})

interface LogoProps extends VariantProps<typeof logoVariants> {
  className?: string
  href?: string | false
}

export const Logo = ({ size = 'md', className, href = '/' }: LogoProps) => {
  const content = <NeylinSymbol className='logo-symbol' />

  if (href === false) {
    return <div className={cn(logoVariants({ size, className }))}>{content}</div>
  }

  return (
    <Link to={href} className={cn(logoVariants({ size, className }))}>
      {content}
    </Link>
  )
}
