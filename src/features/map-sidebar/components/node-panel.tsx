import { AlertCircleIcon, Maximize01Icon, Target01Icon, Trash01Icon } from '@untitledui/icons-react/outline'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { Edge, Node } from '@/entities/map'
import { useDeleteNode, useUpdateNode } from '@/entities/map'
import { useNodeProgress, useUpdateNodeProgress } from '@/entities/progress'
import { useFocusMode } from '@/features/graph/model/graph.store'
import { NodeMetadataForm, type NodeMetadataFormValues } from '@/features/node-metadata-form'
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
import { Button } from '@/shared/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/card'
import { Label } from '@/shared/components/label'
import { Slider } from '@/shared/components/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/tabs'
import { toast } from '@/shared/components/toast'
import { useDebouncedCallback } from '@/shared/hooks'

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
  const [activeTab, setActiveTab] = useState<'properties' | 'connections'>('properties')
  const { focusedNodeId, focusNode, clearFocus } = useFocusMode()

  const updateNodeMutation = useUpdateNode(node.mapId)
  const deleteNodeMutation = useDeleteNode(node.mapId)

  // User progress for this node (includes confidence)
  const { data: nodeProgress } = useNodeProgress(node.mapId, node.id)
  const updateProgressMutation = useUpdateNodeProgress(node.mapId, node.id)

  const isFocused = focusedNodeId === node.id

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

  return (
    <>
      <div className='flex flex-col h-full'>
        {/* Header with node title and actions */}
        <div className='flex items-center justify-between px-4 py-3 border-b'>
          <h3 className='text-sm font-medium truncate flex-1'>{node.label}</h3>
          <div className='flex items-center gap-1 ml-2'>
            <Button
              variant={isFocused ? 'default' : 'ghost'}
              size='icon'
              className='h-7 w-7'
              onClick={() => (isFocused ? clearFocus() : focusNode(node.id))}
              title={isFocused ? t('graph.nodeControls.clearFocus') : t('graph.nodeControls.focusMode')}
            >
              <Target01Icon className='h-3.5 w-3.5' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7'
              asChild
              title={t('nodeDrawer.openFullEditor')}
            >
              <Link to={`/dashboard/maps/${node.mapId}/node/${node.id}`}>
                <Maximize01Icon className='h-3.5 w-3.5' />
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'properties' | 'connections')}
          className='flex flex-col flex-1 min-h-0'
        >
          <TabsList variant='underline' className='grid grid-cols-2'>
            <TabsTrigger variant='underline' value='properties'>
              {t('nodeDrawer.tabs.properties')}
            </TabsTrigger>
            <TabsTrigger variant='underline' value='connections'>
              {t('nodeDrawer.tabs.connections')}
            </TabsTrigger>
          </TabsList>

          {/* Properties Tab */}
          <TabsContent value='properties' className='flex-1 overflow-y-auto mt-0'>
            <div className='flex flex-col min-h-full'>
              {/* Node Metadata Form */}
              <div className='p-4 border-b'>
                <NodeMetadataForm
                  node={node}
                  onSubmit={handleMetadataSubmit}
                  isPending={updateNodeMutation.isPending}
                  disabled={isReadOnly}
                />
              </div>

              {/* Confidence Slider - Personal progress */}
              <div className='p-4 border-b'>
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

              {/* Danger Zone */}
              {!isReadOnly && (
                <div className='p-4 mt-auto'>
                  <Card className='border-destructive/30'>
                    <CardHeader className='pb-2 pt-3 px-3'>
                      <CardTitle className='text-xs font-medium text-destructive flex items-center gap-1.5'>
                        <AlertCircleIcon className='h-3.5 w-3.5' />
                        {t('nodeEdit.dangerZone', 'Danger zone')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='px-3 pb-3'>
                      <p className='text-xs text-muted-foreground mb-3'>
                        {t('nodeEdit.deleteWarning', 'Deleting this node will also remove all its connections.')}
                      </p>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash01Icon className='mr-1.5 h-3.5 w-3.5' />
                        {t('nodeEdit.deleteNode', 'Delete node')}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value='connections' className='flex-1 overflow-y-auto mt-0 p-4'>
            {renderConnectionsPanel?.(node, edges, allNodes, onOpenNode, onPanToNode)}
          </TabsContent>
        </Tabs>
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
