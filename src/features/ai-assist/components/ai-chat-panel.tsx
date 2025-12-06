import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useEnrichNode, type EnrichType } from '@/entities/ai'
import { useGenerateExercises } from '@/entities/exercise'
import { useNode, useUpdateNode } from '@/entities/node'
import { Separator } from '@/shared/components/separator'
import { useToast } from '@/shared/components/toast'
import type { ChatMessage, PreviewCard, QuickActionType, EnrichmentPreviewData, ExercisePreviewData } from '../chat.types'
import { ChatMessageList } from './chat-message-list'
import { ChatInput } from './chat-input'
import { QuickActionBar } from './quick-action-bar'
import { ContextIndicator } from './context-indicator'

interface AIChatPanelProps {
  nodeId: string
  mapId: string
  quickActions?: QuickActionType[]
}

export const AIChatPanel = ({ nodeId, mapId, quickActions = ['enrich', 'examples', 'sources', 'exercises'] }: AIChatPanelProps) => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  // Data hooks
  const { data: node } = useNode(mapId, nodeId)
  const enrichNodeMutation = useEnrichNode()
  const generateExercisesMutation = useGenerateExercises()
  const updateNodeMutation = useUpdateNode()

  const handleQuickAction = (action: QuickActionType) => {
    // Map quick actions to prompts
    const promptMap: Record<QuickActionType, string> = {
      enrich: t('ai.improveDescription'),
      examples: t('ai.generateExamples'),
      sources: t('ai.findSources'),
      exercises: t('ai.generateExercises')
    }

    // Fill input with prompt and trigger send
    const prompt = promptMap[action]
    setInputValue(prompt)
    // Auto-send after filling
    setTimeout(() => handleSendMessage(prompt), 100)
  }

  const detectIntent = (content: string): QuickActionType | 'general' => {
    const lower = content.toLowerCase()
    if (lower.includes('description') || lower.includes('improve') || lower.includes('enhance')) {
      return 'enrich'
    }
    if (lower.includes('example') || lower.includes('demo')) {
      return 'examples'
    }
    if (lower.includes('source') || lower.includes('reference') || lower.includes('link')) {
      return 'sources'
    }
    if (lower.includes('exercise') || lower.includes('quiz') || lower.includes('flashcard') || lower.includes('practice')) {
      return 'exercises'
    }
    return 'general'
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isStreaming || !node) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsStreaming(true)

    const intent = detectIntent(content)
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
      if (intent === 'exercises') {
        const result: any = await generateExercisesMutation.mutateAsync({
          mapId,
          request: {
            nodeIds: [nodeId],
            difficulty: 3,
            count: 5
          }
        })

        const previews: PreviewCard[] = (result.exercises || []).map((exercise: any, index: number) => ({
          id: crypto.randomUUID(),
          type: 'exercise',
          data: {
            exercise,
            index,
            total: result.exercises?.length || 0
          } as ExercisePreviewData,
          status: 'pending'
        }))

        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: `I've generated ${previews.length} exercises. Review and save the ones you like.`,
                  preview: previews,
                  isStreaming: false
                }
              : msg
          )
        )
      } else if (intent === 'enrich' || intent === 'examples' || intent === 'sources') {
        const enrichType: EnrichType = intent === 'enrich' ? 'description' : intent
        const result: any = await enrichNodeMutation.mutateAsync({
          nodeId,
          enrichType
        })

        const previews: PreviewCard[] = [{
          id: crypto.randomUUID(),
          type: 'enrichment',
          data: {
            field: enrichType,
            current: node.content || '',
            proposed: result.enrichedContent || result.description || ''
          } as EnrichmentPreviewData,
          status: 'pending'
        }]

        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: `I've enriched the ${enrichType}. Review the changes below.`,
                  preview: previews,
                  isStreaming: false
                }
              : msg
          )
        )
      } else {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: `I can help you with:\n• Improving the description\n• Generating examples\n• Finding sources\n• Creating exercises\n\nTry asking me!`,
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
    try {
      if (previewCard.type === 'enrichment') {
        const data = previewCard.data as EnrichmentPreviewData
        await updateNodeMutation.mutateAsync({
          mapId,
          nodeId,
          updates: {
            content: data.proposed
          }
        })

        toast({
          title: 'Success',
          description: 'Node updated successfully'
        })

        handleRemovePreview(messageId, previewCard.id)
      } else if (previewCard.type === 'exercise') {
        toast({
          title: 'Success',
          description: 'Exercise already saved'
        })
        handleRemovePreview(messageId, previewCard.id)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className='flex flex-col h-full min-h-0'>
      {/* Quick Actions */}
      <QuickActionBar
        actions={quickActions}
        onActionClick={handleQuickAction}
        disabled={isStreaming}
      />

      <Separator className='my-3' />

      {/* Chat Messages */}
      <div className='flex-1 min-h-0 flex flex-col'>
        <div className='flex-1 overflow-y-auto px-4'>
          {messages.length === 0 ? (
            <div className='flex items-center justify-center h-full text-center p-8'>
              <p className='text-sm text-muted-foreground max-w-xs'>
                {t('ai.chat.noMessages')}
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

        {/* Context Indicator */}
        <div className='px-4 pb-3'>
          <ContextIndicator
            nodeId={nodeId}
            mapId={mapId}
          />
        </div>

        {/* Input */}
        <div className='px-4 pb-4'>
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
            disabled={isStreaming}
            placeholder={t('ai.chat.placeholder')}
          />
        </div>
      </div>
    </div>
  )
}
