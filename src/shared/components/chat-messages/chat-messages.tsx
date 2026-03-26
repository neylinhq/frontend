'use client'

import { useEffect, useRef } from 'react'

import { CopyButton } from '@/shared/components/copy-button'
import { LoadingDots } from '@/shared/components/loading-dots'
import { RichMarkdown } from '@/shared/components/rich-markdown'
import { cn } from '@/shared/lib/cn'

// --- Types ---

export interface ChatMessageItem {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

interface ChatMessagesProps {
  messages: ChatMessageItem[]
  /** Content currently being streamed (not yet committed to messages) */
  streamingContent?: string
  /** Whether AI is currently generating a response */
  isStreaming?: boolean
  /** Additional class name for the container */
  className?: string
}

// --- Component ---

export function ChatMessages({ messages, streamingContent, isStreaming, className }: ChatMessagesProps) {
  const endRef = useRef<HTMLDivElement>(null)
  const initialScrollDone = useRef(false)

  // Scroll to bottom on new messages or streaming content
  useEffect(() => {
    if (!initialScrollDone.current && messages.length > 0) {
      endRef.current?.scrollIntoView({ behavior: 'instant' })
      initialScrollDone.current = true
    } else {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, streamingContent])

  return (
    <div className={cn('flex flex-col gap-5 py-4', className)}>
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {/* Currently streaming assistant message (not yet in messages array) */}
      {isStreaming && streamingContent && (
        <div className='pl-3'>
          <div className='prose prose-sm max-w-none dark:prose-invert'>
            <RichMarkdown>{streamingContent}</RichMarkdown>
          </div>
        </div>
      )}

      {/* Thinking indicator */}
      {isStreaming && !streamingContent && (
        <div className='pl-3 py-1'>
          <LoadingDots />
        </div>
      )}

      <div ref={endRef} />
    </div>
  )
}

// --- Message Bubble ---

function MessageBubble({ message }: { message: ChatMessageItem }) {
  if (message.role === 'user') {
    return (
      <div className='flex justify-end'>
        <div className='max-w-2xl rounded-xl border border-border/50 bg-muted/50 px-3 py-2 text-sm leading-relaxed'>
          <p className='whitespace-pre-wrap break-words'>{message.content}</p>
        </div>
      </div>
    )
  }

  // Assistant message
  const isThinking = message.isStreaming && !message.content
  return (
    <div className='group'>
      <div className='pl-3 space-y-3'>
        {isThinking ? (
          <div className='py-1'>
            <LoadingDots />
          </div>
        ) : (
          <>
            <div
              className='prose prose-sm max-w-none dark:prose-invert'
              aria-live={message.isStreaming ? 'polite' : 'off'}
              aria-atomic='false'
            >
              <RichMarkdown>{message.content}</RichMarkdown>
            </div>
            {message.isStreaming && (
              <div className='py-0.5'>
                <LoadingDots />
              </div>
            )}
            {!message.isStreaming && message.content && (
              <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-100'>
                <CopyButton
                  value={message.content}
                  className='h-6 w-6 rounded-xs text-muted-foreground hover:text-foreground transition-colors'
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
