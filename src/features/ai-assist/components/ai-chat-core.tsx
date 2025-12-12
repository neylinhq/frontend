import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'
import { aiApi, useAIModels } from '@/entities/ai'
import { toast } from '@/shared/components/toast'
import type { ChatContext, ChatMessage, IntentHandler, MapChatContext, PreviewCard } from '../ai-assist.types'
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
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  // Get available models from backend
  const { data: models = [] } = useAIModels()
  const [selectedModel, setSelectedModel] = useState(() => models[0]?.id || 'meta-llama/llama-3.2-3b-instruct:free')

  const detectIntent = (
    content: string
  ): IntentHandler | undefined => {
    return intentHandlers.find(handler => handler.detect(content))
  }

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
      const handler = detectIntent(content)

      throw new Error('Fuck')

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
        // Free-form Q&A via RAG for map context
        if (context.type === 'map') {
          const mapContext = context as MapChatContext
          const result = await aiApi.chatWithMap(
            mapContext.mapId,
            content,
            selectedModel
          )

          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    content: result.answer,
                    sourceNodes: result.sourceNodes,
                    isStreaming: false
                  }
                : msg
            )
          )
        } else {
          // Fallback for node context - show available commands
          const commands = '/enrich, /examples, /sources, /exercises'

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
          models={models}
        />
      </div>
    </div>
  )
}
