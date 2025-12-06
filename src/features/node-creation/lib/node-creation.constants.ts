/**
 * Configuration constants for node creation feature
 */
export const NODE_CREATION_CONFIG = {
  /** Delay before auto-focusing dialog input (ms) */
  FOCUS_DELAY_MS: 100,

  /** Random offset range from center when spawning nodes (px) */
  NODE_SPAWN_OFFSET_PX: 100,

  /** Maximum width for quick add dialog */
  DIALOG_MAX_WIDTH: '500px'
} as const
