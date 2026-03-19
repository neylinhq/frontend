import {
  CheckIcon,
  ChevronDownIcon,
  Loading02Icon,
  Pencil01Icon,
  RefreshCw01Icon
} from '@untitledui/icons-react/outline'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { CopyButton } from '@/shared/components/copy-button'
import { Textarea } from '@/shared/components/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/tooltip'
import { cn } from '@/shared/lib/cn'

import type { ChatMessage, PreviewCard, ResolvedPreview } from '../model/ai-assist.types'
import { CollapsibleProposal } from './collapsible-proposal'
import { PreviewCardComponent } from './preview-card'
import { ThinkingIndicator } from './thinking-indicator'

interface ChatMessageListProps {
  messages: ChatMessage[]
  isStreaming: boolean
  savingPreviews?: Set<string>
  onRemovePreview: (messageId: string, previewId: string) => void
  onSavePreview: (messageId: string, preview: PreviewCard) => void
  onRejectPreview: (messageId: string, preview: PreviewCard) => void
  onRegenerate?: (messageId: string, role: 'user' | 'assistant') => void
  onEditMessage?: (messageId: string, newContent: string) => void
}

/**
 * Chat Message List - S+ Design Pattern
 *
 * Design Philosophy (from design-manifesto.md):
 * - "Интерфейс исчезает, контент сияет" — AI messages without bubble, content first
 * - User messages: compact muted bubble, right-aligned
 * - AI messages: clean prose, no avatar (model visible in selector), no background
 * - Actions appear on hover — progressive disclosure
 */
