import { CreditCard } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { Icon, paymentBrandIcons } from '@/shared/components/icon'

import type { CardBrand } from '../lib/card-utils'

interface CardBrandIconProps {
  brand: CardBrand | string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 40
}

export const CardBrandIcon = ({ brand, className, size = 'md' }: CardBrandIconProps) => {
  const normalizedBrand = brand.toLowerCase()
  const iconData = paymentBrandIcons[normalizedBrand]

  if (iconData) {
    return (
      <Icon data={iconData} size={sizeMap[size]} className={cn('text-foreground', className)} />
    )
  }

  // Fallback to generic card icon
  return (
    <div className={cn('flex items-center justify-center bg-muted rounded border', className)}>
      <CreditCard className='h-4 w-4 text-muted-foreground' />
    </div>
  )
}
