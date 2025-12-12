import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bot, User, Loader2, FileText } from 'lucide-react'
import { Badge } from '@/shared/components/badge'
import { cn } from '@/shared/lib/cn'
import type { ChatMessage, PreviewCard } from '../ai-assist.types'
import { PreviewCardComponent } from './preview-card'

interface ChatMessageListProps {
  messages: ChatMessage[]
  isStreaming: boolean
  onRemovePreview: (messageId: string, previewId: string) => void
  onSavePreview: (messageId: string, preview: PreviewCard) => void
}

export const ChatMessageList = ({
  messages,
  isStreaming,
  onRemovePreview,
  onSavePreview
}: ChatMessageListProps) => {
  const { t } = useTranslation()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className='space-y-4 py-4'>
      {messages.map(message => (
        <div
          key={message.id}
          className={cn(
            'flex gap-3',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          {/* Avatar */}
          {message.role === 'assistant' && (
            <div className='flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
              <Bot className='w-4 h-4 text-primary' />
            </div>
          )}

          {/* Message Content */}
          <div
            className={cn(
              'flex flex-col gap-2 max-w-[85%]',
              message.role === 'user' && 'items-end'
            )}
          >
            {/* Message Bubble */}
            <div
              className={cn(
                'rounded-lg px-4 py-2.5 text-sm',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              {message.role === 'assistant' ? (
                <div className='prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:my-2 prose-code:text-xs prose-code:bg-background/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded'>
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </Markdown>
                </div>
              ) : (
                <p className='whitespace-pre-wrap break-words'>{message.content}</p>
              )}

              {/* Source Nodes (RAG references) */}
              {message.sourceNodes && message.sourceNodes.length > 0 && (
                <div className='mt-3 pt-3 border-t border-border/50'>
                  <div className='flex items-center gap-1.5 text-xs text-muted-foreground mb-2'>
                    <FileText className='w-3 h-3' />
                    <span>{t('ai.chat.sources', 'Sources')}</span>
                  </div>
                  <div className='flex flex-wrap gap-1.5'>
                    {message.sourceNodes.map(node => (
                      <Badge
                        key={node.id}
                        variant='secondary'
                        className='text-xs font-normal cursor-default'
                        title={`${node.label} (${node.type})`}
                      >
                        {node.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Streaming Indicator */}
            {message.isStreaming && (
              <div className='flex items-center gap-2 text-xs text-muted-foreground px-2'>
                <Loader2 className='w-3 h-3 animate-spin' />
                <span>{t('ai.chat.streaming')}</span>
              </div>
            )}

            {/* Preview Cards */}
            {message.preview && message.preview.length > 0 && (
              <div className='space-y-2 w-full'>
                {message.preview.map(preview => (
                  <PreviewCardComponent
                    key={preview.id}
                    preview={preview}
                    onRemove={() => onRemovePreview(message.id, preview.id)}
                    onSave={() => onSavePreview(message.id, preview)}
                  />
                ))}

                {/* Save All Button (if multiple previews) */}
                {message.preview.length > 1 && (
                  <button
                    className='w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors'
                    onClick={() => {
                      message.preview?.forEach(preview => {
                        onSavePreview(message.id, preview)
                      })
                    }}
                  >
                    {t('ai.chat.saveAll', { count: message.preview.length })}
                  </button>
                )}
              </div>
            )}

            {/* Timestamp */}
            <span className='text-xs text-muted-foreground px-2'>
              {message.timestamp.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          {/* User Avatar */}
          {message.role === 'user' && (
            <div className='flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center'>
              <User className='w-4 h-4 text-muted-foreground' />
            </div>
          )}
        </div>
      ))}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  )
}
