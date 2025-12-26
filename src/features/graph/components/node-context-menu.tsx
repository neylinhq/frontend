import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import {
  GitBranch01Icon,
  Maximize01Icon,
  Pencil01Icon,
  Target01Icon,
  Trash01Icon,
  ZoomInIcon
} from '@untitledui/icons-react/outline'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
} from '@/shared/components/context-menu'

import { useGraphViewStore } from '../model/graph.store'

interface NodeContextMenuProps {
  children: React.ReactNode
  nodeId: string
  nodeLabel: string
  onEdit?: () => void
  onDelete?: () => void
  onZoomToNode?: () => void
}

export const NodeContextMenu = ({
  children,
  nodeId,
  nodeLabel,
  onEdit,
  onDelete,
  onZoomToNode
}: NodeContextMenuProps) => {
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
      <ContextMenuContent className='w-56'>
        <div className='px-2 py-1.5 text-sm font-medium truncate border-b mb-1'>{nodeLabel}</div>

        {/* Focus Actions */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Target01Icon className='h-4 w-4 mr-2' />
            {t('graph.contextMenu.focusOnNode', 'Focus on this node')}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => handleFocus(1)}>
              <GitBranch01Icon className='h-4 w-4 mr-2' />
              {t('graph.contextMenu.depth1', '1 level deep')}
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleFocus(2)}>
              <GitBranch01Icon className='h-4 w-4 mr-2' />
              {t('graph.contextMenu.depth2', '2 levels deep')}
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleFocus(3)}>
              <GitBranch01Icon className='h-4 w-4 mr-2' />
              {t('graph.contextMenu.depth3', '3 levels deep')}
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleFocus(5)}>
              <Maximize01Icon className='h-4 w-4 mr-2' />
              {t('graph.contextMenu.allConnected', 'All connected')}
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {isFocused && (
          <ContextMenuItem onClick={clearFocus}>
            <Target01Icon className='h-4 w-4 mr-2' />
            {t('graph.contextMenu.clearFocus', 'Clear focus')}
          </ContextMenuItem>
        )}

        {onZoomToNode && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onZoomToNode}>
              <ZoomInIcon className='h-4 w-4 mr-2' />
              {t('graph.contextMenu.zoomToNode', 'Zoom to node')}
            </ContextMenuItem>
          </>
        )}

        {(onEdit || onDelete) && (
          <>
            <ContextMenuSeparator />
            {onEdit && (
              <ContextMenuItem onClick={onEdit}>
                <Pencil01Icon className='h-4 w-4 mr-2' />
                {t('graph.contextMenu.editNode', 'Edit node')}
              </ContextMenuItem>
            )}
            {onDelete && (
              <ContextMenuItem
                onClick={onDelete}
                className='text-destructive focus-visible:text-destructive'
              >
                <Trash01Icon className='h-4 w-4 mr-2' />
                {t('graph.contextMenu.deleteNode', 'Delete node')}
              </ContextMenuItem>
            )}
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
