import { AlertCircle, Focus, Maximize2, Network, SlidersHorizontal, Trash2, X } from 'lucide-react'
import { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { Node } from '@/entities/map'
import { useDeleteNode, useUpdateNode } from '@/entities/map'
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
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/shared/components/drawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/tabs'
import { toast } from '@/shared/components/toast'
import { cn } from '@/shared/lib/cn'
import { useDrawerTabs } from '../model/drawer-tabs.hooks'
import { useFocusMode } from '../model/graph.store'

interface NodeDrawerProps {
  node: Node | null
  onClose: () => void
  /** Number of connections for delete warning */
  connectionsCount?: number
  /** Render prop for connections tab content - injected by parent to avoid cross-feature import */
  connectionsTab?: React.ReactNode
  className?: string
}

export const NodeDrawer = memo(({ node, onClose, connectionsCount = 0, connectionsTab, className }: NodeDrawerProps) => {
  const { t } = useTranslation()
  const [isMobile, setIsMobile] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { activeTab, switchTab } = useDrawerTabs()
  const { focusedNodeId, focusNode, clearFocus } = useFocusMode()

  // Keep track of the displayed node in state for smooth transitions
  // This prevents drawer from closing/reopening when switching nodes
  const [displayNode, setDisplayNode] = useState<Node | null>(null)

  // Update display node when prop changes (only when truthy)
  useEffect(() => {
    if (node) {
      setDisplayNode(node)
    }
  }, [node])

  // Handle explicit drawer close
  const handleClose = useCallback(() => {
    setDisplayNode(null)
    onClose()
  }, [onClose])

  // Check mobile via matchMedia
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Mutations
  const updateNodeMutation = useUpdateNode(displayNode?.mapId || '')
  const deleteNodeMutation = useDeleteNode(displayNode?.mapId || '')

  // Handle metadata form submit
  const handleMetadataSubmit = useCallback((values: NodeMetadataFormValues) => {
    if (!displayNode) return

    updateNodeMutation.mutate(
      {
        id: displayNode.id,
        data: {
          type: values.type,
          metadata: {
            ...displayNode.metadata,
            tags: values.tags,
            complexity: values.complexity,
            confidence: values.confidence
          }
        }
      },
      {
        onError: () => toast.error(t('errors.failedSave'))
      }
    )
  }, [displayNode, updateNodeMutation, t])

  // Handle node deletion
  const handleDeleteNode = useCallback(async () => {
    if (!displayNode) return

    try {
      await deleteNodeMutation.mutateAsync(displayNode.id)
      toast.success(t('nodeEdit.nodeDeleted', 'Node deleted'))
      handleClose()
    } catch {
      toast.error(t('errors.failedDelete', 'Failed to delete node'))
    }
  }, [displayNode, deleteNodeMutation, handleClose, t])

  if (!displayNode) {
    return null
  }

  const isFocused = focusedNodeId === displayNode.id

  return (
    <>
      <Drawer open={!!displayNode} onOpenChange={open => !open && handleClose()} modal={false}>
        <DrawerContent
          side={isMobile ? 'bottom' : 'right'}
          size={isMobile ? '70vh' : '360px'}
          showOverlay={isMobile}
          showClose={false}
          className={cn('p-0', className)}
          onInteractOutside={e => e.preventDefault()}
          onPointerDownOutside={e => e.preventDefault()}
        >
          <DrawerHeader className='px-4 py-3'>
            <div className='flex items-center justify-between gap-2'>
              <DrawerTitle className='text-base font-medium truncate'>
                {displayNode.label}
              </DrawerTitle>
              <div className='flex items-center gap-1'>
                <Button
                  variant={isFocused ? 'default' : 'ghost'}
                  size='icon'
                  className='h-8 w-8'
                  onClick={() => (isFocused ? clearFocus() : focusNode(displayNode.id))}
                  title={
                    isFocused ? t('graph.nodeControls.clearFocus') : t('graph.nodeControls.focusMode')
                  }
                >
                  <Focus className='h-4 w-4' />
                </Button>
                <Button variant='ghost' size='icon' className='h-8 w-8' asChild title={t('nodeDrawer.openFullEditor')}>
                  <Link to={`/dashboard/maps/${displayNode.mapId}/node/${displayNode.id}`}>
                    <Maximize2 className='h-4 w-4' />
                  </Link>
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={handleClose}
                  title={t('common.close')}
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </DrawerHeader>

          <Tabs
            value={activeTab === 'overview' ? 'properties' : activeTab}
            onValueChange={value => switchTab(value as 'properties' | 'connections')}
            className='flex flex-col flex-1 min-h-0'
          >
            <div className='px-4 py-2'>
              <TabsList className='w-full grid grid-cols-2'>
                <TabsTrigger value='properties' className='gap-1.5'>
                  <SlidersHorizontal className='h-3.5 w-3.5' />
                  <span className='text-xs'>{t('nodeDrawer.tabs.properties')}</span>
                </TabsTrigger>
                <TabsTrigger value='connections' className='gap-1.5'>
                  <Network className='h-3.5 w-3.5' />
                  <span className='text-xs'>{t('nodeDrawer.tabs.connections')}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value='properties' className='flex-1 overflow-y-auto mt-0'>
              <div className='flex flex-col'>
                {/* Node Metadata Form */}
                <div className='p-4 border-b'>
                  <NodeMetadataForm
                    node={displayNode}
                    onSubmit={handleMetadataSubmit}
                    isPending={updateNodeMutation.isPending}
                  />
                </div>

                {/* Danger Zone */}
                <div className='p-4'>
                  <Card className='border-destructive/30'>
                    <CardHeader className='pb-2 pt-3 px-3'>
                      <CardTitle className='text-xs font-medium text-destructive flex items-center gap-1.5'>
                        <AlertCircle className='h-3.5 w-3.5' />
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
                        <Trash2 className='mr-1.5 h-3.5 w-3.5' />
                        {t('nodeEdit.deleteNode', 'Delete node')}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value='connections' className='flex-1 overflow-y-auto mt-0 p-4'>
              {connectionsTab}
            </TabsContent>
          </Tabs>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('nodeEdit.deleteConfirmTitle', 'Delete node?')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('nodeEdit.deleteConfirmDescription', {
                defaultValue: '"{{label}}" and {{count}} connections will be permanently deleted.',
                label: displayNode.label,
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
              <Trash2 className='mr-1.5 h-3.5 w-3.5' />
              {t('nodeEdit.deleteNode', 'Delete node')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
})

NodeDrawer.displayName = 'NodeDrawer'
