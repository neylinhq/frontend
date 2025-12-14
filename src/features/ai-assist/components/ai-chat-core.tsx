import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'
import { aiApi, type ChatStreamChunk, type ProposalData, useSelectedModel } from '@/entities/ai'
import { useLoaderUser } from '@/entities/user'
import { toast } from '@/shared/components/toast'
import type {
  ChatMessage,
  MapChatContext,
  NodeChatContext,
  PreviewCard,
  ResolvedPreview
} from '../model/ai-assist.types'
import { getChatSessionId, useChatHistoryStore } from '../model/ai-assist.chat.store'
import { ChatInput } from './chat-input'
import { ChatMessageList } from './chat-message-list'

const EMPTY_MESSAGES: ChatMessage[] = []

type ContextMode = 'node' | 'map'

interface AIChatCoreProps {
  nodeContext: NodeChatContext
  mapContext: MapChatContext
  emptyStateMessage?: string
  placeholderText?: string
  /** Show node/map context toggle. Only relevant in node chat panel. */
  showContextSwitch?: boolean
  onSavePreview?: (
    messageId: string,
    preview: PreviewCard
  ) => Promise<{ previousState: Record<string, unknown>; actionId: string } | undefined>
  onUndoPreview?: (preview: ResolvedPreview) => Promise<void>
}

