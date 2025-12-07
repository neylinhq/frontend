import { useRef, type KeyboardEvent } from 'react'
import { ArrowUp } from 'lucide-react'
import { Textarea } from '@/shared/components/textarea'
import { Button } from '@/shared/components/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/select'
import { cn } from '@/shared/lib/cn'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: (value: string) => void
  disabled?: boolean
  placeholder?: string
  model?: string
  onModelChange?: (model: string) => void
  availableModels?: string[]
}

const MODEL_LABELS: Record<string, string> = {
  'gpt-3.5-turbo': 'GPT-3.5',
  'gpt-4': 'GPT-4',
  'gpt-4-turbo': 'GPT-4 Turbo',
  'claude-3-sonnet': 'Claude 3 Sonnet',
  'claude-3-opus': 'Claude 3 Opus'
}

export const ChatInput = ({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
  model = 'gpt-4',
  onModelChange,
  availableModels = ['gpt-4']
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextareaElement>(null)

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value)
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextareaElement>) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLTextareaElement>) => {
    onChange(e.target.value)

    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  }

  return (
    <div className='space-y-2'>
      {/* Model selector */}
      {onModelChange && availableModels.length > 1 && (
        <div className='flex items-center gap-2'>
          <span className='text-xs text-muted-foreground'>Model:</span>
          <Select value={model} onValueChange={onModelChange} disabled={disabled}>
            <SelectTrigger className='w-40 h-7 text-xs'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map(m => (
                <SelectItem key={m} value={m} className='text-xs'>
                  {MODEL_LABELS[m] || m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Input area */}
      <div className='relative flex items-end gap-2'>
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'min-h-[80px] max-h-[200px] resize-none pr-12',
            'focus-visible:ring-1'
          )}
          rows={3}
        />
        <Button
          size='icon'
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className='absolute right-2 bottom-2 h-8 w-8 flex-shrink-0'
        >
          <ArrowUp className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
