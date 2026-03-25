'use client'

import { ArrowUpIcon } from '@untitledui/icons-react/outline'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/button'
import { RichMarkdown } from '@/shared/components/rich-markdown'
import { Textarea } from '@/shared/components/textarea'
import { STREAM_API_URL } from '@/shared/config/env'
import { cn } from '@/shared/lib/cn'

// --- Types ---

interface HelpMessage {
  role: 'user' | 'assistant'
  content: string
}

interface StepAIHelpProps {
  mapId: string
  conceptTitle: string
  stepQuestion: string
  /** Called when user used AI help — affects FSRS rating */
  onHelpUsed: () => void
  className?: string
}

/**
 * Inline expandable AI help for a learn session step.
 * User clicks "Спросить" → mini-chat appears below the step.
 * Scoped to the current step's context. Collapse to continue.
 */
export function StepAIHelp({ mapId, conceptTitle, stepQuestion, onHelpUsed, className }: StepAIHelpProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<HelpMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [helpUsed, setHelpUsed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isStreaming) {
      return
    }

    // Mark help as used on first question
    if (!helpUsed) {
      setHelpUsed(true)
      onHelpUsed()
    }

    const userMsg: HelpMessage = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsStreaming(true)

    const assistantMsg: HelpMessage = { role: 'assistant', content: '' }
    setMessages((prev) => [...prev, assistantMsg])

    const history = [...messages, userMsg].map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    const abort = new AbortController()
    abortRef.current = abort

    let streamed = ''

    try {
      const response = await fetch(`${STREAM_API_URL}/maps/${mapId}/learn/help/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          question: text,
          conceptTitle,
          stepQuestion,
          history,
        }),
        signal: abort.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No body')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      for (;;) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const chunk = JSON.parse(line.slice(6))
              if (chunk.type === 'text' && chunk.content) {
                streamed += chunk.content
                setMessages((prev) => {
                  const updated = [...prev]
                  updated[updated.length - 1] = { role: 'assistant', content: streamed }
                  return updated
                })
              }
            } catch {
              // skip
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: streamed || t('practice.mode.helpUnavailable', 'Could not get help right now. Try again.'),
          }
          return updated
        })
      }
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [input, isStreaming, helpUsed, onHelpUsed, messages, mapId, conceptTitle, stepQuestion, t])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          'text-xs text-muted-foreground hover:text-foreground transition-colors self-start',
          className
        )}
      >
        {t('practice.mode.askAboutThis', 'Ask about this')}
      </button>
    )
  }

  return (
    <div className={cn('rounded-lg border bg-muted/20 p-3 space-y-2', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {t('practice.mode.aiHelp', 'AI Help')}
        </span>
        <button
          type="button"
          onClick={handleToggle}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      {messages.length > 0 && (
        <div className="max-h-[200px] overflow-y-auto space-y-2">
          {messages.map((msg, i) => (
            <div key={`${msg.role}-${i}`} className={msg.role === 'user' ? 'text-right' : ''}>
              {msg.role === 'user' ? (
                <span className="inline-block rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs">
                  {msg.content}
                </span>
              ) : (
                <div className="prose prose-xs dark:prose-invert max-w-none text-xs">
                  <RichMarkdown>{msg.content}</RichMarkdown>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input */}
      <div className="flex gap-1.5">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('practice.mode.askQuestion', 'Ask a question...')}
          className="min-h-[32px] max-h-[80px] text-xs resize-none"
          disabled={isStreaming}
          rows={1}
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          className="shrink-0 self-end h-8 w-8 p-0"
        >
          <ArrowUpIcon className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
