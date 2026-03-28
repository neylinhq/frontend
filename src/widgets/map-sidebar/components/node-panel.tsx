import { ChevronDownIcon, Trash01Icon } from '@untitledui/icons-react/outline'
import { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { NodeMetadataForm, type NodeMetadataFormValues } from '@/features/node-metadata-form'
import type { Edge, Node } from '@/entities/map'
import { useDeleteNode, useUpdateNode } from '@/entities/map'
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
import { Field } from '@/shared/components/field'
import { Input } from '@/shared/components/input'
import { toast } from '@/shared/components/toast'
import { useDebouncedCallback } from '@/shared/hooks'
import { cn } from '@/shared/lib/cn'

import { useNodeActionsStore } from '../model'

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

  // Register node actions in shell header store
  useEffect(() => {
    useNodeActionsStore.setState({
      onCopyId: handleCopyId,
      onDeleteRequest: () => setDeleteDialogOpen(true)
    })
    return () => useNodeActionsStore.setState({ onCopyId: null, onDeleteRequest: null })
  }, [handleCopyId])

  return (
    <>
      <div className='flex flex-col h-full'>
        <div className='flex-1 overflow-y-auto'>
          {/* Node name */}
          <div className='px-panel pt-4 pb-1.5'>
            <Field label={t('nodeEdit.nameLabel')} labelClassName='text-xs'>
              <Input
                value={localLabel}
                readOnly={isReadOnly}
                disabled={isReadOnly}
                onChange={e => handleLabelChange(e.target.value)}
                placeholder={t('nodeEdit.namePlaceholder')}
              />
            </Field>
          </div>

          {/* Node Metadata Form — type & tags */}
          <div className='px-panel pb-4 pt-2.5'>
            <NodeMetadataForm
              node={node}
              onSubmit={handleMetadataSubmit}
              isPending={updateNodeMutation.isPending}
              disabled={isReadOnly}
            />
          </div>

          {/* Connections — collapsible section */}
          <div className='px-panel-sm py-1'>
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
                <div className='px-panel-sm pb-2'>
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
