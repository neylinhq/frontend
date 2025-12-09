import { useViewport } from '@xyflow/react'
import { createContext, memo, useContext, useRef, type ReactNode } from 'react'

/**
 * Graph Viewport Context
 *
 * CRITICAL PERFORMANCE OPTIMIZATION:
 * Instead of each node/edge calling useViewport() (which causes re-render on EVERY viewport change),
 * we have ONE subscriber at the top level that provides zoom via context.
 *
 * KEY INSIGHT: Context updates still cause re-renders of all consumers.
 * So we use a ref-based approach where the context value is stable,
 * but the ref inside it updates on every frame.
 *
 * Components that need zoom for LOD decisions can read from the ref
 * without causing re-renders.
 */

interface GraphViewportContextValue {
  /** Ref containing current zoom - read this for calculations */
  zoomRef: React.MutableRefObject<number>
  /** Subscribe to zoom changes (for components that need to re-render on LOD change) */
  subscribeToLodChange: (callback: (isLowZoom: boolean) => void) => () => void
}

const GraphViewportContext = createContext<GraphViewportContextValue | null>(null)

interface GraphViewportProviderProps {
  children: ReactNode
}

/**
 * Provider component that subscribes to viewport changes ONCE
 * and provides zoom level to all children via context.
 *
 * Uses ref-based approach to avoid re-rendering all consumers on every zoom change.
 */
export const GraphViewportProvider = memo(({ children }: GraphViewportProviderProps) => {
  const { zoom } = useViewport()
  const zoomRef = useRef(zoom)
  const subscribersRef = useRef<Set<(isLowZoom: boolean) => void>>(new Set())
  const wasLowZoomRef = useRef(zoom < 0.05)

  // Update ref on every render (but don't trigger re-renders in consumers)
  zoomRef.current = zoom

  // Check if LOD threshold crossed and notify subscribers
  const isLowZoom = zoom < 0.05
  if (isLowZoom !== wasLowZoomRef.current) {
    wasLowZoomRef.current = isLowZoom
    // Notify all subscribers about LOD change
    subscribersRef.current.forEach(callback => callback(isLowZoom))
  }

  // Stable context value - never changes, so consumers don't re-render
  const contextValue = useRef<GraphViewportContextValue>({
    zoomRef,
    subscribeToLodChange: (callback) => {
      subscribersRef.current.add(callback)
      return () => subscribersRef.current.delete(callback)
    }
  })

  return (
    <GraphViewportContext.Provider value={contextValue.current}>
      {children}
    </GraphViewportContext.Provider>
  )
})

GraphViewportProvider.displayName = 'GraphViewportProvider'

/**
 * Hook to access viewport zoom level via ref.
 * Reading zoomRef.current does NOT cause re-renders.
 *
 * Use this in node/edge components for LOD calculations.
 */
export const useGraphViewport = () => {
  const context = useContext(GraphViewportContext)
  if (!context) {
    // Fallback for components rendered outside provider
    return {
      zoomRef: { current: 1 },
      subscribeToLodChange: () => () => {}
    }
  }
  return context
}
