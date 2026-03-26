'use client'

import { ArrowUpIcon } from '@untitledui/icons-react/outline'
import { type KeyboardEvent, useRef, useState } from 'react'

import { Button } from '@/shared/components/button'
import { Textarea } from '@/shared/components/textarea'
import { useResizable } from '@/shared/hooks'
import { cn } from '@/shared/lib/cn'

const MIN_INPUT_HEIGHT = 80
const MAX_INPUT_HEIGHT = 300
const DEFAULT_INPUT_HEIGHT = 80

interface ChatInputProps {
  onSend: (value: string) => void
  onStop?: () => void
  disabled?: boolean
  isLoading?: boolean
  placeholder?: string
  /** Slot rendered at bottom-left (e.g. model selector, chain info) */
  bottomLeft?: React.ReactNode
  className?: string
}

export function ChatInput({
  onSend,
  onStop,
  disabled = false,
  isLoading = false,
  placeholder,
  bottomLeft,
  className
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState('')

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

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value)
      setValue('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={cn('relative', isResizing && 'select-none', className)}>
      {/* Resize handle */}
      <div
        onMouseDown={handleResizeMouseDown}
        className='absolute left-0 right-0 top-0 h-3 cursor-row-resize z-10 flex items-center justify-center group'
      >
        <div className='h-0.5 w-8 rounded-full bg-muted-foreground/20 group-hover:bg-muted-foreground/40 transition-colors' />
      </div>

      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        style={{ height: inputHeight }}
        className={cn(
          'resize-none w-full rounded-2xl border border-border/60 bg-transparent',
          'pl-4 pr-12 pt-4 pb-11 text-sm leading-relaxed',
          'focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0'
        )}
      />

      {/* Bottom left slot */}
      {bottomLeft && (
        <div className='absolute left-4 bottom-3 flex items-center gap-2'>
          {bottomLeft}
        </div>
      )}

      {/* Send/Stop button */}
      {isLoading ? (
        <Button
          size='icon'
          variant='ghost'
          onClick={onStop}
          className='absolute right-3 bottom-3 h-7 w-7 flex-shrink-0 rounded-full bg-foreground text-background hover:bg-foreground/90'
        >
          <span className='h-2.5 w-2.5 rounded-none bg-background' />
        </Button>
      ) : (
        <Button
          size='icon'
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className='absolute right-3 bottom-3 h-7 w-7 flex-shrink-0 rounded-full'
        >
          <ArrowUpIcon className='h-3.5 w-3.5' />
        </Button>
      )}
    </div>
  )
}
