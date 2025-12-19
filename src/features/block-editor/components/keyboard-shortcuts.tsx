import { Keyboard01Icon } from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'

/**
 * Shortcut keys (i18n keys for descriptions)
 */
const SHORTCUT_SECTIONS = [
  {
    categoryKey: 'textFormatting',
    shortcuts: [
      { keys: ['Ctrl', 'B'], descKey: 'bold' },
      { keys: ['Ctrl', 'I'], descKey: 'italic' },
      { keys: ['Ctrl', 'U'], descKey: 'underline' },
      { keys: ['Ctrl', 'Shift', 'S'], descKey: 'strikethrough' },
      { keys: ['Ctrl', 'E'], descKey: 'inlineCode' },
      { keys: ['Ctrl', 'Shift', 'H'], descKey: 'highlight' }
    ]
  },
  {
    categoryKey: 'paragraphs',
    shortcuts: [
      { keys: ['Ctrl', 'Alt', '1'], descKey: 'heading1' },
      { keys: ['Ctrl', 'Alt', '2'], descKey: 'heading2' },
      { keys: ['Ctrl', 'Alt', '3'], descKey: 'heading3' },
      { keys: ['Ctrl', 'Shift', '7'], descKey: 'orderedList' },
      { keys: ['Ctrl', 'Shift', '8'], descKey: 'bulletList' },
      { keys: ['Ctrl', 'Shift', '9'], descKey: 'taskList' }
    ]
  },
  {
    categoryKey: 'general',
    shortcuts: [
      { keys: ['/'], descKey: 'openMenu' },
      { keys: ['Ctrl', 'Z'], descKey: 'undo' },
      { keys: ['Ctrl', 'Y'], descKey: 'redo' },
      { keys: ['Ctrl', 'A'], descKey: 'selectAll' }
    ]
  }
] as const

interface KeyboardShortcutsProps {
  className?: string
}

export const KeyboardShortcuts = ({ className }: KeyboardShortcutsProps) => {
  const { t } = useTranslation()

  return (
    <div className={cn('space-y-4', className)}>
      <div className='flex items-center gap-2 text-sm font-medium'>
        <Keyboard01Icon className='h-4 w-4' />
        <span>{t('editor.shortcuts.title')}</span>
      </div>

      {SHORTCUT_SECTIONS.map(section => (
        <div key={section.categoryKey}>
          <h4 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2'>
            {t(`editor.shortcuts.categories.${section.categoryKey}`)}
          </h4>
          <div className='space-y-1'>
            {section.shortcuts.map(shortcut => (
              <div key={shortcut.descKey} className='flex items-center justify-between py-1'>
                <span className='text-sm text-muted-foreground'>
                  {t(`editor.shortcuts.${shortcut.descKey}`)}
                </span>
                <div className='flex items-center gap-1'>
                  {shortcut.keys.map((key, index) => (
                    <span key={key}>
                      <kbd
                        className='inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border bg-muted px-1.5 text-xs font-medium'
                        aria-label={key}
                      >
                        {key}
                      </kbd>
                      {index < shortcut.keys.length - 1 && (
                        <span className='mx-0.5 text-muted-foreground' aria-hidden='true'>
                          +
                        </span>
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

/**
 * Compact version for tooltip
 */
const ESSENTIAL_SHORTCUTS = [
  { keys: ['Ctrl', 'B'], descKey: 'bold' },
  { keys: ['Ctrl', 'I'], descKey: 'italic' },
  { keys: ['Ctrl', 'U'], descKey: 'underline' },
  { keys: ['/'], descKey: 'commands' }
] as const

export const KeyboardShortcutsCompact = () => {
  const { t } = useTranslation()

  return (
    <div className='text-xs space-y-1'>
      {ESSENTIAL_SHORTCUTS.map(shortcut => (
        <div key={shortcut.descKey} className='flex items-center justify-between gap-4'>
          <span className='text-muted-foreground'>{t(`editor.shortcuts.${shortcut.descKey}`)}</span>
          <div className='flex items-center gap-0.5'>
            {shortcut.keys.map((key, index) => (
              <span key={key}>
                <kbd
                  className='inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-border bg-muted px-1 text-[10px]'
                  aria-label={key}
                >
                  {key}
                </kbd>
                {index < shortcut.keys.length - 1 && (
                  <span className='text-muted-foreground' aria-hidden='true'>
                    +
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
