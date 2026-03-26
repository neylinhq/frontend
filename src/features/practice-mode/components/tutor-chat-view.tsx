'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { ChatMessageItem } from '@/shared/components/chat-messages'
import { ChatMessages } from '@/shared/components/chat-messages'
import { ChatInput } from '@/shared/components/chat-input'
import { cn } from '@/shared/lib/cn'

import type { TutorChunk } from '../api/practice-mode.api'
import type { StabilityDelta } from '../model/practice-mode.store'
import { usePracticeModeActions, usePracticeModeSession, usePracticeModeStore } from '../model/practice-mode.store'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/v1'

interface TutorChatViewProps {
  mapId: string
  nodeLabels: Map<string, string>
  className?: string
}

export function TutorChatView({ mapId, nodeLabels, className }: TutorChatViewProps) {
  const { t } = useTranslation()
  const session = usePracticeModeSession()
  const { addTutorMessage, recordAnswer } = usePracticeModeActions()

  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedContent, setStreamedContent] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  // Track which nodeId was last auto-started so we re-trigger when chain advances
  const startedNodeRef = useRef<string | null>(null)

  const chain = session?.nodeQueue ?? []
  const currentNodeId = session ? chain[session.currentChainIndex] ?? null : null
  const currentNodeLabel = currentNodeId ? (nodeLabels.get(currentNodeId) ?? '') : ''

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  // Convert tutor history to ChatMessageItem format
  const chatMessages: ChatMessageItem[] = (session?.tutorHistory ?? []).map((msg, i) => ({
    id: `tutor-${i}`,
    role: msg.role,
    content: msg.content
  }))

  // Core: send a message and stream response
  const sendMessage = useCallback(async (text: string) => {
    // Read session from store directly to avoid stale closure
    const currentSession = usePracticeModeStore.getState().session
    if (isStreaming || !currentNodeId || !currentSession) {
      return
    }

    const isStart = text === ''
    if (!isStart) {
      addTutorMessage({ role: 'user', content: text })
    }

    setIsStreaming(true)
    setStreamedContent('')

    const history = isStart
      ? []
      : [...currentSession.tutorHistory, { role: 'user' as const, content: text }].map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))

    const abort = new AbortController()
    abortRef.current = abort
    let accumulated = ''

    try {
      const response = await fetch(`${API_URL}/maps/${mapId}/practice/tutor/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nodeId: currentNodeId,
          message: isStart ? '__start__' : text,
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
              stabilityBefore?: number
              stabilityAfter?: number
            }

            if (chunk.type === 'text' && chunk.content) {
              accumulated += chunk.content
              setStreamedContent(accumulated)
            }

            if (chunk.type === 'quality' && chunk.quality !== undefined) {
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
          } catch {
            // skip
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        accumulated = accumulated || t('practice.tutor.errorMessage')
      }
    } finally {
      if (accumulated) {
        addTutorMessage({ role: 'assistant', content: accumulated })
      }
      setStreamedContent('')
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [isStreaming, currentNodeId, mapId, addTutorMessage, recordAnswer, currentNodeLabel, t])

  // Auto-start: AI sends first message for each node in the chain
  useEffect(() => {
    if (!currentNodeId || startedNodeRef.current === currentNodeId) {
      return
    }
    startedNodeRef.current = currentNodeId
    sendMessage('')
  }, [currentNodeId, sendMessage])

  const handleSend = useCallback((text: string) => {
    sendMessage(text)
  }, [sendMessage])

  const handleStop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  if (!session) {
    return null
  }

  // Chain info shown inline above messages
  const chainInfo = chain.length > 1
    ? chain.map((id) => nodeLabels.get(id) ?? id.slice(0, 6)).join(' → ')
    : null

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages area */}
      <div className='flex-1 min-h-0 overflow-y-auto px-4'>
        {/* Chain breadcrumb + current node — compact, inline */}
        {chainInfo && (
          <div className='text-xs text-muted-foreground truncate pt-3 pb-1'>
            {chainInfo}
          </div>
        )}
        {currentNodeLabel && (
          <div className='text-sm font-semibold pb-2'>
            {currentNodeLabel}
          </div>
        )}

        <ChatMessages
          messages={chatMessages}
          streamingContent={streamedContent}
          isStreaming={isStreaming}
        />
      </div>

      {/* Input — same as main chat */}
      <div className='shrink-0 p-3'>
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isLoading={isStreaming}
          disabled={!currentNodeId}
          placeholder={t('practice.tutor.placeholder')}
        />
      </div>
    </div>
  )
}
