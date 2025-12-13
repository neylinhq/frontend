import { Bot, Check, Copy, FileText, Loader2, Pencil, RefreshCw, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/avatar'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { Icon } from '@/shared/components/icon'
import { aiBrandIcons } from '@/shared/components/icon/icon.constants'
import { Textarea } from '@/shared/components/textarea'
import { toast } from '@/shared/components/toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/tooltip'
import { cn } from '@/shared/lib/cn'
import type { ChatMessage, PreviewCard, ResolvedPreview } from '../ai-assist.types'
import { CollapsibleProposal } from './collapsible-proposal'
import { PreviewCardComponent } from './preview-card'

interface ChatMessageListProps {
  messages: ChatMessage[]
  isStreaming: boolean
  onRemovePreview: (messageId: string, previewId: string) => void
  onSavePreview: (messageId: string, preview: PreviewCard) => void
  onRejectPreview: (messageId: string, previewId: string) => void
  onUndoResolved: (messageId: string, preview: ResolvedPreview) => void
  onRegenerate?: () => void
  onEditMessage?: (messageId: string, newContent: string) => void
  /** User avatar URL for user messages */
  userAvatarUrl?: string
  /** User display name for avatar fallback */
  userDisplayName?: string
}

export const ChatMessageList = ({
  messages,
  isStreaming,
  onRemovePreview,
  onSavePreview,
  onRejectPreview,
  onUndoResolved,
  onRegenerate,
  onEditMessage,
  userAvatarUrl,
  userDisplayName
}: ChatMessageListProps) => {
  const { t } = useTranslation()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const editTextareaRef = useRef<HTMLTextAreaElement>(null)

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content)
    toast.success(t('common.copied', 'Copied'))
  }

  const handleStartEdit = (messageId: string, content: string) => {
    setEditingMessageId(messageId)
    setEditValue(content)
    // Focus textarea after render
    setTimeout(() => editTextareaRef.current?.focus(), 0)
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditValue('')
  }

  const handleSubmitEdit = () => {
    if (editingMessageId && editValue.trim() && onEditMessage) {
      onEditMessage(editingMessageId, editValue.trim())
      setEditingMessageId(null)
      setEditValue('')
    }
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancelEdit()
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitEdit()
    }
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <div className='space-y-4 py-4'>
      {messages.map((message, index) => {
        // Check if AI is "thinking" (streaming but no content yet)
        const isThinking = message.role === 'assistant' && message.isStreaming && !message.content

        return (
        <div
          key={message.id}
          className={cn(
            'group flex gap-3',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          )}
          onMouseEnter={() => setHoveredMessageId(message.id)}
          onMouseLeave={() => setHoveredMessageId(null)}
        >
          {/* AI Avatar */}
          {message.role === 'assistant' && (
            <div className='flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
              {message.brand && aiBrandIcons[message.brand] ? (
                <Icon data={aiBrandIcons[message.brand]} className='w-4 h-4 text-primary' />
              ) : (
                <Bot className='w-4 h-4 text-primary' />
              )}
            </div>
          )}

          {/* Message Content */}
          <div
            className={cn(
              'flex flex-col gap-2',
              editingMessageId === message.id ? 'w-full' : 'max-w-[85%]',
              message.role === 'user' && 'items-end'
            )}
          >
            {/* Thinking Bubble - shown when AI is processing but no content yet */}
            {isThinking ? (
              <div className='rounded-lg px-4 py-3 bg-muted'>
                <div className='flex items-center gap-1.5'>
                  <span className='w-2 h-2 rounded-full bg-primary/60 animate-pulse' style={{ animationDelay: '0ms' }} />
                  <span className='w-2 h-2 rounded-full bg-primary/60 animate-pulse' style={{ animationDelay: '150ms' }} />
                  <span className='w-2 h-2 rounded-full bg-primary/60 animate-pulse' style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            ) : message.role === 'user' && editingMessageId === message.id ? (
              // Inline edit mode for user message
              <div className='flex flex-col gap-2 w-full'>
                <Textarea
                  ref={editTextareaRef}
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  className='min-h-[80px] resize-none text-sm w-full'
                  placeholder={t('ai.chat.placeholder')}
                />
                <div className='flex items-center justify-between gap-4'>
                  <p className='text-xs text-muted-foreground'>{t('ai.chat.editWarning')}</p>
                  <div className='flex gap-2 flex-shrink-0'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleCancelEdit}
                      className='h-7 px-3'
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      size='sm'
                      onClick={handleSubmitEdit}
                      disabled={!editValue.trim()}
                      className='h-7 px-3'
                    >
                      {t('common.send')}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  'rounded-lg px-4 py-2.5 text-sm',
                  message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}
              >
                {message.role === 'assistant' ? (
                  <div className='prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:my-2 prose-code:text-xs prose-code:bg-background/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded'>
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {(() => {
                        let content = message.content
                        // Handle case where AI returned raw JSON
                        if (content.startsWith('{"action":')) {
                          try {
                            const parsed = JSON.parse(content)
                            content = parsed.message || content
                          } catch {
                            // Extract message manually if JSON malformed
                            const match = content.match(/"message":\s*"((?:[^"\\]|\\.)*)"/s)
                            if (match) {
                              content = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
                            }
                          }
                        }
                        return content.replace(/\s*[•·]\s*/g, '\n- ').replace(/^\s*-\s*$/gm, '')
                      })()}
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
            )}

            {/* Streaming Indicator - only show when actually streaming content, not when thinking */}
            {message.isStreaming && message.content && (
              <div className='flex items-center gap-2 text-xs text-muted-foreground px-2'>
                <Loader2 className='w-3 h-3 animate-spin' />
                <span>{t('ai.chat.streaming')}</span>
              </div>
            )}

            {/* Pending Preview Cards */}
            {message.preview && message.preview.length > 0 && (
              <div className='space-y-2 w-full'>
                {message.preview.map(preview => (
                  <PreviewCardComponent
                    key={preview.id}
                    preview={preview}
                    onRemove={() => onRejectPreview(message.id, preview.id)}
                    onSave={() => onSavePreview(message.id, preview)}
                  />
                ))}

                {/* Apply All Button (if multiple previews) */}
                {message.preview.length > 1 && (
                  <Button
                    className='w-full'
                    onClick={() => {
                      message.preview?.forEach(preview => {
                        onSavePreview(message.id, preview)
                      })
                    }}
                  >
                    <Check className='h-4 w-4 mr-2' />
                    {t('ai.chat.applyAll', {
                      count: message.preview.length,
                      defaultValue: `Apply all (${message.preview.length})`
                    })}
                  </Button>
                )}
              </div>
            )}

            {/* Resolved Preview Cards (collapsible) */}
            {message.resolvedPreviews && message.resolvedPreviews.length > 0 && (
              <div className='space-y-1.5 w-full'>
                {message.resolvedPreviews.map(resolved => (
                  <CollapsibleProposal
                    key={resolved.id}
                    preview={resolved}
                    canUndo={resolved.status === 'approved' && !!resolved.undoData}
                    onUndo={() => onUndoResolved(message.id, resolved)}
                  />
                ))}
              </div>
            )}

            {/* Actions */}
            <div
              className={cn(
                'flex items-center gap-0.5 h-7 transition-opacity',
                // User messages: show on hover only; AI messages: always visible
                message.role === 'user'
                  ? hoveredMessageId === message.id
                    ? 'opacity-100'
                    : 'opacity-0'
                  : 'opacity-100'
              )}
            >
              {message.role === 'user' ? (
                // User message: show edit + copy + timestamp
                <>
                  {onEditMessage && !isStreaming && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 text-muted-foreground hover:text-foreground'
                          onClick={() => handleStartEdit(message.id, message.content)}
                        >
                          <Pencil className='h-3 w-3' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side='bottom'>
                        <p className='text-xs'>{t('common.edit')}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 text-muted-foreground hover:text-foreground'
                        onClick={() => handleCopy(message.content)}
                      >
                        <Copy className='h-3 w-3' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side='bottom'>
                      <p className='text-xs'>{t('common.copy')}</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className='text-[10px] text-muted-foreground ml-1'>
                    {message.timestamp.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </>
              ) : (
                // Assistant message: always visible actions
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 text-muted-foreground hover:text-foreground'
                        onClick={() => handleCopy(message.content)}
                      >
                        <Copy className='h-3 w-3' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side='bottom'>
                      <p className='text-xs'>{t('common.copy')}</p>
                    </TooltipContent>
                  </Tooltip>
                  {onRegenerate && index === messages.length - 1 && !isStreaming && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 text-muted-foreground hover:text-foreground'
                          onClick={onRegenerate}
                        >
                          <RefreshCw className='h-3 w-3' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side='bottom'>
                        <p className='text-xs'>{t('ai.chat.regenerate')}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </>
              )}
            </div>
          </div>

          {/* User Avatar */}
          {message.role === 'user' && (
            <Avatar className='flex-shrink-0 w-8 h-8'>
              {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={userDisplayName || 'User'} />}
              <AvatarFallback className='bg-muted text-muted-foreground text-xs'>
                {userDisplayName ? userDisplayName.charAt(0).toUpperCase() : <User className='w-4 h-4' />}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        )
      })}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  )
}
