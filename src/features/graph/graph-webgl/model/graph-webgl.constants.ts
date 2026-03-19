import type { LayoutOptions, ViewportState } from './graph-webgl.types'

/**
 * Default layout options
 */
export const DEFAULT_LAYOUT_OPTIONS: LayoutOptions = {
  viewMode: 'overview',
  spacingPercent: 100,
  directionStrength: 0,
  iterations: 150,
  coolingFactor: 0.97,
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
