import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2, Sparkles, BookOpen, Link2, GraduationCap } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export interface SlashCommand {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  shortcut?: string
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (command: SlashCommand) => void
  filter: string
  position?: { top: number; left: number }
}

export const CommandPalette = ({
  isOpen,
  onClose,
  onSelect,
  filter,
  position
}: CommandPaletteProps) => {
  const { t } = useTranslation()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const commands: SlashCommand[] = [
    {
      id: 'clear',
      label: 'clear',
      description: t('ai.commands.clearDesc', 'Clear chat history'),
      icon: <Trash2 className='h-4 w-4' />
    },
    {
      id: 'enrich',
      label: 'enrich',
      description: t('ai.commands.enrichDesc', 'Improve node description'),
      icon: <Sparkles className='h-4 w-4' />
    },
    {
      id: 'examples',
      label: 'examples',
      description: t('ai.commands.examplesDesc', 'Generate examples'),
      icon: <BookOpen className='h-4 w-4' />
    },
    {
      id: 'sources',
      label: 'sources',
      description: t('ai.commands.sourcesDesc', 'Find related sources'),
      icon: <Link2 className='h-4 w-4' />
    },
    {
      id: 'exercises',
      label: 'exercises',
      description: t('ai.commands.exercisesDesc', 'Generate practice exercises'),
      icon: <GraduationCap className='h-4 w-4' />
    }
  ]

  // Filter commands based on input (without the leading /)
  const searchTerm = filter.startsWith('/') ? filter.slice(1).toLowerCase() : filter.toLowerCase()
  const filteredCommands = commands.filter(
    cmd =>
      cmd.label.toLowerCase().includes(searchTerm) ||
      cmd.description.toLowerCase().includes(searchTerm)
  )

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [filter])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => (prev + 1) % filteredCommands.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length)
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            onSelect(filteredCommands[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex, onSelect, onClose])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  if (!isOpen || filteredCommands.length === 0) return null

  return (
    <div
      className={cn(
        'absolute z-50 w-64 max-h-64 overflow-y-auto',
        'bg-popover border border-border rounded-lg shadow-lg',
        'animate-in fade-in-0 zoom-in-95 duration-150'
      )}
      style={position ? { bottom: position.top, left: position.left } : { bottom: '100%', left: 0, marginBottom: 8 }}
    >
      <div ref={listRef} className='py-1'>
        {filteredCommands.map((command, index) => (
          <button
            key={command.id}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 text-left',
              'text-sm transition-colors',
              index === selectedIndex
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-muted'
            )}
            onClick={() => onSelect(command)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <span className='text-muted-foreground'>{command.icon}</span>
            <div className='flex-1 min-w-0'>
              <div className='font-medium'>/{command.label}</div>
              <div className='text-xs text-muted-foreground truncate'>
                {command.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Keyboard hints */}
      <div className='border-t border-border px-3 py-1.5 flex items-center gap-3 text-[10px] text-muted-foreground'>
        <span className='flex items-center gap-1'>
          <kbd className='px-1 py-0.5 bg-muted rounded text-[9px]'>↑↓</kbd>
          {t('ai.commands.navigate', 'Navigate')}
        </span>
        <span className='flex items-center gap-1'>
          <kbd className='px-1 py-0.5 bg-muted rounded text-[9px]'>↵</kbd>
          {t('ai.commands.select', 'Select')}
        </span>
        <span className='flex items-center gap-1'>
          <kbd className='px-1 py-0.5 bg-muted rounded text-[9px]'>esc</kbd>
          {t('ai.commands.close', 'Close')}
        </span>
      </div>
    </div>
  )
}
