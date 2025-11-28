import { Keyboard } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

const SHORTCUTS = [
  {
    category: 'Text Formatting',
    shortcuts: [
      { keys: ['Ctrl', 'B'], description: 'Bold' },
      { keys: ['Ctrl', 'I'], description: 'Italic' },
      { keys: ['Ctrl', 'U'], description: 'Underline' },
      { keys: ['Ctrl', 'Shift', 'S'], description: 'Strikethrough' },
      { keys: ['Ctrl', 'E'], description: 'Inline code' },
      { keys: ['Ctrl', 'Shift', 'H'], description: 'Highlight' }
    ]
  },
  {
    category: 'Paragraphs',
    shortcuts: [
      { keys: ['Ctrl', 'Alt', '1'], description: 'Heading 1' },
      { keys: ['Ctrl', 'Alt', '2'], description: 'Heading 2' },
      { keys: ['Ctrl', 'Alt', '3'], description: 'Heading 3' },
      { keys: ['Ctrl', 'Shift', '7'], description: 'Ordered list' },
      { keys: ['Ctrl', 'Shift', '8'], description: 'Bullet list' },
      { keys: ['Ctrl', 'Shift', '9'], description: 'Task list' }
    ]
  },
  {
    category: 'General',
    shortcuts: [
      { keys: ['/'], description: 'Open block menu' },
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Y'], description: 'Redo' },
      { keys: ['Ctrl', 'A'], description: 'Select all' }
    ]
  }
]

interface KeyboardShortcutsProps {
  className?: string
}

export function KeyboardShortcuts({ className }: KeyboardShortcutsProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className='flex items-center gap-2 text-sm font-medium'>
        <Keyboard className='h-4 w-4' />
        <span>Keyboard Shortcuts</span>
      </div>

      {SHORTCUTS.map(section => (
        <div key={section.category}>
          <h4 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2'>
            {section.category}
          </h4>
          <div className='space-y-1'>
            {section.shortcuts.map(shortcut => (
              <div key={shortcut.description} className='flex items-center justify-between py-1'>
                <span className='text-sm text-muted-foreground'>{shortcut.description}</span>
                <div className='flex items-center gap-1'>
                  {shortcut.keys.map((key, index) => (
                    <span key={index}>
                      <kbd className='inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border bg-muted px-1.5 text-xs font-medium'>
                        {key}
                      </kbd>
                      {index < shortcut.keys.length - 1 && (
                        <span className='mx-0.5 text-muted-foreground'>+</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Compact version for tooltip
export function KeyboardShortcutsCompact() {
  const essentialShortcuts = [
    { keys: ['Ctrl', 'B'], description: 'Bold' },
    { keys: ['Ctrl', 'I'], description: 'Italic' },
    { keys: ['Ctrl', 'U'], description: 'Underline' },
    { keys: ['/'], description: 'Commands' }
  ]

  return (
    <div className='text-xs space-y-1'>
      {essentialShortcuts.map(shortcut => (
        <div key={shortcut.description} className='flex items-center justify-between gap-4'>
          <span className='text-muted-foreground'>{shortcut.description}</span>
          <div className='flex items-center gap-0.5'>
            {shortcut.keys.map((key, index) => (
              <span key={index}>
                <kbd className='inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-border bg-muted px-1 text-[10px]'>
                  {key}
                </kbd>
                {index < shortcut.keys.length - 1 && (
                  <span className='text-muted-foreground'>+</span>
                )}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
