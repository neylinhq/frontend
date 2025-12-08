/**
 * Viewport utilities for smart positioning of floating elements
 */

export interface ViewportBounds {
  width: number
  height: number
  scrollX: number
  scrollY: number
}

export interface CollisionResult {
  top: boolean
  right: boolean
  bottom: boolean
  left: boolean
}

/**
 * Get current viewport dimensions and scroll position
 */
export function getViewportBounds(): ViewportBounds {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY
  }
}

/**
 * Detect which sides of a rectangle collide with viewport boundaries
 */
export function detectCollisions(
  rect: { x: number; y: number; width: number; height: number },
  viewport: ViewportBounds,
  padding = 0
): CollisionResult {
  return {
    top: rect.y - padding < 0,
    right: rect.x + rect.width + padding > viewport.width,
    bottom: rect.y + rect.height + padding > viewport.height,
    left: rect.x - padding < 0
  }
}

/**
 * Constrain a position to stay within viewport boundaries
 */
export function constrainToViewport(
  position: { x: number; y: number },
  size: { width: number; height: number },
  viewport: ViewportBounds,
  padding = 16
): { x: number; y: number } {
  let { x, y } = position

  // Constrain X
  const minX = padding
  const maxX = viewport.width - size.width - padding
  x = Math.max(minX, Math.min(maxX, x))

  // Constrain Y
  const minY = padding
  const maxY = viewport.height - size.height - padding
  y = Math.max(minY, Math.min(maxY, y))

  return { x, y }
}
