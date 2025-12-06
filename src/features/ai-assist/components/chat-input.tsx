import { useRef, type KeyboardEvent } from 'react'
import { ArrowUp } from 'lucide-react'
import { Textarea } from '@/shared/components/textarea'
import { Button } from '@/shared/components/button'
import { cn } from '@/shared/lib/cn'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export const ChatInput = ({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = 'Type a message...'
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
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }

  return (
    <div className='relative flex items-end gap-2'>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'min-h-[40px] max-h-[120px] resize-none pr-12',
          'focus-visible:ring-1'
        )}
        rows={1}
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
  )
}
