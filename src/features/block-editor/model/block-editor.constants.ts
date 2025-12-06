/**
 * Block Editor Constants
 *
 * Centralized configuration for dimensions, timings, and thresholds.
 * Follows Design Manifesto guidelines for consistent UX.
 */

/**
 * Menu dimensions (in pixels)
 */
export const MENU = {
  /** Slash menu height */
  SLASH_HEIGHT: 400,
  /** Slash menu width */
  SLASH_WIDTH: 320,
  /** Bubble menu height */
  BUBBLE_HEIGHT: 44,
  /** Bubble menu minimum width */
  BUBBLE_MIN_WIDTH: 400,
  /** Viewport padding for menu positioning */
  VIEWPORT_PADDING: 8,
  /** Gap between bubble menu and selection */
  BUBBLE_GAP: 24
} as const

/**
 * Hover and interaction thresholds (in pixels)
 */
export const THRESHOLD = {
  /** Pixels threshold for block hover detection */
  BLOCK_HOVER: 5,
  /** Extended hover grace area for keeping menu visible */
  HOVER_GRACE: 10,
  /** Left zone for triggering block nesting on drag */
  NEST_ZONE: 40
} as const

/**
 * Animation and timing constants (in milliseconds)
 */
export const TIMING = {
  /** Delay before focusing input in dialogs (allows for animation) */
  FOCUS_DELAY: 100,
  /** Menu entrance/exit animation duration (Design Manifesto: 200-300ms) */
  MENU_ANIMATION: 200
} as const

/**
 * Table of Contents configuration
 */
export const TOC = {
  /** Scroll offset when clicking TOC item (negative = above target) */
  SCROLL_OFFSET: -100
} as const

/**
 * Gutter configuration for floating menu positioning
 * The gutter is the left margin where floating menu buttons appear
 */
export const GUTTER = {
  /** Width of gutter in pixels (Tailwind: pl-16 = 64px) */
  WIDTH: 64,
  /** Tailwind class for gutter padding (apply to content containers) */
  PADDING_CLASS: 'md:pl-16',
  /** Tailwind class for floating menu position (negative of padding) */
  MENU_POSITION_CLASS: '-left-16'
} as const
