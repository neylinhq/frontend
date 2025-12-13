import { ArrowUp, GripHorizontal, Map } from 'lucide-react'
import { type KeyboardEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AIModel } from '@/entities/ai'
import { Button } from '@/shared/components/button'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/shared/components/select'
import { Switch } from '@/shared/components/switch'
import { Textarea } from '@/shared/components/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/tooltip'
import { useResizable } from '@/shared/hooks'
import { cn } from '@/shared/lib/cn'
import { CommandPalette, type SlashCommand } from './command-palette'

const MIN_INPUT_HEIGHT = 80
const MAX_INPUT_HEIGHT = 300
const DEFAULT_INPUT_HEIGHT = 80

type ContextMode = 'node' | 'map'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: (value: string) => void
  onCommand?: (commandId: string) => void
  disabled?: boolean
  placeholder?: string
  model?: string
  onModelChange?: (model: string) => void
  models?: AIModel[]
  contextMode?: ContextMode
  onContextModeChange?: (mode: ContextMode) => void
  showContextSwitch?: boolean
}

export const ChatInput = ({
  value,
  onChange,
  onSend,
  onCommand,
  disabled = false,
  placeholder = 'Type a message...',
  model,
  onModelChange,
  models = [],
  contextMode = 'node',
  onContextModeChange,
  showContextSwitch = false
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

  // Find current model name
  const currentModel = models.find(m => m.id === model)
  const currentModelName =
    currentModel?.name || model?.split('/').pop()?.replace(':free', '') || 'Select model'

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

      {/* Bottom controls - Model selector and context switch */}
      <div className='absolute left-3 bottom-2.5 flex items-center gap-2'>
        {/* Model selector */}
        {onModelChange && models.length > 0 && (
          <Select value={model} onValueChange={onModelChange} disabled={disabled}>
            <SelectTrigger className='max-w-36 h-6 text-[10px] border-none bg-muted hover:bg-muted'>
              <span className='truncate'>{currentModelName}</span>
            </SelectTrigger>
            <SelectContent>
              {models.map(m => (
                <SelectItem key={m.id} value={m.id} className='text-xs'>
                  <span className='flex items-center gap-1.5'>
                    {m.name}
                    {m.free && (
                      <span className='text-[9px] text-green-600 dark:text-green-400'>FREE</span>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Context mode toggle */}
        {showContextSwitch && onContextModeChange && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='flex items-center gap-1.5'>
                <Switch
                  checked={contextMode === 'map'}
                  onCheckedChange={checked => onContextModeChange(checked ? 'map' : 'node')}
                  disabled={disabled}
                  className='h-4 w-7 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-3'
                />
                <span className='text-[10px] text-muted-foreground flex items-center gap-0.5'>
                  <Map className='h-3 w-3' />
                  {t('ai.context.map', 'Map')}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side='top' className='text-xs'>
              {contextMode === 'map'
                ? t('ai.context.mapHint', 'Search across map ($)')
                : t('ai.context.nodeHint', 'Current node only')}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Send button - bottom right */}
      <Button
        size='icon'
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        className='absolute right-3 bottom-2.5 h-8 w-8 flex-shrink-0'
      >
        <ArrowUp className='h-4 w-4' />
      </Button>
    </div>
  )
}
