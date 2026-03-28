import {
  Copy01Icon,
  DotsHorizontalIcon,
  LinkExternal01Icon,
  MessageDotsSquareIcon,
  PlusIcon,
  Target01Icon,
  Trash01Icon,
  XCloseIcon
} from '@untitledui/icons-react/outline'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ChatSelectorPopover } from '@/features/ai-assist'
import type { Node } from '@/entities/map'
import {
  type MapSidebarTab,
  useMapActions,
  useMapActiveTab,
  useMapUIStore,
  useSidebarOpen,
  useSidebarWidth
} from '@/entities/map-ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/components/dropdown-menu'
import { OverflowNav, type OverflowNavItem } from '@/shared/components/overflow-nav'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/popover'
import { ResizableSidebar } from '@/shared/components/resizable-sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/tooltip'
import { cn } from '@/shared/lib/cn'

import { useChatActionsStore, useNodeActionsStore } from '../model'

interface MapSidebarProps {
  mapId: string
  /** Selected node for Node tab */
  selectedNode: Node | null
  /** Whether user can edit */
  canEdit: boolean
  /** Whether the selected node is focused in the graph */
  isFocused?: boolean
  /** Toggle focus on/off for the selected node */
  onToggleFocus?: () => void
  /** Navigate to full node editor page */
  onOpenFullEditor?: () => void
  /** Render prop for node panel content */
  renderNodePanel?: (node: Node) => React.ReactNode
  /** Render prop for chat panel content */
  renderChatPanel?: () => React.ReactNode
  /** Render prop for settings panel content */
  renderSettingsPanel?: () => React.ReactNode
  /** Render prop for practice panel */
  renderPracticePanel?: () => React.ReactNode
  /** Whether practice mode is active */
  isPracticeActive?: boolean
  /** Callback when node is closed */
  onCloseNode?: () => void
  className?: string
}

