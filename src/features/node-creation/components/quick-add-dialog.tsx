import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { type Node, useCreateEdge, useFullMap } from '@/entities/map'
import type { NodeType } from '@/entities/node'
import type { ViewportState } from '@/features/graph-webgl'
import { Button } from '@/shared/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/dialog'
import { Input } from '@/shared/components/input'
import { toast } from '@/shared/components/toast'
import { cn } from '@/shared/lib/cn'
import { getNodeConfig, getNodeIcon } from '../lib/node-type-utils'
import {
  getPartialType,
  getTypeSuggestions,
  hasTypePrefix,
  parseQuickInput
} from '../lib/parse-quick-input'
import { NODE_CREATION_CONFIG } from '../model/node-creation.constants'
import { useCreateNodeMutation } from '../model/node-creation.hooks'
import { useCreateNodeMutationWebGL } from '../model/node-creation.webgl.hooks'
import { useNodeCreationStore } from '../model/node-creation.store'
import { ConnectionSelector } from './connection-selector'

interface CreateNodeInput {
  mapId: string
  label: string
  type: NodeType
  description?: string
}

interface CreateNodeMutation {
  mutateAsync: (input: CreateNodeInput) => Promise<Node>
}

interface QuickAddDialogBaseProps {
  createNode: CreateNodeMutation
}

const QuickAddDialogBase = ({ createNode }: QuickAddDialogBaseProps) => {
  const { t } = useTranslation()
  const { mapId } = useParams<{ mapId: string }>()
  const inputRef = useRef<HTMLInputElement>(null)

  const { isQuickAddOpen, draftLabel, draftType, pendingConnections, closeQuickAdd, setDraft } =
    useNodeCreationStore()
  const createEdge = useCreateEdge(mapId || '')

  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<NodeType[]>([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0)
  const [isCreating, setIsCreating] = useState(false)

  // Update draft when input changes
  useEffect(() => {
    const parsed = parseQuickInput(input)
    setDraft(parsed.label, parsed.type)

    // Update suggestions
    if (hasTypePrefix(input)) {
      const partialType = getPartialType(input)
      const typeSuggestions = getTypeSuggestions(partialType || '')
      setSuggestions(typeSuggestions)
      setShowSuggestions(typeSuggestions.length > 0)
      setSelectedSuggestionIndex(0)
    } else {
      setShowSuggestions(false)
    }
  }, [input, setDraft])

  // Auto-focus input when dialog opens
  useEffect(() => {
    if (isQuickAddOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), NODE_CREATION_CONFIG.FOCUS_DELAY_MS)
    }
  }, [isQuickAddOpen])

  // Reset input when dialog closes
  useEffect(() => {
    if (!isQuickAddOpen) {
      setInput('')
      setShowSuggestions(false)
    }
  }, [isQuickAddOpen])

  const handleCreate = async () => {
    if (!draftLabel.trim() || !mapId) {
      return
    }

    setIsCreating(true)

    try {
      // 1. Create the node
      const newNode = await createNode.mutateAsync({
        mapId,
        label: draftLabel,
        type: draftType
      })

      // 2. Create edges for pending connections (in parallel)
      if (pendingConnections.length > 0 && newNode?.id) {
        await Promise.all(
          pendingConnections.map(conn =>
            createEdge.mutateAsync({
              sourceNodeId: conn.direction === 'outgoing' ? newNode.id : conn.targetNodeId,
              targetNodeId: conn.direction === 'outgoing' ? conn.targetNodeId : newNode.id,
              relationType: conn.relationType,
              strength: 1.0,
              bidirectional: false
            })
          )
        )
      }

      toast.success(t('nodeCreation.success'), {
        description: t('nodeCreation.created', { label: draftLabel })
      })

      closeQuickAdd()
    } catch {
      toast.error(t('nodeCreation.error'))
    } finally {
      setIsCreating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedSuggestionIndex(prev => Math.min(prev + 1, suggestions.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedSuggestionIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Tab') {
        e.preventDefault()
        const selected = suggestions[selectedSuggestionIndex]
        if (selected) {
          // Replace /partial with /type
          const baseLabel = input.split('/')[0]?.trim() || ''
          setInput(`${baseLabel} /${selected}`)
          setShowSuggestions(false)
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false)
      }
    }

    if (e.key === 'Enter' && !showSuggestions) {
      e.preventDefault()
      handleCreate()
    }
  }

  const Icon = getNodeIcon(draftType)

  return (
    <Dialog open={isQuickAddOpen} onOpenChange={open => !open && closeQuickAdd()}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{t('nodeCreation.quickAdd.title')}</DialogTitle>
          <DialogDescription>{t('nodeCreation.quickAdd.description')}</DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='relative'>
            <Input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('nodeCreation.quickAdd.placeholder')}
              className='pr-10'
            />
            {Icon && (
              <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                <Icon className='h-4 w-4 text-muted-foreground' />
              </div>
            )}
          </div>

          {/* Type Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className='rounded-md border bg-popover p-2 text-sm'>
              <div className='mb-1.5 px-2 text-xs text-muted-foreground'>
                {t('nodeCreation.quickAdd.typeSuggestions')}
              </div>
              <div className='space-y-0.5'>
                {suggestions.map((type, index) => {
                  const config = getNodeConfig(type)
                  if (!config) {
                    return null
                  }

                  const TypeIcon = config.icon
                  const isSelected = index === selectedSuggestionIndex

                  return (
                    <button
                      key={type}
                      type='button'
                      onClick={() => {
                        const baseLabel = input.split('/')[0]?.trim() || ''
                        setInput(`${baseLabel} /${type}`)
                        setShowSuggestions(false)
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-colors',
                        isSelected && 'bg-accent text-accent-foreground'
                      )}
                    >
                      <TypeIcon className='h-4 w-4' />
                      <span>{t(config.labelKey)}</span>
                      <span className='ml-auto text-xs text-muted-foreground'>/{type}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Connection Selector */}
          <ConnectionSelector />

          {/* Preview */}
          {draftLabel && (
            <div className='rounded-md border bg-muted/50 p-3'>
              <div className='flex items-center gap-2 text-sm'>
                {Icon && <Icon className='h-4 w-4' />}
                <span className='font-medium'>{draftLabel}</span>
                <span className='ml-auto text-xs text-muted-foreground'>
                  {t(`nodeTypes.${draftType}`)}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={closeQuickAdd}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCreate} disabled={!draftLabel.trim() || isCreating}>
            {isCreating ? t('common.creating') : t('common.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const QuickAddDialog = () => {
  const createNode = useCreateNodeMutation()
  return <QuickAddDialogBase createNode={createNode} />
}

interface QuickAddDialogWebGLProps {
  viewport?: ViewportState | null
}

export const QuickAddDialogWebGL = ({ viewport = null }: QuickAddDialogWebGLProps) => {
  const { mapId } = useParams<{ mapId: string }>()
  const { data: fullMap } = useFullMap(mapId || '')
  const createNode = useCreateNodeMutationWebGL({
    nodes: fullMap?.nodes ?? [],
    viewport
  })

  return <QuickAddDialogBase createNode={createNode} />
}
