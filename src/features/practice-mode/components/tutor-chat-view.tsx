'use client'

import { ArrowLeftIcon, ArrowUpIcon } from '@untitledui/icons-react/outline'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/button'
import { RichMarkdown } from '@/shared/components/rich-markdown'
import { Textarea } from '@/shared/components/textarea'
import { STREAM_API_URL } from '@/shared/config/env'
import { cn } from '@/shared/lib/cn'

import type { TutorChunk } from '../api/practice-mode.api'
import type { StabilityDelta, TutorMessage } from '../model/practice-mode.store'
import { usePracticeModeActions, usePracticeModeSession } from '../model/practice-mode.store'

// --- Types ---

interface TutorChatViewProps {
  mapId: string
  /** Map of nodeId → label for chain breadcrumb */
  nodeLabels: Map<string, string>
  className?: string
}

// --- Component ---

export function TutorChatView({ mapId, nodeLabels, className }: TutorChatViewProps) {
  const { t } = useTranslation()
  const session = usePracticeModeSession()
  const { addTutorMessage, advanceChain, recordAnswer, setView } = usePracticeModeActions()

  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedContent, setStreamedContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session?.tutorHistory.length, streamedContent])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  // Focus textarea when chain advances to new node
  useEffect(() => {
    textareaRef.current?.focus()
  }, [session?.currentChainIndex])

  const currentNodeId = session?.chain[session.currentChainIndex] ?? null
  const currentNodeLabel = currentNodeId ? (nodeLabels.get(currentNodeId) ?? '') : ''
  const chainLabels = session?.chain.map((id) => nodeLabels.get(id) ?? id.slice(0, 6)) ?? []
  const chainProgress = session ? `${session.currentChainIndex + 1}/${session.chain.length}` : ''

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isStreaming || !currentNodeId || !session) {
      return
    }

    // Add user message
    const userMsg: TutorMessage = { role: 'user', content: text }
    addTutorMessage(userMsg)
    setInput('')
    setIsStreaming(true)
    setStreamedContent('')

    const history = [...session.tutorHistory, userMsg].map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    const abort = new AbortController()
    abortRef.current = abort

    let accumulated = ''

    try {
      const response = await fetch(`${STREAM_API_URL}/maps/${mapId}/practice/tutor/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nodeId: currentNodeId,
          message: text,
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
          if (!line.startsWith('data: ')) {
            continue
          }
          try {
            const chunk = JSON.parse(line.slice(6)) as TutorChunk & {
              quality?: number
              nextNodeId?: string
              stabilityBefore?: number
              stabilityAfter?: number
            }

            if (chunk.type === 'text' && chunk.content) {
              accumulated += chunk.content
              setStreamedContent(accumulated)
            }

            if (chunk.type === 'quality' && chunk.quality !== undefined) {
              // Record FSRS update
              const delta: StabilityDelta | undefined =
                chunk.stabilityBefore !== undefined && chunk.stabilityAfter !== undefined
                  ? {
                      nodeId: currentNodeId,
                      nodeLabel: currentNodeLabel,
                      before: chunk.stabilityBefore,
                      after: chunk.stabilityAfter,
                      delta: chunk.stabilityAfter - chunk.stabilityBefore,
                    }
                  : undefined
              recordAnswer(currentNodeId, chunk.quality >= 3, delta)
            }

            if (chunk.type === 'chain_advance' && chunk.nextNodeId) {
              // Will advance after message is committed
            }
          } catch {
            // skip unparseable
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        accumulated = accumulated || t('practice.tutor.errorMessage', 'Something went wrong. Try again.')
      }
    } finally {
      // Commit assistant message
      if (accumulated) {
        addTutorMessage({ role: 'assistant', content: accumulated })
      }
      setStreamedContent('')
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [input, isStreaming, currentNodeId, session, mapId, addTutorMessage, recordAnswer, currentNodeLabel, t])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleBack = useCallback(() => {
    abortRef.current?.abort()
    setView('overview')
  }, [setView])

  if (!session) {
    return null
  }

  const messages = session.tutorHistory

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header: back + chain breadcrumb */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 shrink-0">
        <button
          type="button"
          onClick={handleBack}
          className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground truncate">
            {chainLabels.join(' → ')}
          </div>
        </div>
        <span className="text-xs tabular-nums text-muted-foreground shrink-0">
          {chainProgress}
        </span>
      </div>

      {/* Current node indicator */}
      <div className="px-4 py-2 shrink-0">
        <span className="text-sm font-semibold">{currentNodeLabel}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-2">
        <div className="flex flex-col gap-3">
          {messages.length === 0 && !isStreaming && (
            <p className="text-xs text-muted-foreground py-4 text-center">
              {t('practice.tutor.startHint', 'The tutor will start the conversation. Type anything to begin.')}
            </p>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={`${msg.role}-${i}`} message={msg} />
          ))}

          {/* Streaming assistant message */}
          {isStreaming && streamedContent && (
            <div className="space-y-1">
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                <RichMarkdown>{streamedContent}</RichMarkdown>
              </div>
            </div>
          )}

          {/* Streaming indicator */}
          {isStreaming && !streamedContent && (
            <div className="flex gap-1 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border/40 p-3">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('practice.tutor.placeholder', 'Your answer...')}
            className="min-h-[40px] max-h-[120px] text-sm resize-none"
            disabled={isStreaming}
            rows={1}
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="shrink-0 self-end h-9 w-9 p-0"
          >
            <ArrowUpIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// --- Message Bubble ---

function MessageBubble({ message }: { message: TutorMessage }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="rounded-2xl rounded-br-md bg-primary/10 px-3 py-2 max-w-[85%]">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
        <RichMarkdown>{message.content}</RichMarkdown>
      </div>
    </div>
  )
}