export const MapSidebar = memo(function MapSidebar({
  mapId,
  selectedNode,
  canEdit,
  isFocused = false,
  onToggleFocus,
  onOpenFullEditor,
  renderNodePanel,
  renderChatPanel,
  renderSettingsPanel,
  renderPracticePanel,
  isPracticeActive = false,
  onCloseNode,
  className
}: MapSidebarProps) {
  const { t } = useTranslation()
  const isOpen = useSidebarOpen()
  const width = useSidebarWidth()
  const activeTab = useMapActiveTab(mapId)
  const { setActiveTab } = useMapActions(mapId)

  const handleClose = useCallback(() => {
    useMapUIStore.getState().setSidebarOpen(false)
    if (activeTab === 'node') {
      onCloseNode?.()
    }
  }, [activeTab, onCloseNode])

  const setTab = useCallback(
    (tab: MapSidebarTab) => {
      setActiveTab(tab)
      useMapUIStore.getState().setSidebarOpen(true)
    },
    [setActiveTab]
  )

  const handleSetWidth = useCallback((w: number) => {
    useMapUIStore.getState().setSidebarWidth(w)
  }, [])

  // Open sidebar to node tab only when node selected while sidebar is closed
  const prevNodeIdRef = useRef<string | null>(null)
  useEffect(() => {
    const newId = selectedNode?.id ?? null
    if (newId && newId !== prevNodeIdRef.current && !isOpen) {
      setTab('node')
    }
    prevNodeIdRef.current = newId
  }, [selectedNode?.id, isOpen, setTab])

  // Open sidebar on practice tab only when practice mode transitions to active
  const prevPracticeRef = useRef(isPracticeActive)
  useEffect(() => {
    if (isPracticeActive && !prevPracticeRef.current) {
      setTab('practice')
    }
    prevPracticeRef.current = isPracticeActive
  }, [isPracticeActive, setTab])

  // Build nav items
  const navItems = useMemo(() => {
    const items: OverflowNavItem[] = []
    if (selectedNode) {
      items.push({
        id: 'node',
        label: t('mapSidebar.tabs.node'),
        active: activeTab === 'node',
        onClick: () => setTab('node')
      })
    }
    if (canEdit) {
      items.push({
        id: 'chat',
        label: t('mapSidebar.tabs.chat'),
        active: activeTab === 'chat',
        onClick: () => setTab('chat')
      })
    }
    items.push({
      id: 'practice',
      label: t('practice.mode.title'),
      active: activeTab === 'practice',
      onClick: () => setTab('practice')
    })
    items.push({
      id: 'settings',
      label: t('mapSidebar.tabs.settings'),
      active: activeTab === 'settings',
      onClick: () => setTab('settings')
    })
    return items
  }, [selectedNode, canEdit, activeTab, setTab, t])

  const { nav, trigger } = OverflowNav({ items: navItems })

  // Chat session actions from store (populated by ChatPanel)
  const chatCreateSession = useChatActionsStore(s => s.createSession)
  const chatSessions = useChatActionsStore(s => s.sessions)
  const chatActiveSessionId = useChatActionsStore(s => s.activeSessionId)
  const chatSelectSession = useChatActionsStore(s => s.selectSession)
  const chatDeleteSession = useChatActionsStore(s => s.deleteSession)
  const [selectorOpen, setSelectorOpen] = useState(false)

  const nodeOnCopyId = useNodeActionsStore(s => s.onCopyId)
  const nodeOnDeleteRequest = useNodeActionsStore(s => s.onDeleteRequest)

  const showNodeActions = activeTab === 'node' && !!selectedNode
  const showChatActions = activeTab === 'chat' && canEdit

  if (!isOpen) {
    return null
  }

  return (
    <ResizableSidebar
      open={isOpen}
      onClose={handleClose}
      width={width}
      onWidthChange={handleSetWidth}
      className={className}
    >
      <div className='flex flex-1 flex-col min-h-0'>
        {/* Nav bar: [tabs] [contextual icons] [✕] */}
        <div className='flex items-center border-b border-border/60 px-2 py-1 shrink-0'>
          {nav}
          <div className='flex items-center shrink-0'>
            {/* Node tab: [⊙ focus] [↗ open] */}
            {showNodeActions && (
              <>
                {onToggleFocus && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        onClick={onToggleFocus}
                        className={cn(
                          'h-7 w-7 flex items-center justify-center rounded-md transition-colors',
                          isFocused
                            ? 'text-foreground bg-muted'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                        )}
                      >
                        <Target01Icon className='h-3.5 w-3.5' />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side='bottom'>
                      <p className='text-xs'>
                        {isFocused ? t('graph.toolbar.clearFocus') : t('graph.toolbar.focusMode')}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {onOpenFullEditor && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        onClick={onOpenFullEditor}
                        className='h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors'
                      >
                        <LinkExternal01Icon className='h-3.5 w-3.5' />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side='bottom'>
                      <p className='text-xs'>{t('nodeDrawer.openFullEditor', 'Open')}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type='button'
                      className='h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors'
                    >
                      <DotsHorizontalIcon className='h-3.5 w-3.5' />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='min-w-36'>
                    <DropdownMenuItem onClick={() => nodeOnCopyId?.()} className='text-xs'>
                      <Copy01Icon className='mr-2 h-3.5 w-3.5' />
                      {t('nodeEdit.copyId')}
                    </DropdownMenuItem>
                    {canEdit && nodeOnDeleteRequest && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={nodeOnDeleteRequest}
                          className='text-xs text-destructive focus:text-destructive'
                        >
                          <Trash01Icon className='mr-2 h-3.5 w-3.5' />
                          {t('nodeEdit.deleteNode')}
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/* Chat tab: [💬 sessions] [+ new] */}
            {showChatActions && (
              <>
                <Popover open={selectorOpen} onOpenChange={setSelectorOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <button
                          type='button'
                          className='h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors'
                        >
                          <MessageDotsSquareIcon className='h-3.5 w-3.5' />
                        </button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side='bottom'>
                      <p className='text-xs'>{t('ai.chat.chats', 'Chats')}</p>
                    </TooltipContent>
                  </Tooltip>
                  <PopoverContent
                    className='w-72 p-0 rounded-lg border-border/60 bg-background overflow-hidden'
                    align='end'
                    sideOffset={6}
                  >
                    <ChatSelectorPopover
                      sessions={chatSessions}
                      activeSessionId={chatActiveSessionId}
                      onSelectSession={id => {
                        chatSelectSession?.(id)
                        setSelectorOpen(false)
                      }}
                      onDeleteSession={chatDeleteSession ?? undefined}
                    />
                  </PopoverContent>
                </Popover>

                {chatCreateSession && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        onClick={chatCreateSession}
                        className='h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors'
                      >
                        <PlusIcon className='h-3.5 w-3.5' />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side='bottom'>
                      <p className='text-xs'>{t('ai.chat.newChat', 'New chat')}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </>
            )}

            {trigger}
            <button
              type='button'
              onClick={handleClose}
              className='h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors'
            >
              <XCloseIcon className='h-3.5 w-3.5' />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className='flex-1 min-h-0 overflow-hidden'>
          {activeTab === 'node' && (
            <div className='h-full overflow-y-auto'>
              {selectedNode ? (
                renderNodePanel?.(selectedNode)
              ) : (
                <div className='flex items-center justify-center h-full p-4'>
                  <p className='text-sm text-muted-foreground text-center'>
                    {t('mapSidebar.selectNode')}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && canEdit && (
            <div className='flex flex-col h-full overflow-hidden'>{renderChatPanel?.()}</div>
          )}

          {activeTab === 'practice' && (
            <div className='h-full overflow-y-auto'>{renderPracticePanel?.()}</div>
          )}

          {activeTab === 'settings' && (
            <div className='h-full overflow-y-auto'>{renderSettingsPanel?.()}</div>
          )}
        </div>
      </div>
    </ResizableSidebar>
  )
})
