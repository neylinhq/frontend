/**
 * Layout Constants
 * Centralized dimensions for consistent layouts across the app
 */
export const LAYOUT = {
  // Dashboard sidebar
  sidebar: {
    collapsed: {
      width: 64,
      class: 'w-16'
    },
    expanded: {
      width: 256,
      class: 'w-64'
    }
  },

  // Header height - consistent across all layouts
  header: {
    height: 56,
    class: 'h-14'
  },

  // Documentation layout
  docs: {
    container: 'max-w-[1400px]',
    sidebar: {
      width: 260,
      class: 'w-[260px]'
    },
    toc: {
      width: 220,
      class: 'w-[220px]'
    },
    content: 'max-w-3xl'
  },

  // Public pages (marketing)
  public: {
    container: 'max-w-5xl'
  },

  // Dashboard/Settings
  dashboard: {
    container: 'max-w-6xl'
  }
} as const

// Computed CSS values for sticky positioning
export const DOCS_STICKY = {
  top: '3.5rem', // 56px = h-14
  height: 'calc(100vh - 3.5rem)'
} as const
