import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
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
import { chatSessionKeys, useChatSession, useAddChatMessage } from '../model/ai-assist.sessions.hooks'
import type { ChatProposal } from '../model/ai-assist.sessions.types'
import { ChatInput } from './chat-input'
import { ChatEmptyState } from './chat-empty-state'
import { ChatMessageList } from './chat-message-list'

const EMPTY_MESSAGES: ChatMessage[] = []

interface AIChatCoreProps {
  nodeContext: NodeChatContext
  mapContext: MapChatContext
  /** Session ID for multi-chat support. If not provided, uses legacy localStorage-based session. */
  sessionId?: string | null
  emptyStateMessage?: string
  placeholderText?: string
  /** @deprecated Context switch removed - unified context is always used */
  showContextSwitch?: boolean
  onSavePreview?: (
    messageId: string,
    preview: PreviewCard
  ) => Promise<{ previousState: Record<string, unknown>; actionId: string } | undefined>
  onUndoPreview?: (preview: ResolvedPreview) => Promise<void>
  /** Called when rejecting a preview that was previously applied (to delete created entities) */
  onRejectAppliedPreview?: (preview: PreviewCard) => Promise<void>
}

export const AIChatCore = ({
  nodeContext,
  mapContext,
  sessionId: externalSessionId,
  emptyStateMessage,
  placeholderText,
  onSavePreview,
  onUndoPreview,
  onRejectAppliedPreview
}: AIChatCoreProps) => {
  const { t } = useTranslation()
  const user = useLoaderUser()
  const queryClient = useQueryClient()
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [savingPreviews, setSavingPreviews] = useState<Set<string>>(new Set())
  const [dbMessagesLoaded, setDbMessagesLoaded] = useState(false)

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

  // Stop streaming handler
  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  const { models, selectedModel, setSelectedModel } = useSelectedModel()

  // Session ID: use external DB session if provided, otherwise fallback to legacy localStorage-based
  const legacySessionId = getChatSessionId(nodeContext.mapId, nodeContext.nodeId)
  const sessionId = externalSessionId || legacySessionId

  // Fetch session with messages from DB (only for DB sessions)
  const { data: dbSessionData, isLoading: isLoadingSession } = useChatSession(
    mapContext.mapId,
    externalSessionId || ''
  )

  // API hook for saving messages to DB
  const addMessageToDb = useAddChatMessage(mapContext.mapId)

  // Use persisted chat history - direct selector to avoid new array on each render
  const localMessages = useChatHistoryStore(s => s.sessions[sessionId]?.messages) ?? EMPTY_MESSAGES
  const addMessage = useChatHistoryStore(s => s.addMessage)
  const updateMessage = useChatHistoryStore(s => s.updateMessage)
  const removePreview = useChatHistoryStore(s => s.removePreview)
  const moveToResolved = useChatHistoryStore(s => s.moveToResolved)
  const undoResolved = useChatHistoryStore(s => s.undoResolved)
  const truncateFromMessage = useChatHistoryStore(s => s.truncateFromMessage)
  const clearSession = useChatHistoryStore(s => s.clearSession)
  const setMessages = useChatHistoryStore(s => s.setMessages)

  // Load messages from DB when session changes (sync DB -> localStorage for display)
  useEffect(() => {
    if (!externalSessionId || !dbSessionData?.messages || isLoadingSession) return

    // Only load once per session to avoid overwriting local streaming state
    if (dbMessagesLoaded) return

    // Convert DB messages to local format
    const dbMessages: ChatMessage[] = dbSessionData.messages.map(m => {
      // Map DB proposals to PreviewCard format
      const pendingPreviews: PreviewCard[] = (m.proposals || [])
        .filter(p => p.status === 'pending')
        .map(p => ({
          id: (p.data?.id as string) || uuidv4(),
          type: p.type as PreviewCard['type'],
          data: p.data as unknown as PreviewCard['data'],
          status: 'pending' as const
        }))

      // Map to ResolvedPreview format
      const resolvedPreviews: ResolvedPreview[] = (m.proposals || [])
        .filter(p => p.status !== 'pending')
        .map(p => ({
          id: (p.data?.id as string) || uuidv4(),
          type: p.type as ResolvedPreview['type'],
          data: p.data as unknown as ResolvedPreview['data'],
          status: p.status === 'accepted' ? 'approved' as const : 'rejected' as const,
          resolvedAt: new Date()
        }))

      return {
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(m.createdAt),
        preview: pendingPreviews.length > 0 ? pendingPreviews : undefined,
        resolvedPreviews: resolvedPreviews.length > 0 ? resolvedPreviews : undefined
      }
    })

    // Set messages in local store (replace existing)
    if (setMessages) {
      setMessages(sessionId, dbMessages)
    }
    setDbMessagesLoaded(true)
  }, [externalSessionId, dbSessionData, isLoadingSession, sessionId, dbMessagesLoaded, setMessages])

  // Reset loaded flag when session changes
  useEffect(() => {
    setDbMessagesLoaded(false)
  }, [externalSessionId])

  // Use local messages for display (they include streaming state)
  const messages = localMessages

  // Save message to DB (for DB sessions)
  const saveMessageToDb = useCallback(async (
    role: 'user' | 'assistant',
    content: string,
    proposals?: PreviewCard[]
  ) => {
    if (!externalSessionId) return

    try {
      // Convert PreviewCard[] to ChatProposal[] for DB
      const dbProposals = proposals?.map(p => ({
        type: p.type as ChatProposal['type'],
        status: 'pending' as const,
        data: p.data as unknown as Record<string, unknown>
      }))

      await addMessageToDb.mutateAsync({
        sessionId: externalSessionId,
        role,
        content,
        proposals: dbProposals
      })

      // Invalidate session cache to sync with DB
      queryClient.invalidateQueries({ queryKey: chatSessionKeys.list(mapContext.mapId) })
    } catch {
      // Non-critical error - message is still in localStorage
      // This can happen if backend is not updated or not available
    }
  }, [externalSessionId, addMessageToDb, queryClient, mapContext.mapId])

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

    // Save user message to DB (title auto-generated on backend for first message)
    saveMessageToDb('user', content.trim())

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
              // Save assistant message to DB after streaming completes
              saveMessageToDb('assistant', streamedContent, preview)
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
          // Unified context: always pass currentNodeId for focus node
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

      case 'graph_fragment':
        return {
          id,
          type: 'graph_fragment',
          data: {
            title: proposal.graphFragment?.title ?? '',
            nodes: (proposal.graphFragment?.nodes ?? []).map(n => ({
              tempId: n.tempId,
              label: n.label,
              nodeType: n.nodeType,
              description: n.description,
              content: n.content,
              selected: true
            })),
            edges: (proposal.graphFragment?.edges ?? []).map(e => ({
              tempId: e.tempId,
              fromRef: e.fromRef,
              toRef: e.toRef,
              fromIsNew: e.fromIsNew,
              toIsNew: e.toIsNew,
              relation: e.relation,
              selected: true
            })),
            reasoning: proposal.graphFragment?.reasoning
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
        const result = await onSavePreview(messageId, previewCard)
        moveToResolved(
          sessionId,
          messageId,
          previewCard.id,
          'approved',
          result ? { previousState: result.previousState, actionId: result.actionId } : undefined
        )
      } else {
        // No save handler, just mark as resolved
        moveToResolved(sessionId, messageId, previewCard.id, 'approved')
      }
    } catch (error) {
      // Extract error message from API response
      const apiError = error as { data?: { error?: { message?: string } } }
      const errorMessage = apiError.data?.error?.message || (error as Error).message || t('ai.saveFailed')
      toast.error(t('common.error'), {
        description: errorMessage
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

  const handleRejectPreview = async (messageId: string, preview: PreviewCard) => {
    // If preview has applied entity IDs, delete them first
    if (onRejectAppliedPreview) {
      let hasAppliedEntities = false

      if (preview.type === 'graph_fragment') {
        // For graph_fragment, check if any nodes/edges have been applied
        const data = preview.data as import('../model/ai-assist.types').GraphFragmentPreviewData
        hasAppliedEntities = data.nodes.some(n => n.appliedNodeId) || data.edges.some(e => e.appliedEdgeId)
      } else {
        // For other types, check appliedNodeId/appliedEdgeId on the data object
        const data = preview.data as { appliedNodeId?: string; appliedEdgeId?: string }
        hasAppliedEntities = !!(data.appliedNodeId || data.appliedEdgeId)
      }

      if (hasAppliedEntities) {
        try {
          await onRejectAppliedPreview(preview)
        } catch {
          toast.error(t('common.error'), {
            description: t('ai.deleteFailed', 'Failed to delete')
          })
          return
        }
      }
    }
    moveToResolved(sessionId, messageId, preview.id, 'rejected')
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

  // Determine context type for empty state suggestions
  const chatContext = nodeContext.nodeId ? 'node' : 'map'

  return (
    <div className='flex h-full flex-col'>
      <div className='flex-1 overflow-y-auto [scrollbar-gutter:stable] px-3 py-3'>
        {messages.length === 0 ? (
          <ChatEmptyState
            title={emptyStateMessage}
            context={chatContext}
            onSuggestionClick={handleSendMessage}
          />
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
          />
        )}
      </div>

      <div className='border-t border-border'>
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          onStop={handleStop}
          onCommand={handleCommand}
          disabled={isStreaming}
          isLoading={isStreaming}
          placeholder={placeholderText || t('ai.chat.placeholder')}
          model={selectedModel}
          onModelChange={setSelectedModel}
          models={models}
        />
      </div>
    </div>
  )
}
