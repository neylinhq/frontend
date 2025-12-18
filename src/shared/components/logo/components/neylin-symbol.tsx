import { cn } from '@/shared/lib/cn'

interface NeylinSymbolProps {
  className?: string
}

export const NeylinSymbol = ({ className }: NeylinSymbolProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 32 32'
      className={cn('shrink-0', className)}
      aria-hidden='true'
    >
      <path
        stroke='currentColor'
        strokeLinecap='round'
        strokeWidth='1.4'
        d='m9 10 13-2m0 0-5 14m0 0L9 10'
      />
      <circle cx='9' cy='10' r='2.6' fill='currentColor' />
      <circle cx='22' cy='8' r='2.2' fill='currentColor' />
      <circle cx='17' cy='22' r='2.1' fill='currentColor' />
    </svg>
  )
}
