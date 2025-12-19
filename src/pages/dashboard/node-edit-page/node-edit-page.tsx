import {
  AlertCircle,
  ArrowLeft,
  GraduationCap,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  SlidersHorizontal,
  Sparkles,
  Trash2
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import type { Edge } from '@/entities/edge'
import type { FullMap, Node } from '@/entities/map'
import { useDeleteEdge, useDeleteNode, useFullMap, useNodeWithContent, useUpdateNode } from '@/entities/map'
import type { NodeType } from '@/entities/node'
import { AISuggestionsPanel } from '@/features/ai-assist/components/ai-suggestions-panel'
import { GUTTER, markdownToPlainText } from '@/features/block-editor'
import { UnifiedEditor } from '@/features/unified-editor'
import { isCodeMirrorEnabled } from '@/shared/config'
import { EdgeEditPopover } from '@/features/graph/components/edge-edit-popover'
import { useEdgeManagementStore } from '@/features/graph/model/graph.edge.store'
import { NodeConnectionsPanel } from '@/features/node-connections-panel'
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/sheet'
import { Skeleton } from '@/shared/components/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/tabs'
import { toast } from '@/shared/components/toast'
import { useAutoSave, useResizable } from '@/shared/hooks'
import { cn } from '@/shared/lib/cn'

/** Default sidebar width in pixels */
const SIDEBAR_DEFAULT_WIDTH = 360
/** Minimum sidebar width */
const SIDEBAR_MIN_WIDTH = 440
/** Maximum sidebar width */
const SIDEBAR_MAX_WIDTH = 800

/** Breakpoint for switching between mobile sheet and desktop sidebar (Tailwind lg) */
const SIDEBAR_BREAKPOINT = 1024

/** Cookie key for sidebar state (exported for server-side reading) */
export const SIDEBAR_COOKIE_KEY = 'node-edit-sidebar'

/** Skeleton placeholder for sidebar while hydrating */
const SidebarSkeleton = ({ width }: { width: number }) => (
  <aside
    className='hidden lg:flex flex-col flex-shrink-0 border-l border-border h-full overflow-hidden'
    style={{ width }}
  >
    <div className='flex flex-1 flex-col min-h-0 overflow-hidden'>
      {/* Tab Header Skeleton */}
      <div className='h-10 grid grid-cols-3 border-b border-border/50'>
        <Skeleton className='h-full rounded-none' />
        <Skeleton className='h-full rounded-none' />
        <Skeleton className='h-full rounded-none' />
      </div>

      {/* Content Skeleton */}
      <div className='flex-1 overflow-hidden p-4 space-y-6'>
        <div className='space-y-3'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-9 w-full' />
          <Skeleton className='h-9 w-full' />
        </div>
        <div className='space-y-3'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-8 w-full' />
          <div className='space-y-2'>
            <Skeleton className='h-12 w-full rounded-lg' />
            <Skeleton className='h-12 w-full rounded-lg' />
            <Skeleton className='h-12 w-full rounded-lg' />
          </div>
        </div>
      </div>
    </div>
  </aside>
)

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
  /** Initial sidebar state from server (cookie) */
  initialSidebarOpen?: boolean
}

