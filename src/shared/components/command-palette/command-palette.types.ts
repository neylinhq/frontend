import type React from 'react'

export interface CommandPaletteItem {
  id: string
}

export interface CommandPaletteProps<T extends CommandPaletteItem> {
  /** Whether the palette is open */
  open: boolean
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void
  /** Items to display and search through */
  items: T[]
  /** Filter function for search */
  filterFn: (item: T, query: string) => boolean
  /** Optional grouping function */
  groupBy?: (item: T) => string
  /** Render function for each item */
  renderItem: (item: T, isSelected: boolean) => React.ReactNode
  /** Callback when item is selected */
  onSelect: (item: T) => void
  /** Input placeholder */
  placeholder?: string
  /** Message when no results found */
  emptyMessage?: string
  /** Hotkey letter (default: 'k' for Cmd+K) */
  hotkey?: string
  /** Whether to enable global hotkey listener */
  enableHotkey?: boolean
  /** Optional footer content */
  footer?: React.ReactNode
  /** Dialog title for accessibility */
  title?: string
}
