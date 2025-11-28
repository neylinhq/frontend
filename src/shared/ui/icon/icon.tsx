import type { SVGProps } from 'react'
import { cn } from '@/shared/lib/cn'

export interface IconData {
  viewBox: string
  path: string | string[]
  displayName?: string
}

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'viewBox' | 'children'> {
  data: IconData
  size?: number | string
  className?: string
}

/**
 * Universal Icon component that adapts to currentColor
 * @example
 * <Icon data={visaIcon} size={24} className="text-blue-600" />
 */
export function Icon({ data, size = 24, className, ...props }: IconProps) {
  const sizeValue = typeof size === 'number' ? `${size}px` : size

  return (
    <svg
      role="img"
      viewBox={data.viewBox}
      xmlns="http://www.w3.org/2000/svg"
      width={sizeValue}
      height={sizeValue}
      fill="currentColor"
      className={cn('inline-block', className)}
      aria-label={data.displayName}
      {...props}
    >
      {data.displayName && <title>{data.displayName}</title>}
      {Array.isArray(data.path) ? (
        data.path.map((p, index) => <path key={index} d={p} />)
      ) : (
        <path d={data.path} />
      )}
    </svg>
  )
}
