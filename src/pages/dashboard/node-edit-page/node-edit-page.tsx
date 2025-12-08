import type { Editor } from '@tiptap/react'
import { AlertCircle, ArrowLeft, GraduationCap, Loader2, PanelRightClose, PanelRightOpen, SlidersHorizontal, Sparkles, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { toast } from '@/shared/components/toast'

import type { Edge } from '@/entities/edge'
import type { FullMap, Node } from '@/entities/map'
import { useDeleteEdge, useDeleteNode, useFullMap, useUpdateNode } from '@/entities/map'
import type { NodeType } from '@/entities/node'
import { EdgeEditPopover } from '@/features/graph/components/edge-edit-popover'
import { useEdgeManagementStore } from '@/features/graph/model/edge-management.store'
import { AISuggestionsPanel } from '@/features/ai-assist/components/ai-suggestions-panel'
import { BlockEditor, editorToHTML, GUTTER, htmlToEditor, htmlToPlainText } from '@/features/block-editor'
import { NodeConnectionsPanel } from '@/features/node-connections-panel'
import { useAutoSave } from '@/features/node-editor'
import { NodeMetadataForm, type NodeMetadataFormValues } from '@/features/node-metadata-form'
import { PracticePanel } from '@/features/practice-panel'
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
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/card'
import { Sheet, SheetContent, SheetHeader } from '@/shared/components/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/tabs'
import { cn } from '@/shared/lib/cn'

/** Sidebar width in pixels - used for sidebar and FAB positioning */
const SIDEBAR_WIDTH = 360

const NODE_TYPE_CONFIG: Record<NodeType, { color: string; label: string }> = {
  concept: { color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', label: 'Concept' },
  fact: { color: 'bg-green-500/10 text-green-600 dark:text-green-400', label: 'Fact' },
  theory: { color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', label: 'Theory' },
  example: { color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400', label: 'Example' },
  question: { color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400', label: 'Question' },
  hypothesis: { color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400', label: 'Hypothesis' },
  person: { color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400', label: 'Person' },
  school: { color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', label: 'School' }
}

interface NodeEditPageProps {
  node: Node
  map: FullMap
  mapId: string
  nodeId: string
}

export const NodeEditPage = ({
  node: currentNode,
  map: initialMap,
  mapId,
  nodeId
}: NodeEditPageProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Use React Query for map data to get automatic updates after mutations
  const { data: mapData } = useFullMap(mapId)
  const map = mapData ?? initialMap

  const updateNodeMutation = useUpdateNode(mapId)
  const deleteNodeMutation = useDeleteNode(mapId)
  const deleteEdgeMutation = useDeleteEdge(mapId)
  const { startEdgeEditing } = useEdgeManagementStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const titleInputRef = useRef<HTMLTextAreaElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isScrollable, setIsScrollable] = useState(false)

  // Detect if main content is scrollable
  useEffect(() => {
    const main = mainRef.current
    const content = contentRef.current
    if (!main) {
      return
    }

    const checkScrollable = () => {
      setIsScrollable(main.scrollHeight > main.clientHeight)
    }

    // Check on mount and resize
    checkScrollable()
    const resizeObserver = new ResizeObserver(checkScrollable)

    // Observe both container and content - content resize triggers when editor grows
    resizeObserver.observe(main)
    if (content) {
      resizeObserver.observe(content)
    }

    return () => resizeObserver.disconnect()
  }, [])

  // Auto-resize title textarea
  const resizeTitleTextarea = useCallback(() => {
    if (titleInputRef.current) {
      titleInputRef.current.style.height = 'auto'
      titleInputRef.current.style.height = `${titleInputRef.current.scrollHeight}px`
    }
  }, [])

  // Sync title from server
  useEffect(() => {
    if (currentNode?.label) {
      setTitle(currentNode.label)
      requestAnimationFrame(resizeTitleTextarea)
    }
  }, [currentNode?.label, resizeTitleTextarea])

  // Auto-save for title
  const debouncedTitleSave = useAutoSave((newTitle: string) => {
    if (!nodeId) {
      return
    }
    if (newTitle.trim() && newTitle !== currentNode?.label) {
      updateNodeMutation.mutate(
        { id: nodeId, data: { label: newTitle.trim() } },
        { onError: () => toast.error(t('errors.failedSaveTitle')) }
      )
    }
  }, 1000)

  // Auto-save for editor content
  const debouncedContentSave = useAutoSave((editor: Editor) => {
    if (!nodeId) {
      return
    }

    const html = editorToHTML(editor)
    const description = htmlToPlainText(html, 200)

    updateNodeMutation.mutate(
      { id: nodeId, data: { content: html, description } },
      { onError: () => toast.error(t('errors.failedSave')) }
    )
  }, 2000)

  // Handle title change
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newTitle = e.target.value
      setTitle(newTitle)
      resizeTitleTextarea()
      debouncedTitleSave(newTitle)
    },
    [debouncedTitleSave, resizeTitleTextarea]
  )

  // Handle title key down (prevent new lines)
  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      titleInputRef.current?.blur()
    }
  }, [])

  // Handler for editor content change
  const handleEditorChange = useCallback(
    (editor: Editor) => {
      debouncedContentSave(editor)
    },
    [debouncedContentSave]
  )

  // Handler for metadata form submit
  const handleMetadataSubmit = (values: NodeMetadataFormValues) => {
    updateNodeMutation.mutate(
      {
        id: nodeId,
        data: {
          type: values.type,
          metadata: {
            ...currentNode.metadata,
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
  }

  // Handle node deletion with cascade
  const handleDeleteNode = useCallback(async () => {
    try {
      await deleteNodeMutation.mutateAsync(nodeId)
      toast.success(t('nodeEdit.nodeDeleted', 'Node deleted'))
      navigate(`/dashboard/maps/${mapId}/view`)
    } catch {
      toast.error(t('errors.failedDelete', 'Failed to delete node'))
    }
  }, [nodeId, mapId, deleteNodeMutation, navigate, t])

  // Count connections for delete warning
  const connectionsCount = map.edges.filter(
    e => e.sourceNodeId === nodeId || e.targetNodeId === nodeId
  ).length

  // Handle edge edit - open popover with edge data
  const handleEditEdge = useCallback((edge: Edge) => {
    // Calculate a position in the center of the sidebar for the popover
    const sidebarRect = document.querySelector('aside')?.getBoundingClientRect()
    const position = sidebarRect
      ? { x: sidebarRect.left + sidebarRect.width / 2, y: sidebarRect.top + 200 }
      : { x: window.innerWidth / 2, y: 300 }
    startEdgeEditing(edge, position)
  }, [startEdgeEditing])

  // Handle edge delete
  const handleDeleteEdge = useCallback(async (edgeId: string) => {
    try {
      await deleteEdgeMutation.mutateAsync(edgeId)
      toast.success(t('common.removed', 'Removed'))
    } catch {
      toast.error(t('errors.failedDelete', 'Failed to delete'))
    }
  }, [deleteEdgeMutation, t])

  return (
    <div className='flex h-full'>
      {/* Main Editor Area */}
      <main
        ref={mainRef}
        className='flex-1 min-w-0 overflow-y-auto [scrollbar-gutter:stable] relative'
      >
        {/* FAB toggle - shown when content is scrollable */}
        {isScrollable && (
          <Button
            variant='outline'
            size='icon'
            onClick={() => {
              // On lg+ toggle inline sidebar, below lg open sheet
              if (window.innerWidth >= 1024) {
                setSidebarOpen(!sidebarOpen)
              } else {
                setMobileSheetOpen(true)
              }
            }}
            className={cn(
              'fixed bottom-4 z-20 h-12 w-12 rounded-full shadow-lg transition-all right-4',
              // On lg+ when sidebar open, position left of sidebar
              sidebarOpen && 'lg:right-[calc(360px+1rem)]'
            )}
          >
            {sidebarOpen ? <PanelRightClose className='h-6 w-6 hidden lg:block' /> : null}
            <PanelRightOpen className={cn('h-6 w-6', sidebarOpen && 'lg:hidden')} />
          </Button>
        )}

        {/* Editor Content */}
        <div ref={contentRef} className='mx-auto max-w-3xl px-4 md:px-8 py-6 md:py-8'>
            {/* Breadcrumb & Actions - with gutter matching editor */}
            <div className={cn('mb-8 flex items-center justify-between', GUTTER.PADDING_CLASS)}>
              <div className='flex items-center gap-3'>
                <Button variant='ghost' size='sm' asChild className='h-8 px-2'>
                  <Link to={`/dashboard/maps/${mapId}/view`}>
                    <ArrowLeft className='h-4 w-4' />
                  </Link>
                </Button>
                <Badge
                  variant='secondary'
                  className={cn('text-xs font-medium', NODE_TYPE_CONFIG[currentNode.type]?.color)}
                >
                  {t(
                    `nodeTypes.${currentNode.type}`,
                    NODE_TYPE_CONFIG[currentNode.type]?.label || currentNode.type
                  )}
                </Badge>
                {updateNodeMutation.isPending && (
                  <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                    <Loader2 className='h-3 w-3 animate-spin' />
                    {t('errors.saving')}
                  </span>
                )}
              </div>
              {/* Header toggle - shown when content is NOT scrollable */}
              {!isScrollable && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    if (window.innerWidth >= 1024) {
                      setSidebarOpen(!sidebarOpen)
                    } else {
                      setMobileSheetOpen(true)
                    }
                  }}
                  className='h-8 w-8 p-0'
                >
                  {sidebarOpen ? <PanelRightClose className='h-4 w-4 hidden lg:block' /> : null}
                  <PanelRightOpen className={cn('h-4 w-4', sidebarOpen && 'lg:hidden')} />
                </Button>
              )}
            </div>
            {/* Editable Title - with gutter matching editor */}
            <div className={cn('mb-2', GUTTER.PADDING_CLASS)}>
              <textarea
                ref={titleInputRef}
                value={title}
                onChange={handleTitleChange}
                onKeyDown={handleTitleKeyDown}
                placeholder={t('nodeEdit.untitledPlaceholder')}
                rows={1}
                className='w-full resize-none overflow-hidden border-none bg-transparent text-4xl font-bold leading-tight tracking-tight text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0'
              />
            </div>

            {/* Editor */}
            <BlockEditor
              initialContent={currentNode.content ? htmlToEditor(currentNode.content) : undefined}
              onEditorUpdate={handleEditorChange}
              placeholder={t('nodeEdit.editorPlaceholder')}
              className='min-h-[500px]'
            />
        </div>
      </main>

      {/* Right Sidebar - Desktop (lg+) */}
      {sidebarOpen && (
        <aside className='hidden lg:flex flex-col flex-shrink-0 border-l border-border h-full overflow-hidden' style={{ width: SIDEBAR_WIDTH }}>
          <div className='flex flex-1 flex-col min-h-0 overflow-hidden'>
            <Tabs defaultValue='properties' className='flex flex-1 flex-col min-h-0'>
              {/* Tab Header */}
              <div className='border-b border-border/50 px-4 py-3'>
                <TabsList className='grid w-full grid-cols-3'>
                  <TabsTrigger value='properties' className='gap-1.5'>
                    <SlidersHorizontal className='h-3.5 w-3.5' />
                    <span className='text-xs hidden sm:inline'>{t('nodeEdit.tabs.properties')}</span>
                  </TabsTrigger>
                  <TabsTrigger value='practice' className='gap-1.5'>
                    <GraduationCap className='h-3.5 w-3.5' />
                    <span className='text-xs hidden sm:inline'>{t('nodeEdit.tabs.practice')}</span>
                  </TabsTrigger>
                  <TabsTrigger value='ai' className='gap-1.5'>
                    <Sparkles className='h-3.5 w-3.5' />
                    <span className='text-xs hidden sm:inline'>{t('nodeEdit.tabs.ai')}</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Properties Tab */}
              <TabsContent value='properties' className='flex-1 overflow-y-auto [scrollbar-gutter:stable] min-h-0 mt-0'>
                <div className='flex flex-col min-h-full'>
                  {/* Node Metadata */}
                  <div className='border-b border-border/50 p-4'>
                    <NodeMetadataForm
                      node={currentNode}
                      onSubmit={handleMetadataSubmit}
                      isPending={updateNodeMutation.isPending}
                    />
                  </div>

                  {/* Connections */}
                  <div className='border-b border-border/50 p-4'>
                    <h3 className='mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                      {t('nodeEdit.connections')}
                    </h3>
                    <NodeConnectionsPanel
                      node={currentNode}
                      edges={map.edges}
                      allNodes={map.nodes}
                      onEditEdge={handleEditEdge}
                      onDeleteEdge={handleDeleteEdge}
                    />
                  </div>

                  {/* Danger Zone - mt-auto pushes to bottom when space available */}
                  <div className='p-4 mt-auto'>
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

              {/* Practice Tab */}
              <TabsContent value='practice' className='flex-1 flex flex-col min-h-0 mt-0'>
                <PracticePanel nodeId={nodeId} mapId={mapId} />
              </TabsContent>

              {/* AI Tab */}
              <TabsContent value='ai' className='flex-1 flex flex-col min-h-0 mt-0'>
                <AISuggestionsPanel nodeId={nodeId} mapId={mapId} />
              </TabsContent>
            </Tabs>
          </div>
        </aside>
      )}

      {/* Right Sidebar - Mobile Sheet */}
      <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
        <SheetContent side='right' className='p-0 flex flex-col' style={{ width: SIDEBAR_WIDTH }}>
          <Tabs defaultValue='properties' className='flex flex-1 flex-col min-h-0'>
            {/* Tab Header */}
            <SheetHeader className='border-b border-border/50 px-4 py-3'>
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='properties' className='gap-1.5'>
                  <SlidersHorizontal className='h-3.5 w-3.5' />
                  <span className='text-xs'>{t('nodeEdit.tabs.properties')}</span>
                </TabsTrigger>
                <TabsTrigger value='practice' className='gap-1.5'>
                  <GraduationCap className='h-3.5 w-3.5' />
                  <span className='text-xs'>{t('nodeEdit.tabs.practice')}</span>
                </TabsTrigger>
                <TabsTrigger value='ai' className='gap-1.5'>
                  <Sparkles className='h-3.5 w-3.5' />
                  <span className='text-xs'>{t('nodeEdit.tabs.ai')}</span>
                </TabsTrigger>
              </TabsList>
            </SheetHeader>

            {/* Properties Tab */}
            <TabsContent value='properties' className='flex-1 overflow-y-auto [scrollbar-gutter:stable] min-h-0 mt-0'>
              <div className='flex flex-col min-h-full'>
                {/* Node Metadata */}
                <div className='border-b border-border/50 p-4'>
                  <NodeMetadataForm
                    node={currentNode}
                    onSubmit={handleMetadataSubmit}
                    isPending={updateNodeMutation.isPending}
                  />
                </div>

                {/* Connections */}
                <div className='border-b border-border/50 p-4'>
                  <h3 className='mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                    {t('nodeEdit.connections')}
                  </h3>
                  <NodeConnectionsPanel
                    node={currentNode}
                    edges={map.edges}
                    allNodes={map.nodes}
                    onEditEdge={handleEditEdge}
                    onDeleteEdge={handleDeleteEdge}
                  />
                </div>

                {/* Danger Zone - mt-auto pushes to bottom when space available */}
                <div className='p-4 mt-auto'>
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

            {/* Practice Tab */}
            <TabsContent value='practice' className='flex-1 flex flex-col min-h-0 mt-0'>
              <PracticePanel nodeId={nodeId} mapId={mapId} />
            </TabsContent>

            {/* AI Tab */}
            <TabsContent value='ai' className='flex-1 flex flex-col min-h-0 mt-0'>
              <AISuggestionsPanel nodeId={nodeId} mapId={mapId} />
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

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
                label: currentNode.label,
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
              {deleteNodeMutation.isPending ? (
                <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
              ) : (
                <Trash2 className='mr-1.5 h-3.5 w-3.5' />
              )}
              {t('nodeEdit.deleteNode', 'Delete node')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edge Edit Popover for editing connections */}
      <EdgeEditPopover mapId={mapId} />
    </div>
  )
}
