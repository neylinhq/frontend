import { useRef, type KeyboardEvent } from 'react'
import { ArrowUp } from 'lucide-react'
import type { AIModel } from '@/entities/ai'
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
  models?: AIModel[]
}

export const ChatInput = ({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
  model,
  onModelChange,
  models = []
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Find current model name
  const currentModel = models.find(m => m.id === model)
  const currentModelName = currentModel?.name || model?.split('/').pop()?.replace(':free', '') || 'Select model'

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value)
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
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
    onChange(e.target.value)

    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  }

  return (
    <div className='relative'>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'min-h-[80px] max-h-[200px] resize-none p-3 pb-8',
          'border-none shadow-none bg-transparent',
          'focus-visible:ring-0 focus-visible:ring-offset-0'
        )}
        rows={3}
      />

      {/* Model selector - bottom left */}
      {onModelChange && models.length > 0 && (
        <div className='absolute left-3 bottom-2.5'>
          <Select value={model} onValueChange={onModelChange} disabled={disabled}>
            <SelectTrigger className='max-w-36 h-6 text-[10px] border-none bg-muted hover:bg-muted'>
              <span className='truncate'>{currentModelName}</span>
            </SelectTrigger>
            <SelectContent>
              {models.map(m => (
                <SelectItem key={m.id} value={m.id} className='text-xs'>
                  <span className='flex items-center gap-1.5'>
                    {m.name}
                    {m.free && <span className='text-[9px] text-green-600 dark:text-green-400'>FREE</span>}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
