import { cva, type VariantProps } from 'class-variance-authority'
import { Link } from 'react-router'
import { APP_NAME } from '@/shared/config'
import { cn } from '@/shared/lib/cn'

const logoVariants = cva(
  'flex items-baseline gap-1 select-none transition-colors hover:text-foreground/80',
  {
    variants: {
      size: {
        xs: '[&_.logo-name]:text-xs [&_.logo-alpha]:text-[6px]',
        sm: '[&_.logo-name]:text-sm [&_.logo-alpha]:text-[7px]',
        base: '[&_.logo-name]:text-base [&_.logo-alpha]:text-[8px]',
        lg: '[&_.logo-name]:text-lg [&_.logo-alpha]:text-[9px]',
        xl: '[&_.logo-name]:text-xl [&_.logo-alpha]:text-[10px]',
        '2xl': '[&_.logo-name]:text-2xl [&_.logo-alpha]:text-xs',
        '3xl': '[&_.logo-name]:text-3xl [&_.logo-alpha]:text-sm',
        '4xl': '[&_.logo-name]:text-4xl [&_.logo-alpha]:text-base',
        '5xl': '[&_.logo-name]:text-5xl [&_.logo-alpha]:text-lg',
        '6xl': '[&_.logo-name]:text-6xl [&_.logo-alpha]:text-xl',
        '7xl': '[&_.logo-name]:text-7xl [&_.logo-alpha]:text-2xl',
        '8xl': '[&_.logo-name]:text-8xl [&_.logo-alpha]:text-3xl',
        '9xl': '[&_.logo-name]:text-9xl [&_.logo-alpha]:text-4xl'
      }
    },
    defaultVariants: {
      size: 'base'
    }
  }
)

interface LogoProps extends VariantProps<typeof logoVariants> {
  className?: string
  showAlpha?: boolean
  href?: string | false
}

export const Logo = ({ size, className, showAlpha = false, href = '/' }: LogoProps) => {
  const content = (
    <>
      <span className='logo-name font-semibold tracking-tight'>{APP_NAME}</span>
      {showAlpha && (
        <span className='logo-alpha text-muted-foreground/60 font-light tracking-wider'>alpha</span>
      )}
    </>
  )

  if (href === false) {
    return <div className={cn(logoVariants({ size, className }))}>{content}</div>
  }

  return (
    <Link to={href} className={cn(logoVariants({ size, className }))}>
      {content}
    </Link>
  )
}
