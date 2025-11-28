import { Focus, GitBranch, Maximize2, Pencil, Trash2, ZoomIn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
} from '@/shared/ui/context-menu'
import { useGraphViewStore } from '../model/graph-view.store'

interface NodeContextMenuProps {
  children: React.ReactNode
  nodeId: string
  nodeLabel: string
  onEdit?: () => void
  onDelete?: () => void
  onZoomToNode?: () => void
}

export function NodeContextMenu({
  children,
  nodeId,
  nodeLabel,
  onEdit,
  onDelete,
  onZoomToNode
}: NodeContextMenuProps) {
  const { t } = useTranslation()
  const { focusNode, focusedNodeId, clearFocus, setFocusDepth } = useGraphViewStore(
    useShallow(s => ({
      focusNode: s.focusNode,
      focusedNodeId: s.focusedNodeId,
      clearFocus: s.clearFocus,
      setFocusDepth: s.setFocusDepth
    }))
  )

  const isFocused = focusedNodeId === nodeId

  const handleFocus = (depth: number) => {
    setFocusDepth(depth)
    focusNode(nodeId)
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium truncate border-b mb-1">{nodeLabel}</div>

        {/* Focus Actions */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Focus className="h-4 w-4 mr-2" />
            {t('graph.contextMenu.focusOnNode', 'Focus on this node')}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => handleFocus(1)}>
              <GitBranch className="h-4 w-4 mr-2" />
              {t('graph.contextMenu.depth1', '1 level deep')}
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleFocus(2)}>
              <GitBranch className="h-4 w-4 mr-2" />
              {t('graph.contextMenu.depth2', '2 levels deep')}
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleFocus(3)}>
              <GitBranch className="h-4 w-4 mr-2" />
              {t('graph.contextMenu.depth3', '3 levels deep')}
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleFocus(5)}>
              <Maximize2 className="h-4 w-4 mr-2" />
              {t('graph.contextMenu.allConnected', 'All connected')}
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {isFocused && (
          <ContextMenuItem onClick={clearFocus}>
            <Focus className="h-4 w-4 mr-2" />
            {t('graph.contextMenu.clearFocus', 'Clear focus')}
          </ContextMenuItem>
        )}

        {onZoomToNode && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onZoomToNode}>
              <ZoomIn className="h-4 w-4 mr-2" />
              {t('graph.contextMenu.zoomToNode', 'Zoom to node')}
            </ContextMenuItem>
          </>
        )}

        {(onEdit || onDelete) && (
          <>
            <ContextMenuSeparator />
            {onEdit && (
              <ContextMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                {t('graph.contextMenu.editNode', 'Edit node')}
              </ContextMenuItem>
            )}
            {onDelete && (
              <ContextMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('graph.contextMenu.deleteNode', 'Delete node')}
              </ContextMenuItem>
            )}
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
