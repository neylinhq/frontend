// Event for triggering layout recalculation
export const layoutEvent = new EventTarget()
export const triggerLayout = (options?: {
  fitView?: boolean
  useAnchor?: boolean
  animated?: boolean
}) => {
  const event = new CustomEvent('layout', {
    detail: {
      fitView: options?.fitView ?? true,
      useAnchor: options?.useAnchor ?? false,
      animated: options?.animated ?? false
    }
  })
  layoutEvent.dispatchEvent(event)
}
