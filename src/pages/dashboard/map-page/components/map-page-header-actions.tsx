import {
  Copy01Icon,
  DotsHorizontalIcon,
  LinkExternal01Icon,
  MessageDotsSquareIcon,
  PlusIcon,
  Target01Icon,
  Trash01Icon
} from '@untitledui/icons-react/outline'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ChatSelectorPopover } from '@/features/ai-assist'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/components/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/tooltip'
import { cn } from '@/shared/lib/cn'
import { useChatActionsStore, useNodeActionsStore } from '@/widgets/map-sidebar'

// ─── Node Header Actions ─────────────────────────────────────────────

interface NodeHeaderActionsProps {
  nodeId: string
  isFocused: boolean
  canEdit: boolean
  onToggleFocus: () => void
  onOpenFullEditor: () => void
}

export const NodeHeaderActions = memo(function NodeHeaderActions({
  isFocused,
  canEdit,
  onToggleFocus,
  onOpenFullEditor
}: NodeHeaderActionsProps) {
  const { t } = useTranslation()
  const nodeOnCopyId = useNodeActionsStore(s => s.onCopyId)
  const nodeOnDeleteRequest = useNodeActionsStore(s => s.onDeleteRequest)

  return (
    <>
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
  )
})

// ─── Chat Header Actions ─────────────────────────────────────────────

export const ChatHeaderActions = memo(function ChatHeaderActions() {
  const { t } = useTranslation()
  const chatCreateSession = useChatActionsStore(s => s.createSession)
  const chatSessions = useChatActionsStore(s => s.sessions)
  const chatActiveSessionId = useChatActionsStore(s => s.activeSessionId)
  const chatSelectSession = useChatActionsStore(s => s.selectSession)
  const chatDeleteSession = useChatActionsStore(s => s.deleteSession)
  const [selectorOpen, setSelectorOpen] = useState(false)

  return (
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
  )
})
