import type { JSONContent } from '@tiptap/react'
import { AlertTriangle, ArrowLeft, Loader2, PanelRightClose, PanelRightOpen } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'

import { useFullMap, useUpdateNode } from '@/entities/map'
import type { NodeType } from '@/entities/node'
import { BlockEditor } from '@/features/block-editor'
import { NodeConnectionsPanel } from '@/features/node-connections-panel'
import { useAutoSave } from '@/features/node-editor/model/use-auto-save.hooks'
import { NodeMetadataForm, type NodeMetadataFormValues } from '@/features/node-metadata-form'
import { cn } from '@/shared/lib/cn'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'

const NODE_TYPE_CONFIG: Record<NodeType, { label: string; color: string }> = {
  concept: { label: 'Concept', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  fact: { label: 'Fact', color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  theory: { label: 'Theory', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  example: { label: 'Example', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  question: { label: 'Question', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
  hypothesis: { label: 'Hypothesis', color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400' }
}

export function NodeEditPage() {
  const { mapId, nodeId } = useParams<{ mapId: string; nodeId: string }>()
  const { data: fullMap, isLoading, isError } = useFullMap(mapId || '')
  const updateNodeMutation = useUpdateNode(mapId || '')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [title, setTitle] = useState('')
  const titleInputRef = useRef<HTMLTextAreaElement>(null)

  // Find the current node
  const currentNode = fullMap?.nodes.find((n) => n.id === nodeId)

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
    if (!nodeId) return
    if (newTitle.trim() && newTitle !== currentNode?.label) {
      updateNodeMutation.mutate(
        { id: nodeId, data: { label: newTitle.trim() } },
        { onError: () => toast.error('Failed to save title') }
      )
    }
  }, 1000)

  // Auto-save for editor content
  const debouncedContentSave = useAutoSave((content: string) => {
    if (!nodeId) return
    updateNodeMutation.mutate(
      { id: nodeId, data: { description: content } },
      { onError: () => toast.error('Failed to save') }
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

  // Validation
  if (!mapId || !nodeId) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Card className="p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 text-lg font-semibold text-destructive">Navigation Error</h2>
          <p className="text-muted-foreground">Map ID or Node ID is missing</p>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Loading Node</h3>
            <p className="text-muted-foreground">Please wait...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !fullMap || !currentNode) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-destructive" />
          <h2 className="mb-2 text-xl font-semibold text-destructive">Node Not Found</h2>
          <p className="mb-6 text-muted-foreground">
            The requested node could not be found or does not exist.
          </p>
          <Button asChild>
            <Link to={`/dashboard/maps/${mapId}/view`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Map
            </Link>
          </Button>
        </Card>
      </div>
    )
  }

  // Handler for editor content change
  const handleEditorChange = (content: JSONContent) => {
    debouncedContentSave(JSON.stringify(content))
  }

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
        onSuccess: () => toast.success('Saved'),
        onError: () => toast.error('Failed to save')
      }
    )
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Main Editor Area */}
      <main className="relative flex-1 overflow-y-auto">
        {/* Editor Content */}
        <div className="mx-auto max-w-3xl px-6 py-12">
          {/* Breadcrumb & Actions */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="h-8 px-2">
                <Link to={`/dashboard/maps/${mapId}/view`}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <Badge
                variant="secondary"
                className={cn('text-xs font-medium', NODE_TYPE_CONFIG[currentNode.type]?.color)}
              >
                {NODE_TYPE_CONFIG[currentNode.type]?.label || currentNode.type}
              </Badge>
              {updateNodeMutation.isPending && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8 p-0"
            >
              {sidebarOpen ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelRightOpen className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Editable Title */}
          <div className="mb-6">
            <textarea
              ref={titleInputRef}
              value={title}
              onChange={handleTitleChange}
              onKeyDown={handleTitleKeyDown}
              placeholder="Untitled"
              rows={1}
              className="w-full resize-none overflow-hidden border-none bg-transparent text-4xl font-bold leading-tight tracking-tight text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0"
            />
          </div>

          {/* Editor */}
          <BlockEditor
            onChange={handleEditorChange}
            placeholder="Start writing, or type '/' for commands..."
            className="min-h-[500px]"
          />
        </div>
      </main>

      {/* Right Sidebar */}
      <aside
        className={cn(
          'flex-shrink-0 border-l border-border transition-all duration-200',
          sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
            <h2 className="text-sm font-semibold">Properties</h2>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Node Metadata */}
            <div className="border-b border-border/50 p-4">
              <NodeMetadataForm
                node={currentNode}
                onSubmit={handleMetadataSubmit}
                isPending={updateNodeMutation.isPending}
              />
            </div>

            {/* Connections */}
            <div className="p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Connections
              </h3>
              <NodeConnectionsPanel
                node={currentNode}
                edges={fullMap.edges}
                allNodes={fullMap.nodes}
              />
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
