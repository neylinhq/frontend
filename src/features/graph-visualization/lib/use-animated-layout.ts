import type { Node } from '@xyflow/react'
import { useCallback, useEffect, useRef } from 'react'
import { useReactFlow, useViewport } from '@xyflow/react'

interface AnimationConfig {
  duration: number
  easing: (t: number) => number
}

// Easing function: fast start, smooth deceleration
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

const DEFAULT_CONFIG: AnimationConfig = {
  duration: 300,
  easing: easeOutCubic,
}

export function useAnimatedLayout() {
  const animationRef = useRef<number | null>(null)
  const { setNodes, setCenter } = useReactFlow()
  const { zoom } = useViewport()

  const animateToPositions = useCallback(
    (
      currentNodes: Node[],
      targetNodes: Node[],
      anchorNodeId: string | null,
      config: AnimationConfig = DEFAULT_CONFIG
    ) => {
      // Cancel any running animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      // If no nodes, nothing to animate
      if (currentNodes.length === 0 || targetNodes.length === 0) {
        setNodes(targetNodes)
        return
      }

      const startTime = performance.now()

      // Build maps for O(1) position lookup
      const startPositions = new Map(
        currentNodes.map((n) => [n.id, { x: n.position.x, y: n.position.y }])
      )
      const targetPositions = new Map(
        targetNodes.map((n) => [n.id, { x: n.position.x, y: n.position.y }])
      )

      // Calculate anchor node centers for camera sync
      let anchorStart: { x: number; y: number } | null = null
      let anchorTarget: { x: number; y: number } | null = null

      if (anchorNodeId) {
        const startNode = currentNodes.find((n) => n.id === anchorNodeId)
        const targetNode = targetNodes.find((n) => n.id === anchorNodeId)

        if (startNode && targetNode) {
          anchorStart = {
            x: startNode.position.x + (startNode.measured?.width ?? 200) / 2,
            y: startNode.position.y + (startNode.measured?.height ?? 100) / 2,
          }
          anchorTarget = {
            x: targetNode.position.x + (targetNode.measured?.width ?? 200) / 2,
            y: targetNode.position.y + (targetNode.measured?.height ?? 100) / 2,
          }
        }
      }

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / config.duration, 1)
        const easedProgress = config.easing(progress)

        // Interpolate all node positions
        const interpolatedNodes = targetNodes.map((node) => {
          const start = startPositions.get(node.id)
          const target = targetPositions.get(node.id)

          // If node didn't exist before, use target position
          if (!start || !target) {
            return node
          }

          return {
            ...node,
            position: {
              x: start.x + (target.x - start.x) * easedProgress,
              y: start.y + (target.y - start.y) * easedProgress,
            },
          }
        })

        setNodes(interpolatedNodes)

        // Sync camera with anchor node (instant, no additional easing)
        if (anchorStart && anchorTarget) {
          const cameraX = anchorStart.x + (anchorTarget.x - anchorStart.x) * easedProgress
          const cameraY = anchorStart.y + (anchorTarget.y - anchorStart.y) * easedProgress
          setCenter(cameraX, cameraY, { zoom, duration: 0 })
        }

        // Continue animation if not complete
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          animationRef.current = null
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    },
    [setNodes, setCenter, zoom]
  )

  // Cancel animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Check if animation is currently running
  const isAnimating = useCallback(() => animationRef.current !== null, [])

  // Cancel current animation
  const cancelAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [])

  return {
    animateToPositions,
    isAnimating,
    cancelAnimation,
  }
}
