import {
  ChevronDownIcon,
  Copy01Icon,
  DotsHorizontalIcon,
  Trash01Icon
} from '@untitledui/icons-react/outline'
import { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { NodeMetadataForm, type NodeMetadataFormValues } from '@/features/node-metadata-form'
import type { Edge, Node } from '@/entities/map'
import { useDeleteNode, useUpdateNode } from '@/entities/map'
import { useNodeProgress, useUpdateNodeProgress } from '@/entities/progress'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/shared/components/alert-dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/shared/components/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/components/dropdown-menu'
import { Field } from '@/shared/components/field'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import { Slider } from '@/shared/components/slider'
import { toast } from '@/shared/components/toast'
import { useDebouncedCallback } from '@/shared/hooks'
import { cn } from '@/shared/lib/cn'

interface NodePanelProps {
  node: Node
  edges: Edge[]
  allNodes: Node[]
  isReadOnly?: boolean
  onClose?: () => void
  /** Render prop for connections panel */
  renderConnectionsPanel?: (
    node: Node,
    edges: Edge[],
    allNodes: Node[],
    onOpenNode?: (id: string) => void,
    onPanToNode?: (id: string) => void
  ) => React.ReactNode
  onOpenNode?: (id: string) => void
  onPanToNode?: (id: string) => void
}

export const NodePanel = memo(function NodePanel({
  node,
  edges,
  allNodes,
  isReadOnly = false,
  onClose,
  renderConnectionsPanel,
  onOpenNode,
  onPanToNode
}: NodePanelProps) {
  const { t } = useTranslation()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [connectionsOpen, setConnectionsOpen] = useState(true)
  const [localLabel, setLocalLabel] = useState(node.label)

  // Sync local label when node label changes externally
  useEffect(() => {
    setLocalLabel(node.label)
  }, [node.label])

  const updateNodeMutation = useUpdateNode(node.mapId)
  const deleteNodeMutation = useDeleteNode(node.mapId)

  // User progress for this node (includes confidence)
  const { data: nodeProgress } = useNodeProgress(node.mapId, node.id)
  const updateProgressMutation = useUpdateNodeProgress(node.mapId, node.id)

  // Debounced label save
  const debouncedLabelSave = useDebouncedCallback((value: string) => {
    updateNodeMutation.mutate({ id: node.id, data: { label: value } })
  }, 500)

  const handleLabelChange = useCallback(
    (value: string) => {
      setLocalLabel(value)
      debouncedLabelSave(value)
    },
    [debouncedLabelSave]
  )

  // Debounced confidence update
  const debouncedConfidenceUpdate = useDebouncedCallback((value: number) => {
    updateProgressMutation.mutate({ confidence: value })
  }, 300)

  const handleConfidenceChange = useCallback(
    (values: number[]) => {
      debouncedConfidenceUpdate(values[0])
    },
    [debouncedConfidenceUpdate]
  )

  // Count connections
  const connectionsCount = edges.filter(
    e => e.sourceNodeId === node.id || e.targetNodeId === node.id
  ).length

  // Handle metadata form submit
  const handleMetadataSubmit = useCallback(
    (values: NodeMetadataFormValues) => {
      updateNodeMutation.mutate(
        {
          id: node.id,
          data: {
            type: values.type,
            metadata: {
              ...node.metadata,
              tags: values.tags
            }
          }
        },
        {
          onError: () => toast.error(t('errors.failedSave'))
        }
      )
    },
    [node, updateNodeMutation, t]
  )

  // Handle node deletion
  const handleDeleteNode = useCallback(async () => {
    try {
      await deleteNodeMutation.mutateAsync(node.id)
      toast.success(t('nodeEdit.nodeDeleted', 'Node deleted'))
      onClose?.()
    } catch {
      toast.error(t('errors.failedDelete', 'Failed to delete node'))
    }
  }, [node.id, deleteNodeMutation, onClose, t])

  // Handle copy ID
  const handleCopyId = useCallback(() => {
    navigator.clipboard.writeText(node.id)
    toast.success(t('common.copied'))
  }, [node.id, t])

  return (
    <>
      <div className='flex flex-col h-full'>
        <div className='flex-1 overflow-y-auto'>
          {/* Node name + inline [⋯] menu */}
          <div className='flex items-end gap-1.5 px-4 pt-4 pb-1.5'>
            <Field
              label={t('nodeEdit.nameLabel')}
              labelClassName='text-xs'
              className='flex-1 min-w-0'
            >
              <Input
                value={localLabel}
                readOnly={isReadOnly}
                disabled={isReadOnly}
                onChange={e => handleLabelChange(e.target.value)}
                placeholder={t('nodeEdit.namePlaceholder')}
              />
            </Field>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type='button'
                  className='h-9 w-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0'
                >
                  <DotsHorizontalIcon className='h-3.5 w-3.5' />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='min-w-36'>
                <DropdownMenuItem onClick={handleCopyId} className='text-xs'>
                  <Copy01Icon className='mr-2 h-3.5 w-3.5' />
                  {t('nodeEdit.copyId')}
                </DropdownMenuItem>
                {!isReadOnly && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteDialogOpen(true)}
                      className='text-xs text-destructive focus:text-destructive'
                    >
                      <Trash01Icon className='mr-2 h-3.5 w-3.5' />
                      {t('nodeEdit.deleteNode')}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Node Metadata Form — type & tags */}
          <div className='px-4 pb-4 pt-2.5'>
            <NodeMetadataForm
              node={node}
              onSubmit={handleMetadataSubmit}
              isPending={updateNodeMutation.isPending}
              disabled={isReadOnly}
            />
          </div>

          {/* Confidence Slider */}
          <div className='px-4 pb-4'>
            <div className='space-y-1.5'>
              <div className='flex items-center justify-between'>
                <Label className='text-xs text-muted-foreground'>
                  {t('form.confidence.label', 'Confidence')}
                </Label>
                <span className='text-xs tabular-nums text-muted-foreground'>
                  {Math.round((nodeProgress?.confidence ?? 0) * 100)}%
                </span>
              </div>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={[nodeProgress?.confidence ?? 0]}
                onValueChange={handleConfidenceChange}
                className='py-1'
                disabled={updateProgressMutation.isPending}
              />
            </div>
          </div>

          {/* Connections — collapsible section */}
          <div className='px-2 py-1'>
            <Collapsible open={connectionsOpen} onOpenChange={setConnectionsOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type='button'
                  className='flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium hover:bg-muted/50 transition-colors'
                >
                  <span>
                    {t('nodeDrawer.tabs.connections', 'Connections')}
                    {connectionsCount > 0 && (
                      <span className='ml-1.5 text-xs text-muted-foreground tabular-nums'>
                        ({connectionsCount})
                      </span>
                    )}
                  </span>
                  <ChevronDownIcon
                    className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform duration-200',
                      connectionsOpen && 'rotate-180'
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className='px-2 pt-1 pb-2'>
                  {renderConnectionsPanel?.(node, edges, allNodes, onOpenNode, onPanToNode)}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('nodeEdit.deleteConfirmTitle', 'Delete node?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('nodeEdit.deleteConfirmDescription', {
                defaultValue: '"{{label}}" and {{count}} connections will be permanently deleted.',
                label: node.label,
                count: connectionsCount
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNode}
              disabled={deleteNodeMutation.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              <Trash01Icon className='mr-1.5 h-3.5 w-3.5' />
              {t('nodeEdit.deleteNode', 'Delete node')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
})
