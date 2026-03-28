'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useSelectedModel } from '@/entities/ai'
import { ChatInput } from '@/shared/components/chat-input'
import type { ChatMessageItem } from '@/shared/components/chat-messages'
import { ChatMessages } from '@/shared/components/chat-messages'
import { ModelSelector } from '@/shared/components/model-selector'
import { cn } from '@/shared/lib/cn'
import { useStreamingStore } from '@/shared/lib/streaming-store'

import { usePracticeModeActions, usePracticeModeSession, usePracticeModeStore } from '../model/practice-mode.store'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/v1'

interface TutorChatViewProps {
  mapId: string
  nodeLabels?: Map<string, string>
  className?: string
}

export function TutorChatView({ mapId, className }: TutorChatViewProps) {
  const { t } = useTranslation()
  const session = usePracticeModeSession()
  const { addTutorMessage, markSubgraphNodeCompleted } = usePracticeModeActions()
  const { models, selectedModel, setSelectedModel } = useSelectedModel()

  const STREAM_KEY = `tutor-${mapId}`
  const startStream = useStreamingStore((s) => s.startStream)
  const stopStreamAction = useStreamingStore((s) => s.stopStream)
  const clearStream = useStreamingStore((s) => s.clearStream)
  const isStreaming = useStreamingStore((s) => !!s.streams[STREAM_KEY])

  const [streamedContent, setStreamedContent] = useState('')
  const autoStarted = useRef(false)

  const subgraph = session?.sessionSubgraph ?? null
  const chain = session?.nodeQueue ?? []
  // Use first node as reference for nodeId in API calls
  const firstNodeId = chain[0] ?? null

  // Subgraph header: node labels, completed ones styled differently
  const subgraphNodes = subgraph?.nodes ?? []

  // Convert tutor history to ChatMessageItem format
  const chatMessages: ChatMessageItem[] = (session?.tutorHistory ?? []).map((msg, i) => ({
    id: `tutor-${i}`,
    role: msg.role,
    content: msg.content,
  }))

  // Core: send a message and stream response
  const sendMessage = useCallback(
    async (text: string) => {
      const currentSession = usePracticeModeStore.getState().session
      if (isStreaming || !firstNodeId || !currentSession) {
        return
      }

      const isStart = text === ''
      if (!isStart) {
        addTutorMessage({ role: 'user', content: text })
      }

      setStreamedContent('')

      const history = isStart
        ? []
        : [...currentSession.tutorHistory, { role: 'user' as const, content: text }].map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }))

      const abort = startStream(STREAM_KEY, `msg-${Date.now()}`)
      let accumulated = ''

      try {
        const response = await fetch(`${API_URL}/maps/${mapId}/practice/tutor/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            nodeId: firstNodeId,
            message: isStart ? '__start__' : text,
            model: selectedModel,
            history,
            nodeQueue: chain,
            nodeQueueIdx: 0,
            sessionSubgraph: currentSession.sessionSubgraph,
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
              const chunk = JSON.parse(line.slice(6)) as {
                type: string
                content?: string
                evaluations?: Array<{ nodeId: string; quality: number }>
                quality?: number
                stabilityBefore?: number
                stabilityAfter?: number
              }

              if (chunk.type === 'text' && chunk.content) {
                accumulated += chunk.content
                setStreamedContent(accumulated)
              }

              // Handle inline evaluations from AI
              if (chunk.type === 'node_evaluations' && chunk.evaluations) {
                for (const evaluation of chunk.evaluations) {
                  markSubgraphNodeCompleted(evaluation.nodeId, evaluation.quality)
                }
              }

              // Handle content correction (eval tags stripped)
              if (chunk.type === 'content_correction' && chunk.content) {
                accumulated = chunk.content
              }

              // Legacy quality chunk (fallback when no inline evals)
              if (chunk.type === 'quality') {
                // Quality handled by backend, no action needed on frontend
              }
            } catch {
              // skip unparseable chunks
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
        clearStream(STREAM_KEY)
      }
    },
    [isStreaming, firstNodeId, chain, mapId, selectedModel, addTutorMessage, markSubgraphNodeCompleted, t, startStream, clearStream, STREAM_KEY]
  )

  // Auto-start: AI sends first message when session begins
  useEffect(() => {
    if (!firstNodeId || autoStarted.current) {
      return
    }
    autoStarted.current = true
    sendMessage('')
  }, [firstNodeId, sendMessage])

  const handleSend = useCallback(
    (text: string) => {
      sendMessage(text)
    },
    [sendMessage]
  )

  const handleStop = useCallback(() => {
    stopStreamAction(STREAM_KEY)
  }, [stopStreamAction, STREAM_KEY])

  if (!session) {
    return null
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className='flex-1 min-h-0 overflow-y-auto px-4'>
        {/* Subgraph header: node labels */}
        {subgraphNodes.length > 0 && (
          <div className='flex flex-wrap gap-x-2 gap-y-1 py-2'>
            {subgraphNodes.map((node) => (
              <span
                key={node.nodeId}
                className={cn(
                  'text-xs transition-colors',
                  node.status === 'completed'
                    ? 'text-muted-foreground/50'
                    : 'text-muted-foreground'
                )}
              >
                {node.label}
                {node.nodeId !== subgraphNodes[subgraphNodes.length - 1]?.nodeId && ','}
              </span>
            ))}
          </div>
        )}

        <ChatMessages
          messages={chatMessages}
          streamingContent={streamedContent}
          isStreaming={isStreaming}
        />
      </div>

      <div className='shrink-0 px-4 py-3 flex flex-col gap-2'>
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isLoading={isStreaming}
          disabled={!firstNodeId}
          placeholder={t('practice.tutor.placeholder')}
          bottomLeft={
            <ModelSelector
              value={selectedModel}
              onChange={setSelectedModel}
              models={models}
              disabled={isStreaming}
            />
          }
        />
      </div>
    </div>
  )
}
