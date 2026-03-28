import type { ViewportState } from '@/shared/lib/viewport'

import type { LayoutOptions } from './graph-webgl.types'

/**
 * Default layout options
 */
export const DEFAULT_LAYOUT_OPTIONS: LayoutOptions = {
  viewMode: 'overview',
  spacingPercent: 100,
  directionStrength: 0,
  iterations: 250,      // more iterations → better convergence for dense graphs
  coolingFactor: 0.982, // slower cooling → nodes explore wider before settling
  theta: 0.9,
  ignoreExistingPositions: false
}

/**
 * Default viewport state
 */
export const DEFAULT_VIEWPORT: ViewportState = {
  x: 0,
  y: 0,
  zoom: 1,
  width: 800,
  height: 600
}
