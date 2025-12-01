import type { Editor } from '@tiptap/react'
import { ArrowLeft, Loader2, PanelRightClose, PanelRightOpen } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { toast } from 'sonner'

import type { FullMap, Node } from '@/entities/map'
import { useUpdateNode } from '@/entities/map'
import type { NodeType } from '@/entities/node'
import { BlockEditor, editorToHTML, htmlToEditor, htmlToPlainText } from '@/features/block-editor'
import { useAutoSave } from '@/features/node-editor'
import { NodeConnectionsPanel } from '@/features/node-connections-panel'
import { NodeMetadataForm, type NodeMetadataFormValues } from '@/features/node-metadata-form'
import { cn } from '@/shared/lib/cn'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/sheet'

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
  map: lightweightMap,
  mapId,
  nodeId
}: NodeEditPageProps) => {
  const { t } = useTranslation()
  const updateNodeMutation = useUpdateNode(mapId)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [title, setTitle] = useState('')
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
          label: values.label,
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
        onSuccess: () => toast.success(t('common.saved')),
        onError: () => toast.error(t('errors.failedSave'))
      }
    )
  }

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
              'fixed bottom-4 z-20 h-12 w-12 rounded-full shadow-lg transition-all',
              // Position adapts to sidebar on desktop
              sidebarOpen ? 'right-4 lg:right-[21rem]' : 'right-4'
            )}
          >
            {sidebarOpen ? <PanelRightClose className='h-6 w-6 hidden lg:block' /> : null}
            <PanelRightOpen className={cn('h-6 w-6', sidebarOpen && 'lg:hidden')} />
          </Button>
        )}

        {/* Editor Content */}
        <div ref={contentRef} className='mx-auto max-w-3xl px-4 md:px-8 py-6 md:py-8'>
          {/* Gutter wrapper - provides space for floating menu buttons on desktop */}
          <div className='md:pl-12'>
            {/* Breadcrumb & Actions */}
            <div className='mb-8 flex items-center justify-between'>
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
            {/* Editable Title */}
            <div className='mb-4 md:mb-6'>
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
        </div>
      </main>

      {/* Right Sidebar - Desktop (lg+) */}
      {sidebarOpen && (
        <aside className='hidden lg:flex w-80 flex-shrink-0 border-l border-border h-full'>
          <div className='flex flex-1 flex-col min-h-0'>
            {/* Sidebar Header */}
            <div className='flex items-center justify-between border-b border-border/50 px-4 py-3'>
              <h2 className='text-sm font-semibold'>{t('nodeEdit.properties')}</h2>
            </div>

            {/* Sidebar Content */}
            <div className='flex-1 overflow-y-auto [scrollbar-gutter:stable] min-h-0 flex flex-col'>
              {/* Node Metadata */}
              <div className='border-b border-border/50 p-4 flex-shrink-0'>
                <NodeMetadataForm
                  node={currentNode}
                  onSubmit={handleMetadataSubmit}
                  isPending={updateNodeMutation.isPending}
                />
              </div>

              {/* Connections - fills remaining space */}
              <div className='p-4 flex-1'>
                <h3 className='mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                  {t('nodeEdit.connections')}
                </h3>
                <NodeConnectionsPanel
                  node={currentNode}
                  edges={lightweightMap.edges}
                  allNodes={lightweightMap.nodes}
                />
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Right Sidebar - Mobile Sheet */}
      <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
        <SheetContent side='right' className='w-80 p-0 flex flex-col'>
          <SheetHeader className='border-b border-border/50 px-4 py-3'>
            <SheetTitle className='text-sm font-semibold'>{t('nodeEdit.properties')}</SheetTitle>
          </SheetHeader>

          <div className='flex-1 overflow-y-auto [scrollbar-gutter:stable] flex flex-col'>
            {/* Node Metadata */}
            <div className='border-b border-border/50 p-4 flex-shrink-0'>
              <NodeMetadataForm
                node={currentNode}
                onSubmit={handleMetadataSubmit}
                isPending={updateNodeMutation.isPending}
              />
            </div>

            {/* Connections - fills remaining space */}
            <div className='p-4 flex-1'>
              <h3 className='mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                {t('nodeEdit.connections')}
              </h3>
              <NodeConnectionsPanel
                node={currentNode}
                edges={lightweightMap.edges}
                allNodes={lightweightMap.nodes}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
