import { useEffect, useRef } from 'react'

const LIVE_REGION_DELAY_MS = 100

interface LiveRegionProps {
  message: string
  assertive?: boolean
}

export const LiveRegion = ({ message, assertive = false }: LiveRegionProps) => {
  const regionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!message || !regionRef.current) {
      return
    }

    // Clear and re-announce to ensure screen readers pick up the change
    regionRef.current.textContent = ''

    const timeoutId = setTimeout(() => {
      if (regionRef.current) {
        regionRef.current.textContent = message
      }
    }, LIVE_REGION_DELAY_MS)

    return () => clearTimeout(timeoutId)
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