export const ChatMessageList = ({
  messages,
  isStreaming,
  savingPreviews,
  onRemovePreview,
  onSavePreview,
  onRejectPreview,
  onRegenerate,
  onEditMessage
}: ChatMessageListProps) => {
  const { t } = useTranslation()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set())
  const [editValue, setEditValue] = useState('')
  const editTextareaRef = useRef<HTMLTextAreaElement>(null)

  const isPreviewSaving = (messageId: string, previewId: string) =>
    savingPreviews?.has(`${messageId}:${previewId}`) ?? false

  const isAnyPreviewSaving = (messageId: string, previews: PreviewCard[]) =>
    previews.some(p => isPreviewSaving(messageId, p.id))

  const handleStartEdit = (messageId: string, content: string) => {
    setEditingMessageId(messageId)
    setEditValue(content)
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const parseContent = (content: string) => {
    if (content.startsWith('{"action":')) {
      try {
        const parsed = JSON.parse(content)
        return parsed.message || content
      } catch {
        const match = content.match(/"message":\s*"((?:[^"\\]|\\.)*)"/s)
        if (match) {
          return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
        }
      }
    }
    return content
  }

  return (
    <div className='flex flex-col gap-5 py-4'>
      {messages.map(message => {
        const isThinking = message.role === 'assistant' && message.isStreaming && !message.content
        const isUser = message.role === 'user'
        const isEditing = editingMessageId === message.id

        // User message
        if (isUser) {
          return (
            <div
              key={message.id}
              className='group flex justify-end'
              onMouseEnter={() => setHoveredMessageId(message.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              <div
                className={cn(
                  'flex flex-col gap-1.5',
                  isEditing ? 'w-full' : 'max-w-2xl',
                  'items-end'
                )}
              >
                {isEditing ? (
                  <div className='flex flex-col gap-2 w-full'>
                    <Textarea
                      ref={editTextareaRef}
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      className='min-h-24 resize-none text-sm w-full rounded-xl border-border/50 bg-background'
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
                  <>
                    {/* User bubble - compact, muted */}
                    <div className='rounded-xl border border-border/50 bg-muted/50 px-3 py-2 text-sm leading-relaxed'>
                      <p className='whitespace-pre-wrap break-words'>{message.content}</p>
                    </div>

                    {/* Actions on hover */}
                    <div
                      className={cn(
                        'flex items-center gap-2 transition-opacity duration-100 motion-reduce:transition-none',
                        hoveredMessageId === message.id ? 'opacity-100' : 'opacity-0'
                      )}
                    >
                      {onEditMessage && !isStreaming && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-6 w-6 rounded-xs text-muted-foreground hover:text-foreground transition-colors'
                              onClick={() => handleStartEdit(message.id, message.content)}
                            >
                              <Pencil01Icon className='h-3.5 w-3.5' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side='bottom'>
                            <p className='text-xs'>{t('common.edit')}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <CopyButton
                        value={message.content}
                        label={t('common.copy')}
                        copiedLabel={t('common.copied')}
                        className='h-6 w-6 rounded-xs text-muted-foreground hover:text-foreground transition-colors'
                      />
                      {onRegenerate && !isStreaming && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-6 w-6 rounded-xs text-muted-foreground hover:text-foreground transition-colors'
                              onClick={() => onRegenerate(message.id, 'user')}
                            >
                              <RefreshCw01Icon className='h-3.5 w-3.5' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side='bottom'>
                            <p className='text-xs'>{t('ai.chat.regenerate')}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        }

        // AI message - clean, no avatar (model visible in selector)
        return (
          <div
            key={message.id}
            className='group'
            onMouseEnter={() => setHoveredMessageId(message.id)}
            onMouseLeave={() => setHoveredMessageId(null)}
          >
            <div className='pl-3 space-y-3'>
              {isThinking ? (
                <div className='py-1'>
                  <ThinkingIndicator />
                </div>
              ) : (
                <div
                  className='prose prose-sm max-w-none dark:prose-invert'
                  aria-live={message.isStreaming ? 'polite' : 'off'}
                  aria-atomic='false'
                >
                  <Markdown remarkPlugins={[remarkGfm]}>{parseContent(message.content)}</Markdown>
                </div>
              )}

              {/* Source Nodes */}
              {message.sourceNodes && message.sourceNodes.length > 0 && (
                <div className='pt-2'>
                  <button
                    type='button'
                    onClick={() => {
                      const newExpanded = new Set(expandedSources)
                      if (newExpanded.has(message.id)) {
                        newExpanded.delete(message.id)
                      } else {
                        newExpanded.add(message.id)
                      }
                      setExpandedSources(newExpanded)
                    }}
                    className='flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'
                  >
                    <span>
                      {t('ai.chat.sources', 'Sources')} ({message.sourceNodes.length})
                    </span>
                    <ChevronDownIcon
                      className={cn(
                        'w-3 h-3 transition-transform',
                        expandedSources.has(message.id) && 'rotate-180'
                      )}
                    />
                  </button>
                  {expandedSources.has(message.id) && (
                    <div className='flex flex-wrap gap-1.5 mt-2'>
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
                  )}
                </div>
              )}

              {/* Preview Cards - both pending and resolved */}
              {message.preview && message.preview.length > 0 && (
                <div className='space-y-2'>
                  {message.preview.map(preview =>
                    preview.status === 'approved' || preview.status === 'rejected' ? (
                      preview.type === 'exercise' ? (
                        <PreviewCardComponent
                          key={preview.id}
                          preview={preview}
                          onRemove={() => onRejectPreview(message.id, preview)}
                          onSave={() => onSavePreview(message.id, preview)}
                          isSaving={isPreviewSaving(message.id, preview.id)}
                        />
                      ) : (
                        <CollapsibleProposal
                          key={preview.id}
                          preview={{
                            ...(preview as ResolvedPreview),
                            status: preview.status,
                            resolvedAt: preview.resolvedAt ?? new Date()
                          }}
                        />
                      )
                    ) : (
                      <PreviewCardComponent
                        key={preview.id}
                        preview={preview}
                        onRemove={() => onRejectPreview(message.id, preview)}
                        onSave={() => onSavePreview(message.id, preview)}
                        isSaving={isPreviewSaving(message.id, preview.id)}
                      />
                    )
                  )}

                  {(() => {
                    // Only show "Apply All" for pending previews
                    const pendingPreviews = message.preview.filter(
                      p =>
                        p.type !== 'exercise' && (p.status === 'pending' || p.status === 'editing')
                    )
                    if (pendingPreviews.length <= 1) return null

                    return (
                      <Button
                        size='sm'
                        className='w-full'
                        disabled={isAnyPreviewSaving(message.id, pendingPreviews)}
                        onClick={() => {
                          pendingPreviews.forEach(preview => {
                            onSavePreview(message.id, preview)
                          })
                        }}
                      >
                        {isAnyPreviewSaving(message.id, pendingPreviews) ? (
                          <Loading02Icon className='h-4 w-4 mr-2 animate-spin' />
                        ) : (
                          <CheckIcon className='h-4 w-4 mr-2' />
                        )}
                        {t('ai.chat.applyAll', {
                          count: pendingPreviews.length,
                          defaultValue: `Apply all (${pendingPreviews.length})`
                        })}
                      </Button>
                    )
                  })()}
                </div>
              )}

              {/* Actions on hover — only when AI has content */}
              {!isThinking && (
                <div
                  className={cn(
                    'flex items-center gap-2 transition-opacity duration-100 motion-reduce:transition-none',
                    hoveredMessageId === message.id ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  <CopyButton
                    value={message.content}
                    label={t('common.copy')}
                    copiedLabel={t('common.copied')}
                    className='h-6 w-6 rounded-xs text-muted-foreground hover:text-foreground transition-colors'
                  />
                  {onRegenerate && !isStreaming && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-6 w-6 rounded-xs text-muted-foreground hover:text-foreground transition-colors'
                          onClick={() => onRegenerate(message.id, 'assistant')}
                        >
                          <RefreshCw01Icon className='h-3.5 w-3.5' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side='bottom'>
                        <p className='text-xs'>{t('ai.chat.regenerate')}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}

      <div ref={messagesEndRef} />
    </div>
  )
}
