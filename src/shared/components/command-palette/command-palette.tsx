'use client'

import { Hash, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { Dialog, DialogContent, DialogTitle } from '@/shared/components/dialog'
import type { CommandPaletteItem, CommandPaletteProps } from './command-palette.types'

export const CommandPalette = <T extends CommandPaletteItem>({
  open,
  onOpenChange,
  items,
  filterFn,
  groupBy,
  renderItem,
  onSelect,
  placeholder = 'Search...',
  emptyMessage = 'No results found',
  hotkey = 'k',
  enableHotkey = true,
  footer,
  title = 'Command palette'
}: CommandPaletteProps<T>) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Filter results
  const results = useMemo(() => {
    if (!query.trim()) {
      return items
    }
    return items.filter(item => filterFn(item, query))
  }, [items, query, filterFn])

  // Group by section if groupBy provided
  const groupedResults = useMemo(() => {
    if (!groupBy) return null

    const groups: Record<string, T[]> = {}
    for (const item of results) {
      const group = groupBy(item)
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(item)
    }
    return groups
  }, [results, groupBy])

  // Handle selection
  const handleSelect = useCallback(
    (item: T) => {
      onSelect(item)
      onOpenChange(false)
      setQuery('')
    },
    [onSelect, onOpenChange]
  )

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(i => (i + 1) % results.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(i => (i - 1 + results.length) % results.length)
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex])
          }
          break
      }
    },
    [results, selectedIndex, handleSelect]
  )

  // Global hotkey (Cmd+K / Ctrl+K)
  useEffect(() => {
    if (!enableHotkey) return

    const down = (e: KeyboardEvent) => {
      if (e.key === hotkey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange, hotkey, enableHotkey])

  // Reset selection on query change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Reset query when closed
  useEffect(() => {
    if (!open) {
      setQuery('')
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl p-0 gap-0 overflow-hidden [&>button]:hidden'>
        <DialogTitle className='sr-only'>{title}</DialogTitle>

        {/* Search Input */}
        <div className='flex items-center border-b px-4'>
          <Search className='h-4 w-4 text-muted-foreground shrink-0' />
          <input
            type='text'
            placeholder={placeholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className='flex-1 h-14 px-3 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
            autoFocus
          />
          <kbd className='hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground'>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className='max-h-[400px] overflow-y-auto p-2'>
          {results.length === 0 ? (
            <div className='py-12 text-center text-sm text-muted-foreground'>
              {query ? `${emptyMessage} "${query}"` : emptyMessage}
            </div>
          ) : groupedResults ? (
            // Grouped view
            Object.entries(groupedResults).map(([section, sectionItems]) => (
              <div key={section} className='mb-4 last:mb-0'>
                <div className='px-2 py-1.5 text-xs font-medium text-muted-foreground'>
                  {section}
                </div>
                {sectionItems.map(item => {
                  const globalIndex = results.indexOf(item)
                  const isSelected = globalIndex === selectedIndex

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={cn(
                        'w-full rounded-lg transition-colors',
                        isSelected ? 'bg-accent' : 'hover:bg-accent/50'
                      )}
                    >
                      {renderItem(item, isSelected)}
                    </button>
                  )
                })}
              </div>
            ))
          ) : (
            // Flat view
            results.map((item, index) => {
              const isSelected = index === selectedIndex

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'w-full rounded-lg transition-colors',
                    isSelected ? 'bg-accent' : 'hover:bg-accent/50'
                  )}
                >
                  {renderItem(item, isSelected)}
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        {footer ?? (
          <div className='flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground'>
            <div className='flex items-center gap-4'>
              <span className='flex items-center gap-1'>
                <kbd className='inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px]'>
                  ↑
                </kbd>
                <kbd className='inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px]'>
                  ↓
                </kbd>
                <span className='ml-1'>Navigate</span>
              </span>
              <span className='flex items-center gap-1'>
                <kbd className='inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px]'>
                  ↵
                </kbd>
                <span className='ml-1'>Select</span>
              </span>
            </div>
            <div className='flex items-center gap-1'>
              <Hash className='h-3 w-3' />
              <span>{results.length} results</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
