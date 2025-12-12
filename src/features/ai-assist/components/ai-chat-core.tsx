import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'
import { aiApi, type ProposalData } from '@/entities/ai'
import { useAIModels } from '@/entities/ai'
import { toast } from '@/shared/components/toast'
import type { ChatContext, ChatMessage, MapChatContext, NodeChatContext, PreviewCard } from '../ai-assist.types'
import { ChatInput } from './chat-input'
import { ChatMessageList } from './chat-message-list'

type ContextMode = 'node' | 'map'

interface AIChatCoreProps {
  nodeContext: NodeChatContext
  mapContext: MapChatContext
  emptyStateMessage?: string
  onSavePreview?: (messageId: string, preview: PreviewCard) => Promise<void>
}

export const AIChatCore = ({
  nodeContext,
  mapContext,
  emptyStateMessage,
  onSavePreview
}: AIChatCoreProps) => {
  const { t } = useTranslation()
  const [contextMode, setContextMode] = useState<ContextMode>('node')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const { data: models = [] } = useAIModels()
  const [selectedModel, setSelectedModel] = useState(() => models[0]?.id || 'nex-agi/deepseek-v3.1-nex-n1:free')

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
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
    setMessages(prev => [...prev, aiMessage])

    try {
      const result = await aiApi.chatWithMap(
        nodeContext.mapId,
        content,
        selectedModel,
        undefined,
        contextMode === 'node' ? nodeContext.nodeId : undefined
      )

      // Build preview if AI proposed changes
      let preview: PreviewCard[] | undefined
      if (result.action === 'proposal' && result.proposal) {
        preview = [createProposalPreview(result.proposal)]
      }

      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: result.message,
                sourceNodes: result.sourceNodes,
                preview,
                isStreaming: false
              }
            : msg
        )
      )
    } catch (error) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: t('ai.chat.error'),
                isStreaming: false
              }
            : msg
        )
      )
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
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id !== messageId || !msg.preview) return msg
        return {
          ...msg,
          preview: msg.preview.filter(p => p.id !== previewId)
        }
      })
    )
  }

  const handleSavePreview = async (messageId: string, previewCard: PreviewCard) => {
    if (onSavePreview) {
      try {
        await onSavePreview(messageId, previewCard)
        handleRemovePreview(messageId, previewCard.id)
      } catch {
        toast.error(t('common.error'), {
          description: t('ai.saveFailed')
        })
      }
    } else {
      handleRemovePreview(messageId, previewCard.id)
    }
  }

  const defaultEmptyMessage =
    contextMode === 'node'
      ? t('ai.chat.noMessages')
      : t('ai.chat.noMessagesMap')

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
          />
        )}
      </div>

      <div className="border-t border-border">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          disabled={isStreaming}
          placeholder={t('ai.chat.placeholder')}
          model={selectedModel}
          onModelChange={setSelectedModel}
          models={models}
          contextMode={contextMode}
          onContextModeChange={setContextMode}
          showContextSwitch
        />
      </div>
    </div>
  )
}
