import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'
import { aiApi, type ChatStreamChunk, type ProposalData, useSelectedModel } from '@/entities/ai'
import { toast } from '@/shared/components/toast'
import type { ChatMessage, MapChatContext, NodeChatContext, PreviewCard, ResolvedPreview } from '../ai-assist.types'
import { useChatHistoryStore, getChatSessionId } from '../model/chat-history.store'
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
  onSavePreview?: (messageId: string, preview: PreviewCard) => Promise<{ previousState: Record<string, unknown>; actionId: string } | void>
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
  const [contextMode, setContextMode] = useState<ContextMode>('node')
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

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
  const clearSession = useChatHistoryStore(s => s.clearSession)

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return

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
      // Build history from previous messages (excluding current streaming one)
      const history = messages
        .filter(msg => !msg.isStreaming)
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))

      let streamedContent = ''
      let preview: PreviewCard[] | undefined

      // Use streaming API
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
              // Add proposal preview
              if (chunk.proposal) {
                preview = [createProposalPreview(chunk.proposal)]
                updateMessage(sessionId, aiMessageId, { preview })
              }
              break

            case 'done':
              // Finalize message
              updateMessage(sessionId, aiMessageId, {
                content: streamedContent,
                preview,
                isStreaming: false
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
          history
        }
      )
    } catch (error) {
      updateMessage(sessionId, aiMessageId, {
        content: t('ai.chat.error'),
        isStreaming: false
      })
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
      })
    } finally {
      setIsStreaming(false)
    }
  }

  const createProposalPreview = (proposal: ProposalData): PreviewCard => ({
    id: uuidv4(),
    type: 'enrichment',
    data: {
      field: proposal.field,
      current: proposal.current,
      proposed: proposal.value
    },
    status: 'pending'
  })

  const handleRemovePreview = (messageId: string, previewId: string) => {
    removePreview(sessionId, messageId, previewId)
  }

  const handleSavePreview = async (messageId: string, previewCard: PreviewCard) => {
    if (onSavePreview) {
      try {
        const result = await onSavePreview(messageId, previewCard)
        // Move to resolved with undo data if available
        moveToResolved(
          sessionId,
          messageId,
          previewCard.id,
          'approved',
          result ? { previousState: result.previousState, actionId: result.actionId } : undefined
        )
      } catch {
        toast.error(t('common.error'), {
          description: t('ai.saveFailed')
        })
      }
    } else {
      // No save handler, just mark as resolved
      moveToResolved(sessionId, messageId, previewCard.id, 'approved')
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

  const defaultEmptyMessage = t('ai.chat.noMessages')

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="max-w-xs text-balance text-center text-xs text-muted-foreground">
              {emptyStateMessage || defaultEmptyMessage}
            </p>
          </div>
        ) : (
          <ChatMessageList
            messages={messages}
            isStreaming={isStreaming}
            onRemovePreview={handleRemovePreview}
            onSavePreview={handleSavePreview}
            onRejectPreview={handleRejectPreview}
            onUndoResolved={handleUndoResolved}
          />
        )}
      </div>

      <div className="border-t border-border">
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
