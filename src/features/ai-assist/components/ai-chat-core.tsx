import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAIModels } from '@/entities/ai'
import { useToast } from '@/shared/components/toast'
import type { ChatContext, ChatMessage, IntentHandler, PreviewCard } from '../ai-assist.types'
import { ChatInput } from './chat-input'
import { ChatMessageList } from './chat-message-list'

interface AIChatCoreProps {
  context: ChatContext
  intentHandlers: IntentHandler[]
  emptyStateMessage?: string
  onSavePreview?: (messageId: string, preview: PreviewCard) => Promise<void>
}

export const AIChatCore = ({
  context,
  intentHandlers,
  emptyStateMessage,
  onSavePreview
}: AIChatCoreProps) => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt-4')

  // Get available models from backend
  const { data: models = [] } = useAIModels()
  const availableModels =
    models.length > 0 ? models.map(m => m.id) : ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']

  const detectIntent = (
    content: string
  ): IntentHandler | undefined => {
    return intentHandlers.find(handler => handler.detect(content))
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsStreaming(true)

    const aiMessageId = crypto.randomUUID()
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    }
    setMessages(prev => [...prev, aiMessage])

    try {
      const handler = detectIntent(content)

      if (handler) {
        const result = await handler.execute(context, content, selectedModel)

        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: result.content,
                  preview: result.preview,
                  isStreaming: false
                }
              : msg
          )
        )
      } else {
        // Default response with available commands
        const commands =
          context.type === 'node'
            ? '/enrich, /examples, /sources, /exercises'
            : '/analyze, /suggest, /gaps, /summary'

        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: `I can help you with:\n\nTry these commands: ${commands}`,
                  isStreaming: false
                }
              : msg
          )
        )
      }
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
        variant: 'destructive'
      })
    } finally {
      setIsStreaming(false)
    }
  }

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
      } catch (error) {
        toast({
          title: t('common.error'),
          description: t('ai.saveFailed'),
          variant: 'destructive'
        })
      }
    } else {
      handleRemovePreview(messageId, previewCard.id)
    }
  }

  const defaultEmptyMessage =
    context.type === 'node'
      ? t('ai.chat.noMessages')
      : t('ai.chat.noMessagesMap')

  return (
    <div className="flex h-full flex-col">
      {/* Chat Messages */}
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

      {/* Input - Fixed at bottom */}
      <div className="border-t border-border">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          disabled={isStreaming}
          placeholder={t('ai.chat.placeholder')}
          model={selectedModel}
          onModelChange={setSelectedModel}
          availableModels={availableModels}
        />
      </div>
    </div>
  )
}
