import { useEffect, useRef } from 'react'

interface LiveRegionProps {
  message: string
  assertive?: boolean
}

export const LiveRegion = ({ message, assertive = false }: LiveRegionProps) => {
  const regionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (message && regionRef.current) {
      // Clear and re-announce to ensure screen readers pick up the change
      regionRef.current.textContent = ''
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message
        }
      }, 100)
    }
  }, [message])

  return (
    <div
      ref={regionRef}
      role='status'
      aria-live={assertive ? 'assertive' : 'polite'}
      aria-atomic='true'
      className='sr-only'
    />
  )
}