export const AIChatCore = ({
  nodeContext,
  emptyStateMessage,
  placeholderText,
  showContextSwitch = false,
  onSavePreview,
  onUndoPreview
}: AIChatCoreProps) => {
  const { t } = useTranslation()
  const user = useLoaderUser()
  const [contextMode, setContextMode] = useState<ContextMode>('node')
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [savingPreviews, setSavingPreviews] = useState<Set<string>>(new Set())

  // AbortController для отмены стрима при размонтировании
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cleanup: отменяем стрим при размонтировании компонента
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const { models, selectedModel, setSelectedModel } = useSelectedModel()

  // Session ID always based on node (chat history persists regardless of context mode)
  const sessionId = getChatSessionId(nodeContext.mapId, nodeContext.nodeId)

  // Use persisted chat history - direct selector to avoid new array on each render
  const messages = useChatHistoryStore(s => s.sessions[sessionId]?.messages) ?? EMPTY_MESSAGES
  const addMessage = useChatHistoryStore(s => s.addMessage)
  const updateMessage = useChatHistoryStore(s => s.updateMessage)
  const removePreview = useChatHistoryStore(s => s.removePreview)
  const moveToResolved = useChatHistoryStore(s => s.moveToResolved)
  const undoResolved = useChatHistoryStore(s => s.undoResolved)
  const truncateFromMessage = useChatHistoryStore(s => s.truncateFromMessage)
  const clearSession = useChatHistoryStore(s => s.clearSession)

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) {
      return
    }

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    addMessage(sessionId, userMessage)
    setInputValue('')
    setIsStreaming(true)

    const aiMessageId = uuidv4()
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    }
    addMessage(sessionId, aiMessage)

    try {
      // Regular chat - use streaming API
      abortControllerRef.current = new AbortController()

        // Build history from previous messages (excluding current streaming one)
        const history = messages
          .filter(msg => !msg.isStreaming)
          .map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          }))

        let streamedContent = ''
        let preview: PreviewCard[] | undefined

        await aiApi.chatWithMapStream(
          nodeContext.mapId,
          content,
          (chunk: ChatStreamChunk) => {
            switch (chunk.type) {
              case 'text':
                // Append text incrementally
                streamedContent += chunk.content || ''
                updateMessage(sessionId, aiMessageId, {
                  content: streamedContent,
                  isStreaming: true
                })
                break

              case 'sources':
                // Update source nodes
                updateMessage(sessionId, aiMessageId, {
                  sourceNodes: chunk.sourceNodes
                })
                break

              case 'proposal':
                // Add proposal previews (supports batch)
                if (chunk.proposals && chunk.proposals.length > 0) {
                  const total = chunk.proposals.length
                  preview = chunk.proposals.map((p, idx) => createProposalPreview(p, idx, total))
                  updateMessage(sessionId, aiMessageId, { preview })
                } else if (chunk.proposal) {
                  preview = [createProposalPreview(chunk.proposal)]
                  updateMessage(sessionId, aiMessageId, { preview })
                }
                break

              case 'done':
                // Finalize message with brand for avatar icon
                updateMessage(sessionId, aiMessageId, {
                  content: streamedContent,
                  preview,
                  isStreaming: false,
                  brand: chunk.brand
                })
                break

              case 'error':
                updateMessage(sessionId, aiMessageId, {
                  content: chunk.content || t('ai.chat.error'),
                  isStreaming: false
                })
                break
            }
          },
          {
            model: selectedModel,
            nodeId: contextMode === 'node' ? nodeContext.nodeId : undefined,
            currentNodeId: nodeContext.nodeId,
            history,
            signal: abortControllerRef.current.signal
          }
        )
    } catch (error) {
      updateMessage(sessionId, aiMessageId, {
        content: t('ai.chat.error'),
        isStreaming: false
      })
      toast.error(t('ai.chat.error'), {
        description: error instanceof Error ? error.message : 'An error occurred'
      })
    } finally {
      setIsStreaming(false)
    }
  }

  const createProposalPreview = (proposal: ProposalData, index?: number, total?: number): PreviewCard => {
    const id = uuidv4()

    switch (proposal.type) {
      case 'exercise':
        return {
          id,
          type: 'exercise',
          data: {
            exercise: proposal.exercise ? {
              type: proposal.exercise.type as 'quiz' | 'flashcard' | 'fill_gaps' | 'match' | 'sequence' | 'true_false' | 'open_ended',
              difficulty: proposal.exercise.difficulty,
              question: proposal.exercise.question,
              options: proposal.exercise.options?.map((opt, i) => ({ id: String(i), content: opt })),
              explanation: proposal.exercise.explanation,
              // AI-generated exercises store answer directly
              answer: proposal.exercise.answer
            } : {},
            // Add batch info for ExerciseCard
            index,
            total
          },
          status: 'pending'
        }

      case 'new_node':
        return {
          id,
          type: 'new_node',
          data: proposal.newNode!,
          status: 'pending'
        }

      case 'connection':
        return {
          id,
          type: 'connection',
          data: proposal.connection!,
          status: 'pending'
        }

      case 'edit':
      default:
        return {
          id,
          type: 'enrichment',
          data: {
            field: proposal.field ?? 'description',
            current: proposal.current ?? '',
            proposed: proposal.value ?? ''
          },
          status: 'pending'
        }
    }
  }

  const handleRemovePreview = (messageId: string, previewId: string) => {
    removePreview(sessionId, messageId, previewId)
  }

  const handleSavePreview = async (messageId: string, previewCard: PreviewCard) => {
    // Защита от двойного клика: проверяем, не сохраняется ли уже этот превью
    const key = `${messageId}:${previewCard.id}`
    if (savingPreviews.has(key)) {
      return // Запрос уже в процессе
    }

    // Добавляем в Set активных сохранений
    setSavingPreviews(prev => new Set([...prev, key]))

    try {
      if (onSavePreview) {
        console.log('[AI Chat] Calling onSavePreview...')
        const result = await onSavePreview(messageId, previewCard)
        console.log('[AI Chat] onSavePreview returned:', result)
        // Move to resolved with undo data if available
        moveToResolved(
          sessionId,
          messageId,
          previewCard.id,
          'approved',
          result ? { previousState: result.previousState, actionId: result.actionId } : undefined
        )
        console.log('[AI Chat] moveToResolved completed')
      } else {
        // No save handler, just mark as resolved
        moveToResolved(sessionId, messageId, previewCard.id, 'approved')
      }
    } catch (error) {
      console.error('[AI Chat] Save preview failed:', error)
      console.error('[AI Chat] Error stack:', (error as Error).stack)
      toast.error(t('common.error'), {
        description: t('ai.saveFailed')
      })
    } finally {
      // Убираем из Set после завершения (успех или ошибка)
      setSavingPreviews(prev => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }

  const handleRejectPreview = (messageId: string, previewId: string) => {
    moveToResolved(sessionId, messageId, previewId, 'rejected')
  }

  const handleUndoResolved = async (messageId: string, preview: ResolvedPreview) => {
    if (onUndoPreview && preview.undoData) {
      try {
        await onUndoPreview(preview)
        undoResolved(sessionId, messageId, preview.id)
        toast.success(t('common.undone', 'Undone'))
      } catch {
        toast.error(t('common.error'), {
          description: t('ai.undoFailed', 'Failed to undo')
        })
      }
    } else {
      // No undo handler or no undo data, just move back to pending
      undoResolved(sessionId, messageId, preview.id)
    }
  }

  const handleCommand = async (commandId: string) => {
    switch (commandId) {
      case 'clear':
        clearSession(sessionId)
        toast.success(t('ai.commands.clearSuccess', 'Chat cleared'))
        break
      case 'enrich':
      case 'examples':
      case 'sources':
      case 'exercises':
        // These commands trigger AI actions - send as regular message
        handleSendMessage(`/${commandId}`)
        break
    }
  }

  const handleRegenerate = (messageId: string, role: 'user' | 'assistant') => {
    if (role === 'user') {
      // User message regenerate: truncate from this message and resend it
      const message = messages.find(m => m.id === messageId)
      if (message) {
        truncateFromMessage(sessionId, messageId)
        handleSendMessage(message.content)
      }
    } else {
      // AI message regenerate: truncate this AI message, find previous user message and resend it
      const messageIndex = messages.findIndex(m => m.id === messageId)
      if (messageIndex > 0) {
        // Truncate from the AI message
        truncateFromMessage(sessionId, messageId)
        // Find the user message that triggered this AI response (the one before)
        const previousUserMessage = [...messages.slice(0, messageIndex)].reverse().find(m => m.role === 'user')
        if (previousUserMessage) {
          handleSendMessage(previousUserMessage.content)
        }
      }
    }
  }

  const handleEditMessage = (messageId: string, newContent: string) => {
    // Truncate history from this message (removes it and all subsequent)
    truncateFromMessage(sessionId, messageId)
    // Send the edited message immediately
    handleSendMessage(newContent)
  }

  const defaultEmptyMessage = t('ai.chat.noMessages')

  return (
    <div className='flex h-full flex-col'>
      <div className='flex-1 overflow-y-auto [scrollbar-gutter:stable] px-3 py-3'>
        {messages.length === 0 ? (
          <div className='flex h-full items-center justify-center'>
            <p className='max-w-xs text-balance text-center text-xs text-muted-foreground'>
              {emptyStateMessage || defaultEmptyMessage}
            </p>
          </div>
        ) : (
          <ChatMessageList
            messages={messages}
            isStreaming={isStreaming}
            savingPreviews={savingPreviews}
            onRemovePreview={handleRemovePreview}
            onSavePreview={handleSavePreview}
            onRejectPreview={handleRejectPreview}
            onUndoResolved={handleUndoResolved}
            onRegenerate={handleRegenerate}
            onEditMessage={handleEditMessage}
            userAvatarUrl={user?.avatarUrl}
            userDisplayName={user?.displayName || user?.firstName}
          />
        )}
      </div>

      <div className='border-t border-border'>
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          onCommand={handleCommand}
          disabled={isStreaming}
          placeholder={placeholderText || t('ai.chat.placeholder')}
          model={selectedModel}
          onModelChange={setSelectedModel}
          models={models}
          contextMode={contextMode}
          onContextModeChange={setContextMode}
          showContextSwitch={showContextSwitch}
        />
      </div>
    </div>
  )
}
