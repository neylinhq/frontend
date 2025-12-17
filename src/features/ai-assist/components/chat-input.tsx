import { ArrowUp, GripHorizontal, Square } from 'lucide-react'
import { type KeyboardEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AIModel } from '@/entities/ai'
import { Button } from '@/shared/components/button'
import { Textarea } from '@/shared/components/textarea'
import { useResizable } from '@/shared/hooks'
import { cn } from '@/shared/lib/cn'
import { CommandPalette, type SlashCommand } from './command-palette'
import { ModelSelector } from './model-selector'

const MIN_INPUT_HEIGHT = 80
const MAX_INPUT_HEIGHT = 300
const DEFAULT_INPUT_HEIGHT = 80

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: (value: string) => void
  onStop?: () => void
  onCommand?: (commandId: string) => void
  disabled?: boolean
  isLoading?: boolean
  placeholder?: string
  model?: string
  onModelChange?: (model: string) => void
  models?: AIModel[]
}

export const ChatInput = ({
  value,
  onChange,
  onSend,
  onStop,
  onCommand,
  disabled = false,
  isLoading = false,
  placeholder = 'Type a message...',
  model,
  onModelChange,
  models = []
}: ChatInputProps) => {
  const { t } = useTranslation()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showCommands, setShowCommands] = useState(false)

  // Resizable input height
  const {
    size: inputHeight,
    isResizing,
    handleMouseDown: handleResizeMouseDown
  } = useResizable({
    minSize: MIN_INPUT_HEIGHT,
    maxSize: MAX_INPUT_HEIGHT,
    initialSize: DEFAULT_INPUT_HEIGHT,
    direction: 'vertical',
    handleSide: 'top',
    storageKey: 'chat-input-height'
  })

  // Check if we should show command palette
  const shouldShowCommands = value.startsWith('/') && !value.includes(' ')

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value)
    }
  }

  const handleCommandSelect = (command: SlashCommand) => {
    setShowCommands(false)
    onChange('')
    onCommand?.(command.id)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // If command palette is open, let it handle arrow keys and enter
    if (shouldShowCommands && ['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) {
      return // Let CommandPalette handle these
    }

    // Cmd/Ctrl + Enter to send
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }

    // Prevent default Enter behavior (new line) when Shift is not pressed
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Show/hide command palette
    setShowCommands(newValue.startsWith('/') && !newValue.includes(' '))
  }

  return (
    <div className={cn('relative', isResizing && 'select-none')}>
      {/* Resize handle */}
      <div
        onMouseDown={handleResizeMouseDown}
        className={cn(
          'absolute left-0 right-0 top-0 h-3 cursor-row-resize z-10 flex items-center justify-center',
          'hover:bg-muted/50 transition-colors group'
        )}
      >
        <GripHorizontal
          className={cn(
            'h-3 w-6 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors',
            isResizing && 'text-muted-foreground/60'
          )}
        />
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={shouldShowCommands && showCommands}
        onClose={() => setShowCommands(false)}
        onSelect={handleCommandSelect}
        filter={value}
      />

      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        style={{ height: inputHeight }}
        className={cn(
          'resize-none p-3 pt-5 pb-12',
          'border-none shadow-none bg-transparent',
          'focus-visible:ring-0 focus-visible:ring-offset-0'
        )}
      />

      {/* Bottom controls - Model selector */}
      <div className='absolute left-3 bottom-2.5 flex items-center gap-2'>
        {onModelChange && models.length > 0 && (
          <ModelSelector
            value={model}
            onChange={onModelChange}
            models={models}
            disabled={disabled}
          />
        )}
      </div>

      {/* Send/Stop button - bottom right */}
      {isLoading ? (
        <Button
          size='icon'
          variant='destructive'
          onClick={onStop}
          aria-label={t('ai.chat.stop', 'Stop generating')}
          className='absolute right-3 bottom-2.5 h-8 w-8 flex-shrink-0'
        >
          <Square className='h-3 w-3 fill-current' />
        </Button>
      ) : (
        <Button
          size='icon'
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className='absolute right-3 bottom-2.5 h-8 w-8 flex-shrink-0'
          aria-label={t('ai.chat.send', 'Send message')}
        >
          <ArrowUp className='h-4 w-4' />
        </Button>
      )}
    </div>
  )
}