export const NodeEditPage = ({
  node: currentNode,
  map: initialMap,
  mapId,
  nodeId,
  initialSidebarOpen = true
}: NodeEditPageProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Gutter padding only needed for Tiptap (floating menu), not for CodeMirror
  const useCodeMirror = isCodeMirrorEnabled()
  const gutterClass = useCodeMirror ? '' : GUTTER.PADDING_CLASS

  // Use React Query for map data to get automatic updates after mutations
  const { data: mapData } = useFullMap(mapId)
  const map = mapData ?? initialMap

  // Subscribe to node updates from React Query (for AI panel updates)
  const { data: nodeData } = useNodeWithContent(mapId, nodeId)
  const node = nodeData ?? currentNode

  const updateNodeMutation = useUpdateNode(mapId)
  const deleteNodeMutation = useDeleteNode(mapId)
  const deleteEdgeMutation = useDeleteEdge(mapId)
  const { startEdgeEditing } = useEdgeManagementStore()
  const [sidebarOpen, setSidebarOpen] = useState(initialSidebarOpen)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)

  // Resizable sidebar
  const {
    size: sidebarWidth,
    isResizing,
    handleMouseDown: handleResizeMouseDown
  } = useResizable({
    minSize: SIDEBAR_MIN_WIDTH,
    maxSize: SIDEBAR_MAX_WIDTH,
    initialSize: SIDEBAR_DEFAULT_WIDTH,
    direction: 'horizontal',
    handleSide: 'left',
    storageKey: 'node-edit-sidebar-width'
  })
  const [isHydrated, setIsHydrated] = useState(false)
  const [title, setTitle] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const titleInputRef = useRef<HTMLTextAreaElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isScrollable, setIsScrollable] = useState(false)

  // Mark as hydrated after mount (CSS is loaded by then)
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Persist sidebar state to cookie
  useEffect(() => {
    document.cookie = `${SIDEBAR_COOKIE_KEY}=${sidebarOpen}; path=/; max-age=31536000; SameSite=Lax`
  }, [sidebarOpen])

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
    if (node?.label) {
      setTitle(node.label)
      requestAnimationFrame(resizeTitleTextarea)
    }
  }, [node?.label, resizeTitleTextarea])

  // Auto-save for title
  const debouncedTitleSave = useAutoSave((newTitle: string) => {
    if (!nodeId) {
      return
    }
    if (newTitle.trim() && newTitle !== node?.label) {
      updateNodeMutation.mutate(
        { id: nodeId, data: { label: newTitle.trim() } },
        { onError: () => toast.error(t('errors.failedSaveTitle')) }
      )
    }
  }, 1000)

  // Auto-save for editor content (now receives Markdown directly from UnifiedEditor)
  const debouncedContentSave = useAutoSave((markdown: string) => {
    if (!nodeId) {
      return
    }

    const description = markdownToPlainText(markdown, 200)

    updateNodeMutation.mutate(
      { id: nodeId, data: { content: markdown, description } },
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

  // Handler for editor content change (receives HTML from UnifiedEditor)
  const handleEditorChange = useCallback(
    (html: string) => {
      debouncedContentSave(html)
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
            ...node.metadata,
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
  const handleEditEdge = useCallback(
    (edge: Edge) => {
      // Calculate a position in the center of the sidebar for the popover
      const sidebarRect = document.querySelector('aside')?.getBoundingClientRect()
      const position = sidebarRect
        ? { x: sidebarRect.left + sidebarRect.width / 2, y: sidebarRect.top + 200 }
        : { x: window.innerWidth / 2, y: 300 }
      startEdgeEditing(edge, position)
    },
    [startEdgeEditing]
  )

  // Handle edge delete
  const handleDeleteEdge = useCallback(
    async (edgeId: string) => {
      try {
        await deleteEdgeMutation.mutateAsync(edgeId)
        toast.success(t('common.removed', 'Removed'))
      } catch {
        toast.error(t('errors.failedDelete', 'Failed to delete'))
      }
    },
    [deleteEdgeMutation, t]
  )

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
              if (window.innerWidth >= SIDEBAR_BREAKPOINT) {
                setSidebarOpen(!sidebarOpen)
              } else {
                setMobileSheetOpen(true)
              }
            }}
            className='fixed bottom-4 z-20 h-12 w-12 rounded-full transition-all right-4'
            style={sidebarOpen ? { right: `calc(${sidebarWidth}px + 1rem)` } : undefined}
          >
            {sidebarOpen ? <PanelRightClose className='h-6 w-6 hidden lg:block' /> : null}
            <PanelRightOpen className={cn('h-6 w-6', sidebarOpen && 'lg:hidden')} />
          </Button>
        )}

        {/* Editor Content */}
        <div ref={contentRef} className='mx-auto max-w-3xl px-4 md:px-8 py-6 md:py-8'>
          {/* Breadcrumb & Actions - with gutter matching editor (only for Tiptap) */}
          <div className={cn('mb-8 flex items-center justify-between', gutterClass)}>
            <div className='flex items-center gap-3'>
              <Button variant='ghost' size='sm' asChild className='h-8 px-2'>
                <Link to={`/dashboard/maps/${mapId}/view`}>
                  <ArrowLeft className='h-4 w-4' />
                </Link>
              </Button>
              <Badge
                variant='secondary'
                className={cn('text-xs font-medium', NODE_TYPE_CONFIG[node.type]?.color)}
              >
                {t(
                  `nodeTypes.${node.type}`,
                  NODE_TYPE_CONFIG[node.type]?.label || node.type
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
                  if (window.innerWidth >= SIDEBAR_BREAKPOINT) {
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
          {/* Editable Title - with gutter matching editor (only for Tiptap) */}
          <div className={cn('mb-2', gutterClass)}>
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
          {/* key by nodeId - only recreate editor when switching to different node */}
          <UnifiedEditor
            key={nodeId}
            initialContent={node.content ?? ''}
            onChange={handleEditorChange}
            placeholder={t('nodeEdit.editorPlaceholder')}
            className='min-h-[500px]'
          />
        </div>
      </main>

      {/* Right Sidebar - Desktop (lg+) */}
      {/* Show skeleton while hydrating to prevent layout shift */}
      {!isHydrated && sidebarOpen && <SidebarSkeleton width={sidebarWidth} />}
      {isHydrated && sidebarOpen && (
        <aside
          className={cn(
            'hidden lg:flex flex-col flex-shrink-0 border-l border-border h-full overflow-hidden relative',
            isResizing && 'select-none'
          )}
          style={{ width: sidebarWidth }}
        >
          {/* Resize handle */}
          <div
            onMouseDown={handleResizeMouseDown}
            className={cn(
              'absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-10',
              'hover:bg-primary/20 active:bg-primary/30 transition-colors',
              isResizing && 'bg-primary/30'
            )}
          />
          <div className='flex flex-1 flex-col min-h-0 overflow-hidden'>
            <Tabs defaultValue='properties' className='flex flex-1 flex-col min-h-0'>
              {/* Tab Header */}
              <TabsList variant='underline' className='grid grid-cols-3'>
                <TabsTrigger
                  variant='underline'
                  value='properties'
                  title={t('nodeEdit.tabs.properties')}
                >
                  <SlidersHorizontal className='h-4 w-4' />
                </TabsTrigger>
                <TabsTrigger
                  variant='underline'
                  value='practice'
                  title={t('nodeEdit.tabs.practice')}
                >
                  <GraduationCap className='h-4 w-4' />
                </TabsTrigger>
                <TabsTrigger variant='underline' value='ai' title={t('nodeEdit.tabs.ai')}>
                  <Sparkles className='h-4 w-4' />
                </TabsTrigger>
              </TabsList>

              {/* Properties Tab */}
              <TabsContent
                value='properties'
                className='flex-1 overflow-y-auto [scrollbar-gutter:stable] min-h-0 mt-0'
              >
                <div className='flex flex-col min-h-full'>
                  {/* Node Metadata */}
                  <div className='border-b border-border/50 p-4'>
                    <NodeMetadataForm
                      node={node}
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
                      node={node}
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
                          {t(
                            'nodeEdit.deleteWarning',
                            'Deleting this node will also remove all its connections.'
                          )}
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
        <SheetContent
          side='right'
          className='p-0 flex flex-col'
          style={{ width: SIDEBAR_DEFAULT_WIDTH }}
        >
          <Tabs defaultValue='properties' className='flex flex-1 flex-col min-h-0'>
            {/* Tab Header */}
            <SheetHeader className='p-0'>
              <SheetTitle className='sr-only'>{t('nodeEdit.sidebar', 'Node sidebar')}</SheetTitle>
              <TabsList variant='underline' className='grid grid-cols-3'>
                <TabsTrigger
                  variant='underline'
                  value='properties'
                  title={t('nodeEdit.tabs.properties')}
                >
                  <SlidersHorizontal className='h-4 w-4' />
                </TabsTrigger>
                <TabsTrigger
                  variant='underline'
                  value='practice'
                  title={t('nodeEdit.tabs.practice')}
                >
                  <GraduationCap className='h-4 w-4' />
                </TabsTrigger>
                <TabsTrigger variant='underline' value='ai' title={t('nodeEdit.tabs.ai')}>
                  <Sparkles className='h-4 w-4' />
                </TabsTrigger>
              </TabsList>
            </SheetHeader>

            {/* Properties Tab */}
            <TabsContent
              value='properties'
              className='flex-1 overflow-y-auto [scrollbar-gutter:stable] min-h-0 mt-0'
            >
              <div className='flex flex-col min-h-full'>
                {/* Node Metadata */}
                <div className='border-b border-border/50 p-4'>
                  <NodeMetadataForm
                    node={node}
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
                    node={node}
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
                        {t(
                          'nodeEdit.deleteWarning',
                          'Deleting this node will also remove all its connections.'
                        )}
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
