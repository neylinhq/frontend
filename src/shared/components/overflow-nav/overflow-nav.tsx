'use client'

import { DotsHorizontalIcon } from '@untitledui/icons-react/outline'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/components/dropdown-menu'
import { cn } from '@/shared/lib/cn'

export interface OverflowNavItem {
  id: string
  label: string
  active?: boolean
  onClick: () => void
  destructive?: boolean
}

interface OverflowNavProps {
  /** Main items — shown inline after extraItems, participate in overflow */
  items: OverflowNavItem[]
  /** Prefix items — shown inline BEFORE items, participate in overflow (fall off from the right end first among themselves) */
  extraItems?: OverflowNavItem[]
  /** Always-in-menu items — always at the bottom of the popover, never inline */
  menuItems?: OverflowNavItem[]
  itemClassName?: string
  activeClassName?: string
  inactiveClassName?: string
  className?: string
}

const TRIGGER_WIDTH = 28 // w-7 trigger button

/**
 * OverflowNav — Priority+ pattern.
 *
 * Inline order (left → right): [extraItems] [items]
 * Overflow: items fall off from the right end into the TOP of the "⋯" popover.
 * menuItems: always at the bottom of the popover regardless of space.
 */
export const OverflowNav = ({
  items,
  extraItems,
  menuItems,
  itemClassName = 'px-1.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors',
  activeClassName = 'text-foreground',
  inactiveClassName = 'text-muted-foreground hover:text-foreground',
  className
}: OverflowNavProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null)

  // Combined inline pool: extra first, then main
  const allItems = useMemo(() => [...(extraItems ?? []), ...items], [extraItems, items])

  const [visibleCount, setVisibleCount] = useState(allItems.length)

  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node
    setContainerEl(node)
  }, [])

  // Track whether trigger is currently rendered so calculate() can normalise containerWidth
  const isTriggerShownRef = useRef(false)
  // Whether menuItems are present (trigger always shown regardless of overflow)
  const hasMenuItemsRef = useRef((menuItems?.length ?? 0) > 0)

  const calculate = useCallback(() => {
    const container = containerRef.current
    const measure = measureRef.current
    if (!container || !measure) { return }

    // Normalise: when trigger is visible it takes 28px from containerRef.
    // Add it back so we always calculate against the same stable "true" width.
    const trueWidth = container.offsetWidth + (isTriggerShownRef.current ? TRIGGER_WIDTH : 0)

    const children = Array.from(measure.children) as HTMLElement[]
    if (children.length === 0) { return }

    const GAP = 2 // gap-0.5 = 2px between buttons

    const countFitting = (available: number) => {
      let usedWidth = 0
      let count = 0
      for (const child of children) {
        const needed = usedWidth + (count > 0 ? GAP : 0) + child.offsetWidth
        if (needed > available) { break }
        usedWidth = needed
        count++
      }
      return count
    }

    // First pass: all items vs true width (no trigger yet)
    let count = countFitting(trueWidth)
    // If trigger will appear (overflow or permanent menuItems), redo with reduced width
    if (count < children.length || hasMenuItemsRef.current) {
      count = countFitting(trueWidth - TRIGGER_WIDTH)
    }

    setVisibleCount(Math.max(1, count))
  }, [])

  useEffect(() => {
    hasMenuItemsRef.current = (menuItems?.length ?? 0) > 0
    calculate()
  }, [menuItems, calculate])

  // Re-observe when container element is attached/re-attached (e.g. sidebar closed then opened)
  useEffect(() => {
    if (!containerEl) { return }
    const observer = new ResizeObserver(() => calculate())
    observer.observe(containerEl)
    calculate()
    return () => observer.disconnect()
  }, [calculate, containerEl])

  // When items change: reset to show all, then recalculate after React commits the DOM
  // (ResizeObserver won't fire here — flex-1 container doesn't resize from content changes)
  useEffect(() => {
    setVisibleCount(allItems.length)
    const id = requestAnimationFrame(calculate)
    return () => cancelAnimationFrame(id)
  }, [allItems, calculate])

  const visibleItems = allItems.slice(0, visibleCount)
  const overflowItems = allItems.slice(visibleCount)

  const hasOverflow = overflowItems.length > 0
  const hasMenu = (menuItems?.length ?? 0) > 0
  const showTrigger = hasOverflow || hasMenu

  // Update ref so calculate() knows current trigger state on next call
  isTriggerShownRef.current = showTrigger

  return {
    /** Inline nav element — place in the flex row */
    nav: (
      <div ref={setContainerRef} className={cn('flex items-center gap-0.5 min-w-0 flex-1 overflow-hidden', className)}>
        {/* Hidden measure layer — all items rendered to measure widths */}
        <div
          ref={measureRef}
          className='flex items-center gap-0.5 absolute invisible pointer-events-none h-0 overflow-hidden'
          aria-hidden='true'
        >
          {allItems.map(item => (
            <span key={item.id} className={itemClassName}>{item.label}</span>
          ))}
        </div>

        {visibleItems.map(item => (
          <button
            key={item.id}
            type='button'
            onClick={item.onClick}
            className={cn(
              itemClassName,
              item.destructive
                ? 'text-destructive hover:text-destructive'
                : item.active ? activeClassName : inactiveClassName
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    ),
    /** Trigger button + dropdown — place in the right group next to close */
    trigger: showTrigger ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            className='h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0'
          >
            <DotsHorizontalIcon className='h-3.5 w-3.5' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='min-w-36'>
          {/* Overflow items at top — fell off from the right end */}
          {overflowItems.map(item => (
            <DropdownMenuItem
              key={item.id}
              onClick={item.onClick}
              className={cn('text-xs', item.active && 'font-medium', item.destructive && 'text-destructive focus:text-destructive')}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
          {/* Always-in-menu items at bottom */}
          {hasOverflow && hasMenu && <DropdownMenuSeparator />}
          {menuItems?.map(item => (
            <DropdownMenuItem
              key={item.id}
              onClick={item.onClick}
              className={cn('text-xs', item.active && 'font-medium', item.destructive && 'text-destructive focus:text-destructive')}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : null
  }
}
