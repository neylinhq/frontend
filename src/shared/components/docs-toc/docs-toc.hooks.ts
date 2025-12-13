import { useEffect, useState } from 'react'

/**
 * Hook to track which heading is currently active based on scroll position.
 * Uses IntersectionObserver to detect when headings enter/exit the viewport.
 */
export const useActiveHeading = (headingIds: string[]) => {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (headingIds.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        // Start detecting when heading is 80px from top
        // Stop detecting when heading is 80% down the viewport
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0
      }
    )

    headingIds.forEach(id => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [headingIds])

  return activeId
}
